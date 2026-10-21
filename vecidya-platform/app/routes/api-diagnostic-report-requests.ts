import { createReportRequestBundle, findReportRequestByIdempotencyHash } from "../../db/queries/diagnostic-identification.server";
import { readRequestBodyLimited, RequestBodyTooLargeError } from "../features/diagnostic/bounded-request-body.server";
import { allowRateLimitedActor, allowRateLimitedRequest } from "../features/diagnostic/diagnostic-rate-limit.server";
import {
  COMMERCIAL_CONTACT_NOTICE_VERSION,
  DIAGNOSTIC_RESEARCH_NOTICE_VERSION,
  IDENTIFIED_REPORT_RETENTION_DAYS,
  REPORT_SERVICE_NOTICE_VERSION,
  VERIFIED_EMAIL_CHALLENGE_TTL_HOURS,
} from "../features/diagnostic/identified-report-constants";
import { validateDiagnosticReportRequest } from "../features/diagnostic/identified-report-contracts";
import { createOpaqueToken, digestOpaqueToken } from "../features/diagnostic/report-access-crypto.server";
import { buildPublicDiagnosticReport, isCurrentPublicDiagnosticEngineIdentityV1, PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1, replayPublicDiagnosticV3 } from "../features/diagnostic/public-diagnostic-replay.server";
import { toAnonymousDiagnosticSummaryV1 } from "../features/diagnostic/anonymous-summary.server";
import { deliverDiagnosticVerificationEmail } from "../../server/email/diagnostic-dev-inbox.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { ActionFunctionArgs } from "react-router";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (status: number, error: string) => Response.json({ error }, { status, headers });
export function loader() {
  return failure(405, "Método no permitido.");
}

export async function action({ context, request }: ActionFunctionArgs) {
  if (!import.meta.env.DEV) return failure(404, "No disponible.");
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return failure(415, "Formato no permitido.");
  const { env } = context.get(cloudflareContext);
  if (!env.DIAGNOSTIC_IDENTIFICATION_RATE_LIMITER) return failure(503, "El servicio no está disponible temporalmente.");
  if (!await allowRateLimitedRequest(env.DIAGNOSTIC_IDENTIFICATION_RATE_LIMITER, request, "report-submit")) return failure(429, "Espera un momento antes de volver a intentarlo.");

  const idempotencyKey = request.headers.get("idempotency-key") ?? "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(idempotencyKey)) return failure(400, "No pudimos validar el intento. Vuelve a intentarlo.");
  let raw: string;
  try { raw = await readRequestBodyLimited(request, 48 * 1024); }
  catch (error) {
    if (error instanceof RequestBodyTooLargeError) return failure(413, "La solicitud es demasiado grande.");
    return failure(400, "No pudimos leer la solicitud.");
  }
  let value: unknown;
  try { value = JSON.parse(raw); }
  catch { return failure(400, "Revisa los datos e inténtalo de nuevo."); }
  const publicInput = validateDiagnosticReportRequest(value);
  const qa03bInput = !publicInput && import.meta.env.DEV
    ? (await import("../features/diagnostic/qa03b/identified-report-request.server")).validateQa03bDiagnosticReportRequest(value)
    : null;
  const input = publicInput ?? qa03bInput;
  if (!input || (publicInput && !isCurrentPublicDiagnosticEngineIdentityV1(publicInput.engineIdentity))) return failure(409, "Este resultado pertenece a otra versión. Inicia un diagnóstico nuevo para solicitar el informe.");

  const emailDigest = await digestOpaqueToken(input.email);
  if (!await allowRateLimitedActor(env.DIAGNOSTIC_IDENTIFICATION_RATE_LIMITER, "report-submit", `email:${emailDigest}`)) return failure(429, "Espera un momento antes de volver a intentarlo.");
  const idempotencyHash = await digestOpaqueToken(idempotencyKey);
  const requestFingerprintHash = await digestOpaqueToken(`${idempotencyHash}:${JSON.stringify(input)}`);
  const existing = await findReportRequestByIdempotencyHash(env.DB, idempotencyHash);
  if (existing) return existing.requestFingerprintHash === requestFingerprintHash
    ? Response.json({ requestId: existing.id, status: existing.status, reused: true, ...(qa03bInput ? { summaryVersion: qa03bInput.anonymousSummary.contractVersion, summary: qa03bInput.anonymousSummary } : {}) }, { status: 202, headers })
    : failure(409, "La clave de este intento ya se usó con datos distintos. Vuelve al formulario e inténtalo de nuevo.");

  const now = new Date();
  let engineIdentity: string;
  let reportVersion: string;
  let methodologyVersion: string;
  let reportJson: string;
  let summary: unknown;
  if (qa03bInput) {
    const { replayQa03bSessionV1, buildQa03bReplayProjectionsV1 } = await import("../features/diagnostic/qa03b/worker-replay.server");
    const replay = replayQa03bSessionV1({
      replayVersion: qa03bInput.replayVersion,
      engineIdentity: qa03bInput.engineIdentity,
      answerSchema: qa03bInput.answerSchema,
      questionBank: qa03bInput.questionBank,
      sessionSchema: qa03bInput.sessionSchema,
      sessionKey: qa03bInput.sessionKey,
      session: qa03bInput.session,
    }, now.getTime());
    if (!replay.ok) return failure(422, "La sesión QA-03B no corresponde a una ruta vigente y completa. Inicia o reanuda el diagnóstico.");
    const projections = buildQa03bReplayProjectionsV1(replay, qa03bInput.businessName, now);
    if (JSON.stringify(projections.summary) !== JSON.stringify(qa03bInput.anonymousSummary)) return failure(409, "El resumen cambió respecto a la sesión. Vuelve al diagnóstico para actualizarlo.");
    engineIdentity = JSON.stringify(replay.result.engineIdentity);
    reportVersion = projections.report.reportVersion;
    methodologyVersion = projections.report.methodologyVersion;
    reportJson = JSON.stringify(projections.report);
    summary = projections.summary;
  } else {
    const replay = replayPublicDiagnosticV3(publicInput!.answers);
    if (!replay.ok) return failure(422, "Las respuestas guardadas ya no corresponden a una ruta vigente. Inicia un diagnóstico nuevo.");
    engineIdentity = JSON.stringify(PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1);
    reportVersion = PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1.reportVersion;
    methodologyVersion = PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1.methodologyVersion;
    reportJson = JSON.stringify(buildPublicDiagnosticReport(replay.result, publicInput!.businessName, now));
    summary = toAnonymousDiagnosticSummaryV1(replay.result);
  }
  const requestId = crypto.randomUUID();
  const token = createOpaqueToken();
  const tokenDigest = await digestOpaqueToken(token);
  const expiresAt = new Date(now.getTime() + IDENTIFIED_REPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const reportSha256 = await digestOpaqueToken(reportJson);
  const requestRecord = {
    id: requestId,
    idempotencyKeyHash: idempotencyHash,
    requestFingerprintHash,
    engineIdentity,
    reportVersion,
    methodologyVersion,
    status: "verification_pending" as const,
    fullName: input.fullName,
    businessName: input.businessName,
    email: input.email,
    phone: input.phone,
    serviceNoticeVersion: REPORT_SERVICE_NOTICE_VERSION,
    serviceNoticeAcknowledgedAt: now,
    createdAt: now,
    updatedAt: now,
    expiresAt,
  };
  const challenge = {
    id: crypto.randomUUID(),
    requestId,
    purpose: "verification" as const,
    tokenDigest,
    status: "pending" as const,
    attempts: 0,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + VERIFIED_EMAIL_CHALLENGE_TTL_HOURS * 60 * 60 * 1000),
    consumedAt: null,
    createdAt: now,
  };

  try {
    await createReportRequestBundle(env.DB, {
      request: requestRecord,
      snapshot: {
        requestId,
        engineIdentity: requestRecord.engineIdentity,
        reportVersion: requestRecord.reportVersion,
        methodologyVersion: requestRecord.methodologyVersion,
        reportJson,
        reportSha256,
        computedAt: now,
        expiresAt,
      },
      challenge,
      ...(input.commercialContactOptIn ? { commercialIntent: {
        id: crypto.randomUUID(), requestId, noticeVersion: COMMERCIAL_CONTACT_NOTICE_VERSION,
        source: "diagnostic_report_form", consentedAt: now, revokedAt: null,
      } } : {}),
      ...(input.researchParticipationOptIn ? { researchIntent: {
        id: crypto.randomUUID(), requestId, noticeVersion: DIAGNOSTIC_RESEARCH_NOTICE_VERSION,
        source: "diagnostic_report_form", consentedAt: now, revokedAt: null,
      } } : {}),
    });
  } catch {
    const raced = await findReportRequestByIdempotencyHash(env.DB, idempotencyHash).catch(() => null);
    if (raced) return raced.requestFingerprintHash === requestFingerprintHash
      ? Response.json({ requestId: raced.id, status: raced.status, reused: true, ...(qa03bInput ? { summaryVersion: qa03bInput.anonymousSummary.contractVersion, summary: qa03bInput.anonymousSummary } : {}) }, { status: 202, headers })
      : failure(409, "La clave de este intento ya se usó con datos distintos. Vuelve al formulario e inténtalo de nuevo.");
    return failure(503, "No pudimos guardar la solicitud. Tus respuestas anónimas siguen disponibles en este navegador.");
  }

  deliverDiagnosticVerificationEmail({ requestId, challengeId: challenge.id, recipient: input.email, token, origin: new URL(request.url).origin, now: now.getTime() });
  const summaryVersion = qa03bInput ? "anonymous-diagnostic-summary-v1" : (summary as ReturnType<typeof toAnonymousDiagnosticSummaryV1>).version;
  return Response.json({ requestId, status: "verification_pending", expiresAt: expiresAt.toISOString(), summaryVersion, ...(qa03bInput ? { summary } : {}) }, { status: 202, headers });
}
