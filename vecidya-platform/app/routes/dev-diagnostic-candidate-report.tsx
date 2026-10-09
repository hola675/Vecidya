import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, isRouteErrorResponse, useRouteError, useLoaderData, type LoaderFunctionArgs, type MetaFunction } from "react-router";

import { buildCandidateDiagnosticReportV1 } from "../components/diagnostic-flow/candidate-presentation";
import { DiagnosticReport, REPORT_PAPERS, reportFileName, type ReportFit, type CandidateDiagnosticReportV1 } from "../components/diagnostic-report";
import { CandidateSessionStoreV3, completeCandidateSessionV3, type CandidateSessionV3 } from "../features/diagnostic/qbv2-candidate-session";

export const meta: MetaFunction = () => [{ title: "Informe candidato (prueba local)" }, { name: "robots", content: "noindex, nofollow" }];

export function loader({ request }: LoaderFunctionArgs) {
  if (!import.meta.env.DEV) throw new Response("Not Found", { status: 404 });
  const url = new URL(request.url);
  return { paper: url.searchParams.get("paper") === "letter" ? "letter" as const : "a4" as const };
}

type ReportState = { readonly kind: "loading" } | { readonly kind: "unavailable" } | { readonly kind: "error" } | { readonly kind: "ready"; readonly session: CandidateSessionV3; readonly report: CandidateDiagnosticReportV1 };

export default function DevDiagnosticCandidateReport() {
  const { paper } = useLoaderData<typeof loader>();
  const [source, setSource] = useState<ReportState>({ kind: "loading" });
  const [fit, setFit] = useState<ReportFit | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    try {
      const session = new CandidateSessionStoreV3(window.localStorage).read(Date.now());
      if (!session || session.status !== "completed" || session.terminalReason === null || session.reviewIndex !== null || session.queue.length !== 0) {
        setSource({ kind: "unavailable" });
        return;
      }
      const completed = completeCandidateSessionV3(session, session.writerId, session.updatedAt);
      if (!completed) { setSource({ kind: "unavailable" }); return; }
      setSource({ kind: "ready", session, report: buildCandidateDiagnosticReportV1(completed.result, new Date(session.startedAt)) });
    } catch (error) {
      console.error("[informe candidato] no se pudo reconstruir desde la sesión", error);
      setSource({ kind: "error" });
    }
  }, [attempt]);

  const report = source.kind === "ready" ? source.report : null;
  const fileName = report ? reportFileName(report.identity.businessName, report.generatedAt) : null;
  const onFit = useCallback((result: ReportFit) => setFit(result), []);
  useEffect(() => {
    if (fileName) document.title = fileName.replace(/\.pdf$/, "");
  }, [fileName]);

  const alternatePaper = paper === "a4" ? "letter" : "a4";
  const alternatePaperUrl = useMemo(() => `/__dev/diagnostico/candidate/informe?paper=${alternatePaper}`, [alternatePaper]);

  return (
    <main className="rp-page">
      <div className="rp-toolbar" role="region" aria-label="Acciones del informe candidato">
        <Link to="/__dev/diagnostico/candidate">Volver a la sesión candidata</Link>
        <Link to="/__dev/diagnostico/candidate/metodologia">Metodología candidata</Link>
        {source.kind === "unavailable" ? <p role="alert">No hay una sesión candidata completada y válida en este navegador. Una sesión incompleta o editada no genera un informe final.</p> : null}
        {source.kind === "error" ? <p role="alert">No pudimos reconstruir el informe desde las respuestas guardadas. <button className="button button--secondary" onClick={() => { setFit(null); setSource({ kind: "loading" }); setAttempt((value) => value + 1); }} type="button">Reintentar</button></p> : null}
        {source.kind === "loading" || (report && !fit) ? <p aria-live="polite">Preparando el informe desde la sesión candidata…</p> : null}
        {report && fit ? <>
          <button className="button button--primary" disabled={fit.overflow} onClick={() => window.print()} type="button">Imprimir o guardar PDF</button>
          <span className="rp-toolbar__meta">{fileName} · {REPORT_PAPERS[paper].label}</span>
          <a href={alternatePaperUrl}>Ver en {REPORT_PAPERS[alternatePaper].label}</a>
          <span className="rp-toolbar__meta">{fit.pages} páginas · tipografía mínima disponible 8,5 pt{fit.overflow ? " · el contenido no cabe sin recortar" : ""}</span>
        </> : null}
      </div>
      {report ? <DiagnosticReport debug onFit={onFit} paper={paper} report={report} /> : null}
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return <main className="rp-page"><div className="rp-toolbar" role="alert"><p>{notFound ? "Esta prueba solo está disponible en desarrollo local." : "No pudimos preparar el informe candidato."}</p></div></main>;
}
