import type { ReactNode } from "react";
import type { DiagnosticNarrative } from "../../features/diagnostic";

import { EvidenceDisclosure, HelpDisclosure } from "./disclosures";
import { ConfidenceIndicator, modifier, ScoreMeter, StatusIndicator } from "./indicators";
import { dimensionOverview, RESULT_HELP, type DimensionDisplay } from "./presentation";

/**
 * Una dimensión: etiqueta, estado, porcentaje (si existe) con su confianza, interpretación y evidencia. Sin
 * altura fija: el texto largo (terminología clínica o nonprofit, listas de evidencia) siempre fluye.
 */
export function DimensionCard({ display, children }: { display: DimensionDisplay; children?: ReactNode }) {
  const { dimension } = display;
  return (
    <li className={`dr-dim dr-dim--${modifier(dimension.status)}${display.percent === null ? " dr-dim--unscored" : ""}`}>
      <div className="dr-dim__head">
        <img alt="" className="dr-dim__icon" height="64" src={display.icon} width="64" />
        <h3 className="dr-dim__label">{dimension.label}</h3>
        <StatusIndicator label={display.statusLabel} status={dimension.status} />
      </div>
      <div className="dr-dim__measure">
        {display.percent !== null && display.confidence ? (
          <>
            <ScoreMeter display={display} />
            <ConfidenceIndicator confidence={display.confidence} />
          </>
        ) : (
          <span className="dr-dim__no-score">Sin porcentaje</span>
        )}
      </div>
      <div className="dr-dim__body">
        <p>{dimension.interpretation.text}</p>
        <EvidenceDisclosure display={display} />
        {children}
      </div>
    </li>
  );
}

/** Nivel 3 — las ocho dimensiones, siempre las ocho y en el orden canónico. */
export function DimensionOverview({ narrative }: { narrative: DiagnosticNarrative }) {
  const model = dimensionOverview(narrative);
  return (
    <section aria-labelledby="dr-dimensions-title" className="dr-section dr-dimensions">
      <div className="dr-subhead">
        <h2 className="dr-section__title" id="dr-dimensions-title">Las ocho áreas del diagnóstico</h2>
        <HelpDisclosure help={RESULT_HELP.dimensions} />
      </div>
      {model.lifecycleNote ? <p className="dr-note">{model.lifecycleNote}</p> : null}
      {model.preliminaryNote ? <p className="dr-note">{model.preliminaryNote}</p> : null}
      <div className="dr-help-row">
        <HelpDisclosure help={RESULT_HELP.score} />
        {model.hasUnscored ? <HelpDisclosure help={RESULT_HELP.unscored} /> : null}
      </div>
      <ul className="dr-dim-list" role="list">
        {model.items.map((display) => <DimensionCard display={display} key={display.dimension.dimension} />)}
      </ul>
    </section>
  );
}
