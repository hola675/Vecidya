import { allowRateLimitedRequest } from "../features/diagnostic/diagnostic-rate-limit.server";
import { loadDiagnosticEventHistoryV9 } from "../features/diagnostic/qa03b/v9-audit-repository";
import { recoverDiagnosticAuditSessionV9 } from "../features/diagnostic/qa03b/v9-audit-replay.server";
import {
  DIAGNOSTIC_V9_PUBLIC_WORKSPACE_ID,
  readOwnedDiagnosticRunV9,
  type V9IdentityDb,
} from "../features/diagnostic/qa03b/v9-identity-repository";
import { readV9AnonymousIdentityCookie } from "../features/diagnostic/qa03b/anonymous-identity-cookie.server";
import { isV9PublicRuntimeAvailable, type V9PublicRuntimeConfig } from "../features/diagnostic/qa03b/v9-public-availability.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getSession } from "../../server/auth/session.server";

import type { Route } from "./+types/api-diagnostic-v9-run-state";

const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

function failure(status: number, error: string) {
  return Response.json({ error }, { status, headers });
}

function validUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
}

/**
 * Resumes only the caller's own V9 execution.
 * Reconstructs the state from committed events, never from client-provided answers.
 */
export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const runtime = env as unknown as V9PublicRuntimeConfig;
  if (!isV9PublicRuntimeAvailable(runtime)) return failure(503, "El diagnóstico V9 aún no está habilitado.");

  if (!env.DIAGNOSTIC_PUBLIC_RATE_LIMITER) return failure(503, "El servicio no está disponible temporalmente.");
  if (!await allowRateLimitedRequest(env.DIAGNOSTIC_PUBLIC_RATE_LIMITER, request, "diagnostic-v9-resume-run")) {
    return failure(429, "Espera un momento antes de volver a intentarlo.");
  }

  const runId = params.runId;
  if (!validUuid(runId)) return failure(400, "Identificador de diagnóstico inválido.");

  let session;
  try {
    session = await getSession(env, request);
  } catch {
    return failure(503, "No pudimos comprobar tu sesión.");
  }

  const anonymous = session ? null : readV9AnonymousIdentityCookie(request);
  if (!session && !anonymous) return failure(401, "Inicia sesión o recupera tu identidad de visitante.");

  try {
    const db = env.DB as unknown as V9IdentityDb;
    const run = await readOwnedDiagnosticRunV9(db, {
      workspaceId: DIAGNOSTIC_V9_PUBLIC_WORKSPACE_ID,
      runId,
      ...(session ? { userId: session.user.id } : {
        identityId: anonymous!.identityId,
        recoveryCredential: anonymous!.recoveryCredential,
      }),
    });
    if (run.bank_version !== runtime.DIAGNOSTIC_V9_BANK_VERSION ||
        run.engine_version !== runtime.DIAGNOSTIC_V9_ENGINE_VERSION ||
        run.scoring_version !== runtime.DIAGNOSTIC_V9_SCORING_VERSION ||
        run.recommendation_version !== runtime.DIAGNOSTIC_V9_RECOMMENDATION_VERSION ||
        run.consent_version !== runtime.DIAGNOSTIC_V9_CONSENT_VERSION) {
      return failure(409, "Este diagnóstico utiliza otra versión del motor V9.");
    }

    if (run.status === "failed" || run.status === "abandoned") {
      return failure(409, "Este diagnóstico ya no se puede reanudar.");
    }

    const events = await loadDiagnosticEventHistoryV9(db, DIAGNOSTIC_V9_PUBLIC_WORKSPACE_ID, runId);
    if (events.length !== run.last_seq) return failure(409, "El historial todavía no está completo.");

    const startedAt = Date.parse(run.started_at);
    if (!Number.isFinite(startedAt)) return failure(409, "El diagnóstico tiene una fecha inicial inválida.");
    const reconstructed = recoverDiagnosticAuditSessionV9({
      runId,
      startedAt,
      events,
    });
    if (!reconstructed.ok) return failure(409, "El historial no pudo reconstruirse de forma segura.");
    if (run.status === "completed" && reconstructed.session.status !== "completing") {
      return failure(409, "El estado final no coincide con el historial.");
    }

    return Response.json({
      ok: true,
      runId,
      status: run.status,
      startedAt: run.started_at,
      lastSeq: run.last_seq,
      answers: reconstructed.session.answers,
      answeredQuestionIds: reconstructed.session.answeredQuestionIds,
      nextQuestionId: run.status === "active" ? reconstructed.nextQuestionId : null,
      interactionCount: reconstructed.session.interactionCount,
      readyToFinalize: run.status === "active" && reconstructed.session.status === "completing",
      terminalReason: reconstructed.session.terminalReason,
    }, { headers });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "v9_run_not_owned") return failure(404, "No existe un diagnóstico accesible con esa identidad.");
    if (code === "v9_identity_proof_invalid") return failure(403, "La identidad del visitante no se pudo verificar.");
    if (code === "v9_identity_already_claimed") return failure(409, "Esta identidad ya fue reclamada. Inicia sesión.");
    if (code === "v9_anonymous_proof_required" || code === "v9_identity_not_claimable") {
      return failure(401, "No encontramos una identidad recuperable.");
    }
    return failure(503, "No pudimos recuperar el diagnóstico en este momento.");
  }
}

export function action() {
  return failure(405, "Método no permitido.");
}
