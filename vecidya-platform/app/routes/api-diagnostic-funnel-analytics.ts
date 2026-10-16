import { listFunnelAnalytics, recordBrowserFunnelAnalytics } from "../../db/queries/diagnostic-funnel-analytics.server";
import { isBrowserFunnelAnalyticsEvent } from "../features/diagnostic/funnel-analytics-contract";
import { allowRateLimitedRequest } from "../features/diagnostic/diagnostic-rate-limit.server";
import { readRequestBodyLimited, RequestBodyTooLargeError } from "../features/diagnostic/bounded-request-body.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (status: number, error: string) => Response.json({ error }, { status, headers });
const isLoopbackRequest = (request: Request) => ["localhost", "127.0.0.1", "[::1]"].includes(new URL(request.url).hostname.toLowerCase());

export function loader({ context, request }: LoaderFunctionArgs) {
  if (!import.meta.env.DEV || !isLoopbackRequest(request)) return failure(404, "No disponible.");
  const { env } = context.get(cloudflareContext);
  return listFunnelAnalytics(env.DB).then((rows) => Response.json({ metrics: rows.filter((row) => row.count >= 5) }, { headers }));
}

export async function action({ context, request }: ActionFunctionArgs) {
  if (!import.meta.env.DEV || !isLoopbackRequest(request)) return failure(404, "No disponible.");
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return failure(415, "Formato no permitido.");
  const { env } = context.get(cloudflareContext);
  if (!env.DIAGNOSTIC_PUBLIC_RATE_LIMITER || !await allowRateLimitedRequest(env.DIAGNOSTIC_PUBLIC_RATE_LIMITER, request, "diagnostic-funnel-analytics")) return failure(429, "Espera un momento antes de volver a intentarlo.");

  let raw: string;
  try { raw = await readRequestBodyLimited(request, 1024); }
  catch (error) {
    if (error instanceof RequestBodyTooLargeError) return failure(413, "La solicitud es demasiado grande.");
    return failure(400, "No pudimos leer el evento.");
  }
  let value: unknown;
  try { value = JSON.parse(raw); }
  catch { return failure(400, "El evento no tiene un formato válido."); }
  if (typeof value !== "object" || value === null || Array.isArray(value) || Object.keys(value).length !== 1 || !Object.hasOwn(value, "event")) return failure(400, "El evento no está permitido.");
  const event = (value as { event?: unknown }).event;
  if (!isBrowserFunnelAnalyticsEvent(event)) return failure(400, "El evento no está permitido.");

  try { await recordBrowserFunnelAnalytics(env.DB, event); }
  catch { /* La analítica es best-effort y no altera el recorrido. */ }
  return new Response(null, { status: 204, headers });
}
