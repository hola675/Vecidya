import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, type MetaFunction } from "react-router";

import { buildDiagnosticReport, CANONICAL_REPORT_PAPER, DiagnosticReport, REPORT_PAPERS, reportFileName, type ReportFit, type ReportPaper } from "../components/diagnostic-report";
import { PublicLayout } from "../components/public-layout";
import { DiagnosticSessionStoreV3, runDiagnosticPipelineV3, type DiagnosticResultV3 } from "../features/diagnostic";

/**
 * DIAG-V3-13 — informe PDF del diagnóstico, público desde el corte (antes solo en la ruta privada
 * `/__dev/diagnostico/informe`, DIAG-V3-12). Sin parámetros de desarrollo: ni personas golden, ni
 * `debug`, ni `stress`, ni fecha fija. Solo lee el diagnóstico terminado de este navegador
 * (`localStorage`); sin servidor, sin IDs internos. `?paper=a4|letter` es la única opción real del
 * usuario; `?print=1` abre el diálogo de impresión en cuanto el informe termina de repartirse en hojas.
 * `noindex`: una página por visitante, nunca contenido público que convenga indexar (a diferencia de
 * `/diagnostico/metodologia`, que sí es evergreen).
 */

export const meta: MetaFunction = () => [{ title: "Informe del diagnóstico · Vecidya" }, { name: "robots", content: "noindex, nofollow" }];

type Source = { readonly kind: "loading" } | { readonly kind: "missing" } | { readonly kind: "error" } | { readonly kind: "ready"; readonly result: DiagnosticResultV3 };

export default function DiagnosticoInforme() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paper: ReportPaper = searchParams.get("paper") === "letter" ? "letter" : CANONICAL_REPORT_PAPER;
  const shouldPrint = searchParams.get("print") === "1";
  const [source, setSource] = useState<Source>({ kind: "loading" });
  const [fit, setFit] = useState<ReportFit | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    try {
      const session = new DiagnosticSessionStoreV3(window.localStorage).read(Date.now());
      if (!session || (session.status !== "completed" && session.status !== "completing") || session.queue.length > 0) { setSource({ kind: "missing" }); return; }
      setSource({ kind: "ready", result: runDiagnosticPipelineV3(session.answers) });
    } catch (error) {
      console.error("[informe] no se pudo preparar el resultado", error);
      setSource({ kind: "error" });
    }
  }, [attempt]);

  const generatedAt = useMemo(() => new Date(), []);
  const report = useMemo(() => (source.kind === "ready" ? buildDiagnosticReport({ narrative: source.result.narrative, outcome: source.result.outcome, generatedAt }) : null), [source, generatedAt]);
  const fileName = report ? reportFileName(report.identity.businessName, report.generatedAt) : null;

  const onFit = useCallback((result: ReportFit) => setFit(result), []);
  useEffect(() => {
    if (!fit || !fileName) return;
    // El navegador propone el título como nombre del PDF al guardar.
    document.title = fileName.replace(/\.pdf$/, "");
    if (shouldPrint && !fit.overflow) window.print();
  }, [fit, fileName, shouldPrint]);

  const switchPaper = (next: ReportPaper) => {
    const params = new URLSearchParams(searchParams);
    params.set("paper", next);
    params.delete("print");
    setSearchParams(params, { replace: true });
  };

  return (
    <PublicLayout>
      <main className="rp-page">
        <div aria-label="Acciones del informe" className="rp-toolbar" role="region">
          {source.kind === "missing" ? <p>No hay un diagnóstico terminado en este navegador. <a href="/diagnostico">Hacer el diagnóstico</a></p> : null}
          {source.kind === "error" ? (
            <p role="alert">
              No pudimos preparar el informe. Tus respuestas siguen guardadas.{" "}
              <button className="button button--secondary" onClick={() => setAttempt((value) => value + 1)} type="button">Reintentar</button>
            </p>
          ) : null}
          {source.kind === "loading" || (report && !fit) ? <p aria-live="polite">Preparando tu informe…</p> : null}
          {report && fit ? (
            <>
              <button className="button" onClick={() => window.print()} type="button">Imprimir o guardar PDF</button>
              <span className="rp-toolbar__meta">{fileName} · {REPORT_PAPERS[paper].label}</span>
              <button className="text-link" onClick={() => switchPaper(paper === "a4" ? "letter" : "a4")} type="button">Ver en {REPORT_PAPERS[paper === "a4" ? "letter" : "a4"].label}</button>
              {fit.overflow ? <p role="alert">El informe no cabe en tres páginas con este contenido.</p> : null}
            </>
          ) : null}
        </div>
        {report ? <DiagnosticReport onFit={onFit} paper={paper} report={report} /> : null}
      </main>
    </PublicLayout>
  );
}
