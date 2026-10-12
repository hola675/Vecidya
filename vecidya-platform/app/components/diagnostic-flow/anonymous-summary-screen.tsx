import { useEffect, useRef, useState } from "react";

import type { AnonymousDiagnosticSummaryV1 } from "../../features/diagnostic/anonymous-summary";

const STATE_LABELS = {
  low: "Hay puntos prioritarios por atender",
  developing: "Tu presencia digital está en desarrollo",
  solid: "La lectura muestra una base favorable",
  insufficient: "Aún no hay evidencia suficiente",
} as const;

const CONFIDENCE_LABELS = {
  high: "Confianza alta",
  medium: "Confianza moderada",
  low: "Confianza limitada",
} as const;

export function AnonymousSummaryScreen({
  summary,
  onRestart,
}: {
  readonly summary: AnonymousDiagnosticSummaryV1;
  readonly onRestart: () => void;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [detailsRequested, setDetailsRequested] = useState(false);
  const scoreText = summary.score === null ? "Sin porcentaje" : String(summary.score) + "%";

  useEffect(() => { titleRef.current?.focus(); }, []);

  return (
    <section aria-labelledby="df-anon-title" className="df-anon-summary">
      <header className="df-anon-summary__hero">
        <div className="df-anon-summary__heading">
          <h1 className="df-anon-summary__title" id="df-anon-title" ref={titleRef} tabIndex={-1}>Tu resultado, en breve</h1>
          <p className="df-anon-summary__state">{STATE_LABELS[summary.state]}</p>
        </div>
        <img alt="" className="df-anon-summary__mark" decoding="async" height="56" src="/assets/selected/brand/brand-symbol-3d.webp" width="56" />
        <div aria-label={summary.score === null ? "Aún no hay un porcentaje fiable" : "Resultado " + scoreText} className="df-anon-summary__score">
          <span>{scoreText}</span>
        </div>
        <p className={"df-anon-summary__confidence" + (summary.preliminary ? " is-preliminary" : "")}>
          {summary.preliminary ? "Lectura preliminar · evidencia limitada" : CONFIDENCE_LABELS[summary.confidence]}
        </p>
        <p className="df-anon-summary__confidence-note">{summary.confidenceNote}</p>
        <p className="df-anon-summary__headline">{summary.headline}</p>
        {summary.currentState ? <p className="df-anon-summary__current">{summary.currentState}</p> : null}
      </header>

      <div className="df-anon-summary__reading">
        {summary.focus ? (
          <section aria-labelledby="df-anon-focus-title">
            <p className="df-anon-summary__label">Lo más importante ahora</p>
            <h2 id="df-anon-focus-title">{summary.focus.title}</h2>
            <p>{summary.focus.description}</p>
          </section>
        ) : null}
        {summary.firstAction ? (
          <section aria-labelledby="df-anon-action-title">
            <p className="df-anon-summary__label">Un primer paso</p>
            <h2 id="df-anon-action-title">{summary.firstAction.title}</h2>
            <p>{summary.firstAction.description}</p>
          </section>
        ) : null}
      </div>

      <details className="df-anon-summary__coverage">
        <summary>Cómo interpretar esta lectura</summary>
        <p>{summary.coverageNote}</p>
        <p>El resumen no incluye el análisis detallado de cada área.</p>
      </details>

      <div className="df-anon-summary__actions">
        <button className="button button--primary" onClick={() => setDetailsRequested(true)} type="button">
          Ver diagnóstico completo
        </button>
        <p aria-live="polite" className="df-anon-summary__request-note" role={detailsRequested ? "status" : undefined}>
          {detailsRequested
            ? "El flujo para solicitar el informe completo se habilitará más adelante. No te pediremos datos ahora."
            : ""}
        </p>
        <div>
          <button aria-describedby="df-anon-download-note" className="button button--secondary" disabled type="button">Descargar resumen</button>
          <p className="df-anon-summary__download-note" id="df-anon-download-note">La descarga todavía no está disponible.</p>
        </div>
        <button className="button button--ghost" onClick={onRestart} type="button">Empezar otro diagnóstico</button>
      </div>
    </section>
  );
}
