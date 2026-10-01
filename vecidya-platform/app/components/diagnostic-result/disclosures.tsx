import type { DimensionDisplay } from "./presentation";

/** Ayuda contextual con `<details>` nativo: accesible por teclado, sin JS y legible al imprimir. */
export function HelpDisclosure({ help }: { help: { readonly question: string; readonly paragraphs: readonly string[] } }) {
  return (
    <details className="dr-help">
      <summary>
        <span aria-hidden="true" className="dr-help__mark">?</span>
        {help.question}
      </summary>
      <div className="dr-help__body">
        {help.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </details>
  );
}

/** «En qué se basa»: temas legibles de la procedencia, nunca identificadores de pregunta ni fórmulas. */
export function EvidenceDisclosure({ display }: { display: DimensionDisplay }) {
  const { evidence, label } = display.dimension;
  if (evidence.length === 0) return null;
  return (
    <details className="dr-evidence">
      <summary>En qué se basa<span className="dr-sr-only"> la lectura de {label}</span></summary>
      <div className="dr-evidence__body">
        <p>{display.evidenceLead}</p>
        <ul>{evidence.map((item) => <li key={item.questionId}>{item.topic}</li>)}</ul>
      </div>
    </details>
  );
}
