import type { DiagnosticNarrative } from "../../features/diagnostic";

import { DimensionOverview } from "./dimension-overview";
import { FocusSection } from "./focus-section";
import { METHOD_NOTES } from "./presentation";
import { AreasSection, MixedSignalsSection, StrengthsSection, UncertaintySection } from "./reading-sections";
import { ResultHero } from "./result-hero";

/** Nivel 5 — reserva de «Cómo se evaluó». Las fuentes y marcos externos llegan en la capa de metodología. */
export function MethodNote() {
  return (
    <section aria-labelledby="dr-method-title" className="dr-section dr-method">
      <h2 className="dr-section__title" id="dr-method-title">Cómo se evaluó</h2>
      <ul>{METHOD_NOTES.map((note) => <li key={note}>{note}</li>)}</ul>
    </section>
  );
}

/**
 * DIAG-V3-09 — experiencia de resultado. Consume solo el `DiagnosticNarrative` (datos planos y serializables):
 * ordena, etiqueta y pliega sus bloques, pero no decide significado ni reescribe su texto.
 *
 * Orden de lectura (igual en móvil y escritorio): resumen → restricción y prioridades → lo que funciona y lo que
 * conviene fortalecer → señales cruzadas → ocho áreas con su evidencia → lo que falta confirmar → método.
 * Mapa al futuro PDF: `ResultHero` = portada + resumen ejecutivo; `FocusSection` = prioridades;
 * `DimensionOverview` = páginas por dimensión; `UncertaintySection` + `MethodNote` = evidencia y método.
 */
export function DiagnosticResult({ narrative }: { narrative: DiagnosticNarrative }) {
  const hasReadings = narrative.strengths.length > 0 || narrative.weaknesses.length > 0;
  return (
    <article aria-labelledby="dr-title" className={`dr-result dr-result--${narrative.lifecycle}`}>
      <ResultHero narrative={narrative} />
      <FocusSection narrative={narrative} />
      {hasReadings ? (
        <div className="dr-readings">
          <StrengthsSection narrative={narrative} />
          <AreasSection narrative={narrative} />
        </div>
      ) : null}
      <MixedSignalsSection narrative={narrative} />
      <DimensionOverview narrative={narrative} />
      <UncertaintySection narrative={narrative} />
      <MethodNote />
    </article>
  );
}
