import type { DiagnosticNarrative, DiagnosticOutcome } from "../../features/diagnostic";

import { DigitalPresenceStatusCard } from "./presence-status";
import { LIFECYCLE_DISPLAY, PROFILE_DISPLAY } from "./presentation";

/**
 * Nivel 1 — portada: el contexto del resultado y la presencia digital actual (porcentaje, estado y confianza).
 * DIAG-V3-10: el porcentaje general describe la presencia de hoy; no es una prioridad ni la decide.
 */
export function ResultHero({ narrative, outcome }: { narrative: DiagnosticNarrative; outcome: DiagnosticOutcome }) {
  return (
    <header className={`dr-hero dr-hero--${narrative.lifecycle}`}>
      <h1 className="eyebrow dr-hero__title" id="dr-title" tabIndex={-1}>Resultado de tu diagnóstico</h1>
      <ul aria-label="Contexto del diagnóstico" className="dr-context">
        <li>{PROFILE_DISPLAY[narrative.profile]}</li>
        <li>{LIFECYCLE_DISPLAY[narrative.lifecycle]}</li>
      </ul>
      <DigitalPresenceStatusCard status={outcome.overall} />
    </header>
  );
}

/** Nivel 2 — diagnóstico ejecutivo: la primera frase del resumen es el titular, seguida de «Dónde estás hoy». */
export function ExecutiveSummary({ narrative }: { narrative: DiagnosticNarrative }) {
  const [headline, ...lead] = narrative.executiveSummary;
  return (
    <section aria-labelledby="dr-summary-title" className="dr-section dr-summary">
      <h2 className="dr-section__title" id="dr-summary-title">Lo que encontró el diagnóstico</h2>
      {headline ? <p className="dr-summary__headline">{headline.text}</p> : null}
      {lead.map((block) => <p className="dr-summary__lead" key={block.id}>{block.text}</p>)}
      <div className="dr-summary__state">
        <p className="dr-summary__state-label">Dónde estás hoy</p>
        <p>{narrative.currentState.text}</p>
      </div>
    </section>
  );
}
