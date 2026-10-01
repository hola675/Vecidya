import type { DimensionPresentationStatus, ResultCertainty } from "../../features/diagnostic";

import { CERTAINTY_DISPLAY, type DimensionDisplay } from "./presentation";

/** Clase CSS a partir de un valor de dominio; nunca se muestra como texto. */
export const modifier = (value: string) => value.replace(/_/g, "-");

/**
 * Forma por estado: el estado se lee por texto e icono, nunca solo por color. Lleno = sólido, medio = parcial,
 * cuarto = necesita refuerzo, anillo con punto = señal, anillo punteado = sin información, guion = no evaluado,
 * anillo tachado = no aplica.
 */
function StatusGlyph({ status }: { status: DimensionPresentationStatus }) {
  const ring = <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />;
  const shapes: Record<DimensionPresentationStatus, React.ReactNode> = {
    strong: <circle cx="8" cy="8" r="7" fill="currentColor" />,
    positive_signal: <>{ring}<circle cx="8" cy="8" r="2.75" fill="currentColor" /></>,
    partial: <>{ring}<path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" /></>,
    weak: <>{ring}<path d="M8 8V1.75A6.25 6.25 0 0 1 14.25 8z" fill="currentColor" /></>,
    uncertain: <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.4 2.2" />,
    not_assessed: <path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />,
    not_applicable: <>{ring}<path d="M3.6 12.4l8.8-8.8" stroke="currentColor" strokeWidth="1.5" /></>,
  };
  return <svg aria-hidden="true" className="dr-status__glyph" focusable="false" height="16" viewBox="0 0 16 16" width="16">{shapes[status]}</svg>;
}

export function StatusIndicator({ label, status }: { label: string; status: DimensionPresentationStatus }) {
  return (
    <span className={`dr-status dr-status--${modifier(status)}`}>
      <StatusGlyph status={status} />
      <span>{label}</span>
    </span>
  );
}

/** Confianza: barras ascendentes + texto. Lenguaje visual propio, distinto del porcentaje. */
export function ConfidenceIndicator({ confidence, label }: { confidence: NonNullable<DimensionDisplay["confidence"]>; label?: string }) {
  return (
    <span className={`dr-confidence dr-confidence--${confidence.steps}`}>
      <span aria-hidden="true" className="dr-confidence__bars">
        {[1, 2, 3].map((step) => <span className={step <= confidence.steps ? "is-on" : undefined} key={step} />)}
      </span>
      <span>{label ?? `Confianza ${confidence.label.toLowerCase()}`}</span>
    </span>
  );
}

/**
 * Porcentaje + barra fina. La barra es decorativa (el texto ya dice el valor) y se raya cuando la lectura es
 * preliminar, para que un 100% con poca evidencia no se vea más firme que un 90% bien respaldado.
 */
export function ScoreMeter({ display }: { display: DimensionDisplay }) {
  if (display.percent === null || display.dimension.score === null) return null;
  return (
    <span className="dr-meter">
      <strong className="dr-meter__value">{display.percent}</strong>
      <span aria-hidden="true" className="dr-meter__track">
        <span className={`dr-meter__fill dr-meter__fill--${modifier(display.dimension.status)}${display.preliminary ? " dr-meter__fill--preliminary" : ""}`} style={{ width: `${display.dimension.score}%` }} />
      </span>
    </span>
  );
}

export function CertaintyTag({ certainty }: { certainty: ResultCertainty }) {
  return <span className={`dr-certainty dr-certainty--${certainty}`}>{CERTAINTY_DISPLAY[certainty]}</span>;
}
