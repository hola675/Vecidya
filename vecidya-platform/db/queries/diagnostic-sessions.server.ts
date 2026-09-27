import { eq } from "drizzle-orm";

import { AUTOSAVE_SNAPSHOT_RETENTION_DAYS, COMPLETED_RESULT_RETENTION_DAYS, isCurrentPersistedVersions, isDiagnosticSessionId, ONE_DAY_MS, type PersistedVersions } from "../../app/features/diagnostic/contracts";
import { deriveContext, explainResult, type Answers, type DiagnosticResult, type QuestionId } from "../../app/features/diagnostic/index";
import { buildCanonicalCompletionPayload, computeCompletionHash } from "../../app/features/diagnostic/persistence";
import type { Database } from "../client.server";
import { diagnosticAnswer, diagnosticResult, diagnosticSession } from "../schema";

/**
 * Consultas de sesión anónima del Diagnóstico (DIAG-V3-06). El servidor nunca confía en un objeto de
 * respuestas ni en un resultado enviado por el cliente (spec §14/§26): `completeDiagnosticSession`
 * recalcula todo con el motor real (`explainResult`) y persiste ese resultado, nunca uno recibido.
 */

export class DiagnosticSessionError extends Error {}
export class DiagnosticCompletionConflictError extends Error {}

export type DiagnosticSessionRow = typeof diagnosticSession.$inferSelect;

export async function createDiagnosticSession(database: Database, input: { tokenHash: string; versions: PersistedVersions; now?: Date }) {
  const now = input.now ?? new Date();
  const snapshotExpiresAt = new Date(now.getTime() + AUTOSAVE_SNAPSHOT_RETENTION_DAYS * ONE_DAY_MS);
  const id = crypto.randomUUID();

  await database.insert(diagnosticSession).values({
    id,
    status: "STARTED",
    tokenHash: input.tokenHash,
    diagnosticVersion: input.versions.diagnosticVersion,
    questionBankVersion: input.versions.questionBankVersion,
    routingVersion: input.versions.routingVersion,
    scoringVersion: input.versions.scoringVersion,
    resultSchemaVersion: input.versions.resultSchemaVersion,
    startedAt: now,
    lastActivityAt: now,
    snapshotExpiresAt,
    revision: 0,
    questionsSeen: 0,
    questionsAnswered: 0,
  });

  return { id, versions: input.versions, status: "STARTED" as const, snapshotExpiresAt };
}

export async function getDiagnosticSessionById(database: Database, sessionId: string): Promise<DiagnosticSessionRow | undefined> {
  if (!isDiagnosticSessionId(sessionId)) return undefined;
  return database.query.diagnosticSession.findFirst({ where: eq(diagnosticSession.id, sessionId) });
}

export function sessionVersions(session: DiagnosticSessionRow): PersistedVersions | null {
  const candidate = {
    diagnosticVersion: session.diagnosticVersion,
    questionBankVersion: session.questionBankVersion,
    routingVersion: session.routingVersion,
    scoringVersion: session.scoringVersion,
    resultSchemaVersion: session.resultSchemaVersion,
  };
  return isCurrentPersistedVersions(candidate) ? candidate : null;
}

export type SnapshotInput = {
  sessionId: string;
  currentQuestionId: QuestionId | null;
  questionsSeen: number;
  questionsAnswered: number;
  activeAnswers: Answers;
  now?: Date;
};

/**
 * Actualiza únicamente la metadata de la sesión en D1 (spec §13: nunca resultados ni respuestas
 * completas durante el autosave; eso vive en el snapshot de KV). Rechaza una sesión ya finalizada
 * (spec §33) y una sesión con versiones incompatibles con el motor actual (spec §45: sin casts).
 */
export async function snapshotDiagnosticSession(database: Database, input: SnapshotInput) {
  const now = input.now ?? new Date();
  const session = await getDiagnosticSessionById(database, input.sessionId);
  if (!session) throw new DiagnosticSessionError("Session not found");
  if (session.status === "COMPLETED") throw new DiagnosticSessionError("Session is already completed");
  if (!sessionVersions(session)) throw new DiagnosticSessionError("Session versions are incompatible with the current engine");

  const context = deriveContext(input.activeAnswers);
  const nextRevision = session.revision + 1;
  const nextStatus = input.questionsAnswered > 0 ? ("IN_PROGRESS" as const) : (session.status as "STARTED" | "IN_PROGRESS");
  const snapshotExpiresAt = new Date(now.getTime() + AUTOSAVE_SNAPSHOT_RETENTION_DAYS * ONE_DAY_MS);

  await database
    .update(diagnosticSession)
    .set({
      status: nextStatus,
      lastActivityAt: now,
      snapshotExpiresAt,
      revision: nextRevision,
      currentQuestionId: input.currentQuestionId,
      questionsSeen: input.questionsSeen,
      questionsAnswered: input.questionsAnswered,
      profile: context.profile ?? session.profile,
      stage: context.stage ?? session.stage,
      goal: context.goal ?? session.goal,
      updatedAt: now,
    })
    .where(eq(diagnosticSession.id, input.sessionId));

  return { revision: nextRevision, status: nextStatus, snapshotExpiresAt };
}

export type CompletionOutcome =
  | { status: "completed"; result: DiagnosticResult }
  | { status: "already_completed"; result: DiagnosticResult };

/**
 * Finalización idempotente y transaccional (spec §27/§28). El cliente nunca es autoridad de
 * scores/estado/recomendaciones: aquí se valida, se deriva, se recalcula con `explainResult` y solo
 * ese resultado se persiste. Repetir la misma finalización (mismo hash canónico) devuelve el
 * resultado ya guardado; una finalización distinta sobre una sesión ya completada es un conflicto
 * explícito, nunca una sobreescritura silenciosa.
 */
export async function completeDiagnosticSession(
  database: Database,
  input: { sessionId: string; rawAnswers: Answers; now?: Date },
): Promise<CompletionOutcome> {
  const now = input.now ?? new Date();
  const session = await getDiagnosticSessionById(database, input.sessionId);
  if (!session) throw new DiagnosticSessionError("Session not found");
  const versions = sessionVersions(session);
  if (!versions) throw new DiagnosticSessionError("Session versions are incompatible with the current engine");

  const trace = explainResult(input.rawAnswers);
  if (!trace) throw new DiagnosticSessionError("Answers do not resolve a profile");
  const activeAnswers = trace.facts.context.answers;
  const canonicalPayload = buildCanonicalCompletionPayload(input.sessionId, versions, activeAnswers);
  const completionHash = await computeCompletionHash(canonicalPayload);

  if (session.status === "COMPLETED") {
    const existing = await database.query.diagnosticResult.findFirst({ where: eq(diagnosticResult.sessionId, input.sessionId) });
    if (!existing) throw new DiagnosticSessionError("Completed session has no stored result");
    if (existing.completionHash !== completionHash) {
      throw new DiagnosticCompletionConflictError("Session already completed with a different canonical payload");
    }
    return { status: "already_completed", result: JSON.parse(existing.structuredResultJson) as DiagnosticResult };
  }

  const retentionUntil = new Date(now.getTime() + COMPLETED_RESULT_RETENTION_DAYS * ONE_DAY_MS);
  const answerRecords = Object.entries(activeAnswers as Record<string, unknown>);

  const answerInserts = answerRecords.map(([questionId, value]) =>
    database.insert(diagnosticAnswer).values({
      id: crypto.randomUUID(),
      sessionId: input.sessionId,
      questionId,
      questionVersion: 1,
      answerValue: JSON.stringify(value),
      createdAt: now,
    }),
  );

  const resultInsert = database.insert(diagnosticResult).values({
    id: crypto.randomUUID(),
    sessionId: input.sessionId,
    diagnosticVersion: versions.diagnosticVersion,
    resultSchemaVersion: versions.resultSchemaVersion,
    state: trace.result.state.id,
    overallScore: trace.result.overallScore,
    confidenceLevel: trace.result.confidence.level,
    structuredResultJson: JSON.stringify(trace.result),
    dimensionResultsJson: JSON.stringify(trace.facts.dimensionResults),
    completionHash,
    retentionUntil,
    createdAt: now,
  });

  const sessionUpdate = database
    .update(diagnosticSession)
    .set({
      status: "COMPLETED",
      completedAt: now,
      updatedAt: now,
      profile: trace.facts.profile,
      stage: trace.facts.context.stage ?? null,
      goal: trace.facts.context.goal ?? null,
    })
    .where(eq(diagnosticSession.id, input.sessionId));

  const statements = [...answerInserts, resultInsert, sessionUpdate];
  await database.batch(statements as [(typeof statements)[number], ...(typeof statements)[number][]]);

  return { status: "completed", result: trace.result };
}
