import type { DiagnosticNarrative, NarrativePriority } from "../../features/diagnostic";

import { HelpDisclosure } from "./disclosures";
import { CertaintyTag, ConfidenceIndicator, modifier } from "./indicators";
import { CONSTRAINT_COPY, dimensionDisplay, dimensionLabelOf, PRIORITY_SLOT_DISPLAY, RESULT_HELP, showNextFocus } from "./presentation";

/** Restricción principal: el bloque con más jerarquía después del resumen. */
export function PrimaryConstraint({ narrative }: { narrative: DiagnosticNarrative }) {
  const constraint = narrative.primaryConstraint;
  if (!constraint) {
    // Sin restricción material (p. ej. la persona golden de citas): un resultado válido, no un hueco.
    return (
      <div className="dr-constraint dr-constraint--clear">
        <p className="dr-constraint__kicker">{CONSTRAINT_COPY.kicker}</p>
        <h3 className="dr-constraint__title">{CONSTRAINT_COPY.clearTitle}</h3>
        <p className="dr-constraint__text">{narrative.nextFocus.text}</p>
      </div>
    );
  }
  const dimension = narrative.dimensions.find((item) => item.dimension === constraint.dimension);
  const confidence = dimension ? dimensionDisplay(dimension).confidence : null;
  return (
    <div className={`dr-constraint dr-constraint--${constraint.certainty}`}>
      <p className="dr-constraint__kicker">{constraint.certainty === "unknown" ? CONSTRAINT_COPY.verifyKicker : CONSTRAINT_COPY.kicker}</p>
      {dimension ? <h3 className="dr-constraint__title">{dimension.label}</h3> : null}
      <p className="dr-constraint__text">{constraint.text}</p>
      <div className="dr-meta">
        <CertaintyTag certainty={constraint.certainty} />
        {confidence ? <ConfidenceIndicator confidence={confidence} /> : null}
      </div>
    </div>
  );
}

/** Prioridades en el orden exacto del dominio: el componente nunca ordena por score, severidad ni rango. */
export function PriorityList({ narrative }: { narrative: DiagnosticNarrative }) {
  if (narrative.priorities.length === 0) return null;
  return (
    <div className="dr-priorities">
      <div className="dr-subhead">
        <h3>Por dónde empezar</h3>
        <HelpDisclosure help={RESULT_HELP.priorities} />
      </div>
      <ol className="dr-priority-list" role="list">
        {narrative.priorities.map((priority: NarrativePriority) => (
          <li className={`dr-priority dr-priority--${modifier(priority.slot)}`} key={priority.statement.id}>
            <p className="dr-priority__slot">{PRIORITY_SLOT_DISPLAY[priority.slot]}</p>
            <p className="dr-priority__statement">{priority.statement.text}</p>
            <p className="dr-priority__why">{priority.why.text}</p>
            <div className="dr-meta">
              <span className="dr-area-tag">{dimensionLabelOf(narrative, priority.dimension)}</span>
              <CertaintyTag certainty={priority.certainty} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Nivel 2 — qué importa más ahora. */
export function FocusSection({ narrative }: { narrative: DiagnosticNarrative }) {
  return (
    <section aria-labelledby="dr-focus-title" className="dr-section dr-focus">
      <h2 className="dr-section__title" id="dr-focus-title">Lo que más importa ahora</h2>
      <PrimaryConstraint narrative={narrative} />
      <PriorityList narrative={narrative} />
      {showNextFocus(narrative) && narrative.primaryConstraint ? <p className="dr-next-focus">{narrative.nextFocus.text}</p> : null}
    </section>
  );
}
