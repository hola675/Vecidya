import type { DiagnosticNarrative, DiagnosticOutcome } from "../../features/diagnostic";

import { ActionPath, VecidyaHelpSection } from "./action-path";
import { DimensionOverview } from "./dimension-overview";
import { FocusSection } from "./focus-section";
import { METHOD_NOTES, RESULT_DISCLAIMER } from "./presentation";
import { EvidenceSection, UncertaintySection } from "./reading-sections";
import { ExecutiveSummary, ResultHero } from "./result-hero";

/** Cierre — «Cómo se evaluó» y el alcance del resultado. Las fuentes y marcos externos llegan en la capa de metodología. */
export function MethodNote() {
  return (
    <section aria-labelledby="dr-method-title" className="dr-section dr-method">
      <h2 className="dr-section__title" id="dr-method-title">Cómo se evaluó</h2>
      <ul>{METHOD_NOTES.map((note) => <li key={note}>{note}</li>)}</ul>
      <p className="dr-disclaimer">{RESULT_DISCLAIMER}</p>
    </section>
  );
}

/**
 * DIAG-V3-09/10 — experiencia de resultado. Consume el `DiagnosticNarrative` y el `DiagnosticOutcome` (datos planos
 * y serializables): ordena, etiqueta y pliega sus bloques, pero no decide significado ni reescribe su texto.
 *
 * Orden de lectura (igual en móvil, escritorio e impresión): presencia digital actual → diagnóstico ejecutivo → lo
 * que más frena y las prioridades → plan de acción → cómo llegamos al resultado → ocho áreas → riesgos y lo que
 * falta confirmar → cómo puede ayudar Vecidya → método y alcance. Lo comercial nunca aparece antes del diagnóstico.
 */
export function DiagnosticResult({ narrative, outcome }: { narrative: DiagnosticNarrative; outcome: DiagnosticOutcome }) {
  return (
    <article aria-labelledby="dr-title" className={`dr-result dr-result--${narrative.lifecycle}`}>
      <ResultHero narrative={narrative} outcome={outcome} />
      <ExecutiveSummary narrative={narrative} />
      <FocusSection narrative={narrative} />
      <ActionPath narrative={narrative} outcome={outcome} />
      <EvidenceSection narrative={narrative} />
      <DimensionOverview narrative={narrative} />
      <UncertaintySection narrative={narrative} />
      <VecidyaHelpSection narrative={narrative} outcome={outcome} />
      <MethodNote />
    </article>
  );
}
