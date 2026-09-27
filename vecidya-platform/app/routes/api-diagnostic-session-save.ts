import { createDatabase } from "../../db/client.server";
import { saveDiagnosticSession } from "../../db/queries/diagnostic-save-resume.server";
import { DiagnosticSessionError, getDiagnosticSessionById } from "../../db/queries/diagnostic-sessions.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { readBoundedJsonBody, RequestTooLargeError } from "../../server/diagnostic/request-validation.server";
import { verifyWriteToken } from "../../server/diagnostic/session-security.server";
import { deriveActiveAnswers } from "../features/diagnostic";
import { formatRecoveryCode } from "../../server/diagnostic/recovery-code.server";
import { isDiagnosticSessionId, isQuestionId, type QuestionId } from "../features/diagnostic/contracts";
import { validateAnswersPayload } from "../features/diagnostic/persistence";

import type { Route } from "./+types/api-diagnostic-session-save";

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/**
 * DIAG-V3-07 §17/§27: "Guardar para después", autenticado por `sessionId` + `writeToken`, igual que
 * snapshot/completion (nunca `sessionId` solo). Mina un recovery code nuevo cuando el contenido
 * cambió desde el último SAVE; un retry con el MISMO contenido no vuelve a exponer un código (spec
 * §11): esa respuesta nunca lleva `recoveryCode`, y el body debe seguir usándose como si el código
 * ya se hubiera capturado antes.
 */
export async function action({ context, params, request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const sessionId = params.sessionId;
  if (!isDiagnosticSessionId(sessionId)) return Response.json({ error: "Invalid session id" }, { status: 400 });

  let body: unknown;
  try {
    body = await readBoundedJsonBody(request);
  } catch (error) {
    if (error instanceof RequestTooLargeError) return Response.json({ error: error.message }, { status: 413 });
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  const candidate = body as { writeToken?: unknown; answers?: unknown; currentQuestionId?: unknown; questionsSeen?: unknown; questionsAnswered?: unknown; regenerateCode?: unknown };
  if (typeof candidate.writeToken !== "string") return Response.json({ error: "writeToken is required" }, { status: 400 });

  const { env } = context.get(cloudflareContext);
  const database = createDatabase(env.DB);

  let session;
  try {
    session = await getDiagnosticSessionById(database, sessionId);
  } catch {
    return Response.json({ error: "Session storage is temporarily unavailable" }, { status: 503 });
  }
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
  if (!(await verifyWriteToken(candidate.writeToken, session.tokenHash))) {
    return Response.json({ error: "Invalid session credentials" }, { status: 403 });
  }

  const validated = validateAnswersPayload(candidate.answers);
  if (!validated.ok) return Response.json({ error: validated.error }, { status: 400 });
  const activeAnswers = deriveActiveAnswers(validated.answers);

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

  let outcome;
  try {
    outcome = await saveDiagnosticSession(database, env.DIAGNOSTIC_RECOVERY_HMAC_KEY, {
      sessionId,
      currentQuestionId,
      questionsSeen: candidate.questionsSeen,
      questionsAnswered: candidate.questionsAnswered,
      activeAnswers,
      regenerateCode: candidate.regenerateCode === true,
    });
  } catch (error) {
    if (error instanceof DiagnosticSessionError) return Response.json({ error: error.message }, { status: 409 });
    throw error;
  }

  // Cache-Control: no-store en TODA respuesta de este endpoint (spec §38), no solo cuando lleva
  // `recoveryCode`: es más simple de mantener correcto que condicionarlo por rama de respuesta.
  const headers = { "cache-control": "no-store" };
  if (outcome.status === "already_saved") {
    return Response.json({ status: outcome.status, expiresAt: outcome.expiresAt.toISOString() }, { headers });
  }
  return Response.json(
    { status: outcome.status, recoveryCode: formatRecoveryCode(outcome.recoveryCode), expiresAt: outcome.expiresAt.toISOString() },
    { headers },
  );
}
