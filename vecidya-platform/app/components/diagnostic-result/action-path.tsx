import { offeringDependencies, type DiagnosticNarrative, type DiagnosticOutcome } from "../../features/diagnostic";

import { modifier } from "./indicators";
import { actionSteps, COMMERCIAL_ROLE_DISPLAY, EMPTY_ACTION_PATH_NOTE, helpItems, VECIDYA_HELP_NOTE } from "./presentation";

/**
 * Plan de acción: un paso corto por recomendación, en el orden de las prioridades. Resume lo que ya se justificó
 * arriba (no repite el «por qué» de cada prioridad) y marca la dependencia entre pasos.
 */
export function ActionPath({ narrative, outcome }: { narrative: DiagnosticNarrative; outcome: DiagnosticOutcome }) {
  const steps = actionSteps(narrative, outcome);
  return (
    <section aria-labelledby="dr-plan-title" className="dr-section dr-plan">
      <h2 className="dr-section__title" id="dr-plan-title">Plan de acción recomendado</h2>
      {steps.length === 0 ? (
        <p className="dr-note">{EMPTY_ACTION_PATH_NOTE}</p>
      ) : (
        <ol className="dr-step-list" role="list">
          {steps.map((step) => (
            <li className={`dr-step dr-step--${modifier(step.recommendation.framing)}`} key={step.recommendation.id}>
              <p className="dr-step__title">{step.recommendation.title}</p>
              <p className="dr-step__what">{step.recommendation.whatToImprove}</p>
              <p className="dr-step__outcome"><span>Resultado esperado:</span> {step.recommendation.expectedOutcome}</p>
              <div className="dr-meta">
                <span className={`dr-step__tag dr-step__tag--${modifier(step.recommendation.mode === "prepare" ? "prepare" : step.recommendation.framing)}`}>{step.tag}</span>
                {step.area ? <span className="dr-area-tag">{step.area}</span> : null}
                {step.after.length > 0 ? <span className="dr-step__after">Después del paso {step.after.join(" y ")}</span> : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/**
 * Cómo puede ayudar Vecidya: siempre después del diagnóstico y del plan. Cada oferta conserva la cadena
 * evidencia → prioridad → recomendación → solución → oferta, visible en «¿Por qué te recomendamos esto?».
 * Sin precios ni llamadas a comprar: el resultado sirve aunque no se contrate nada.
 */
export function VecidyaHelpSection({ narrative, outcome }: { narrative: DiagnosticNarrative; outcome: DiagnosticOutcome }) {
  const items = helpItems(narrative, outcome);
  return (
    <section aria-labelledby="dr-vecidya-title" className="dr-section dr-vecidya">
      <h2 className="dr-section__title" id="dr-vecidya-title">Cómo puede ayudarte Vecidya</h2>
      <p className="dr-note">
        {items.length === 0 ? VECIDYA_HELP_NOTE.none : VECIDYA_HELP_NOTE.some}
      </p>
      {items.length > 0 ? (
        <ol className="dr-help-list" role="list">
          {items.map((entry) => (
            <li className="dr-help-item" key={entry.item.recommendationId}>
              <h3 className="dr-help-item__title"><span className="dr-help-item__step">Paso {entry.step}</span> {entry.recommendation.title}</h3>
              {entry.item.solution.solution ? (
                <div className="dr-solution">
                  <p className="dr-solution__label"><span>Tipo de solución:</span> {entry.item.solution.solution.label}</p>
                  <p className="dr-solution__text">{entry.item.solution.solution.description}</p>
                  {entry.item.solution.alternatives.length > 0 ? <p className="dr-solution__alt">También podría servir, con la base ya lista: {entry.item.solution.alternatives.map((item) => item.label.toLowerCase()).join(", ")}.</p> : null}
                </div>
              ) : null}
              {entry.noOffering ? <p className="dr-help-item__none">{entry.noOffering}</p> : null}
              {entry.offerings.length > 0 ? (
                <ul className="dr-offer-list" role="list">
                  {entry.offerings.map((match) => (
                    <li className={`dr-offer dr-offer--${modifier(match.role)}${match.sharedWith ? " dr-offer--shared" : ""}`} key={match.offering.id}>
                      <p className="dr-offer__head">
                        <strong className="dr-offer__name">{match.offering.name}</strong>
                        <span className="dr-offer__role">{COMMERCIAL_ROLE_DISPLAY[match.role]}</span>
                      </p>
                      {match.sharedWith ? (
                        <p className="dr-offer__text">La misma opción del paso {match.sharedWith.split(":")[1]}.</p>
                      ) : (
                        <>
                          <p className="dr-offer__text">{match.offering.summary}</p>
                          {match.condition ? <p className="dr-offer__condition">{match.condition}</p> : null}
                          {offeringDependencies(match).map((dependency) => <p className="dr-offer__dependency" key={dependency.role}>{dependency.text}</p>)}
                          {match.offering.externalCost ? <p className="dr-offer__cost">{match.offering.externalCost}</p> : null}
                          <p className="dr-offer__contract">{match.offering.contracting}</p>
                          {match.timing === "after_prerequisite" ? <p className="dr-offer__timing">Conviene después del paso {match.after.map((id) => id.split(":")[1]).join(" y ")}.</p> : null}
                          {match.offering.publicPath ? <a className="dr-offer__link" href={match.offering.publicPath}>Ver {match.offering.name}<span className="dr-sr-only"> en el sitio de Vecidya</span></a> : null}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
              {entry.proof.length > 0 ? (
                <details className="dr-proof">
                  <summary>¿Por qué te recomendamos esto?<span className="dr-sr-only"> (paso {entry.step})</span></summary>
                  <ol className="dr-proof__chain">
                    {entry.proof.map((link) => (
                      <li key={link.label}><span className="dr-proof__label">{link.label}</span><span className="dr-proof__text">{link.text}</span></li>
                    ))}
                  </ol>
                </details>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
