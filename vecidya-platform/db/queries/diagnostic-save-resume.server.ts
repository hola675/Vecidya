import { and, eq, ne } from "drizzle-orm";

import { SAVED_SNAPSHOT_RETENTION_DAYS, isCurrentPersistedVersions, ONE_DAY_MS, type PersistedVersions } from "../../app/features/diagnostic/contracts";
import { buildCanonicalSavePayload, computeSaveHash, type DiagnosticSessionSnapshot } from "../../app/features/diagnostic/persistence";
import type { Answers, QuestionId } from "../../app/features/diagnostic/index";
import { generateRecoveryCode, hashRecoveryCode } from "../../server/diagnostic/recovery-code.server";
import { generateWriteToken, hashWriteToken } from "../../server/diagnostic/session-security.server";
import type { Database } from "../client.server";
import { diagnosticSavedSnapshot, diagnosticSession } from "../schema";
import { DiagnosticSessionError, getDiagnosticSessionById, sessionVersions } from "./diagnostic-sessions.server";

/**
 * "Guardar para después" (DIAG-V3-07). El servidor nunca confía en el progreso enviado por el
 * navegador más de lo que ya exige `snapshotDiagnosticSession` (spec §16): las respuestas activas ya
 * llegan derivadas por quien llama (mismo `deriveActiveAnswers` que usan snapshot/completion), esta
 * capa solo persiste el checkpoint durable y el recovery code.
 */

const MAX_CODE_COLLISION_RETRIES = 5;

export type SaveOutcome = { status: "saved"; recoveryCode: string; expiresAt: Date } | { status: "already_saved"; expiresAt: Date };

export type SaveInput = {
  sessionId: string;
  currentQuestionId: QuestionId | null;
  questionsSeen: number;
  questionsAnswered: number;
  activeAnswers: Answers;
  /**
   * Acción explícita de la persona ("perdí mi código, dame uno nuevo"), distinta de un retry de red
   * (spec §36: cualquier rotación debe ser explícita). Sin esto, un SAVE con el MISMO contenido nunca
   * vuelve a exponer un código — ver el comentario de idempotencia más abajo.
   */
  regenerateCode?: boolean;
  now?: Date;
};

/**
 * Idempotencia de SAVE (spec §11): un retry con el MISMO contenido exacto (mismo hash canónico) no
 * mina un código nuevo — solo extiende `expires_at` y confirma `status=SAVED`. Contenido distinto, o
 * `regenerateCode: true`, sí mina uno nuevo, reemplazando el digest anterior. El código en claro nunca
 * se cachea en ningún almacén: se muestra en la respuesta HTTP exactamente cuando se mina, nunca se
 * recupera después (mismo patrón de exposición única que `writeToken`, DIAG-V3-06-C1).
 *
 * La escritura del snapshot usa `onConflictDoUpdate` sobre la PK (`session_id`), no un
 * insert-o-update decidido en la aplicación: dos SAVE concurrentes del primer guardado de la misma
 * sesión (doble clic, dos pestañas) ya no compiten por una violación de la restricción de la PK —
 * hallazgo de la revisión independiente de DIAG-V3-07 — solo puede quedar una fila, y el segundo en
 * llegar la actualiza en vez de fallar. La única violación de restricción que sigue siendo posible en
 * esta tabla es `recovery_lookup_digest` (código nuevo colisionando con el de otra sesión, ~1 en 2^60),
 * que el bucle de abajo resuelve reintentando con un código distinto.
 */
export async function saveDiagnosticSession(database: Database, recoveryHmacSecret: string, input: SaveInput): Promise<SaveOutcome> {
  const now = input.now ?? new Date();
  const session = await getDiagnosticSessionById(database, input.sessionId);
  if (!session) throw new DiagnosticSessionError("Session not found");
  if (session.status === "COMPLETED") throw new DiagnosticSessionError("Session is already completed");
  const versions = sessionVersions(session);
  if (!versions) throw new DiagnosticSessionError("Session versions are incompatible with the current engine");

  const canonicalPayload = buildCanonicalSavePayload(input.sessionId, versions, input.activeAnswers, {
    currentQuestionId: input.currentQuestionId,
    questionsSeen: input.questionsSeen,
    questionsAnswered: input.questionsAnswered,
  });
  const canonicalHash = await computeSaveHash(canonicalPayload);
  const existing = await database.query.diagnosticSavedSnapshot.findFirst({ where: eq(diagnosticSavedSnapshot.sessionId, input.sessionId) });
  const expiresAt = new Date(now.getTime() + SAVED_SNAPSHOT_RETENTION_DAYS * ONE_DAY_MS);

  const buildSessionStatusUpdate = () =>
    database
      .update(diagnosticSession)
      .set({ status: "SAVED", lastActivityAt: now, updatedAt: now })
      .where(and(eq(diagnosticSession.id, input.sessionId), ne(diagnosticSession.status, "COMPLETED")));

  /**
   * `changes === 0` significa que la sesión ya está `COMPLETED` (carrera con `completeDiagnosticSession`,
   * que corre en su propio `database.batch` atómico — spec §21): borra cualquier fila que este mismo
   * SAVE haya podido escribir, para no dejar un snapshot huérfano de una sesión completada.
   */
  async function runAtomicallyOrCleanUp(write: Parameters<typeof database.batch>[0][number]): Promise<number> {
    const [statusResult] = await database.batch([buildSessionStatusUpdate(), write]);
    if (statusResult.meta.changes === 0) {
      await database.delete(diagnosticSavedSnapshot).where(eq(diagnosticSavedSnapshot.sessionId, input.sessionId));
      throw new DiagnosticSessionError("Session is already completed");
    }
    return statusResult.meta.changes;
  }

  if (existing && existing.canonicalHash === canonicalHash && !input.regenerateCode) {
    const touch = database
      .update(diagnosticSavedSnapshot)
      .set({ savedAt: now, expiresAt, updatedAt: now })
      .where(eq(diagnosticSavedSnapshot.sessionId, input.sessionId));
    await runAtomicallyOrCleanUp(touch);
    return { status: "already_saved", expiresAt };
  }

  const snapshotFields = {
    revision: session.revision,
    currentQuestionId: input.currentQuestionId,
    activeAnswersJson: JSON.stringify(input.activeAnswers),
    questionsSeen: input.questionsSeen,
    questionsAnswered: input.questionsAnswered,
    diagnosticVersion: versions.diagnosticVersion,
    questionBankVersion: versions.questionBankVersion,
    routingVersion: versions.routingVersion,
    scoringVersion: versions.scoringVersion,
    resultSchemaVersion: versions.resultSchemaVersion,
    canonicalHash,
    savedAt: now,
    expiresAt,
    updatedAt: now,
  };

  for (let attempt = 0; attempt < MAX_CODE_COLLISION_RETRIES; attempt += 1) {
    const recoveryCode = generateRecoveryCode();
    const recoveryLookupDigest = await hashRecoveryCode(recoveryHmacSecret, recoveryCode);
    const write = database
      .insert(diagnosticSavedSnapshot)
      .values({ sessionId: input.sessionId, recoveryLookupDigest, ...snapshotFields })
      .onConflictDoUpdate({ target: diagnosticSavedSnapshot.sessionId, set: { recoveryLookupDigest, ...snapshotFields } });

    try {
      await runAtomicallyOrCleanUp(write);
      return { status: "saved", recoveryCode, expiresAt };
    } catch (error) {
      if (error instanceof DiagnosticSessionError) throw error;
      const isDigestCollision = error instanceof Error && /recovery_lookup_digest/i.test(error.message);
      if (!isDigestCollision || attempt === MAX_CODE_COLLISION_RETRIES - 1) throw error;
    }
  }
  throw new DiagnosticSessionError("Could not allocate a unique recovery code");
}

export type RecoverOutcome =
  | {
      ok: true;
      sessionId: string;
      writeToken: string;
      versions: PersistedVersions;
      activeAnswers: Answers;
      currentQuestionId: QuestionId | null;
      questionsSeen: number;
      questionsAnswered: number;
      revision: number;
    }
  | { ok: false; reason: "invalid" | "expired" | "version_mismatch" };

/**
 * Recuperación (spec §17/§18/§19). Falla genérica para digest inexistente, formato casi válido o
 * sesión ya completada (spec §26: no facilitar enumeración); expirado y versión incompatible son
 * distinguibles porque ya se comprobó una credencial legítima. Rota `writeToken` siempre que
 * recupera con éxito (spec §19/§21): el dispositivo anterior pierde capacidad de escribir de
 * inmediato, sin excepción. El recovery code NO se invalida ni se rota aquí — sigue siendo válido
 * hasta completion/expiry/una rotación explícita futura (spec §20), fuera de alcance en V1. La
 * comprobación de expiración/versión ocurre ANTES de cualquier escritura: un código expirado o
 * incompatible nunca toca `token_hash` ni `status`.
 */
export async function recoverDiagnosticSession(database: Database, recoveryHmacSecret: string, normalizedCode: string, now: Date = new Date()): Promise<RecoverOutcome> {
  const recoveryLookupDigest = await hashRecoveryCode(recoveryHmacSecret, normalizedCode);
  const saved = await database.query.diagnosticSavedSnapshot.findFirst({ where: eq(diagnosticSavedSnapshot.recoveryLookupDigest, recoveryLookupDigest) });
  if (!saved) return { ok: false, reason: "invalid" };

  const session = await getDiagnosticSessionById(database, saved.sessionId);
  if (!session || session.status === "COMPLETED") return { ok: false, reason: "invalid" };
  if (now.getTime() > saved.expiresAt.getTime()) return { ok: false, reason: "expired" };

  const versionsCandidate = {
    diagnosticVersion: saved.diagnosticVersion,
    questionBankVersion: saved.questionBankVersion,
    routingVersion: saved.routingVersion,
    scoringVersion: saved.scoringVersion,
    resultSchemaVersion: saved.resultSchemaVersion,
  };
  if (!isCurrentPersistedVersions(versionsCandidate)) return { ok: false, reason: "version_mismatch" };
  const versions = versionsCandidate;

  const newWriteToken = generateWriteToken();
  const newTokenHash = await hashWriteToken(newWriteToken);
  const rotation = await database
    .update(diagnosticSession)
    .set({ tokenHash: newTokenHash, status: "IN_PROGRESS", lastActivityAt: now, updatedAt: now })
    .where(and(eq(diagnosticSession.id, saved.sessionId), ne(diagnosticSession.status, "COMPLETED")));
  if (rotation.meta.changes === 0) return { ok: false, reason: "invalid" };

  return {
    ok: true,
    sessionId: saved.sessionId,
    writeToken: newWriteToken,
    versions,
    activeAnswers: JSON.parse(saved.activeAnswersJson) as Answers,
    currentQuestionId: saved.currentQuestionId as QuestionId | null,
    questionsSeen: saved.questionsSeen,
    questionsAnswered: saved.questionsAnswered,
    revision: saved.revision,
  };
}

/** Snapshot serializable para la respuesta de recuperación, mismo contrato que usa el Browser Store. */
export function recoveredSnapshot(outcome: Extract<RecoverOutcome, { ok: true }>, now: number): DiagnosticSessionSnapshot {
  return {
    sessionId: outcome.sessionId as never,
    versions: outcome.versions,
    status: outcome.questionsAnswered > 0 ? "IN_PROGRESS" : "STARTED",
    startedAt: now,
    lastActivityAt: now,
    revision: outcome.revision,
    currentQuestionId: outcome.currentQuestionId,
    answers: outcome.activeAnswers,
    questionsSeen: outcome.questionsSeen,
    questionsAnswered: outcome.questionsAnswered,
  };
}
