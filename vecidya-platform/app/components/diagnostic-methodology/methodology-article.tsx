import { DIGITAL_DIMENSION_IDS, QUESTION_TOPICS } from "../../features/diagnostic";
// Import directo, fuera del barrel: la metodología no entra en el chunk compartido que cargan las rutas públicas.
import {
  DIMENSION_METHODOLOGY, METHODOLOGY_CHANGE_RULES, METHODOLOGY_SECTIONS, METHODOLOGY_SOURCES, METHODOLOGY_VERSION, RECOMMENDATION_CHAIN,
  type DimensionMethodology, type MethodologyChangeRule, type MethodologyClaim, type MethodologySection, type MethodologySource,
} from "../../features/diagnostic/qbv2-methodology";

/**
 * DIAG-V3-11 — presentación reutilizable de la metodología (no depende del perfil ni de un resultado concreto).
 * Solo muestra los datos de `qbv2-methodology.ts`: nivel A («Lo esencial») y nivel B (secciones con detalle,
 * áreas, fuentes y versiones). Las referencias son enlaces normales, accesibles con teclado e imprimibles.
 */

const sectionId = (id: string) => `dm-${id}`;
const sourceAnchor = (id: string) => `dm-source-${id}`;
const sourceNumber = (id: string) => METHODOLOGY_SOURCES.findIndex((source) => source.id === id) + 1;
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const INCREMENT_DISPLAY: Readonly<Record<MethodologyChangeRule["increment"], string>> = { major: "Versión mayor", minor: "Versión menor", none: "No cambia" };
const SOURCE_TYPE_DISPLAY: Readonly<Record<MethodologySource["sourceType"], string>> = {
  official_platform_documentation: "Documentación oficial",
  government_statistics: "Estadística pública",
  intergovernmental_research: "Organismo internacional",
  academic_research: "Investigación universitaria",
  industry_research: "Investigación publicada",
};

/** Explicaciones del nivel A: todas las secciones menos las que son listados (áreas, fuentes y versiones). */
const ESSENTIALS = METHODOLOGY_SECTIONS.filter((section) => !["overview", "dimensions", "sources", "versioning"].includes(section.id));

function SourceRefs({ ids }: { ids: readonly string[] }) {
  return (
    <span className="dm-refs">
      <span className="dm-refs__label">{ids.length > 1 ? "Fuentes" : "Fuente"}</span>
      {ids.map((id) => {
        const source = METHODOLOGY_SOURCES.find((item) => item.id === id)!;
        return <a aria-label={`Fuente ${sourceNumber(id)}: ${source.title}`} href={`#${sourceAnchor(id)}`} key={id}>{sourceNumber(id)}</a>;
      })}
    </span>
  );
}

function Claim({ claim }: { claim: MethodologyClaim }) {
  return (
    <li className={`dm-claim dm-claim--${claim.type}`}>
      {claim.type === "product_interpretation" ? <span className="dm-tag">Criterio de Vecidya</span> : null}
      {claim.text}
      {claim.sourceIds?.length ? <SourceRefs ids={claim.sourceIds} /> : null}
    </li>
  );
}

function AreaCard({ area }: { area: DimensionMethodology }) {
  const titleId = `dm-area-${area.id}`;
  return (
    <article aria-labelledby={titleId} className="dm-area">
      <h3 className="dm-area__title" id={titleId}>{area.label}</h3>
      <p className="dm-area__lead">{area.evaluates}</p>
      <dl className="dm-area__facts">
        <div><dt>Se basa en preguntas sobre</dt><dd><ul>{area.evidenceQuestionIds.map((id) => <li key={id}>{capitalize(QUESTION_TOPICS[id]!)}</li>)}</ul></dd></div>
        <div><dt>Una lectura alta indica</dt><dd>{area.high}</dd></div>
        <div><dt>Una lectura baja indica</dt><dd>{area.low}</dd></div>
        <div><dt>Lo que no significa</dt><dd>{area.notMeaning}</dd></div>
        <div>
          <dt>Por qué importa</dt>
          <dd>
            {area.whyItMatters.type === "product_interpretation" ? <span className="dm-tag">Criterio de Vecidya</span> : null}
            {area.whyItMatters.text}
            {area.whyItMatters.sourceIds?.length ? <SourceRefs ids={area.whyItMatters.sourceIds} /> : null}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function SourceList() {
  const areaLabel = (id: DimensionMethodology["id"]) => DIMENSION_METHODOLOGY[id].label;
  return (
    <ol className="dm-sources">
      {METHODOLOGY_SOURCES.map((source) => (
        <li id={sourceAnchor(source.id)} key={source.id} tabIndex={-1}>
          <p className="dm-source__title"><a href={source.url} rel="noopener noreferrer" target="_blank">{source.title}<span className="dm-sr-only"> (se abre en una pestaña nueva)</span></a></p>
          <p className="dm-source__meta">{source.organization}{source.publishedAt ? ` · ${source.publishedAt.slice(0, 4)}` : ""} · {SOURCE_TYPE_DISPLAY[source.sourceType]}{source.language === "en" ? " · En inglés" : ""}</p>
          <ul className="dm-source__supports">{source.supports.map((item) => <li key={item.dimension}><strong>{areaLabel(item.dimension)}:</strong> {item.principle}</li>)}</ul>
        </li>
      ))}
    </ol>
  );
}

function SectionBody({ section }: { section: MethodologySection }) {
  switch (section.id) {
    case "dimensions":
      return <div className="dm-areas">{DIGITAL_DIMENSION_IDS.map((id) => <AreaCard area={DIMENSION_METHODOLOGY[id]} key={id} />)}</div>;
    case "sources":
      return <SourceList />;
    case "versioning":
      return (
        <div className="dm-table-wrap">
          <table className="dm-table">
            <caption className="dm-sr-only">Qué cambios exigen una nueva versión de la metodología</caption>
            <thead><tr><th scope="col">Cambio</th><th scope="col">Efecto en la versión</th></tr></thead>
            <tbody>{METHODOLOGY_CHANGE_RULES.map((rule) => <tr key={rule.change}><td>{rule.change}</td><td>{INCREMENT_DISPLAY[rule.increment]}</td></tr>)}</tbody>
          </table>
        </div>
      );
    case "recommendations":
      return (
        <>
          <ol aria-label="Cadena de una recomendación" className="dm-chain">{RECOMMENDATION_CHAIN.map((step) => <li key={step}>{step}</li>)}</ol>
          <ul className="dm-claims">{section.detail.map((item) => <Claim claim={item} key={item.id} />)}</ul>
        </>
      );
    default:
      return section.detail.length > 0 ? <ul className="dm-claims">{section.detail.map((item) => <Claim claim={item} key={item.id} />)}</ul> : null;
  }
}

export function MethodologyArticle() {
  const overview = METHODOLOGY_SECTIONS.find((section) => section.id === "overview")!;
  return (
    <article aria-labelledby="dm-title" className="dm">
      <header className="dm-hero">
        <p className="dm-eyebrow">Metodología {METHODOLOGY_VERSION}</p>
        <h1 className="dm-hero__title" id="dm-title">Cómo funciona el diagnóstico de Vecidya</h1>
        <p className="dm-hero__lead">{overview.simple}</p>
      </header>

      <section aria-labelledby="dm-essentials-title" className="dm-essentials">
        <h2 className="dm-section__title" id="dm-essentials-title">Lo esencial</h2>
        <ul>{ESSENTIALS.map((section) => <li key={section.id}><a className="dm-essentials__link" href={`#${sectionId(section.id)}`}>{section.title}</a><p>{section.simple}</p></li>)}</ul>
      </section>

      <nav aria-label="Contenido de la metodología" className="dm-toc">
        <h2 className="dm-toc__title">Contenido</h2>
        <ol>{METHODOLOGY_SECTIONS.map((section) => <li key={section.id}><a href={`#${sectionId(section.id)}`}>{section.title}</a></li>)}</ol>
      </nav>

      {METHODOLOGY_SECTIONS.map((section) => (
        <section aria-labelledby={`${sectionId(section.id)}-title`} className="dm-section" id={sectionId(section.id)} key={section.id}>
          <h2 className="dm-section__title" id={`${sectionId(section.id)}-title`}>{section.title}</h2>
          {section.id === "overview" ? null : <p className="dm-simple">{section.simple}</p>}
          <SectionBody section={section} />
        </section>
      ))}
    </article>
  );
}
