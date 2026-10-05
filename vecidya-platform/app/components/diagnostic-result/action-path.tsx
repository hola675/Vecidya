import type { DiagnosticNarrative, DiagnosticOutcome } from "../../features/diagnostic";

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
  const commercial = outcome.commercialRecommendation;
  const items = [...commercial.now.complements, ...commercial.now.services, ...commercial.later.complements, ...commercial.later.services];
  const hasCommercial = Boolean(commercial.now.license) || items.length > 0;
  const legacyItems = helpItems(narrative, outcome);
  const legacyCompatibility = !hasCommercial && commercial.operationalNeed.evidenceRefs.length === 0 && legacyItems.length > 0;
  return (
    <section aria-labelledby="dr-vecidya-title" className="dr-section dr-vecidya">
      <h2 className="dr-section__title" id="dr-vecidya-title">Cómo puede ayudarte Vecidya</h2>
      <p className="dr-note">
        {hasCommercial ? "Esta propuesta separa la licencia, las necesidades actuales y las oportunidades posteriores. La selección se basa en la necesidad operacional demostrada, no en el porcentaje digital." : VECIDYA_HELP_NOTE.none}
      </p>
      {legacyCompatibility ? (
        <ol className="dr-help-list" role="list">
          {legacyItems.map((entry) => (
            <li className="dr-help-item" key={entry.item.recommendationId}>
              <h3 className="dr-help-item__title"><span className="dr-help-item__step">Paso {entry.step}</span> {entry.recommendation.title}</h3>
              {entry.item.solution.solution ? <div className="dr-solution"><p className="dr-solution__label"><span>Tipo de solución:</span> {entry.item.solution.solution.label}</p><p className="dr-solution__text">{entry.item.solution.solution.description}</p></div> : null}
              {entry.noOffering ? <p className="dr-help-item__none">{entry.noOffering}</p> : null}
              {entry.offerings.length > 0 ? <ul className="dr-offer-list" role="list">{entry.offerings.map((match) => <li className="dr-offer" key={match.offering.id}><p className="dr-offer__head"><strong className="dr-offer__name">{match.offering.name}</strong><span className="dr-offer__role">{COMMERCIAL_ROLE_DISPLAY[match.role]}</span></p><p className="dr-offer__text">{match.offering.summary}</p></li>)}</ul> : null}
              {entry.proof.length > 0 ? <details className="dr-proof"><summary>¿Por qué te recomendamos esto?</summary><ol className="dr-proof__chain">{entry.proof.map((link) => <li key={link.label}><span className="dr-proof__label">{link.label}</span><span className="dr-proof__text">{link.text}</span></li>)}</ol></details> : null}
            </li>
          ))}
        </ol>
      ) : hasCommercial ? (
        <ol className="dr-help-list" role="list">
          {commercial.now.license ? (
            <li className="dr-help-item" key="commercial-license">
              <h3 className="dr-help-item__title"><span className="dr-help-item__step">NECESARIO AHORA</span> Vecidya {commercial.now.license}</h3>
              <p className="dr-offer__text">${commercial.cost.monthlyLicenseUsd}/mes · Puesta en marcha ${commercial.cost.activationUsd} una vez.</p>
              <p className="dr-offer__condition">{commercial.licenseFit.rationale}</p>
              <details className="dr-proof"><summary>¿Por qué esta licencia?</summary><p>{commercial.licenseFit.rationale} {commercial.licenseFit.whyNotLower} {commercial.licenseFit.whyNotHigher}</p>{commercial.licenseFit.evidence.length > 0 ? <ul>{commercial.licenseFit.evidence.map((evidence) => <li key={`${evidence.questionId}-${evidence.answerOption}`}>{evidence.derivedFact}</li>)}</ul> : null}</details>
            </li>
          ) : null}
          {items.map((item) => (
            <li className="dr-help-item" key={`${item.priority}-${item.id}`}>
              <h3 className="dr-help-item__title"><span className="dr-help-item__step">{item.priority === "NOW" ? "NECESARIO AHORA" : "PUEDE AYUDARTE DESPUÉS"}</span> {item.name}</h3>
              {item.priceLabel !== null ? <p className="dr-offer__text">{item.priceLabel}{item.usageCategories.length > 0 ? ` · Uso externo: ${item.usageCategories.join(", ")}` : ""}</p> : null}
              <p className="dr-offer__condition">{item.rationale}</p>
              <details className="dr-proof"><summary>¿Qué evidencia lo respalda?</summary><ul>{item.evidence.map((evidence) => <li key={`${evidence.questionId}-${evidence.answerOption}`}>{evidence.derivedFact}</li>)}</ul></details>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
