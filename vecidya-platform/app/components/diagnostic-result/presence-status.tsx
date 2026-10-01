import type { DigitalPresenceStatus, OverallState } from "../../features/diagnostic";

import { HelpDisclosure } from "./disclosures";
import { ConfidenceIndicator, modifier } from "./indicators";
import { presenceDisplay, RESULT_HELP } from "./presentation";
import { STATUS_ASSETS } from "./status-assets";

/**
 * Marcador del icono de estado mientras no exista el arte final: tres bloques apilados (base incompleta, base que
 * crece, base completa y verificada). Decorativo: el estado siempre se lee también por texto.
 */
function StatusAssetPlaceholder({ state }: { state: OverallState }) {
  const filled = { low: 1, developing: 2, solid: 3 }[state];
  const blocks = [
    { x: 6, y: 34, width: 36 },
    { x: 11, y: 21, width: 26 },
    { x: 16, y: 8, width: 16 },
  ];
  return (
    <svg aria-hidden="true" className="dr-presence__placeholder" focusable="false" height="56" viewBox="0 0 48 48" width="56">
      {blocks.map((block, index) => (index < filled
        ? <rect fill="currentColor" height="10" key={block.y} rx="2" width={block.width} x={block.x} y={block.y} />
        : <rect fill="none" height="9" key={block.y} rx="2" stroke="currentColor" strokeDasharray="3 2.5" strokeWidth="1.5" width={block.width - 1} x={block.x + 0.5} y={block.y + 0.5} />))}
      {state === "solid" ? <path d="M36 10.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" /> : null}
    </svg>
  );
}

function StatusAsset({ state }: { state: OverallState }) {
  const asset = STATUS_ASSETS[state];
  return (
    <span className="dr-presence__asset" data-asset-slot={asset.slot}>
      {asset.src ? <img alt="" height="56" src={asset.src} width="56" /> : <StatusAssetPlaceholder state={state} />}
    </span>
  );
}

/**
 * Estado general de la presencia digital: porcentaje, nombre del estado, icono semántico y explicación; la
 * confianza y la cobertura van en una fila aparte para no mezclar capacidad con evidencia. No es una prioridad.
 */
export function DigitalPresenceStatusCard({ status }: { status: DigitalPresenceStatus }) {
  const display = presenceDisplay(status);
  const state = status.state === "insufficient" ? null : status.state;
  return (
    <section aria-labelledby="dr-presence-title" className={`dr-presence dr-presence--${modifier(status.state)}`} data-state={status.state}>
      <div className="dr-presence__main">
        {state ? <StatusAsset state={state} /> : null}
        <div className="dr-presence__reading">
          <h2 className="dr-presence__kicker" id="dr-presence-title">Tu presencia digital</h2>
          {display.percent ? (
            <>
              <p className="dr-presence__value">{display.percent}</p>
              <p className="dr-presence__label">{status.label}</p>
            </>
          ) : <p className="dr-presence__value dr-presence__value--none">{status.label}</p>}
        </div>
      </div>
      <p className="dr-presence__text">{status.explanation.text}</p>
      <div className="dr-presence__meta">
        {display.percent ? (
          <p className="dr-presence__confidence">
            <span className="dr-presence__meta-label">Confianza del resultado:</span>
            <ConfidenceIndicator confidence={display.confidence} label={display.confidence.label} />
          </p>
        ) : null}
        <p className="dr-presence__coverage">{display.coverage}</p>
      </div>
      <HelpDisclosure help={RESULT_HELP.presence} />
    </section>
  );
}
