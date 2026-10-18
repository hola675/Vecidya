import { isRouteErrorResponse, useLoaderData, useRouteError } from "react-router";
import { useState } from "react";
import { readRequestBodyLimited, RequestBodyTooLargeError } from "../features/diagnostic/bounded-request-body.server";

import { deleteIdentifiedReport, getAuthorizedReport, recordDetailedReportFirstOpen, revokeDiagnosticOptionalIntents } from "../../db/queries/diagnostic-identification.server";
import { REPORT_VERSION, type DiagnosticReportV1 } from "../components/diagnostic-report/report-model";
import { DiagnosticReport } from "../components/diagnostic-report/diagnostic-report";
import { readCookie, digestOpaqueToken, constantTimeEqual } from "../features/diagnostic/report-access-crypto.server";
import { isCurrentPublicDiagnosticEngineIdentityV1 } from "../features/diagnostic/public-diagnostic-replay.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";


const responseHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const notFound = () => new Response("No disponible.", { status: 404, headers: responseHeaders });
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

export const meta: MetaFunction = () => [
  { title: "Informe completo del diagnóstico" },
  { name: "robots", content: "noindex, nofollow, noarchive" },
];

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  if (!import.meta.env.DEV || !params.requestId || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(params.requestId)) throw notFound();
  const token = readCookie(request, "diagnostic_report_access");
  if (!token) throw notFound();
  const { env } = context.get(cloudflareContext);
  const row = await getAuthorizedReport(env.DB, await digestOpaqueToken(token), params.requestId, new Date());
  if (!row || row.snapshot.reportVersion !== REPORT_VERSION || row.request.reportVersion !== row.snapshot.reportVersion || row.request.methodologyVersion !== row.snapshot.methodologyVersion || row.request.engineIdentity !== row.snapshot.engineIdentity) throw notFound();
  if (!constantTimeEqual(await digestOpaqueToken(row.snapshot.reportJson), row.snapshot.reportSha256)) throw notFound();
  let storedIdentity: unknown;
  let report: unknown;
  try {
    storedIdentity = JSON.parse(row.snapshot.engineIdentity);
    report = JSON.parse(row.snapshot.reportJson);
  } catch {
    throw notFound();
  }
  if (!isCurrentPublicDiagnosticEngineIdentityV1(storedIdentity) || !isRecord(report) || report.reportVersion !== row.snapshot.reportVersion || !isRecord(report.overallPresence) || !Array.isArray(report.dimensions) || !Array.isArray(report.recommendations)) throw notFound();
  try { await recordDetailedReportFirstOpen(env.DB, row.access.id, params.requestId, new Date()); }
  catch { /* Analytics must not prevent opening an already authorized report. */ }
  return { requestId: params.requestId, report: report as unknown as DiagnosticReportV1 };
}

export async function action({ context, params, request }: ActionFunctionArgs) {
  const requestId = params.requestId;
  if (!import.meta.env.DEV || !["DELETE", "PATCH"].includes(request.method) || request.headers.get("origin") !== new URL(request.url).origin || !requestId || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(requestId)) return notFound();
  const token = readCookie(request, "diagnostic_report_access");
  if (!token) return notFound();
  const { env } = context.get(cloudflareContext);
  const authorized = await getAuthorizedReport(env.DB, await digestOpaqueToken(token), requestId, new Date());
  if (!authorized) return notFound();
  if (request.method === "PATCH") {
    if (!/^application\\/json(?:\\s*;|$)/i.test(request.headers.get("content-type") ?? "")) {
      return Response.json({ error: "Formato no permitido." }, { status: 415, headers: responseHeaders });
    }
    let raw: string;
    try { raw = await readRequestBodyLimited(request, 512); }
    catch (error) {
      return Response.json({ error: error instanceof RequestBodyTooLargeError ? "Solicitud demasiado grande." : "No se pudo leer la solicitud." }, { status: error instanceof RequestBodyTooLargeError ? 413 : 400, headers: responseHeaders });
    }
    let payload: unknown;
    try { payload = JSON.parse(raw); }
    catch { return Response.json({ error: "Solicitud inválida." }, { status: 400, headers: responseHeaders }); }
    if (!isRecord(payload) || Object.keys(payload).length !== 2 ||
      typeof payload.revokeCommercial !== "boolean" || typeof payload.revokeResearch !== "boolean" ||
      (!payload.revokeCommercial && !payload.revokeResearch)) {
      return Response.json({ error: "Selecciona al menos una preferencia." }, { status: 400, headers: responseHeaders });
    }
    const result = await revokeDiagnosticOptionalIntents(env.DB, {
      requestId, accessTokenDigest: await digestOpaqueToken(token), now: new Date(),
      revokeCommercial: payload.revokeCommercial, revokeResearch: payload.revokeResearch,
    });
    if (!result.authorized) return notFound();
    return Response.json({ ok: true, commercialRevoked: result.commercialRevoked, researchRevoked: result.researchRevoked }, { headers: responseHeaders });
  }
  await deleteIdentifiedReport(env.DB, requestId);
  return new Response(null, { status: 204, headers: { ...responseHeaders, "Set-Cookie": `diagnostic_report_access=; Path=/diagnostico/informe; HttpOnly; SameSite=Strict; Max-Age=0${new URL(request.url).protocol === "https:" ? "; Secure" : ""}` } });
}

export function headers() { return responseHeaders; }

export default function IdentifiedDiagnosticReport() {
  const data = useLoaderData<typeof loader>();
  const [revokeCommercial, setRevokeCommercial] = useState(false);
  const [revokeResearch, setRevokeResearch] = useState(false);
  return (
    <main className="rp-page df-identified-report">
      <nav className="df-identified-report__nav" aria-label="Navegación del diagnóstico">
        <a className="text-link" href="/diagnostico">Volver a mi diagnóstico</a>
        <label><input type="checkbox" checked={revokeCommercial} onChange={(event) => setRevokeCommercial(event.target.checked)} /> Revocar contacto comercial</label>
        <label><input type="checkbox" checked={revokeResearch} onChange={(event) => setRevokeResearch(event.target.checked)} /> Revocar uso para investigación</label>
        <button className="df-link-button" disabled={!revokeCommercial && !revokeResearch} onClick={() => void revokeOptionalIntents(data.requestId, revokeCommercial, revokeResearch)} type="button">Guardar revocaciones</button>
        <button className="df-link-button" onClick={() => void deleteRequest(data.requestId)} type="button">Eliminar esta solicitud</button>
      </nav>
      <DiagnosticReport paper="a4" report={data.report} />
    </main>
  );
}

async function revokeOptionalIntents(requestId: string, revokeCommercial: boolean, revokeResearch: boolean) {
  if ((!revokeCommercial && !revokeResearch) || !window.confirm("¿Confirmas revocar los permisos seleccionados? Tu informe seguirá disponible.")) return;
  const response = await fetch(`/diagnostico/informe/${encodeURIComponent(requestId)}`, {
    method: "PATCH",
    headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ revokeCommercial, revokeResearch }),
  });
  if (response.ok) window.alert("Se han procesado tus preferencias opcionales.");
  else window.alert("No se pudieron actualizar tus preferencias. Vuelve a intentarlo.");
}

async function deleteRequest(requestId: string) {
  const response = await fetch(`/diagnostico/informe/${encodeURIComponent(requestId)}`, { method: "DELETE" });
  if (response.ok) window.location.assign("/diagnostico");
}

export function ErrorBoundary() {
  const error = useRouteError();
  const unavailable = isRouteErrorResponse(error) && error.status === 404;
  return <main className="rp-page"><p role="alert">{unavailable ? "Este informe no está disponible o el acceso expiró." : "No pudimos abrir el informe. Vuelve a tu diagnóstico e inténtalo otra vez."}</p><a href="/diagnostico">Volver a mi diagnóstico</a></main>;
}
