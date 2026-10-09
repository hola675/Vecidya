import { Link } from "react-router";

import type { CandidatePipelineResultV3 } from "../../features/diagnostic/qbv2-candidate-pipeline";
import { DimensionCard } from "../diagnostic-result/dimension-overview";
import { EvidenceSection, UncertaintySection } from "../diagnostic-result/reading-sections";
import { ExecutiveSummary } from "../diagnostic-result/result-hero";
import { dimensionDisplay } from "../diagnostic-result/presentation";
import { FocusSection } from "../diagnostic-result/focus-section";
import { buildCandidateResultPresentationV3 } from "./candidate-presentation";

const methodologyPath = "/__dev/diagnostico/candidate/metodologia";
const reportPath = "/__dev/diagnostico/candidate/informe";

function CandidateOverall({ result }: { result: CandidatePipelineResultV3 }) {
  const view = buildCandidateResultPresentationV3(result);
  const hasScore = view.overall.score !== null && view.overall.publicLabel !== null;
  return (
    <section aria-labelledby="candidate-overall-title" className="dr-presence dr-candidate-overall" data-state={result.overall.state}>
      <div className="dr-presence__main">
        <div className="dr-presence__reading">
          <h2 className="dr-presence__kicker" id="candidate-overall-title">Estado general</h2>
          {hasScore ? <><p className="dr-presence__value">{view.overall.score}%</p><p className="dr-presence__code">{view.overall.publicLabel}</p></> : <p className="dr-presence__value dr-presence__value--none">{view.overall.label}</p>}
        </div>
      </div>
      <p className="dr-presence__text">{view.overall.explanation}</p>
      <dl className="dr-candidate-overall__meta">
        <div><dt>Confianza</dt><dd>{view.overall.confidence}{view.overall.provisional ? " · lectura provisional" : ""}</dd></div>
        <div><dt>Cobertura contextual O6</dt><dd>{view.overall.coverage}</dd></div>
      </dl>
      {view.overall.warning ? <p className="dr-note">{view.overall.warning}</p> : null}
    </section>
  );
}

function CandidateRecommendationSection({ result }: { result: CandidatePipelineResultV3 }) {
  const view = buildCandidateResultPresentationV3(result);
  return (
    <section aria-labelledby="candidate-recommendations-title" className="dr-section dr-plan">
      <h2 className="dr-section__title" id="candidate-recommendations-title">Acciones recomendadas por el diagnóstico</h2>
      {view.recommendations.length === 0 ? <p className="dr-note">No hay una acción respaldada que debamos recomendar todavía.</p> : (
        <ol className="dr-step-list" role="list">
          {view.recommendations.map((item) => (
            <li className="dr-step" key={item.rank}>
              <p className="dr-step__title">{item.title}</p>
              <p className="dr-step__what">{item.whatToImprove}</p>
              <p className="dr-step__outcome"><span>Por qué importa:</span> {item.whyItMatters}</p>
              <p className="dr-step__outcome"><span>Resultado esperado:</span> {item.expectedOutcome}</p>
              <div className="dr-meta"><span className="dr-step__tag">{item.mode}</span><span className="dr-area-tag">{item.area}</span><span>{item.certainty}</span></div>
              {item.conditions.length ? <div className="dr-candidate-condition"><strong>Condiciones necesarias</strong><ul>{item.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul></div> : null}
              {item.solution ? <p className="dr-candidate-solution"><strong>Solución compatible:</strong> {item.solution.label}. {item.solution.description}</p> : <p className="dr-candidate-solution"><strong>Solución:</strong> todavía no hay una correspondencia justificada para esta recomendación.</p>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function CandidateCommercialSection({ result }: { result: CandidatePipelineResultV3 }) {
  const view = buildCandidateResultPresentationV3(result);
  const commercial = view.commercial;
  const itemList = (items: typeof commercial.now) => items.length ? (
    <ul>{items.map((item) => <li key={`${item.kind}:${item.name}`}><strong>{item.name}</strong> · {item.kind}{item.priceLabel ? ` · ${item.priceLabel}` : ""}<p>{item.rationale}</p></li>)}</ul>
  ) : <p>No hay ofertas compatibles justificadas para este momento.</p>;
  return (
    <section aria-labelledby="candidate-commercial-title" className="dr-section dr-vecidya">
      <h2 className="dr-section__title" id="candidate-commercial-title">Relación comercial, separada del resultado</h2>
      <p className="dr-note">La licencia y las ofertas no cambian la evaluación de capacidad ni las prioridades.</p>
      <div className="dr-candidate-license">
        <h3>{commercial.licenseName ? `Licencia recomendada: ${commercial.licenseName}` : "No se recomienda una licencia por ahora"}</h3>
        <p><strong>Certeza de encaje:</strong> {commercial.certainty}</p>
        <p>{commercial.rationale}</p>
        {commercial.licenseName ? <><p>{commercial.whyNotLower}</p><p>{commercial.whyNotHigher}</p></> : null}
        {commercial.unresolvedSignals.length ? <p><strong>Por confirmar:</strong> {commercial.unresolvedSignals.join("; ")}</p> : null}
      </div>
      <h3 className="dr-section__subtitle">Compatibles ahora</h3>{itemList(commercial.now)}
      <h3 className="dr-section__subtitle dr-section__subtitle--muted">Compatibles después</h3>{itemList(commercial.later)}
    </section>
  );
}

function CandidateDimensions({ result }: { result: CandidatePipelineResultV3 }) {
  const view = buildCandidateResultPresentationV3(result);
  const interpretationById = new Map<string, (typeof result.narrative.dimensions)[number]>(result.narrative.dimensions.map((item) => [item.dimension, item]));
  return (
    <section aria-labelledby="candidate-dimensions-title" className="dr-section dr-dimensions">
      <h2 className="dr-section__title" id="candidate-dimensions-title">Dimensiones, evidencia y contexto</h2>
      <p className="dr-note">La lectura O4 conserva la media certificada de facetas DIRECT hermanas. Las contradicciones respaldadas aparecen en «Cómo llegamos a este resultado»; aquí no se vuelve a agregar ninguna faceta.</p>
      <ul className="dr-dim-list" role="list">
        {view.dimensions.map((item) => {
          const interpretation = interpretationById.get(item.key);
          if (!interpretation) return null;
          return <DimensionCard display={dimensionDisplay(interpretation)} key={item.key}>
            <dl className="dr-candidate-dimension-context">
              <div><dt>Aplicabilidad R4</dt><dd>{item.context.applicability}</dd></div>
              <div><dt>Observabilidad O6</dt><dd>{item.context.observability}</dd></div>
              <div><dt>Evidencia observada</dt><dd>{item.context.directEvidence}</dd></div>
              <div><dt>Cobertura contextual</dt><dd>{item.includedInCoverage ? "Incluida en el denominador O6" : "Fuera del denominador contextual"}</dd></div>
            </dl>
          </DimensionCard>;
        })}
      </ul>
    </section>
  );
}

export function CandidateDiagnosticResult({ result, onEdit }: { result: CandidatePipelineResultV3; onEdit: () => void }) {
  const view = buildCandidateResultPresentationV3(result);
  return (
    <article aria-labelledby="candidate-result-title" className={`dr-result dr-result--${view.lifecycle}`}>
      <header className={`dr-hero dr-hero--${view.lifecycle}`}>
        <h1 className="eyebrow dr-hero__title" id="candidate-result-title" tabIndex={-1}>Resultado de tu diagnóstico de prueba</h1>
        <ul aria-label="Contexto del diagnóstico" className="dr-context"><li>{view.profileLabel}</li><li>{view.lifecycleLabel}</li></ul>
        <p className="dr-note">Resultado local del motor candidato certificado. Todavía no está activo en el diagnóstico público.</p>
        <CandidateOverall result={result} />
      </header>
      <ExecutiveSummary narrative={result.narrative} />
      <FocusSection narrative={result.narrative} />
      <CandidateRecommendationSection result={result} />
      <CandidateCommercialSection result={result} />
      <EvidenceSection narrative={result.narrative} />
      <CandidateDimensions result={result} />
      <UncertaintySection narrative={result.narrative} />
      <section aria-labelledby="candidate-method-title" className="dr-section dr-method">
        <h2 className="dr-section__title" id="candidate-method-title">Metodología y versiones</h2>
        <p>Metodología {result.engineIdentity.methodology}; informe {result.engineIdentity.report}. O4 conserva KEEP_CURRENT_MEAN y O6 usa el denominador contextual certificado.</p>
        <details className="dr-candidate-identities"><summary>Identidad del motor y sus dependencias</summary><dl>{Object.entries(result.engineIdentity).map(([key, value]) => <div key={key}><dt>{key}</dt><dd><code>{String(value)}</code></dd></div>)}</dl></details>
        <p className="dr-method__more"><Link to={methodologyPath}>Leer metodología candidata</Link> · <Link to={reportPath}>Ver informe imprimible</Link></p>
      </section>
      <nav aria-label="Acciones del resultado" className="dr-candidate-actions">
        <button className="button button--secondary" onClick={onEdit} type="button">Editar respuestas</button>
        <Link className="button button--primary" to={reportPath}>Abrir informe imprimible</Link>
        <Link className="button button--secondary" to={methodologyPath}>Abrir metodología</Link>
      </nav>
    </article>
  );
}
