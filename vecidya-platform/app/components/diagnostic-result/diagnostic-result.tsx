import type { CommercialClarificationAnswer, DiagnosticNarrative, DiagnosticOutcome } from "../../features/diagnostic";
// Import directo, fuera del barrel: la metodología no entra en el chunk compartido que cargan las rutas públicas.
import { METHODOLOGY_LINK_LABEL, METHODOLOGY_VERSION, RESULT_METHOD_NOTES } from "../../features/diagnostic/qbv2-methodology";
import { METHODOLOGY_PATH } from "../diagnostic-methodology";

import { ActionPath, VecidyaHelpSection } from "./action-path";
import { DimensionOverview } from "./dimension-overview";
import { FocusSection } from "./focus-section";
import { RESULT_DISCLAIMER } from "./presentation";
import { EvidenceSection, UncertaintySection } from "./reading-sections";
import { ExecutiveSummary, ResultHero } from "./result-hero";

/** Cierre — «Cómo se evaluó» (nivel A de la metodología, DIAG-V3-11), el alcance del resultado y el enlace a la metodología completa. */
export function MethodNote() {
  return (
    <section aria-labelledby="dr-method-title" className="dr-section dr-method">
      <h2 className="dr-section__title" id="dr-method-title">Cómo se evaluó</h2>
      <ul>{RESULT_METHOD_NOTES.map((note) => <li key={note}>{note}</li>)}</ul>
      <p className="dr-method__more"><a href={METHODOLOGY_PATH}>{METHODOLOGY_LINK_LABEL}</a> <span className="dr-method__version">Metodología {METHODOLOGY_VERSION}</span></p>
      <p className="dr-disclaimer">{RESULT_DISCLAIMER}</p>
    </section>
  );
}

/**
 * DIAG-V3-09/10 — experiencia de resultado. Consume el `DiagnosticNarrative` y el `DiagnosticOutcome` (datos planos
 * y serializables): ordena, etiqueta y pliega sus bloques, pero no decide significado ni reescribe su texto.
 *
 * Orden de lectura: resultado digital → atención → licencia y prioridades comerciales → detalle diagnóstico → método.
 */
export function DiagnosticResult({
  narrative,
  outcome,
  onCommercialClarification,
}: {
  narrative: DiagnosticNarrative;
  outcome: DiagnosticOutcome;
  onCommercialClarification?: (answer: CommercialClarificationAnswer) => void;
}) {
  return (
    <article aria-labelledby="dr-title" className={`dr-result dr-result--${narrative.lifecycle}`}>
      <ResultHero narrative={narrative} outcome={outcome} />
      <ExecutiveSummary narrative={narrative} />
      <FocusSection narrative={narrative} />
      <VecidyaHelpSection narrative={narrative} outcome={outcome} onCommercialClarification={onCommercialClarification} />
      <ActionPath narrative={narrative} outcome={outcome} onCommercialClarification={onCommercialClarification} />
      <EvidenceSection narrative={narrative} />
      <DimensionOverview narrative={narrative} />
      <UncertaintySection narrative={narrative} />
      <MethodNote />
    </article>
  );
}
