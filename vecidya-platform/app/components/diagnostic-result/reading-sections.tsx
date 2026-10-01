import type { DiagnosticNarrative } from "../../features/diagnostic";

import { modifier } from "./indicators";
import { areaItems, riskItems, strengthItems, uncertaintyGroups, type AreaDisplay } from "./presentation";

function ReadingList({ items }: { items: readonly { readonly block: { readonly id: string; readonly text: string }; readonly label: string; readonly kind?: string; readonly tone?: string }[] }) {
  return (
    <ul className="dr-reading-list" role="list">
      {items.map((item) => (
        <li className={`dr-reading dr-reading--${modifier(item.kind ?? item.tone ?? "")}`} key={item.block.id}>
          <span className="dr-reading__tag">{item.label}</span>
          <p>{item.block.text}</p>
        </li>
      ))}
    </ul>
  );
}

/** Lo que funciona: confirmadas y señales con etiqueta distinta, nunca equivalentes. Sin fortalezas reales, no se muestra. */
export function StrengthsSection({ narrative }: { narrative: DiagnosticNarrative }) {
  const items = strengthItems(narrative);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="dr-strengths-title" className="dr-readings__column">
      <h3 className="dr-subsection__title" id="dr-strengths-title">Lo que funciona</h3>
      <ReadingList items={items} />
    </section>
  );
}

/** Áreas para fortalecer: parcial y debilidad probable/confirmada, sin convertir dudas en fallas. */
export function AreasSection({ narrative }: { narrative: DiagnosticNarrative }) {
  const items = areaItems(narrative);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="dr-areas-title" className="dr-readings__column">
      <h3 className="dr-subsection__title" id="dr-areas-title">Áreas para fortalecer</h3>
      <ReadingList items={items} />
    </section>
  );
}

/** Contradicciones, presentadas como algo que vale la pena mirar junto y no como un error. */
export function MixedSignalsSection({ narrative }: { narrative: DiagnosticNarrative }) {
  if (narrative.contradictions.length === 0) return null;
  return (
    <section aria-labelledby="dr-mixed-title" className="dr-mixed">
      <h3 className="dr-subsection__title" id="dr-mixed-title">Lo que encontramos al cruzar tus respuestas</h3>
      <ul className="dr-mixed__list" role="list">
        {narrative.contradictions.map((block) => <li key={block.id}>{block.text}</li>)}
      </ul>
    </section>
  );
}

/** Nivel 5 — cómo llegamos a este resultado: lecturas que lo sostienen. */
export function EvidenceSection({ narrative }: { narrative: DiagnosticNarrative }) {
  const hasReadings = strengthItems(narrative).length > 0 || areaItems(narrative).length > 0;
  if (!hasReadings && narrative.contradictions.length === 0) return null;
  return (
    <section aria-labelledby="dr-evidence-title" className="dr-section dr-evidence-section">
      <h2 className="dr-section__title" id="dr-evidence-title">Cómo llegamos a este resultado</h2>
      {hasReadings ? (
        <div className="dr-readings">
          <StrengthsSection narrative={narrative} />
          <AreasSection narrative={narrative} />
        </div>
      ) : null}
      <MixedSignalsSection narrative={narrative} />
    </section>
  );
}

/**
 * Riesgos y lo que todavía no se puede confirmar. Cada riesgo es un bloque de la narrativa con procedencia (nunca
 * una frase genérica) y nunca incluye «no aplica», que no es una duda.
 */
export function UncertaintySection({ narrative }: { narrative: DiagnosticNarrative }) {
  const risks: readonly AreaDisplay[] = riskItems(narrative);
  const groups = uncertaintyGroups(narrative);
  if (groups.length === 0 && risks.length === 0) return null;
  return (
    <section aria-labelledby="dr-uncertain-title" className="dr-section dr-uncertain">
      <h2 className="dr-section__title" id="dr-uncertain-title">{risks.length > 0 ? "Riesgos y lo que falta confirmar" : "Lo que todavía no podemos confirmar"}</h2>
      {risks.length > 0 ? (
        <div className="dr-uncertain__group">
          <h3>Riesgos observados</h3>
          <ReadingList items={risks} />
        </div>
      ) : null}
      {groups.map((group) => (
        <div className="dr-uncertain__group" key={group.title}>
          {groups.length > 1 || risks.length > 0 ? <h3>{group.title}</h3> : null}
          <ul>{group.items.map((block) => <li key={block.id}>{block.text}</li>)}</ul>
        </div>
      ))}
    </section>
  );
}
