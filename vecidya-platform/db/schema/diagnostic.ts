import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

// DIAG-V3-06 (Persistence Foundation). Diagnóstico anónimo por defecto: ninguna de estas tablas
// tiene columna de usuario/organización/IP/user-agent. `id` en `diagnostic_session` ES el
// identificador público aleatorio de la sesión (mismo patrón de nombre que el resto del schema,
// donde `id` siempre es la clave primaria); no es un rowid interno. Ningún enum tiene CHECK a nivel
// de base de datos, igual que el resto de este schema: se valida en la aplicación
// (`app/features/diagnostic/persistence.ts`).

// Ciclo de vida de una sesión anónima. `token_hash` es SHA-256 del write token; el token en claro
// nunca se guarda (spec §9). `profile`/`stage`/`goal` solo se escriben cuando la respuesta que los
// resuelve ya llegó (pueden quedar NULL toda la sesión). No hay columnas para `entity`/`archetype`/
// `niche`/`primaryFriction`: el motor actual no las produce (spec §20).
export const diagnosticSession = sqliteTable(
  "diagnostic_session",
  {
    id: text("id").primaryKey(),
    status: text("status", { enum: ["STARTED", "IN_PROGRESS", "SAVED", "COMPLETED", "EXPIRED"] }).default("STARTED").notNull(),
    tokenHash: text("token_hash").notNull(),
    diagnosticVersion: text("diagnostic_version").notNull(),
    questionBankVersion: integer("question_bank_version").notNull(),
    routingVersion: integer("routing_version").notNull(),
    scoringVersion: integer("scoring_version").notNull(),
    resultSchemaVersion: integer("result_schema_version").notNull(),
    profile: text("profile"),
    stage: text("stage"),
    goal: text("goal"),
    startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
    lastActivityAt: integer("last_activity_at", { mode: "timestamp_ms" }).notNull(),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    /** Vencimiento del snapshot temporal (KV); no es la retención del resultado completado (ver `diagnostic_result.retention_until`). */
    snapshotExpiresAt: integer("snapshot_expires_at", { mode: "timestamp_ms" }).notNull(),
    revision: integer("revision").default(0).notNull(),
    currentQuestionId: text("current_question_id"),
    questionsSeen: integer("questions_seen").default(0).notNull(),
    questionsAnswered: integer("questions_answered").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("diagnostic_session_status_idx").on(table.status), index("diagnostic_session_last_activity_idx").on(table.lastActivityAt)],
);

// Respuestas ACTIVAS finales de un diagnóstico completado (spec §22): nunca una respuesta descartada
// por routing tras una invalidación. Se escribe una sola vez, en la transacción de finalización.
export const diagnosticAnswer = sqliteTable(
  "diagnostic_answer",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull().references(() => diagnosticSession.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    questionVersion: integer("question_version").notNull(),
    /** `AnswerValue` serializada tal cual (`"yes"` o `["domain","social"]`), nunca normalizada a null/false/0. */
    answerValue: text("answer_value").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [uniqueIndex("diagnostic_answer_session_question_unique").on(table.sessionId, table.questionId), index("diagnostic_answer_session_idx").on(table.sessionId)],
);

// Resultado canónico de un diagnóstico completado, recalculado siempre en servidor (spec §26/§27).
// `structured_result_json` es exactamente `DiagnosticResult` (Result Engine, DIAG-V3-05), nunca un
// objeto armado por la UI. `dimension_results_json` conserva `DimensionResult[]` (evidencia real +
// insumos de confianza) tal como los produce el motor: se decidió NO crear una tabla
// `diagnostic_dimension_result` separada (spec §24) porque nada en esta fase necesita consultarla por
// columna SQL; una tabla nueva sin ese uso sería normalizar por dogma. `completion_hash` es la clave
// de idempotencia (spec §28), no una restricción UNIQUE global: dos sesiones distintas con el mismo
// contenido canónico no son un conflicto entre sí, cada una es dueña de su propio `session_id` único.
export const diagnosticResult = sqliteTable(
  "diagnostic_result",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull().references(() => diagnosticSession.id, { onDelete: "cascade" }),
    diagnosticVersion: text("diagnostic_version").notNull(),
    resultSchemaVersion: integer("result_schema_version").notNull(),
    state: text("state").notNull(),
    /** Nullable a propósito: prepara un futuro `overallScore.withheld` (DIAG-V3-UX-01, sin decidir) sin implementarlo aquí. */
    overallScore: integer("overall_score"),
    confidenceLevel: text("confidence_level", { enum: ["alta", "media", "baja"] }).notNull(),
    structuredResultJson: text("structured_result_json").notNull(),
    dimensionResultsJson: text("dimension_results_json").notNull(),
    completionHash: text("completion_hash").notNull(),
    retentionUntil: integer("retention_until", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [uniqueIndex("diagnostic_result_session_unique").on(table.sessionId), index("diagnostic_result_completion_hash_idx").on(table.completionHash)],
);

// "Guardar para después" (DIAG-V3-07). Un snapshot durable por sesión (PK = session_id, nunca dos
// filas para la misma sesión): la fila se reemplaza en cada guardado con contenido nuevo, nunca se
// acumulan filas históricas de saves — eso es responsabilidad de `diagnostic_answer`/`diagnostic_result`
// tras completar, no de este checkpoint intermedio (spec §7). `recovery_lookup_digest` es
// `HMAC-SHA-256` del recovery code normalizado (spec §12): el código en claro nunca se persiste, y el
// índice único permite localizar la sesión directamente por el digest, sin escanear la tabla (spec §14).
// `canonical_hash` es el mismo mecanismo de idempotencia que `diagnostic_result.completion_hash`
// (spec §11): un retry de SAVE con contenido idéntico no dispara un código nuevo.
export const diagnosticSavedSnapshot = sqliteTable(
  "diagnostic_saved_snapshot",
  {
    sessionId: text("session_id").primaryKey().references(() => diagnosticSession.id, { onDelete: "cascade" }),
    revision: integer("revision").notNull(),
    currentQuestionId: text("current_question_id"),
    activeAnswersJson: text("active_answers_json").notNull(),
    questionsSeen: integer("questions_seen").notNull(),
    questionsAnswered: integer("questions_answered").notNull(),
    diagnosticVersion: text("diagnostic_version").notNull(),
    questionBankVersion: integer("question_bank_version").notNull(),
    routingVersion: integer("routing_version").notNull(),
    scoringVersion: integer("scoring_version").notNull(),
    resultSchemaVersion: integer("result_schema_version").notNull(),
    canonicalHash: text("canonical_hash").notNull(),
    recoveryLookupDigest: text("recovery_lookup_digest").notNull(),
    savedAt: integer("saved_at", { mode: "timestamp_ms" }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("diagnostic_saved_snapshot_recovery_digest_unique").on(table.recoveryLookupDigest),
    index("diagnostic_saved_snapshot_expires_idx").on(table.expiresAt),
  ],
);
