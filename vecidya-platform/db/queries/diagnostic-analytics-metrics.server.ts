import { and, eq, gt, gte, lt, lte, not, sql, type SQL } from "drizzle-orm";

import { ANALYTICS_ABANDONMENT_THRESHOLD_MS } from "../../app/features/diagnostic/analytics";
import type { PersistedVersions, QuestionId } from "../../app/features/diagnostic/contracts";
import type { Database } from "../client.server";
import { diagnosticEvent, diagnosticResult, diagnosticSavedSnapshot, diagnosticSession } from "../schema";

/**
 * Capa de consultas analíticas (DIAG-V3-08 §41). Server-side únicamente: nada aquí se expone por HTTP
 * (spec §52). Toda consulta relevante acepta `versions` para segmentar (spec §38) — también las de SQL
 * crudo (`dropoffByQuestion`, `answerChangeRateByQuestion`, `unknown/naRateByQuestion` y los buckets de
 * `resultDistribution`), vía `sessionInVersions`; un `undefined`
 * consulta sobre TODAS las versiones presentes — solo aceptable mientras exista una única versión real
 * en producción (hoy). `now`/`thresholdMs` son inyectables (spec §51/§58): nunca `Date.now()` interno,
 * para que las pruebas fijen el boundary exacto.
 */
export type VersionFilter = Partial<PersistedVersions>;

/** La pregunta cuyo cambio de respuesta reinicia todas las demás (`applyAnswer` en `answers.ts`). */
const PROFILE_QUESTION_ID: QuestionId = "profile";

function versionWhere(versions: VersionFilter | undefined) {
  const clauses = [];
  if (versions?.diagnosticVersion) clauses.push(eq(diagnosticSession.diagnosticVersion, versions.diagnosticVersion));
  if (versions?.questionBankVersion) clauses.push(eq(diagnosticSession.questionBankVersion, versions.questionBankVersion));
  if (versions?.routingVersion) clauses.push(eq(diagnosticSession.routingVersion, versions.routingVersion));
  if (versions?.scoringVersion) clauses.push(eq(diagnosticSession.scoringVersion, versions.scoringVersion));
  if (versions?.resultSchemaVersion) clauses.push(eq(diagnosticSession.resultSchemaVersion, versions.resultSchemaVersion));
  return clauses;
}

/**
 * `versionWhere` para las consultas de SQL crudo (`database.all(sql\`...\`)`). Esas consultas usan alias
 * (`ds`, `dr`, `v`...) y Drizzle renderiza cada columna calificada con el nombre de su tabla
 * (`"diagnostic_session"."question_bank_version"`), que no resuelve contra un alias. Por eso el filtro
 * se aplica como `<columna session_id> IN (SELECT id FROM diagnostic_session WHERE <versionWhere>)`:
 * la subconsulta referencia la tabla sin alias y reutiliza EXACTAMENTE las mismas cláusulas que las
 * consultas del query builder. Sin filtro devuelve `1 = 1`: la consulta queda igual que antes.
 */
function sessionInVersions(sessionIdColumn: SQL, versions: VersionFilter | undefined): SQL {
  const clauses = versionWhere(versions);
  if (clauses.length === 0) return sql`1 = 1`;
  return sql`${sessionIdColumn} IN (SELECT ${diagnosticSession.id} FROM ${diagnosticSession} WHERE ${and(...clauses)})`;
}

/**
 * Spec §20: una sesión con un "Guardar para después" VIGENTE nunca es abandono ordinario, sea cual sea
 * su status ACTUAL. Tras guardar, seguir respondiendo en la misma pestaña devuelve la sesión a
 * IN_PROGRESS (`snapshotDiagnosticSession`, comportamiento publicado de DIAG-V3-06/07 que aquí no se
 * toca) mientras su fila de `diagnostic_saved_snapshot` sigue vigente hasta 30 días: el código de
 * recuperación funciona, así que la sesión no terminó. "Vigente" es `expires_at >= now`, complemento
 * lógico de `expires_at < now` que usan `expiredSaved` y la rama SAVED de `dropoffByQuestion`.
 */
function hasLiveSavedSnapshot(now: Date): SQL {
  return sql`exists (select 1 from ${diagnosticSavedSnapshot} where ${and(eq(diagnosticSavedSnapshot.sessionId, diagnosticSession.id), gte(diagnosticSavedSnapshot.expiresAt, now))})`;
}

export type LifecycleMetrics = {
  starts: number;
  completions: number;
  completionRate: number;
  activeIncomplete: number;
  analyticallyAbandoned: number;
  expiredSaved: number;
  averageTimeToCompleteMs: number | null;
};

async function lifecycle(database: Database, options: { versions?: VersionFilter; now?: Date; thresholdMs?: number } = {}): Promise<LifecycleMetrics> {
  const now = options.now ?? new Date();
  const thresholdMs = options.thresholdMs ?? ANALYTICS_ABANDONMENT_THRESHOLD_MS;
  const cutoff = new Date(now.getTime() - thresholdMs);
  const extra = versionWhere(options.versions);

  // Boundary must match the canonical pure predicate `isAnalyticallyAbandoned`
  // (`nowMs - lastActivityAt >= thresholdMs`, inclusive — see
  // app/features/diagnostic/analytics.ts and its unit test "boundary is inclusive"). Expressed
  // against `cutoff = now - thresholdMs`: abandoned is `lastActivityAt <= cutoff` (lte), active is
  // `lastActivityAt > cutoff` (gt, strict) — together they partition every STARTED/IN_PROGRESS
  // session with no gap and no overlap at `lastActivityAt === cutoff`.
  //
  // Excepción deliberada a esa partición (spec §20, `hasLiveSavedSnapshot`): una sesión STARTED/
  // IN_PROGRESS inactiva más allá del umbral pero con un snapshot guardado VIGENTE no es abandonada. No
  // cae en `activeIncomplete` (no está activa) ni en `analyticallyAbandoned` (su recovery code sigue
  // funcionando): queda, como una sesión SAVED vigente, fuera de ambos conteos hasta que el snapshot
  // venza; a partir de ahí cuenta como abandonada.

  const [{ value: starts }] = await database.select({ value: sql<number>`count(*)` }).from(diagnosticSession).where(and(...extra));
  const [{ value: completions }] = await database
    .select({ value: sql<number>`count(*)` })
    .from(diagnosticSession)
    .where(and(eq(diagnosticSession.status, "COMPLETED"), ...extra));
  const [{ value: activeIncomplete }] = await database
    .select({ value: sql<number>`count(*)` })
    .from(diagnosticSession)
    .where(and(sql`${diagnosticSession.status} in ('STARTED','IN_PROGRESS')`, gt(diagnosticSession.lastActivityAt, cutoff), ...extra));
  const [{ value: analyticallyAbandoned }] = await database
    .select({ value: sql<number>`count(*)` })
    .from(diagnosticSession)
    .where(and(sql`${diagnosticSession.status} in ('STARTED','IN_PROGRESS')`, lte(diagnosticSession.lastActivityAt, cutoff), not(hasLiveSavedSnapshot(now)), ...extra));
  const [{ value: expiredSaved }] = await database
    .select({ value: sql<number>`count(*)` })
    .from(diagnosticSession)
    .innerJoin(diagnosticSavedSnapshot, eq(diagnosticSavedSnapshot.sessionId, diagnosticSession.id))
    .where(and(eq(diagnosticSession.status, "SAVED"), lt(diagnosticSavedSnapshot.expiresAt, now), ...extra));
  const [{ value: averageTimeToCompleteMs }] = await database
    .select({ value: sql<number | null>`avg(${diagnosticSession.completedAt} - ${diagnosticSession.startedAt})` })
    .from(diagnosticSession)
    .where(and(eq(diagnosticSession.status, "COMPLETED"), ...extra));

  return {
    starts,
    completions,
    completionRate: starts > 0 ? completions / starts : 0,
    activeIncomplete,
    analyticallyAbandoned,
    expiredSaved,
    averageTimeToCompleteMs: averageTimeToCompleteMs ?? null,
  };
}

export type SaveResumeMetrics = {
  saved: number;
  resumed: number;
  saveRate: number;
  savedResumeRate: number;
};

async function saveResume(database: Database, options: { versions?: VersionFilter } = {}): Promise<SaveResumeMetrics> {
  const extra = versionWhere(options.versions);
  const [{ value: starts }] = await database.select({ value: sql<number>`count(*)` }).from(diagnosticSession).where(and(...extra));
  const [{ value: saved }] = await database
    .select({ value: sql<number>`count(*)` })
    .from(diagnosticSession)
    .where(and(sql`${diagnosticSession.saveCount} > 0`, ...extra));
  const [{ value: resumed }] = await database
    .select({ value: sql<number>`count(*)` })
    .from(diagnosticSession)
    .where(and(sql`${diagnosticSession.resumeCount} > 0`, ...extra));

  return {
    saved,
    resumed,
    saveRate: starts > 0 ? saved / starts : 0,
    // Spec §35: "SAVED SESSIONS THAT LATER RESUME / SAVED SESSIONS" — never "recovery endpoint success
    // rate", a different thing this service deliberately does not compute (invalid attempts aren't
    // stored here at all, spec §36).
    savedResumeRate: saved > 0 ? resumed / saved : 0,
  };
}

export type DropoffRow = { questionId: string; shownAndValid: number; droppedOff: number; dropoffRate: number };

/**
 * Denominador (spec §17): sesiones donde Q fue mostrada Y seguía siendo válida en la ruta (sin
 * `QUESTION_INVALIDATED` posterior al último `QUESTION_SHOWN`). Numerador: ese mismo conjunto, sin
 * `ANSWER_SUBMITTED` posterior, Y la sesión terminó "definitivamente" sin completar — abandonada por
 * inactividad (STARTED/IN_PROGRESS) o con snapshot guardado ya expirado (`expired_saved`). Una sesión
 * SAVED con snapshot vivo, o todavía activa dentro del umbral, NUNCA cuenta como dropoff de Q (spec
 * §17 punto 5, §20): solo cuenta cuando ya está clasificada analíticamente como terminada. Lo mismo
 * para una STARTED/IN_PROGRESS inactiva con snapshot guardado vigente (ver `hasLiveSavedSnapshot`):
 * guardó, siguió respondiendo en la misma pestaña (vuelve a IN_PROGRESS) y su código sigue sirviendo.
 *
 * Reinicio por cambio de perfil (`resets`): `applyAnswer` descarta TODAS las respuestas salvo el perfil
 * nuevo cuando el perfil cambia, sin emitir `QUESTION_INVALIDATED` por cada una (motor publicado, no se
 * toca aquí); el único rastro en la telemetría es el `ANSWER_CHANGED` de `profile` que el cliente emite
 * en ese mismo clic. Ese evento se trata como una invalidación implícita de todo lo anterior de la
 * sesión, excepto de la propia pregunta `profile` (cuyo `ANSWER_CHANGED` ES su respuesta vigente):
 *  - una muestra de Q anterior al reinicio ya no vale para el denominador (Q se mostró en otro contexto);
 *  - un `ANSWER_SUBMITTED` de Q anterior al reinicio ya no cuenta como respuesta: si Q se vuelve a
 *    mostrar tras el reinicio y la persona abandona sin responderla de nuevo, SÍ es dropoff de Q.
 * No se exige que la respuesta sea posterior a la ÚLTIMA muestra de Q: volver atrás a una pregunta ya
 * respondida la muestra otra vez (`QUESTION_SHOWN` por cada cambio de pregunta visible) sin que su
 * respuesta desaparezca, y abandonar ahí no es dejarla sin responder.
 */
async function dropoffByQuestion(database: Database, options: { versions?: VersionFilter; now?: Date; thresholdMs?: number } = {}): Promise<DropoffRow[]> {
  const now = options.now ?? new Date();
  const thresholdMs = options.thresholdMs ?? ANALYTICS_ABANDONMENT_THRESHOLD_MS;

  const rows = await database.all<{ question_id: string; shown_and_valid: number; dropped_off: number }>(sql`
    WITH shown AS (
      SELECT session_id, question_id, MAX(id) AS last_shown_id
      FROM diagnostic_event WHERE event_type = 'QUESTION_SHOWN' AND question_id IS NOT NULL
      GROUP BY session_id, question_id
    ),
    invalidated AS (
      SELECT session_id, question_id, MAX(id) AS last_invalidated_id
      FROM diagnostic_event WHERE event_type = 'QUESTION_INVALIDATED' AND question_id IS NOT NULL
      GROUP BY session_id, question_id
    ),
    resets AS (
      SELECT session_id, MAX(id) AS last_reset_id
      FROM diagnostic_event WHERE event_type = 'ANSWER_CHANGED' AND question_id = ${PROFILE_QUESTION_ID}
      GROUP BY session_id
    ),
    answered AS (
      SELECT session_id, question_id, MAX(id) AS last_answered_id
      FROM diagnostic_event WHERE event_type = 'ANSWER_SUBMITTED' AND question_id IS NOT NULL
      GROUP BY session_id, question_id
    ),
    valid AS (
      SELECT s.session_id, s.question_id, r.last_reset_id
      FROM shown s
      LEFT JOIN invalidated i ON i.session_id = s.session_id AND i.question_id = s.question_id
      LEFT JOIN resets r ON r.session_id = s.session_id AND s.question_id <> ${PROFILE_QUESTION_ID}
      WHERE (i.last_invalidated_id IS NULL OR i.last_invalidated_id < s.last_shown_id)
        AND (r.last_reset_id IS NULL OR r.last_reset_id < s.last_shown_id)
    )
    SELECT
      v.question_id AS question_id,
      COUNT(*) AS shown_and_valid,
      SUM(CASE
        WHEN a.session_id IS NOT NULL THEN 0
        WHEN ds.status = 'COMPLETED' THEN 0
        WHEN ds.status IN ('STARTED','IN_PROGRESS') AND (${now.getTime()} - ds.last_activity_at) >= ${thresholdMs}
          AND NOT EXISTS (SELECT 1 FROM diagnostic_saved_snapshot live WHERE live.session_id = ds.id AND live.expires_at >= ${now.getTime()}) THEN 1
        WHEN ds.status = 'SAVED' AND EXISTS (SELECT 1 FROM diagnostic_saved_snapshot sn WHERE sn.session_id = ds.id AND sn.expires_at < ${now.getTime()}) THEN 1
        ELSE 0
      END) AS dropped_off
    FROM valid v
    JOIN diagnostic_session ds ON ds.id = v.session_id
    LEFT JOIN answered a ON a.session_id = v.session_id AND a.question_id = v.question_id
      AND (v.last_reset_id IS NULL OR a.last_answered_id > v.last_reset_id)
    WHERE ${sessionInVersions(sql`v.session_id`, options.versions)}
    GROUP BY v.question_id
  `);

  return rows.map((row) => ({
    questionId: row.question_id,
    shownAndValid: row.shown_and_valid,
    droppedOff: row.dropped_off,
    dropoffRate: row.shown_and_valid > 0 ? row.dropped_off / row.shown_and_valid : 0,
  }));
}

export type ChangeRateRow = { questionId: string; sessionsAnswered: number; sessionsChanged: number; sessionChangeRate: number; totalChangeEvents: number };

async function answerChangeRateByQuestion(database: Database, options: { versions?: VersionFilter } = {}): Promise<ChangeRateRow[]> {
  const rows = await database.all<{ question_id: string; sessions_answered: number; sessions_changed: number; total_change_events: number }>(sql`
    WITH answered AS (
      SELECT DISTINCT session_id, question_id FROM diagnostic_event WHERE event_type = 'ANSWER_SUBMITTED' AND question_id IS NOT NULL
    ),
    changes AS (
      SELECT session_id, question_id, COUNT(*) AS change_count FROM diagnostic_event WHERE event_type = 'ANSWER_CHANGED' AND question_id IS NOT NULL GROUP BY session_id, question_id
    )
    SELECT
      a.question_id AS question_id,
      COUNT(DISTINCT a.session_id) AS sessions_answered,
      COUNT(DISTINCT c.session_id) AS sessions_changed,
      COALESCE(SUM(c.change_count), 0) AS total_change_events
    FROM answered a
    LEFT JOIN changes c ON c.session_id = a.session_id AND c.question_id = a.question_id
    WHERE ${sessionInVersions(sql`a.session_id`, options.versions)}
    GROUP BY a.question_id
  `);

  return rows.map((row) => ({
    questionId: row.question_id,
    sessionsAnswered: row.sessions_answered,
    sessionsChanged: row.sessions_changed,
    sessionChangeRate: row.sessions_answered > 0 ? row.sessions_changed / row.sessions_answered : 0,
    totalChangeEvents: row.total_change_events,
  }));
}

export type AnswerKindRateRow = { questionId: string; interactions: number; matching: number; rate: number };

async function rateByAnswerKind(database: Database, kind: "unknown" | "not_applicable", options: { versions?: VersionFilter } = {}): Promise<AnswerKindRateRow[]> {
  const rows = await database.all<{ question_id: string; interactions: number; matching: number }>(sql`
    SELECT
      question_id,
      COUNT(*) AS interactions,
      SUM(CASE WHEN answer_kind = ${kind} THEN 1 ELSE 0 END) AS matching
    FROM diagnostic_event
    WHERE event_type = 'ANSWER_SUBMITTED' AND question_id IS NOT NULL
      AND ${sessionInVersions(sql`diagnostic_event.session_id`, options.versions)}
    GROUP BY question_id
  `);
  return rows.map((row) => ({ questionId: row.question_id, interactions: row.interactions, matching: row.matching, rate: row.interactions > 0 ? row.matching / row.interactions : 0 }));
}

const unknownRateByQuestion = (database: Database, options: { versions?: VersionFilter } = {}) => rateByAnswerKind(database, "unknown", options);
const naRateByQuestion = (database: Database, options: { versions?: VersionFilter } = {}) => rateByAnswerKind(database, "not_applicable", options);

export type ResultDistribution = {
  byState: Array<{ state: string; count: number }>;
  overallScoreBuckets: Array<{ bucket: string; count: number }>;
  dimensionAverageScores: Array<{ dimension: string; averageScore: number; evaluatedCount: number }>;
};

async function resultDistribution(database: Database, options: { versions?: VersionFilter } = {}): Promise<ResultDistribution> {
  const stateRows = await database
    .select({ state: diagnosticResult.state, count: sql<number>`count(*)` })
    .from(diagnosticResult)
    .innerJoin(diagnosticSession, eq(diagnosticSession.id, diagnosticResult.sessionId))
    .where(and(...versionWhere(options.versions)))
    .groupBy(diagnosticResult.state);

  const bucketRows = await database.all<{ bucket: string; count: number }>(sql`
    SELECT
      CASE
        WHEN overall_score IS NULL THEN 'withheld'
        WHEN overall_score < 25 THEN '0-24'
        WHEN overall_score < 50 THEN '25-49'
        WHEN overall_score < 75 THEN '50-74'
        ELSE '75-100'
      END AS bucket,
      COUNT(*) AS count
    FROM diagnostic_result dr
    JOIN diagnostic_session ds ON ds.id = dr.session_id
    WHERE ${sessionInVersions(sql`dr.session_id`, options.versions)}
    GROUP BY bucket
  `);

  // dimension_results_json holds DimensionResult[] (facts.ts) per completed session — parsed in JS,
  // not SQL: SQLite's json_each is available in D1 but the codebase has no existing precedent for it,
  // and this keeps the aggregation readable and testable with plain fixtures.
  const resultRows = await database.select({ dimensionResultsJson: diagnosticResult.dimensionResultsJson }).from(diagnosticResult).innerJoin(diagnosticSession, eq(diagnosticSession.id, diagnosticResult.sessionId)).where(and(...versionWhere(options.versions)));

  const perDimension = new Map<string, { sum: number; evaluatedCount: number }>();
  for (const row of resultRows) {
    const dimensionResults = JSON.parse(row.dimensionResultsJson) as Array<{ id: string; evaluated: boolean; score: { score: number | null } }>;
    for (const dimension of dimensionResults) {
      if (!dimension.evaluated || dimension.score.score === null) continue;
      const entry = perDimension.get(dimension.id) ?? { sum: 0, evaluatedCount: 0 };
      entry.sum += dimension.score.score;
      entry.evaluatedCount += 1;
      perDimension.set(dimension.id, entry);
    }
  }

  return {
    byState: stateRows.map((row) => ({ state: row.state, count: row.count })),
    overallScoreBuckets: bucketRows,
    dimensionAverageScores: [...perDimension.entries()].map(([dimension, entry]) => ({ dimension, averageScore: entry.sum / entry.evaluatedCount, evaluatedCount: entry.evaluatedCount })),
  };
}

export type EvidenceCoverageRow = { dimension: string; evaluatedCount: number; averageEvidenceCount: number; averageCoverage: number; unknownCount: number };

/**
 * `confidenceInputs.contradictionCount` en cada `DimensionResult` es el conteo GLOBAL de
 * contradicciones de la sesión (facts.ts pasa `contradictions.length` a las 7 dimensiones por igual),
 * no una cifra específica de esa dimensión — no se reporta "por dimensión" aquí para no fabricar una
 * métrica que el motor no produce (spec §43: nada inventado). Un `contradictionRatePerCompletedSession`
 * separado (no por dimensión) cubre ese ángulo honestamente.
 */
async function evidenceCoverageByDimension(database: Database, options: { versions?: VersionFilter } = {}): Promise<{ byDimension: EvidenceCoverageRow[]; contradictionsPerCompletedSession: number }> {
  const rows = await database.select({ dimensionResultsJson: diagnosticResult.dimensionResultsJson }).from(diagnosticResult).innerJoin(diagnosticSession, eq(diagnosticSession.id, diagnosticResult.sessionId)).where(and(...versionWhere(options.versions)));

  type Accumulator = { evaluatedCount: number; evidenceSum: number; coverageSum: number; unknownSum: number };
  const perDimension = new Map<string, Accumulator>();
  let contradictionSum = 0;

  for (const row of rows) {
    const dimensionResults = JSON.parse(row.dimensionResultsJson) as Array<{
      id: string;
      evaluated: boolean;
      confidenceInputs: { evidenceCount: number; unknownCount: number; coverage: number; contradictionCount: number };
    }>;
    contradictionSum += dimensionResults[0]?.confidenceInputs.contradictionCount ?? 0;
    for (const dimension of dimensionResults) {
      const entry = perDimension.get(dimension.id) ?? { evaluatedCount: 0, evidenceSum: 0, coverageSum: 0, unknownSum: 0 };
      if (dimension.evaluated) entry.evaluatedCount += 1;
      entry.evidenceSum += dimension.confidenceInputs.evidenceCount;
      entry.coverageSum += dimension.confidenceInputs.coverage;
      entry.unknownSum += dimension.confidenceInputs.unknownCount;
      perDimension.set(dimension.id, entry);
    }
  }

  const total = rows.length;
  return {
    byDimension: [...perDimension.entries()].map(([dimension, entry]) => ({
      dimension,
      evaluatedCount: entry.evaluatedCount,
      averageEvidenceCount: total > 0 ? entry.evidenceSum / total : 0,
      averageCoverage: total > 0 ? entry.coverageSum / total : 0,
      unknownCount: entry.unknownSum,
    })),
    contradictionsPerCompletedSession: total > 0 ? contradictionSum / total : 0,
  };
}

export const diagnosticAnalytics = {
  lifecycle,
  saveResume,
  dropoffByQuestion,
  answerChangeRateByQuestion,
  unknownRateByQuestion,
  naRateByQuestion,
  resultDistribution,
  evidenceCoverageByDimension,
};
