import { createDatabase } from "../../db/client.server";
import { recoverDiagnosticSession, recoveredSnapshot } from "../../db/queries/diagnostic-save-resume.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { normalizeRecoveryCode } from "../../server/diagnostic/recovery-code.server";
import { readBoundedJsonBody, RequestTooLargeError } from "../../server/diagnostic/request-validation.server";

import type { Route } from "./+types/api-diagnostic-recover";

/**
 * DIAG-V3-07 §17/§18/§26: recuperación por recovery code, nunca por `sessionId` (no existe ese
 * parámetro en esta ruta) ni por `GET`/query string (spec §17). Respuesta genérica para digest
 * inexistente, formato inválido o sesión ya completada (no facilita enumeración); expirado y versión
 * incompatible sí se distinguen porque ya se comprobó una credencial legítima (spec §26).
 */
export async function action({ context, request }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  const { env } = context.get(cloudflareContext);

  // Rate limiting ANTES de tocar D1 (spec §23): una defensa coarse-grained por IP contra brute force
  // del endpoint completo, no por código/digest (spec §24, un atacante puede variar el código en cada
  // intento). No es un contador transaccional perfecto ni protege contra IPs distribuidas — ver
  // `ARCHITECTURE.md` para las limitaciones documentadas. La IP se pasa al binding nativo de
  // Cloudflare (contador en el edge); esta ruta nunca la escribe en D1 (spec §24: sin PII solo para
  // rate limiting).
  const clientIp = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const { success } = await env.DIAGNOSTIC_RECOVERY_RATE_LIMITER.limit({ key: `diagnostic-recover:${clientIp}` });
  if (!success) return Response.json({ error: "Too many attempts. Try again later." }, { status: 429, headers: { "cache-control": "no-store" } });

  let body: unknown;
  try {
    body = await readBoundedJsonBody(request);
  } catch (error) {
    if (error instanceof RequestTooLargeError) return Response.json({ error: error.message }, { status: 413 });
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) return Response.json({ error: "Invalid or expired recovery code" }, { status: 404 });
  const candidate = body as { code?: unknown };
  const normalized = normalizeRecoveryCode(candidate.code);
  // Un código malformado nunca llega a D1 (spec §26): misma respuesta genérica que "no existe".
  if (!normalized) return Response.json({ error: "Invalid or expired recovery code" }, { status: 404, headers: { "cache-control": "no-store" } });

  const database = createDatabase(env.DB);
  const outcome = await recoverDiagnosticSession(database, env.DIAGNOSTIC_RECOVERY_HMAC_KEY, normalized);

  if (!outcome.ok) {
    const headers = { "cache-control": "no-store" };
    if (outcome.reason === "expired") return Response.json({ error: "This recovery code has expired" }, { status: 410, headers });
    if (outcome.reason === "version_mismatch") return Response.json({ error: "This saved session is incompatible with the current engine" }, { status: 409, headers });
    return Response.json({ error: "Invalid or expired recovery code" }, { status: 404, headers });
  }

  const snapshot = recoveredSnapshot(outcome, Date.now());
  return Response.json(
    { sessionId: outcome.sessionId, writeToken: outcome.writeToken, versions: outcome.versions, snapshot },
    { headers: { "cache-control": "no-store" } },
  );
}
