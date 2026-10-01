import type { DiagnosticNarrative } from "../../features/diagnostic";

import { modifier } from "./indicators";
import { areaItems, strengthItems, uncertaintyGroups } from "./presentation";

/** Lo que funciona: confirmadas y señales con etiqueta distinta, nunca equivalentes. */
export function StrengthsSection({ narrative }: { narrative: DiagnosticNarrative }) {
  const items = strengthItems(narrative);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="dr-strengths-title" className="dr-section dr-readings__column">
      <h2 className="dr-section__title" id="dr-strengths-title">Lo que funciona</h2>
      <ul className="dr-reading-list" role="list">
        {items.map((item) => (
          <li className={`dr-reading dr-reading--${item.kind}`} key={item.block.id}>
            <span className="dr-reading__tag">{item.label}</span>
            <p>{item.block.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Áreas para fortalecer: parcial, debilidad probable/confirmada y dependencia, sin convertir dudas en fallas. */
export function AreasSection({ narrative }: { narrative: DiagnosticNarrative }) {
  const items = areaItems(narrative);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="dr-areas-title" className="dr-section dr-readings__column">
      <h2 className="dr-section__title" id="dr-areas-title">Áreas para fortalecer</h2>
      <ul className="dr-reading-list" role="list">
        {items.map((item) => (
          <li className={`dr-reading dr-reading--${modifier(item.tone)}`} key={item.block.id}>
            <span className="dr-reading__tag">{item.label}</span>
            <p>{item.block.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Contradicciones, presentadas como algo que vale la pena mirar junto y no como un error. */
export function MixedSignalsSection({ narrative }: { narrative: DiagnosticNarrative }) {
  if (narrative.contradictions.length === 0) return null;
  return (
    <section aria-labelledby="dr-mixed-title" className="dr-section dr-mixed">
      <h2 className="dr-section__title" id="dr-mixed-title">Lo que encontramos al cruzar tus respuestas</h2>
      <ul className="dr-mixed__list" role="list">
        {narrative.contradictions.map((block) => <li key={block.id}>{block.text}</li>)}
      </ul>
    </section>
  );
}

/** Lo que todavía no se puede confirmar. Nunca incluye «no aplica», que no es una duda. */
export function UncertaintySection({ narrative }: { narrative: DiagnosticNarrative }) {
  const groups = uncertaintyGroups(narrative);
  if (groups.length === 0) return null;
  return (
    <section aria-labelledby="dr-uncertain-title" className="dr-section dr-uncertain">
      <h2 className="dr-section__title" id="dr-uncertain-title">Lo que todavía no podemos confirmar</h2>
      {groups.map((group) => (
        <div className="dr-uncertain__group" key={group.title}>
          {groups.length > 1 ? <h3>{group.title}</h3> : null}
          <ul>{group.items.map((block) => <li key={block.id}>{block.text}</li>)}</ul>
        </div>
      ))}
    </section>
  );
}
