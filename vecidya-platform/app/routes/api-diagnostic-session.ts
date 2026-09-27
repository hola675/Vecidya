import { createDatabase } from "../../db/client.server";
import { DiagnosticSessionError, getDiagnosticSessionById, sessionVersions, snapshotDiagnosticSession } from "../../db/queries/diagnostic-sessions.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { putDiagnosticSnapshot } from "../../server/diagnostic/kv-snapshot.server";
import { readBoundedJsonBody, RequestTooLargeError } from "../../server/diagnostic/request-validation.server";
import { verifyWriteToken } from "../../server/diagnostic/session-security.server";
import { isDiagnosticSessionId, isQuestionId, type DiagnosticSessionId, type QuestionId } from "../features/diagnostic/contracts";
import { validateAnswersPayload } from "../features/diagnostic/persistence";

import type { Route } from "./+types/api-diagnostic-session";

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/**
 * DIAG-V3-06 §30/§32: snapshot autenticado por sessionId + writeToken (nunca por sessionId solo).
 * Guarda metadata mínima en D1 y el snapshot completo en KV (best-effort, spec §37): una caída de KV
 * no debe bloquear que la persona siga respondiendo preguntas.
 */
export async function action({ context, params, request }: Route.ActionArgs) {
  if (request.method !== "PATCH") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const sessionId = params.sessionId;
  if (!isDiagnosticSessionId(sessionId)) return Response.json({ error: "Invalid session id" }, { status: 400 });

  let body: unknown;
  try {
    body = await readBoundedJsonBody(request);
  } catch (error) {
    if (error instanceof RequestTooLargeError) return Response.json({ error: error.message }, { status: 413 });
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const candidate = body as {
    writeToken?: unknown;
    answers?: unknown;
    currentQuestionId?: unknown;
    questionsSeen?: unknown;
    questionsAnswered?: unknown;
  };
  if (typeof candidate.writeToken !== "string") return Response.json({ error: "writeToken is required" }, { status: 400 });

  const { env } = context.get(cloudflareContext);
  const database = createDatabase(env.DB);

  const session = await getDiagnosticSessionById(database, sessionId);
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
  if (!(await verifyWriteToken(candidate.writeToken, session.tokenHash))) {
    return Response.json({ error: "Invalid session credentials" }, { status: 403 });
  }
  if (session.status === "COMPLETED") return Response.json({ error: "Session is already completed" }, { status: 409 });

  const answers = validateAnswersPayload(candidate.answers);
  if (!answers.ok) return Response.json({ error: answers.error }, { status: 400 });

  let currentQuestionId: QuestionId | null;
  if (candidate.currentQuestionId === null || candidate.currentQuestionId === undefined) {
    currentQuestionId = null;
  } else if (isQuestionId(candidate.currentQuestionId)) {
    currentQuestionId = candidate.currentQuestionId;
  } else {
    return Response.json({ error: "Invalid currentQuestionId" }, { status: 400 });
  }
  if (!isNonNegativeInteger(candidate.questionsSeen) || !isNonNegativeInteger(candidate.questionsAnswered)) {
    return Response.json({ error: "questionsSeen and questionsAnswered must be non-negative integers" }, { status: 400 });
  }

  let snapshotResult;
  try {
    snapshotResult = await snapshotDiagnosticSession(database, {
      sessionId,
      currentQuestionId,
      questionsSeen: candidate.questionsSeen,
      questionsAnswered: candidate.questionsAnswered,
      activeAnswers: answers.answers,
    });
  } catch (error) {
    if (error instanceof DiagnosticSessionError) return Response.json({ error: error.message }, { status: 409 });
    throw error;
  }

  const versions = sessionVersions(session);
  if (versions) {
    try {
      await putDiagnosticSnapshot(env.DIAGNOSTIC_SNAPSHOTS, sessionId, {
        sessionId: sessionId as DiagnosticSessionId,
        versions,
        status: snapshotResult.status,
        startedAt: session.startedAt.getTime(),
        lastActivityAt: Date.now(),
        revision: snapshotResult.revision,
        currentQuestionId,
        answers: answers.answers,
        questionsSeen: candidate.questionsSeen,
        questionsAnswered: candidate.questionsAnswered,
      });
    } catch {
      // KV es best-effort (spec §16/§37): D1 ya guardó la metadata de la sesión.
    }
  }

  return Response.json({ revision: snapshotResult.revision, status: snapshotResult.status });
}
