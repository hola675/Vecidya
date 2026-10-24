import { isRouteErrorResponse, useRouteError, type MetaFunction } from "react-router";

import { CandidateDiagnosticFlow } from "../components/diagnostic-flow/qa03b-diagnostic-flow";
import { PublicLayout } from "../components/public-layout";
import { readRequestBodyLimited, RequestBodyTooLargeError } from "../features/diagnostic/bounded-request-body.server";
import { allowRateLimitedRequest } from "../features/diagnostic/diagnostic-rate-limit.server";
import { buildQa03bReplayProjectionsV2, replayQa03bSessionV1 } from "../features/diagnostic/qa03b/worker-replay.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import type { ActionFunctionArgs } from "react-router";

export const meta: MetaFunction = () => [{ title: "Diagnóstico candidato (prueba local)" }, { name: "robots", content: "noindex, nofollow" }];
const responseHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (status: number, error: string) => Response.json({ error }, { status, headers: responseHeaders });

export function loader() {
  if (!import.meta.env.DEV) throw new Response("Not Found", { status: 404 });
  return null;
}

export async function action({ context, request }: ActionFunctionArgs) {
  if (!import.meta.env.DEV) return failure(404, "No disponible.");
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return failure(415, "Formato no permitido.");
  const { env } = context.get(cloudflareContext);
  if (!env.DIAGNOSTIC_PUBLIC_RATE_LIMITER) return failure(503, "El servicio no está disponible temporalmente.");
  if (!await allowRateLimitedRequest(env.DIAGNOSTIC_PUBLIC_RATE_LIMITER, request, "qa03b-replay")) return failure(429, "Espera un momento antes de volver a intentarlo.");

  let raw: string;
  try { raw = await readRequestBodyLimited(request, 48 * 1024); }
  catch (error) {
    if (error instanceof RequestBodyTooLargeError) return failure(413, "La solicitud es demasiado grande.");
    return failure(400, "No pudimos leer el diagnóstico.");
  }
  let payload: unknown;
  try { payload = JSON.parse(raw); }
  catch { return failure(400, "La solicitud no es válida."); }

  const replay = replayQa03bSessionV1(payload);
  if (!replay.ok) return failure(replay.reason === "identity" || replay.reason === "schema" || replay.reason === "bank" ? 409 : 422, "La sesión no corresponde a una ruta QA-03B completa y vigente.");
  const summary = buildQa03bReplayProjectionsV2(replay, null, new Date(replay.completedAt)).summary;
  return Response.json({ summary }, { headers: responseHeaders });
}

export default function DevDiagnosticCandidate() {
  return <PublicLayout><main className="df-page"><CandidateDiagnosticFlow devMethodologyHref="/__dev/diagnostico/qa03b/metodologia" /></main></PublicLayout>;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return <main className="df-page"><section className="df-screen" role="alert"><h1 className="df-screen__title">{notFound ? "Página no encontrada" : "No pudimos cargar la prueba candidata"}</h1><p className="df-screen__lead">{notFound ? "Esta experiencia solo está disponible en desarrollo local." : "Recarga el entorno de prueba para continuar."}</p></section></main>;
}
