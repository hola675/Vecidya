import { allowRateLimitedRequest } from "../features/diagnostic/diagnostic-rate-limit.server";
import {
  createAnonymousIdentityCredentialV9,
  verifyAnonymousIdentityCredentialV9,
  type V9IdentityDb,
} from "../features/diagnostic/qa03b/v9-identity-repository";
import {
  buildV9AnonymousIdentityCookie,
  readV9AnonymousIdentityCookie,
} from "../features/diagnostic/qa03b/anonymous-identity-cookie.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { getSession } from "../../server/auth/session.server";

import type { Route } from "./+types/api-diagnostic-anonymous-identity";

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
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
    return failure(415, "Formato no permitido.");
  }
  const { env } = context.get(cloudflareContext);
  if (!env.DIAGNOSTIC_PUBLIC_RATE_LIMITER) return failure(503, "El servicio no está disponible temporalmente.");
  if (!await allowRateLimitedRequest(env.DIAGNOSTIC_PUBLIC_RATE_LIMITER, request, "anonymous-diagnostic-identity")) {
    return failure(429, "Espera un momento antes de volver a intentarlo.");
  }

  try {
    const session = await getSession(env, request);
    if (session) return Response.json({ ok: true, authenticated: true }, { headers });
  } catch {
    return failure(503, "No pudimos comprobar tu sesión de Vecidya.");
  }

  const db = env.DB as unknown as V9IdentityDb;
  const existing = readV9AnonymousIdentityCookie(request);
  if (existing) {
    try {
      const identity = await db.prepare(
        "SELECT identity_id,identity_type,credential_hash,claimed_by_user_id FROM diagnostic_v9_identities WHERE identity_id=?",
      ).bind(existing.identityId).first<{
        identity_id: string; identity_type: string; credential_hash: string | null; claimed_by_user_id: string | null;
      }>();
      if (identity?.identity_type === "anonymous" && identity.credential_hash &&
          !identity.claimed_by_user_id &&
          await verifyAnonymousIdentityCredentialV9(existing.recoveryCredential, identity.credential_hash)) {
        return Response.json({ ok: true, authenticated: false, reused: true }, { headers });
      }
    } catch {
      return failure(503, "No pudimos preparar la identidad anónima.");
    }
  }

  try {
    const identity = await createAnonymousIdentityCredentialV9(db, {
      identityId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
    const responseHeaders = new Headers(headers);
    responseHeaders.append("Set-Cookie", buildV9AnonymousIdentityCookie(request, identity));
    return Response.json({ ok: true, authenticated: false, reused: false }, { headers: responseHeaders });
  } catch {
    return failure(503, "No pudimos preparar la identidad anónima.");
  }
}
