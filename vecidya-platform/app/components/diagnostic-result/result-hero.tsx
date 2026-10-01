import type { DiagnosticNarrative } from "../../features/diagnostic";

import { LIFECYCLE_DISPLAY, PROFILE_DISPLAY } from "./presentation";

/**
 * Nivel 1 — qué encontró el diagnóstico. La primera frase del resumen ejecutivo es el titular; no hay puntaje
 * global (el dominio no lo tiene) ni cifras decorativas.
 */
export function ResultHero({ narrative }: { narrative: DiagnosticNarrative }) {
  const [headline, ...lead] = narrative.executiveSummary;
  return (
    <header className={`dr-hero dr-hero--${narrative.lifecycle}`}>
      <h1 className="eyebrow dr-hero__title" id="dr-title" tabIndex={-1}>Resultado de tu diagnóstico</h1>
      <ul aria-label="Contexto del diagnóstico" className="dr-context">
        <li>{PROFILE_DISPLAY[narrative.profile]}</li>
        <li>{LIFECYCLE_DISPLAY[narrative.lifecycle]}</li>
      </ul>
      {headline ? <p className="dr-hero__headline">{headline.text}</p> : null}
      {lead.map((block) => <p className="dr-hero__lead" key={block.id}>{block.text}</p>)}
      <div className="dr-hero__state">
        <p className="dr-hero__state-label">Dónde estás hoy</p>
        <p>{narrative.currentState.text}</p>
      </div>
    </header>
  );
}
