import { allowRateLimitedRequest } from "../features/diagnostic/diagnostic-rate-limit.server";
import {
  ensureUserIdentityV9,
  expirePendingDiagnosticIdentityClaimV9,
  finalizeAnonymousIdentityClaimV9,
  prepareAnonymousIdentityClaimV9,
  type V9IdentityDb,
} from "../features/diagnostic/qa03b/v9-identity-repository";
import {
  clearV9AnonymousIdentityCookie,
  readV9AnonymousIdentityCookie,
} from "../features/diagnostic/qa03b/anonymous-identity-cookie.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getSession } from "../../server/auth/session.server";

import type { Route } from "./+types/api-diagnostic-claim-anonymous";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

function failure(status: number, error: string) {
  return Response.json({ error }, { status, headers });
}

export function loader() {
  return failure(405, "Método no permitido.");
}

export async function action({ context, request }: Route.ActionArgs) {
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  const { env } = context.get(cloudflareContext);
  if (!env.DIAGNOSTIC_PUBLIC_RATE_LIMITER) return failure(503, "El servicio no está disponible temporalmente.");
  if (!await allowRateLimitedRequest(env.DIAGNOSTIC_PUBLIC_RATE_LIMITER, request, "claim-anonymous-diagnostic")) {
    return failure(429, "Espera un momento antes de volver a intentarlo.");
  }

  let session;
  try {
    session = await getSession(env, request);
  } catch {
    return failure(503, "No pudimos comprobar tu sesión de Vecidya.");
  }
  if (!session) return failure(401, "Inicia sesión para recuperar tus diagnósticos.");
  const anonymous = readV9AnonymousIdentityCookie(request);
  if (!anonymous) return failure(400, "No encontramos una identidad anónima recuperable en este navegador.");

  const db = env.DB as unknown as V9IdentityDb;
  const claimId = crypto.randomUUID();
  const now = new Date().toISOString();
  try {
    await ensureUserIdentityV9(db, {
      identityId: crypto.randomUUID(),
      userId: session.user.id,
      createdAt: now,
    });
    await prepareAnonymousIdentityClaimV9(db, {
      claimId,
      identityId: anonymous.identityId,
      recoveryCredential: anonymous.recoveryCredential,
      targetUserId: session.user.id,
      createdAt: now,
    });
    const result = await finalizeAnonymousIdentityClaimV9(db, {
      claimId,
      identityId: anonymous.identityId,
      targetUserId: session.user.id,
      completedAt: new Date().toISOString(),
    });
    const responseHeaders = new Headers(headers);
    responseHeaders.append("Set-Cookie", clearV9AnonymousIdentityCookie(request));
    return Response.json({ ok: true, transferredRuns: result.transferredRuns }, { headers: responseHeaders });
  } catch (error) {
    try {
      await expirePendingDiagnosticIdentityClaimV9(db, { claimId, expiredAt: new Date().toISOString() });
    } catch {
      // Preserve the primary error; never expose database details.
    }
    const code = error instanceof Error ? error.message : "";
    if (code === "v9_claim_proof_invalid") return failure(403, "La credencial no demuestra la propiedad de ese diagnóstico.");
    if (code === "v9_claim_identity_not_claimable" || code === "v9_claim_already_claimed" ||
        code === "v9_claim_not_pending" || code === "v9_claim_already_finalized") {
      return failure(409, "Ese historial ya fue reclamado o no puede vincularse.");
    }
    if (code === "v9_claim_invalid_input") return failure(400, "Los datos de recuperación no son válidos.");
    return failure(503, "No pudimos completar la recuperación. Inténtalo de nuevo más tarde.");
  }
}
