import { useState, type ReactNode } from "react";
import type { DiagnosticNarrative } from "../../features/diagnostic";

import { EvidenceDisclosure, HelpDisclosure } from "./disclosures";
import { ConfidenceIndicator, modifier, ScoreMeter, StatusIndicator } from "./indicators";
import { areaItems, dimensionOverview, RESULT_HELP, strengthItems, type DimensionDisplay } from "./presentation";

/** Una dimensión compacta por defecto; el botón expone todo el detalle sin cambiar el contenido del resultado. */
export function DimensionCard({ display, children }: { display: DimensionDisplay; children?: ReactNode }) {
  const { dimension } = display;
  const [expanded, setExpanded] = useState(false);
  const detailId = `dr-dim-detail-${dimension.dimension}`;
  return (
    <li className={`dr-dim dr-dim--${modifier(dimension.status)}${display.percent === null ? " dr-dim--unscored" : ""}`} data-dimension={dimension.dimension}>
      <div className="dr-dim__head">
        <img alt="" className="dr-dim__icon" height="48" src={display.icon} width="48" />
        <h3 className="dr-dim__label">{dimension.label}</h3>
      </div>
      <div className="dr-dim__measure">
        {display.percent !== null && display.confidence ? (
          <>
            <ScoreMeter display={display} />
            <ConfidenceIndicator confidence={display.confidence} />
          </>
        ) : null}
        <StatusIndicator label={display.statusLabel} status={dimension.status} />
      </div>
      <button
        aria-controls={detailId}
        aria-expanded={expanded}
        aria-label={`${expanded ? "Ocultar" : "Ver"} detalle de ${dimension.label}`}
        className="dr-dim__toggle"
        onClick={() => setExpanded((value) => !value)}
        type="button"
      >
        <span>{expanded ? "Cerrar detalle" : "Ver detalle"}</span>
        <span aria-hidden="true" className="dr-dim__chevron" />
      </button>
      <div className="dr-dim__detail" hidden={!expanded} id={detailId}>
        <p>{dimension.interpretation.text}</p>
        <EvidenceDisclosure display={display} />
        {children}
      </div>
    </li>
  );
}

/** Grid de las ocho áreas en el orden canónico, con un conteo descriptivo de estados ya existentes. */
export function DimensionOverview({ narrative }: { narrative: DiagnosticNarrative }) {
  const model = dimensionOverview(narrative);
  const assessed = model.items.filter((item) => item.percent !== null).length;
  const strengths = strengthItems(narrative).length;
  const opportunities = areaItems(narrative).length;
  const unscored = model.items.length - assessed;
  return (
    <section aria-labelledby="dr-dimensions-title" className="dr-section dr-dimensions">
      <div className="dr-subhead">
        <h2 className="dr-section__title" id="dr-dimensions-title">Tus ocho áreas</h2>
        <HelpDisclosure help={RESULT_HELP.dimensions} />
      </div>
      {model.lifecycleNote ? <p className="dr-note">{model.lifecycleNote}</p> : null}
      {model.preliminaryNote ? <p className="dr-note">{model.preliminaryNote}</p> : null}
      <div className="dr-help-row">
        <HelpDisclosure help={RESULT_HELP.score} />
        {model.hasUnscored ? <HelpDisclosure help={RESULT_HELP.unscored} /> : null}
      </div>
      <div aria-label="Resumen de las áreas" className="dr-snapshot">
        <p className="dr-snapshot__label">Vista rápida</p>
        <ul className="dr-snapshot__list" role="list">
          <li><strong>{assessed}</strong><span>con lectura</span></li>
          <li><strong>{strengths}</strong><span>fortalezas</span></li>
          <li><strong>{opportunities}</strong><span>por mejorar</span></li>
          <li><strong>{unscored}</strong><span>sin lectura suficiente</span></li>
        </ul>
      </div>
      <ul className="dr-dim-list" role="list">
        {model.items.map((display) => <DimensionCard display={display} key={display.dimension.dimension} />)}
      </ul>
    </section>
  );
}
