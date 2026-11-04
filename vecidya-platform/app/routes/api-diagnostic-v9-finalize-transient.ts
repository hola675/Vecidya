import { readRequestBodyLimited, RequestBodyTooLargeError } from "../features/diagnostic/bounded-request-body.server";
import { allowRateLimitedRequest } from "../features/diagnostic/diagnostic-rate-limit.server";
import { finalizeAndAttestDiagnosticV9 } from "../features/diagnostic/v9/attestation.server";
import { DIAGNOSTIC_V9_ATTESTATION_PUBLIC_KEYS } from "../features/diagnostic/v9/attestation-key-registry";
import { cloudflareContext } from "../../server/cloudflare-context";
import { isV9PublicRuntimeAvailable, type V9PublicRuntimeConfig } from "../features/diagnostic/qa03b/v9-public-availability.server";
import type { Route } from "./+types/api-diagnostic-v9-finalize-transient";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (status: number, error: string) => Response.json({ error }, { status, headers });

export function loader() { return failure(405, "Método no permitido."); }

export async function action({ context, request }: Route.ActionArgs) {
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return failure(415, "Formato no permitido.");
  const { env } = context.get(cloudflareContext);
  const runtime = env as unknown as V9PublicRuntimeConfig & {
    DIAGNOSTIC_V9_ATTESTATION_KEY_ID?: string;
    DIAGNOSTIC_V9_ATTESTATION_PRIVATE_KEY_PKCS8?: string;
  };
  if (!isV9PublicRuntimeAvailable(runtime)) return failure(503, "El diagnóstico V9 aún no está habilitado con versiones certificadas.");
  if (!runtime.DIAGNOSTIC_V9_ATTESTATION_KEY_ID || !runtime.DIAGNOSTIC_V9_ATTESTATION_PRIVATE_KEY_PKCS8) {
    return failure(503, "La finalización segura no está disponible temporalmente.");
  }
  const publicKeySpki = DIAGNOSTIC_V9_ATTESTATION_PUBLIC_KEYS[runtime.DIAGNOSTIC_V9_ATTESTATION_KEY_ID];
  if (!publicKeySpki) return failure(503, "La finalización segura no está disponible temporalmente.");
  if (!env.DIAGNOSTIC_PUBLIC_RATE_LIMITER ||
    !await allowRateLimitedRequest(env.DIAGNOSTIC_PUBLIC_RATE_LIMITER, request, "diagnostic-v9-transient-finalize")) {
    return failure(env.DIAGNOSTIC_PUBLIC_RATE_LIMITER ? 429 : 503, "La finalización no está disponible temporalmente.");
  }
  let raw: string;
  try { raw = await readRequestBodyLimited(request, 128 * 1024); }
  catch (error) { return failure(error instanceof RequestBodyTooLargeError ? 413 : 400, "La solicitud no tiene un formato válido."); }
  try {
    const body: unknown = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length !== 1 ||
      !Object.hasOwn(body, "session")) return failure(400, "La solicitud no tiene un formato válido.");
    const finalized = await finalizeAndAttestDiagnosticV9({
      scoringVersion: runtime.DIAGNOSTIC_V9_SCORING_VERSION!,
      session: (body as { session: unknown }).session,
      keyId: runtime.DIAGNOSTIC_V9_ATTESTATION_KEY_ID,
      privateKeyPkcs8: runtime.DIAGNOSTIC_V9_ATTESTATION_PRIVATE_KEY_PKCS8,
      publicKeySpki,
    });
    if (!finalized.ok) {
      return failure(finalized.reason === "key" || finalized.reason === "signing" ? 503 : 422,
        finalized.reason === "replay" ? "El diagnóstico no cumple los criterios de finalización." : "No pudimos generar un comprobante seguro.");
    }
    return Response.json(finalized, { status: 200, headers });
  } catch {
    // Never expose replay errors or answer-derived details.
    return failure(400, "La solicitud no tiene un formato válido.");
  }
}
