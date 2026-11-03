import { allowRateLimitedRequest } from "../features/diagnostic/diagnostic-rate-limit.server";
import {
  DIAGNOSTIC_V9_PUBLIC_WORKSPACE_ID,
  readOwnedDiagnosticRunV9,
  type V9IdentityDb,
} from "../features/diagnostic/qa03b/v9-identity-repository";
import { finalizeOwnedDiagnosticRunV9 } from "../features/diagnostic/qa03b/v9-finalization.server";
import { readV9AnonymousIdentityCookie } from "../features/diagnostic/qa03b/anonymous-identity-cookie.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getSession } from "../../server/auth/session.server";
import {
  isV9PublicRuntimeAvailable,
  type V9PublicRuntimeConfig,
} from "../features/diagnostic/qa03b/v9-public-availability.server";

import type { Route } from "./+types/api-diagnostic-v9-run-result";

const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

function failure(status: number, error: string) {
  return Response.json({ error }, { status, headers });
}

function validUuid(value: unknown): value is string {
  return typeof value === "string" &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
}

/** Owner-only access to immutable, server-computed results; no regeneration. */
export async function loader({ context, request, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const runtime = env as unknown as V9PublicRuntimeConfig;
  if (!isV9PublicRuntimeAvailable(runtime)) return failure(503, "El historial V9 todavía no está habilitado.");
  if (!env.DIAGNOSTIC_PUBLIC_RATE_LIMITER) return failure(503, "El servicio no está disponible temporalmente.");
  if (!await allowRateLimitedRequest(env.DIAGNOSTIC_PUBLIC_RATE_LIMITER, request, "diagnostic-v9-view-result")) {
    return failure(429, "Espera un momento antes de volver a intentarlo.");
  }
  const runId = params.runId;
  if (!validUuid(runId)) return failure(400, "El identificador de diagnóstico no es válido.");
  let session;
  try { session = await getSession(env, request); } catch { return failure(503, "No pudimos verificar tu sesión."); }
  const anonymous = session ? null : readV9AnonymousIdentityCookie(request);
  if (!session && !anonymous) return failure(401, "Inicia sesión o recupera tu identidad de visitante.");

  const owner = {
    workspaceId: DIAGNOSTIC_V9_PUBLIC_WORKSPACE_ID,
    runId,
    ...(session ? { userId: session.user.id } : {
      identityId: anonymous!.identityId,
      recoveryCredential: anonymous!.recoveryCredential,
    }),
  };
  try {
    const db = env.DB as unknown as V9IdentityDb;
    const run = await readOwnedDiagnosticRunV9(db, owner);
    if (run.status !== "completed") return failure(409, "Este diagnóstico todavía no tiene un resultado final.");
    const result = await finalizeOwnedDiagnosticRunV9(db, {
      ...owner,
      expectedVersions: {
        bank: runtime.DIAGNOSTIC_V9_BANK_VERSION!,
        engine: runtime.DIAGNOSTIC_V9_ENGINE_VERSION!,
        scoring: runtime.DIAGNOSTIC_V9_SCORING_VERSION!,
        recommendations: runtime.DIAGNOSTIC_V9_RECOMMENDATION_VERSION!,
        consent: runtime.DIAGNOSTIC_V9_CONSENT_VERSION!,
      },
    });
    return Response.json({ ok: true, ...result }, { headers });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "v9_run_not_owned") return failure(404, "El diagnóstico no existe o no pertenece a esta identidad.");
    if (code === "v9_identity_proof_invalid") return failure(403, "No pudimos verificar tu identidad de visitante.");
    if (code === "v9_identity_already_claimed") return failure(409, "Esta identidad fue reclamada. Inicia sesión.");
    if (code === "v9_run_version_mismatch") return failure(409, "Este diagnóstico utiliza una versión V9 diferente.");
    if (code === "v9_result_integrity_failure") return failure(409, "El resultado guardado no superó las comprobaciones de integridad.");
    return failure(503, "No pudimos recuperar el resultado final.");
  }
}

export function action() {
  return failure(405, "Método no permitido.");
}
