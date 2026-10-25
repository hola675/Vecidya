import { Link } from "react-router";

import { DiagnosticAreaOverview } from "./diagnostic-area-overview";
import type { AnonymousDiagnosticSummaryV2 } from "../../features/diagnostic/qa03b/qbv2-candidate-funnel";

export function CandidateDiagnosticResult({ summary, onEdit, onRequestReport, publicMode = false, reportRequestEnabled = true, methodologyHref = "/diagnostico/metodologia" }: {
  readonly summary: AnonymousDiagnosticSummaryV2;
  readonly onEdit: () => void;
  readonly onRequestReport: () => void;
  readonly publicMode?: boolean;
  readonly reportRequestEnabled?: boolean;
  readonly methodologyHref?: string;
}) {
  return (
    <article aria-labelledby="candidate-result-title" className="dr-result">
      <header className="dr-hero">
        <p className="dr-hero__eyebrow">Resumen {publicMode ? "anónimo calculado por Vecidya" : "anónimo verificado en Worker"}</p>
        <h1 className="eyebrow dr-hero__title" id="candidate-result-title" tabIndex={-1}>Tu resumen del diagnóstico</h1>
        <p className="dr-note">{publicMode ? "Diagnóstico de Vecidya" : `Motor ${summary.diagnosticIdentity.engine}`} · Metodología {summary.methodologyVersion}</p>
      </header>
      <div className="dr-candidate-synthesis">
        <section aria-labelledby="candidate-overall-title" className="dr-presence dr-candidate-overall">
          <div className="dr-presence__main">
            <div className="dr-presence__reading">
              <h2 className="dr-presence__kicker" id="candidate-overall-title">Estado general</h2>
              {summary.score === null ? <p className="dr-presence__value dr-presence__value--none">{summary.overallStatus}</p> : <><p className="dr-presence__value">{summary.score}%</p><p className="dr-presence__code">{summary.overallStatus}</p></>}
            </div>
          </div>
          <p className="dr-presence__text">{summary.executiveSummary}</p>
          <dl className="dr-candidate-overall__meta">
            <div><dt>Confianza</dt><dd>{summary.confidence}</dd></div>
            <div><dt>Cobertura</dt><dd>{summary.coverage}</dd></div>
          </dl>
        </section>
        <DiagnosticAreaOverview dimensions={summary.dimensions} />
      </div>
      {summary.primaryOpportunity ? <section aria-labelledby="candidate-opportunity-title" className="dr-section">
        <h2 className="dr-section__title" id="candidate-opportunity-title">Oportunidad principal</h2>
        <p>{summary.primaryOpportunity}</p>
      </section> : null}
      {summary.firstRecommendedAction ? <section aria-labelledby="candidate-first-action-title" className="dr-section">
        <h2 className="dr-section__title" id="candidate-first-action-title">Primer paso recomendado</h2>
        <h3>{summary.firstRecommendedAction.title}</h3>
        <p>{summary.firstRecommendedAction.explanation}</p>
      </section> : null}
      {summary.limitations.some((limitation) => limitation !== summary.coverage) ? <aside aria-label="Alcance de esta lectura" className="dr-candidate-limitations"><h2>Alcance de esta lectura</h2><p>{summary.limitations.filter((limitation) => limitation !== summary.coverage).join(" · ")}</p></aside> : null}
      <nav aria-label="Acciones del resumen" className="dr-candidate-actions">
        {publicMode ? <button className="button button--secondary" onClick={() => window.print()} type="button">Imprimir o guardar resumen</button> : null}
        {(!publicMode || reportRequestEnabled) ? <button className="button button--primary" onClick={onRequestReport} type="button">Solicitar informe completo</button> : null}
        <button className="button button--secondary" onClick={onEdit} type="button">Editar respuestas</button>
        <Link className="button button--secondary" to={methodologyHref}>Consultar metodología</Link>
      </nav>
      {publicMode && !reportRequestEnabled ? <p className="dr-note">Este resumen es anónimo. La solicitud del informe completo no está disponible en este momento.</p> : null}
    </article>
  );
}
