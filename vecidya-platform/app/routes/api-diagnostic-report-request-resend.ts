import { replacePendingChallenge, findReportRequestById } from "../../db/queries/diagnostic-identification.server";
import { allowRateLimitedRequest } from "../features/diagnostic/diagnostic-rate-limit.server";
import { VERIFIED_EMAIL_CHALLENGE_TTL_HOURS } from "../features/diagnostic/identified-report-constants";
import { isRequestId } from "../features/diagnostic/identified-report-contracts";
import { createOpaqueToken, digestOpaqueToken } from "../features/diagnostic/report-access-crypto.server";
import { deliverDiagnosticVerificationEmail } from "../../server/email/diagnostic-dev-inbox.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { ActionFunctionArgs } from "react-router";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (status: number, error: string) => Response.json({ error }, { status, headers });

export function loader() { return failure(405, "Método no permitido."); }

export async function action({ context, params, request }: ActionFunctionArgs) {
  if (!import.meta.env.DEV) return failure(404, "No disponible.");
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  const requestId = params.requestId;
  if (!requestId || !isRequestId(requestId)) return failure(404, "La solicitud no está disponible.");
  const { env } = context.get(cloudflareContext);
  if (!env.DIAGNOSTIC_IDENTIFICATION_RATE_LIMITER) return failure(503, "El servicio no está disponible temporalmente.");
  if (!await allowRateLimitedRequest(env.DIAGNOSTIC_IDENTIFICATION_RATE_LIMITER, request, "report-resend", [`request:${requestId}`])) return failure(429, "Espera un momento antes de volver a intentarlo.");
  const reportRequest = await findReportRequestById(env.DB, requestId);
  if (!reportRequest || reportRequest.status !== "verification_pending") return failure(404, "La solicitud no está disponible.");

  const now = new Date();
  const token = createOpaqueToken();
  const challenge = {
    id: crypto.randomUUID(), requestId: reportRequest.id, tokenDigest: await digestOpaqueToken(token), status: "pending" as const,
    attempts: 0, issuedAt: now, expiresAt: new Date(now.getTime() + VERIFIED_EMAIL_CHALLENGE_TTL_HOURS * 60 * 60 * 1000), consumedAt: null, createdAt: now,
  };
  if (!await replacePendingChallenge(env.DB, reportRequest.id, challenge)) return failure(404, "La solicitud no está disponible.");
  deliverDiagnosticVerificationEmail({ requestId: reportRequest.id, recipient: reportRequest.email, token, origin: new URL(request.url).origin, now: now.getTime() });
  return Response.json({ requestId: reportRequest.id, status: "verification_pending" }, { status: 202, headers });
}
