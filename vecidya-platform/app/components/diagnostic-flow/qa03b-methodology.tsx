import { Link } from "react-router";

import { METHODOLOGY_SOURCES } from "../../features/diagnostic/qbv2-methodology";
import { CANDIDATE_METHODOLOGY_IDENTITY_V3, CANDIDATE_METHODOLOGY_SECTIONS_V3 } from "./qa03b-methodology-content";

export function CandidateMethodologyArticle() {
  return (
    <article aria-labelledby="candidate-methodology-title" className="dm dm-candidate">
      <header className="dm-hero">
        <h1 className="dm-hero__title" id="candidate-methodology-title">Cómo funciona el diagnóstico candidato de Vecidya</h1>
        <p className="dm-hero__lead">Metodología {CANDIDATE_METHODOLOGY_IDENTITY_V3.replace("diagnostic-methodology-", "")} · explicación local del modelo en prueba. No cambia la metodología pública.</p>
      </header>
      <p className="dr-note">Esta página acompaña al motor candidato, que todavía no está activo en producción. La metodología conserva el identificador 3.0; la explicación de O4 y O6 se limita a esta superficie privada de prueba.</p>
      <nav aria-label="Contenido de la metodología candidata" className="dm-toc">
        <h2 className="dm-toc__title">Contenido</h2>
        <ol>{CANDIDATE_METHODOLOGY_SECTIONS_V3.map((section) => <li key={section.id}><a href={`#candidate-method-${section.id}`}>{section.title}</a></li>)}</ol>
      </nav>
      {CANDIDATE_METHODOLOGY_SECTIONS_V3.map((section) => (
        <section aria-labelledby={`candidate-method-${section.id}-title`} className="dm-section" id={`candidate-method-${section.id}`} key={section.id}>
          <h2 className="dm-section__title" id={`candidate-method-${section.id}-title`}>{section.title}</h2>
          <p className="dm-simple">{section.summary}</p>
          <ul className="dm-claims">{section.points.map((point) => <li className="dm-claim" key={point}>{point}</li>)}</ul>
        </section>
      ))}
      <section aria-labelledby="candidate-method-sources-title" className="dm-section" id="candidate-method-sources">
        <h2 className="dm-section__title" id="candidate-method-sources-title">Fuentes y alcance</h2>
        <p className="dm-simple">Las fuentes respaldan por qué importan distintas áreas digitales. No validan la fórmula del índice ni demuestran predicción de resultados empresariales reales.</p>
        <ol className="dm-sources">{METHODOLOGY_SOURCES.map((source) => <li id={`candidate-source-${source.id}`} key={source.id}><p className="dm-source__title"><a href={source.url} rel="noopener noreferrer" target="_blank">{source.title}<span className="dm-sr-only"> (se abre en una pestaña nueva)</span></a></p><p className="dm-source__meta">{source.organization}{source.publishedAt ? ` · ${source.publishedAt.slice(0, 4)}` : ""}</p><ul className="dm-source__supports">{source.supports.map((item) => <li key={item.dimension}>{item.principle}</li>)}</ul></li>)}</ol>
      </section>
      <nav aria-label="Continuar con la prueba" className="dr-candidate-actions">
        <Link className="button button--secondary" to="/__dev/diagnostico/qa03b">Volver a la sesión candidata</Link>
        <Link className="button button--primary" to="/__dev/diagnostico/qa03b/informe">Abrir informe imprimible</Link>
      </nav>
    </article>
  );
}
