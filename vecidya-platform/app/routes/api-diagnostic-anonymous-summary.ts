import { readRequestBodyLimited, RequestBodyTooLargeError } from "../features/diagnostic/bounded-request-body.server";
import { allowRateLimitedRequest } from "../features/diagnostic/diagnostic-rate-limit.server";
import { toAnonymousDiagnosticSummaryV1 } from "../features/diagnostic/anonymous-summary.server";
import { PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1, replayPublicDiagnosticV3 } from "../features/diagnostic/public-diagnostic-replay.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/api-diagnostic-anonymous-summary";

const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function failure(status: number, error: string) {
  return Response.json({ error }, { status, headers });
}

export function loader() {
  return failure(405, "Método no permitido.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

export async function action({ context, request }: Route.ActionArgs) {
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
    return failure(415, "Formato no permitido.");
  }
  const { env } = context.get(cloudflareContext);
  if (!env.DIAGNOSTIC_PUBLIC_RATE_LIMITER) return failure(503, "El servicio no está disponible temporalmente.");
  if (!await allowRateLimitedRequest(env.DIAGNOSTIC_PUBLIC_RATE_LIMITER, request, "anonymous-summary")) {
    return failure(429, "Espera un momento antes de volver a intentarlo.");
  }

  let raw: string;
  try {
    raw = await readRequestBodyLimited(request, 32 * 1024);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return failure(413, "La solicitud es demasiado grande.");
    return failure(400, "No pudimos leer las respuestas.");
  }

  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    return failure(400, "Las respuestas no tienen un formato válido.");
  }
  if (!isRecord(input) || !hasExactKeys(input, ["answers"]) || !Array.isArray(input.answers)) {
    return failure(400, "Las respuestas no tienen un formato válido.");
  }
  const replay = replayPublicDiagnosticV3(input.answers);
  if (!replay.ok) {
    if (replay.reason === "incomplete" || replay.reason === "completion") return failure(422, "No pudimos preparar una lectura fiable con estas respuestas.");
    if (replay.reason === "order") return failure(400, "La ruta de respuestas no corresponde al diagnóstico.");
    if (replay.reason === "duplicate") return failure(400, "Hay respuestas repetidas.");
    return failure(400, "Las respuestas no cumplen el contrato vigente.");
  }

  if (import.meta.env.DEV) {
    try { const { incrementFunnelAnalytics } = await import("../../db/queries/diagnostic-funnel-analytics.server"); await incrementFunnelAnalytics(env.DB, "diagnostic_completed"); }
    catch { /* A missing local analytics write must not block the summary. */ }
  }

  return Response.json(
    { summary: toAnonymousDiagnosticSummaryV1(replay.result), engineIdentity: PUBLIC_DIAGNOSTIC_ENGINE_IDENTITY_V1 },
    { headers },
  );
}
