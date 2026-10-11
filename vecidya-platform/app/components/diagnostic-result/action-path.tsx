import { commercialClarification, COMMERCIAL_V1_LICENSES, type CommercialClarificationAnswer, type DiagnosticNarrative, type DiagnosticOutcome } from "../../features/diagnostic";

import { modifier } from "./indicators";
import { actionSteps, dimensionDisplay, EMPTY_ACTION_PATH_NOTE } from "./presentation";

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
          {steps.map((step, index) => {
            const dimension = narrative.dimensions.find((item) => item.dimension === step.recommendation.dimension);
            const icon = dimension ? dimensionDisplay(dimension).icon : null;
            return (
              <li className={`dr-step dr-step--${modifier(step.recommendation.framing)}`} data-step-order={index + 1} key={step.recommendation.id}>
                <span aria-hidden="true" className="dr-step__number">{index + 1}</span>
                <div className="dr-step__heading">
                  {icon ? <img alt="" className="dr-step__icon" height="48" src={icon} width="48" /> : null}
                  <div>
                    <p className="dr-step__title">{step.recommendation.title}</p>
                    {step.area ? <p className="dr-step__area">{step.area}</p> : null}
                  </div>
                </div>
                <p className="dr-step__what">{step.recommendation.whatToImprove}</p>
                <details className="dr-step__why">
                  <summary>Por qué importa</summary>
                  <div>
                    <p className="dr-step__outcome">{step.recommendation.expectedOutcome}</p>
                    <span className={`dr-step__tag dr-step__tag--${modifier(step.recommendation.mode === "prepare" ? "prepare" : step.recommendation.framing)}`}>{step.tag}</span>
                    {step.after.length > 0 ? <p className="dr-step__after">Este paso sigue al {step.after.map((number) => `paso ${number}`).join(" y ")}.</p> : null}
                  </div>
                </details>
              </li>
            );
          })}
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
      <h2 className="dr-section__title" id="dr-vecidya-title">¿Quieres ayuda con estos puntos?</h2>
      <p className="dr-note">Estas opciones son compatibles con lo que encontramos y no cambian tu resultado. No todas las personas necesitan contratar una oferta; puedes avanzar por tu cuenta o con quien prefieras.</p>
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
        <details className="dr-commercial-comparison-details">
          <summary>Comparar licencias</summary>
          <div className="dr-commercial-comparison" aria-label={`Comparación de Cuadra, Barrio y Ciudad frente a ${COMMERCIAL_V1_LICENSES[commercial.now.license].name}`}>
            <div><strong>Cuadra</strong><span>{commercial.now.license === "cuadra" ? "Cubre tu necesidad actual." : commercial.licenseFit.whyNotLower}</span></div>
            <div><strong>Barrio</strong><span>{commercial.now.license === "barrio" ? "Cubre tu necesidad actual." : commercial.now.license === "cuadra" ? "Todavía no necesitas seguimiento comercial recurrente." : "Se quedaría corto para tu operación."}</span></div>
            <div><strong>Ciudad</strong><span>{commercial.now.license === "ciudad" ? "Cubre tu necesidad actual." : "Todavía no necesitas coordinar varios procesos."}</span></div>
          </div>
        </details>
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
      <details className="dr-commercial-cost">
        <summary>Ver desglose de costos</summary>
        <div>
          <h3 className="dr-section__subtitle">Tu configuración</h3>
          <dl><div><dt>{COMMERCIAL_V1_LICENSES[commercial.now.license].name}</dt><dd>${commercial.cost.monthlyLicenseUsd}/mes</dd></div>{nowItems.map((item) => item.priceMonthlyUsd !== null ? <div key={item.id}><dt>{item.name}</dt><dd>${item.priceMonthlyUsd}/mes</dd></div> : null)}<div><dt>Vecidya mensual</dt><dd>${commercial.cost.monthlyLicenseUsd + nowItems.reduce((sum, item) => sum + (item.priceMonthlyUsd ?? 0), 0)}/mes</dd></div><div><dt>Puesta en marcha</dt><dd>${commercial.cost.activationUsd} una vez</dd></div></dl>
          {commercial.cost.externalUsage.length > 0 ? <p>Los canales y proveedores pueden sumar costes de uso según mensajes, llamadas, IA o APIs.</p> : null}
        </div>
      </details>
    </section>
  );
}
