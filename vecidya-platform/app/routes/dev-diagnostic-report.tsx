import { useCallback, useEffect, useMemo, useState } from "react";
import { isRouteErrorResponse, useLoaderData, useRouteError, type LoaderFunctionArgs, type MetaFunction } from "react-router";

import {
  buildDiagnosticReport, CANONICAL_REPORT_PAPER, DiagnosticReport, REPORT_PAPERS, reportFileName,
  type DiagnosticReportV1, type ReportFit, type ReportPaper,
} from "../components/diagnostic-report";
import {
  DiagnosticSessionStoreV3, GOLDEN_PERSONAS, runDiagnosticPipelineV3, runGoldenPersonaPipeline, type AnswersV2, type DiagnosticResultV3,
} from "../features/diagnostic";

/**
 * DIAG-V3-12 — informe PDF del diagnóstico V3, privado como el resto de V3. Solo existe en desarrollo: `routes.ts`
 * la registra con `NODE_ENV=development` y el loader responde 404 fuera de `import.meta.env.DEV`.
 *
 * - `/__dev/diagnostico/informe/:personaId`: una persona golden (fixture de prueba, no un cliente real).
 * - `/__dev/diagnostico/informe`: el diagnóstico terminado guardado en este navegador (ruta privada V3).
 * Parámetros: `paper=a4|letter`, `print=1` (abre el diálogo de impresión al estar listo), `debug=1`, `stress=1`
 * (textos alargados para la QA de desbordes) y `date=AAAA-MM-DD` (fecha fija para la QA).
 */

export const meta: MetaFunction = () => [{ title: "Informe del diagnóstico (desarrollo)" }, { name: "robots", content: "noindex, nofollow" }];

export function loader({ params, request }: LoaderFunctionArgs) {
  if (!import.meta.env.DEV) throw new Response("Not Found", { status: 404 });
  const url = new URL(request.url);
  const persona = params.personaId ? GOLDEN_PERSONAS.find((item) => item.id === params.personaId) : undefined;
  if (params.personaId && !persona) throw new Response("Not Found", { status: 404 });
  const paper = (url.searchParams.get("paper") === "letter" ? "letter" : CANONICAL_REPORT_PAPER) as ReportPaper;
  return {
    result: persona ? runDiagnosticPipelineV3(runGoldenPersonaPipeline(persona).answers as AnswersV2) : null,
    paper,
    print: url.searchParams.get("print") === "1",
    debug: url.searchParams.get("debug") === "1",
    stress: url.searchParams.get("stress") === "1",
    date: /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get("date") ?? "") ? url.searchParams.get("date") : null,
  };
}

/** Solo QA: alarga nombre, resumen, explicaciones y evidencias para comprobar que nada se recorta ni se superpone. */
function stressReport(report: DiagnosticReportV1): DiagnosticReportV1 {
  const twice = (text: string) => `${text} ${text}`;
  return {
    ...report,
    identity: { ...report.identity, businessName: "Asociación Comunitaria de Emprendedoras y Emprendedores del Barrio San Cristóbal de las Casas" },
    executiveSummary: { ...report.executiveSummary, lead: report.executiveSummary.lead.map(twice) },
    recommendations: report.recommendations.map((item) => ({ ...item, whyItMatters: twice(item.whyItMatters), expectedOutcome: twice(item.expectedOutcome) })),
    dimensions: report.dimensions.map((item) => ({ ...item, evidenceTopics: [...item.evidenceTopics, ...item.evidenceTopics] })),
  };
}

type Source = { readonly kind: "loading" } | { readonly kind: "missing" } | { readonly kind: "error" } | { readonly kind: "ready"; readonly result: DiagnosticResultV3 };

export default function DevDiagnosticReport() {
  const data = useLoaderData<typeof loader>();
  const [source, setSource] = useState<Source>(data.result ? { kind: "ready", result: data.result } : { kind: "loading" });
  const [fit, setFit] = useState<ReportFit | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Sin persona: el resultado se recalcula con el pipeline congelado a partir de las respuestas guardadas.
  useEffect(() => {
    if (data.result) return;
    try {
      const session = new DiagnosticSessionStoreV3(window.localStorage).read(Date.now());
      if (!session || (session.status !== "completed" && session.status !== "completing") || session.queue.length > 0) { setSource({ kind: "missing" }); return; }
      setSource({ kind: "ready", result: runDiagnosticPipelineV3(session.answers) });
    } catch (error) {
      console.error("[informe] no se pudo preparar el resultado", error);
      setSource({ kind: "error" });
    }
  }, [data.result, attempt]);

  const generatedAt = useMemo(() => (data.date ? new Date(`${data.date}T12:00:00`) : new Date()), [data.date]);
  const report = useMemo(() => {
    if (source.kind !== "ready") return null;
    const built = buildDiagnosticReport({ narrative: source.result.narrative, outcome: source.result.outcome, generatedAt });
    return data.stress ? stressReport(built) : built;
  }, [source, generatedAt, data.stress]);
  const fileName = report ? reportFileName(report.identity.businessName, report.generatedAt) : null;

  const onFit = useCallback((result: ReportFit) => setFit(result), []);
  useEffect(() => {
    if (!fit || !fileName) return;
    // El navegador propone el título como nombre del PDF al guardar.
    document.title = fileName.replace(/\.pdf$/, "");
    if (data.print && !fit.overflow) window.print();
  }, [fit, fileName, data.print]);

  const paperLink = (paper: ReportPaper) => {
    const url = new URL(typeof window === "undefined" ? "http://localhost/" : window.location.href);
    url.searchParams.set("paper", paper);
    url.searchParams.delete("print");
    return `${url.pathname}${url.search}`;
  };

  return (
    <main className="rp-page">
      <div className="rp-toolbar" role="region" aria-label="Acciones del informe">
        {source.kind === "missing" ? <p>No hay un diagnóstico terminado en este navegador. <a href="/__dev/diagnostico/v3">Hacer el diagnóstico</a></p> : null}
        {source.kind === "error" ? <p role="alert">No pudimos preparar el informe. Tus respuestas siguen guardadas. <button className="button button--secondary" onClick={() => setAttempt((value) => value + 1)} type="button">Reintentar</button></p> : null}
        {source.kind === "loading" || (report && !fit) ? <p aria-live="polite">Preparando tu informe…</p> : null}
        {report && fit ? (
          <>
            <button className="button" onClick={() => window.print()} type="button">Imprimir o guardar PDF</button>
            <span className="rp-toolbar__meta">{fileName} · {REPORT_PAPERS[data.paper].label}</span>
            <a href={paperLink(data.paper === "a4" ? "letter" : "a4")}>Ver en {REPORT_PAPERS[data.paper === "a4" ? "letter" : "a4"].label}</a>
            {fit.overflow ? <p role="alert">El informe no cabe en tres páginas con este contenido.</p> : null}
          </>
        ) : null}
      </div>
      {report ? <DiagnosticReport debug={data.debug} onFit={onFit} paper={data.paper} report={report} /> : null}
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="rp-page">
      <div className="rp-toolbar" role="alert">
        <p>{notFound ? "Esta página no está disponible." : "No pudimos preparar el informe. Recarga la página para intentarlo de nuevo."}</p>
      </div>
    </main>
  );
}
