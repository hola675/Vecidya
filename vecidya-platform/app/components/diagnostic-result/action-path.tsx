import { commercialClarification, COMMERCIAL_V1_LICENSES, type CommercialClarificationAnswer, type DiagnosticNarrative, type DiagnosticOutcome } from "../../features/diagnostic";

import { modifier } from "./indicators";
import { actionSteps, EMPTY_ACTION_PATH_NOTE } from "./presentation";

/**
 * Plan de acción: un paso corto por recomendación, en el orden de las prioridades. Resume lo que ya se justificó
 * arriba (no repite el «por qué» de cada prioridad) y marca la dependencia entre pasos.
 */
export function ActionPath({ narrative, outcome, onCommercialClarification }: { narrative: DiagnosticNarrative; outcome: DiagnosticOutcome; onCommercialClarification?: (answer: CommercialClarificationAnswer) => void }) {
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
export function VecidyaHelpSection({ narrative, outcome, onCommercialClarification }: { narrative: DiagnosticNarrative; outcome: DiagnosticOutcome; onCommercialClarification?: (answer: CommercialClarificationAnswer) => void }) {
  const commercial = outcome.commercialRecommendation;
  const clarification = commercialClarification();
  const nowItems = [...commercial.now.complements, ...commercial.now.services].slice(0, 2);
  const laterItems = [...commercial.later.complements, ...commercial.later.services].slice(0, 2);
  return (
    <section aria-labelledby="dr-vecidya-title" className="dr-section dr-vecidya">
      <h2 className="dr-section__title" id="dr-vecidya-title">Tu licencia Vecidya</h2>
      <p className="dr-note">La selección se basa en tu necesidad operacional, no en tu porcentaje digital.</p>
      {commercial.licenseFit.confidence === "to_confirm" && onCommercialClarification ? (
        <fieldset className="dr-commercial-clarification">
          <legend>{clarification.question}</legend>
          {clarification.options.map((option) => {
            const labels: Record<typeof option, string> = {
              single_process: "Un proceso comercial principal",
              multiple_coordinated_processes: "Varios procesos coordinados",
              not_sure: "No estoy seguro",
            };
            return <label key={option}><input name="commercial-process-scope" onChange={() => onCommercialClarification(option)} type="radio" /> {labels[option]}</label>;
          })}
        </fieldset>
      ) : null}
      <div className="dr-commercial-license">
        <p className="dr-help-item__step">TU MEJOR ENCAJE</p>
        <h3 className="dr-help-item__title">Vecidya {COMMERCIAL_V1_LICENSES[commercial.now.license].name}</h3>
        <p className="dr-commercial-license__objective">{commercial.now.license === "cuadra" ? "Organiza" : commercial.now.license === "barrio" ? "Capta y da seguimiento" : "Automatiza y controla"}</p>
        <p className="dr-offer__text">${commercial.cost.monthlyLicenseUsd}/mes · Puesta en marcha ${commercial.cost.activationUsd} una vez</p>
        <p className="dr-offer__condition">{commercial.licenseFit.rationale}</p>
        <div className="dr-commercial-comparison" aria-label={`Comparación de Cuadra, Barrio y Ciudad frente a ${COMMERCIAL_V1_LICENSES[commercial.now.license].name}`}>
          <div><strong>Cuadra</strong><span>{commercial.now.license === "cuadra" ? "Cubre tu necesidad actual." : commercial.licenseFit.whyNotLower}</span></div>
          <div><strong>Barrio</strong><span>{commercial.now.license === "barrio" ? "Cubre tu necesidad actual." : commercial.now.license === "cuadra" ? "Todavía no necesitas seguimiento comercial recurrente." : "Se quedaría corto para tu operación."}</span></div>
          <div><strong>Ciudad</strong><span>{commercial.now.license === "ciudad" ? "Cubre tu necesidad actual." : "Todavía no necesitas coordinar varios procesos."}</span></div>
        </div>
        <details className="dr-proof"><summary>Por qué {COMMERCIAL_V1_LICENSES[commercial.now.license].name}</summary><p>{commercial.licenseFit.rationale} {commercial.licenseFit.whyNotHigher}</p></details>
      </div>
      {nowItems.length > 0 ? <>
        <h3 className="dr-section__subtitle">Te recomendamos ahora</h3>
        <ol className="dr-help-list" role="list">
          {nowItems.map((item) => <li className="dr-help-item" key={`${item.priority}-${item.id}`}><h3 className="dr-help-item__title">{item.name}</h3>{item.priceLabel !== null ? <p className="dr-offer__text">{item.priceLabel}{item.usageCategories.length > 0 ? " + costes de uso" : ""}</p> : <p className="dr-offer__text">Propuesta personalizada</p>}<p className="dr-offer__condition">{item.rationale}</p></li>)}
        </ol>
      </> : null}
      {laterItems.length > 0 ? <>
        <h3 className="dr-section__subtitle dr-section__subtitle--muted">Puede tener sentido después</h3>
        <ul className="dr-later-list" role="list">{laterItems.map((item) => <li key={item.id}>{item.name}</li>)}</ul>
      </> : null}
      <div className="dr-commercial-cost">
        <h3 className="dr-section__subtitle">Tu configuración</h3>
        <dl><div><dt>{COMMERCIAL_V1_LICENSES[commercial.now.license].name}</dt><dd>${commercial.cost.monthlyLicenseUsd}/mes</dd></div>{nowItems.map((item) => item.priceMonthlyUsd !== null ? <div key={item.id}><dt>{item.name}</dt><dd>${item.priceMonthlyUsd}/mes</dd></div> : null)}<div><dt>Vecidya mensual</dt><dd>${commercial.cost.monthlyLicenseUsd + nowItems.reduce((sum, item) => sum + (item.priceMonthlyUsd ?? 0), 0)}/mes</dd></div><div><dt>Puesta en marcha</dt><dd>${commercial.cost.activationUsd} una vez</dd></div></dl>
        {commercial.cost.externalUsage.length > 0 ? <p>Los canales y proveedores pueden sumar costes de uso según mensajes, llamadas, IA o APIs.</p> : null}
      </div>
    </section>
  );
}
