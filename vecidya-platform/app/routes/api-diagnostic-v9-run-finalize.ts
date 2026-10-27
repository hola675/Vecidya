import { readRequestBodyLimited, RequestBodyTooLargeError } from "../features/diagnostic/bounded-request-body.server";
import { allowRateLimitedRequest } from "../features/diagnostic/diagnostic-rate-limit.server";
import {
  DIAGNOSTIC_V9_PUBLIC_WORKSPACE_ID,
  type V9IdentityDb,
} from "../features/diagnostic/qa03b/v9-identity-repository";
import { finalizeOwnedDiagnosticRunV9 } from "../features/diagnostic/qa03b/v9-finalization.server";
import { readV9AnonymousIdentityCookie } from "../features/diagnostic/qa03b/anonymous-identity-cookie.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getSession } from "../../server/auth/session.server";
import { isV9PublicRuntimeAvailable, type V9PublicRuntimeConfig } from "../features/diagnostic/qa03b/v9-public-availability.server";

import type { Route } from "./+types/api-diagnostic-v9-run-finalize";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

function failure(status: number, error: string) {
  return Response.json({ error }, { status, headers });
}

export function loader() {
  return failure(405, "Método no permitido.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validUuid(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
}

export async function action({ context, request, params }: Route.ActionArgs) {
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return failure(415, "Formato no permitido.");

  const { env } = context.get(cloudflareContext);
  const runtime = env as unknown as V9PublicRuntimeConfig;
  if (!isV9PublicRuntimeAvailable(runtime)) return failure(503, "El diagnóstico V9 aún no está habilitado con versiones certificadas.");
  if (!env.DIAGNOSTIC_PUBLIC_RATE_LIMITER) return failure(503, "El servicio no está disponible temporalmente.");
  if (!await allowRateLimitedRequest(env.DIAGNOSTIC_PUBLIC_RATE_LIMITER, request, "diagnostic-v9-finalize-run")) {
    return failure(429, "Espera un momento antes de volver a intentarlo.");
  }

  if (!validUuid(params.runId)) return failure(400, "El identificador del diagnóstico no es válido.");
  let raw: string;
  try {
    raw = await readRequestBodyLimited(request, 1024);
  } catch (error) {
    return failure(error instanceof RequestBodyTooLargeError ? 413 : 400, "La solicitud no tiene un formato válido.");
  }
  try {
    const body: unknown = JSON.parse(raw);
    if (!isRecord(body) || Object.keys(body).length !== 0) return failure(400, "La solicitud no tiene un formato válido.");
  } catch {
    return failure(400, "La solicitud no tiene un formato válido.");
  }

  let session;
  try {
    session = await getSession(env, request);
  } catch {
    return failure(503, "No pudimos comprobar tu sesión de Vecidya.");
  }
  const anonymous = session ? null : readV9AnonymousIdentityCookie(request);
  if (!session && !anonymous) return failure(401, "No encontramos una identidad anónima válida.");

  try {
    const result = await finalizeOwnedDiagnosticRunV9(env.DB as unknown as V9IdentityDb, {
      workspaceId: DIAGNOSTIC_V9_PUBLIC_WORKSPACE_ID,
      runId: params.runId,
      ...(session ? { userId: session.user.id } : {
        identityId: anonymous!.identityId,
        recoveryCredential: anonymous!.recoveryCredential,
      }),
      expectedVersions: {
        bank: runtime.DIAGNOSTIC_V9_BANK_VERSION!,
        engine: runtime.DIAGNOSTIC_V9_ENGINE_VERSION!,
        scoring: runtime.DIAGNOSTIC_V9_SCORING_VERSION!,
        recommendations: runtime.DIAGNOSTIC_V9_RECOMMENDATION_VERSION!,
        consent: runtime.DIAGNOSTIC_V9_CONSENT_VERSION!,
      },
    });
    return Response.json({ ok: true, ...result }, { status: 200, headers });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "v9_run_not_owned") return failure(404, "El diagnóstico no existe o no pertenece a esta identidad.");
    if (code === "v9_identity_proof_invalid") return failure(403, "No pudimos verificar la identidad anónima.");
    if (code === "v9_identity_already_claimed") return failure(409, "Esta identidad ya está asociada a una cuenta. Inicia sesión.");
    if (code === "v9_anonymous_proof_required" || code === "v9_identity_not_claimable") return failure(401, "No encontramos una identidad anónima válida.");
    if (code === "v9_run_not_active") return failure(409, "El diagnóstico ya no admite cambios.");
    if (code === "v9_run_version_mismatch") return failure(409, "La versión del motor cambió. Inicia un diagnóstico nuevo.");
    if (code === "v9_finalize_conflict" || code === "v9_sequence_conflict") return failure(409, "El historial cambió. Recarga el diagnóstico antes de continuar.");
    if (code.startsWith("v9_replay_failed:")) return failure(422, "El diagnóstico no cumple los criterios de finalización.");
    if (code === "v9_history_incomplete" || code === "v9_history_sequence_gap") return failure(409, "El historial está incompleto y no se puede finalizar todavía.");
    return failure(503, "No pudimos finalizar el diagnóstico de forma segura. Inténtalo de nuevo.");
  }
}
