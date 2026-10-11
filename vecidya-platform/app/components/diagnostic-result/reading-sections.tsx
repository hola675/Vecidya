import { publicAssets } from "../../assets/public-assets";
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

function ReadingColumn({ id, title, items, empty }: { id: string; title: string; items: readonly { readonly block: { readonly id: string; readonly text: string }; readonly label: string; readonly kind?: string }[]; empty: string }) {
  return (
    <section aria-labelledby={id} className="dr-readings__column">
      <h3 className="dr-subsection__title" id={id}>{title}</h3>
      {items.length > 0 ? <ReadingList items={items} /> : <p className="dr-reading-empty">{empty}</p>}
    </section>
  );
}

/** Mantiene separadas las fortalezas confirmadas/señales de las áreas parciales o por reforzar. */
export function StrengthsSection({ narrative }: { narrative: DiagnosticNarrative }) {
  return (
    <ReadingColumn
      empty="No se identificó un elemento para esta lista en el resultado actual."
      id="dr-strengths-title"
      items={strengthItems(narrative)}
      title="Lo que ya tienes a favor"
    />
  );
}

export function AreasSection({ narrative }: { narrative: DiagnosticNarrative }) {
  return (
    <ReadingColumn
      empty="No se identificó un elemento para esta lista en el resultado actual."
      id="dr-areas-title"
      items={areaItems(narrative)}
      title="Lo que conviene mejorar"
    />
  );
}

/** Señales que vale la pena mirar juntas, conservando ambos lados y el texto original. */
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

/** Dos columnas breves; el texto original permanece íntegro y las listas vacías se explican sin datos de relleno. */
export function EvidenceSection({ narrative }: { narrative: DiagnosticNarrative }) {
  return (
    <section aria-labelledby="dr-evidence-title" className="dr-section dr-evidence-section">
      <h2 className="dr-section__title" id="dr-evidence-title">Lo que ya funciona y lo que conviene reforzar</h2>
      <div className="dr-readings">
        <StrengthsSection narrative={narrative} />
        <AreasSection narrative={narrative} />
      </div>
      <MixedSignalsSection narrative={narrative} />
    </section>
  );
}

type UncertaintyPoint = { readonly id: string; readonly label: string; readonly text: string };

/** Una sola tarjeta con hasta cuatro puntos; el resto sigue disponible bajo demanda y conserva su agrupación. */
export function UncertaintySection({ narrative }: { narrative: DiagnosticNarrative }) {
  const risks: readonly AreaDisplay[] = riskItems(narrative);
  const groups = uncertaintyGroups(narrative);
  const points: UncertaintyPoint[] = [
    ...risks.map((risk) => ({ id: risk.block.id, label: risk.label, text: risk.block.text })),
    ...groups.flatMap((group) => group.items.map((block) => ({ id: block.id, label: group.title, text: block.text }))),
  ];
  if (points.length === 0) return null;
  const visible = points.slice(0, 4);
  const remaining = points.slice(4);
  const renderPoints = (items: readonly UncertaintyPoint[]) => (
    <ul className="dr-uncertain__list" role="list">
      {items.map((point) => (
        <li className="dr-uncertain__point" key={point.id}>
          <span>{point.label}</span>
          <p>{point.text}</p>
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-labelledby="dr-uncertain-title" className="dr-section dr-uncertain">
      <div className="dr-uncertain__heading">
        <img alt="" height="44" src={publicAssets.icons.search} width="44" />
        <div>
          <h2 className="dr-section__title" id="dr-uncertain-title">{risks.length > 0 ? "Riesgos y lo que falta confirmar" : "Lo que todavía falta confirmar"}</h2>
          <p>La lectura separa estos puntos de las áreas que sí pudieron evaluarse.</p>
        </div>
      </div>
      {renderPoints(visible)}
      {remaining.length > 0 ? (
        <details className="dr-uncertain__more">
          <summary>Ver todo ({remaining.length} más)</summary>
          {renderPoints(remaining)}
        </details>
      ) : null}
    </section>
  );
}
