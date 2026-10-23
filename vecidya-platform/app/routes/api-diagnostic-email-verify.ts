import { consumeChallengeAndGrantAccess, findChallengeByTokenDigest, findRequestWithPendingChallenge, incrementChallengeAttempt } from "../../db/queries/diagnostic-identification.server";
import { readRequestBodyLimited, RequestBodyTooLargeError } from "../features/diagnostic/bounded-request-body.server";
import { allowRateLimitedRequest } from "../features/diagnostic/diagnostic-rate-limit.server";
import { isRequestId } from "../features/diagnostic/identified-report-contracts";
import { VERIFIED_REPORT_ACCESS_TTL_DAYS } from "../features/diagnostic/identified-report-constants";
import { createOpaqueToken, digestOpaqueToken, constantTimeEqual, reportAccessCookie } from "../features/diagnostic/report-access-crypto.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { isIdentifiedReportJourneyAvailable } from "../features/diagnostic/identified-report-availability.server";

import type { ActionFunctionArgs } from "react-router";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (status: number, error: string) => Response.json({ error }, { status, headers });
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

export function loader() { return failure(405, "Método no permitido."); }

export async function action({ context, request }: ActionFunctionArgs) {
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return failure(415, "Formato no permitido.");
  const { env } = context.get(cloudflareContext);
  if (!isIdentifiedReportJourneyAvailable(env)) return failure(404, "No disponible.");
  if (!env.DIAGNOSTIC_IDENTIFICATION_RATE_LIMITER) return failure(503, "El servicio no está disponible temporalmente.");
  let raw: string;
  try { raw = await readRequestBodyLimited(request, 2 * 1024); }
  catch (error) {
    if (error instanceof RequestBodyTooLargeError) return failure(413, "La solicitud es demasiado grande.");
    return failure(400, "No pudimos leer la verificación.");
  }
  let value: unknown;
  try { value = JSON.parse(raw); }
  catch { return failure(400, "El enlace no pudo verificarse. Solicita uno nuevo."); }
  if (!isRecord(value) || Object.keys(value).length !== 2 || !Object.hasOwn(value, "requestId") || !Object.hasOwn(value, "token") || typeof value.requestId !== "string" || !isRequestId(value.requestId) || typeof value.token !== "string" || !/^[A-Za-z0-9_-]{40,44}$/u.test(value.token)) {
    return failure(400, "El enlace no pudo verificarse. Solicita uno nuevo.");
  }
  if (!await allowRateLimitedRequest(env.DIAGNOSTIC_IDENTIFICATION_RATE_LIMITER, request, "email-verify", [`request:${value.requestId}`])) return failure(429, "Espera un momento antes de volver a intentarlo.");

  const now = new Date();
  const pending = await findRequestWithPendingChallenge(env.DB, value.requestId, now);
  if (!pending || pending.challenge.attempts >= 5) return failure(404, "El enlace no está disponible. Solicita uno nuevo.");
  const suppliedDigest = await digestOpaqueToken(value.token);
  if (!constantTimeEqual(suppliedDigest, pending.challenge.tokenDigest)) {
    const staleChallenge = await findChallengeByTokenDigest(env.DB, value.requestId, suppliedDigest);
    if (!staleChallenge) await incrementChallengeAttempt(env.DB, pending.challenge.id, now);
    return failure(400, "El enlace no pudo verificarse. Solicita uno nuevo.");
  }

  const accessToken = createOpaqueToken();
  const accessExpiresAt = new Date(Math.min(
    pending.request.expiresAt.getTime(),
    pending.snapshot.expiresAt.getTime(),
    now.getTime() + VERIFIED_REPORT_ACCESS_TTL_DAYS * 24 * 60 * 60 * 1000,
  ));
  const accessId = crypto.randomUUID();
  const granted = await consumeChallengeAndGrantAccess(env.DB, {
    requestId: pending.request.id,
    challengeId: pending.challenge.id,
    tokenDigest: suppliedDigest,
    purpose: pending.challenge.purpose,
    access: {
      id: accessId,
      requestId: pending.request.id,
      challengeId: pending.challenge.id,
      tokenDigest: await digestOpaqueToken(accessToken),
      issuedAt: now,
      expiresAt: accessExpiresAt,
      revokedAt: null,
    },
    now,
  });
  if (!granted) return failure(409, "Este enlace ya se utilizó. Solicita uno nuevo.");
  const response = Response.json({ requestId: pending.request.id, reportPath: `/diagnostico/informe/${pending.request.id}` }, { headers });
  response.headers.append("Set-Cookie", reportAccessCookie(accessToken, request, (accessExpiresAt.getTime() - now.getTime()) / 1000));
  return response;
}
