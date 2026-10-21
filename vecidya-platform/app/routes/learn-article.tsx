import { Link } from "react-router";

import { getLearnArticle, learnArticles } from "../content/learn";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { LearnBlock } from "../content/learn";
import type { Route } from "./+types/learn-article";

export function loader({ params }: Route.LoaderArgs) {
  const article = params.slug ? getLearnArticle(params.slug) : undefined;
  if (!article) throw new Response("Artículo no encontrado", { status: 404 });
  return { article };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.article) return publicMeta("Artículo no encontrado", "El artículo que buscas no está disponible.", "/aprende", "noindex, nofollow");
  const { article } = loaderData;
  return [
    ...publicMeta(article.title, article.intro, `/aprende/${article.slug}`, article.editorialDraft ? "noindex, nofollow" : undefined).filter((tag) => !("property" in tag && tag.property === "og:type")),
    { property: "og:type", content: "article" },
    ...(!article.editorialDraft ? [{ property: "article:author", content: "Yoan Ortiz" }] : []),
    { property: "article:section", content: article.category },
  ];
}

function renderLearnBlock(block: LearnBlock, key: string) {
  switch (block.type) {
    case "paragraph":
      return <p key={key}>{block.text}</p>;
    case "list":
      return <ul key={key}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
    case "steps":
      return <div className="learn-block learn-block--steps" key={key}><ol aria-label={block.label}>{block.items.map((item) => <li key={item.title}><strong>{item.title}</strong><p>{item.detail}</p></li>)}</ol></div>;
    case "definitions":
      return <div className="learn-block learn-block--definitions" key={key}><dl>{block.items.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl></div>;
    case "example":
      return <section className="learn-block learn-block--example" key={key} aria-label={block.hypothetical ? "Ejemplo hipotético" : "Ejemplo práctico"}>
        {block.hypothetical && <p className="learn-block__eyebrow">Ejemplo hipotético</p>}
        <h3>{block.title}</h3>
        <p><strong>Situación:</strong> {block.context}</p>
        <p><strong>Problema:</strong> {block.problem}</p>
        <p><strong>Enfoque proporcional:</strong> {block.approach}</p>
        <h4>Cómo aplicarlo</h4>
        <ol>{block.actions.map((action) => <li key={action}>{action}</li>)}</ol>
        <p><strong>Qué muestra:</strong> {block.lesson}</p>
      </section>;
    case "callout":
      return <aside className={`learn-block learn-block--callout learn-block--${block.tone}`} key={key}>
        <p className="learn-block__eyebrow">{block.tone === "tip" ? "Consejo" : "Precaución"}</p>
        <h3>{block.title}</h3>
        <p>{block.text}</p>
      </aside>;
    case "faq":
      return <div className="learn-block learn-block--faq" key={key}>{block.items.map((item) => <details key={item.question}>
        <summary>{item.question}</summary>
        <p>{item.answer}</p>
      </details>)}</div>;
    case "sources":
      return <ul className="learn-block learn-block--sources" key={key}>{block.items.map((item) => <li key={item.url}>
        <a href={item.url} target="_blank" rel="noopener noreferrer">{item.label}</a>
        <p>{item.scope}</p>
      </li>)}</ul>;
    case "summary":
      return <aside className="learn-block learn-block--summary" key={key}>
        <h3>Qué puedes hacer ahora</h3>
        <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </aside>;
    default:
      return null;
  }
}

export default function LearnArticle({ loaderData }: Route.ComponentProps) {
  const { article } = loaderData;
  const related = article.relatedSlugs
    ? article.relatedSlugs.flatMap((slug) => {
      const candidate = getLearnArticle(slug);
      return candidate && candidate.slug !== article.slug ? [candidate] : [];
    }).slice(0, 2)
    : learnArticles.filter((candidate) => candidate.slug !== article.slug).slice(0, 2);

  return (
    <PublicLayout>
      <main className="public-page learn-article-page">
        <article>
          <header className="learn-article-header">
            <Link className="text-link" to="/aprende">← Volver a Aprende</Link>
            <p className="eyebrow">{article.category}</p>
            <h1>{article.title}</h1>
            <p className="learn-article-intro">{article.intro}</p>
            {article.editorialDraft ? (
              <p className="learn-article-byline"><strong>Borrador educativo de Aprende Vecidya</strong> · contenido asistido por IA, pendiente de revisión editorial y autoría</p>
            ) : (
              <p className="learn-article-byline">Por <strong>Yoan Ortiz</strong> · Aprende Vecidya</p>
            )}
            <aside className="learn-article-quick" aria-label="Resumen sencillo de la guía">
              <h2>En pocas palabras</h2>
              <ul>{article.enPocasPalabras.map((point) => <li key={point}>{point}</li>)}</ul>
            </aside>
          </header>
          <img className="learn-article-image" src={article.image} alt={article.imageAlt} width={900} height={360} />
          <div className="learn-article-layout">
            <aside className="learn-article-toc" aria-label="Índice del artículo">
              <strong>En esta guía</strong>
              <ol>{article.sections.map((section, index) => <li key={section.heading}><a href={`#section-${index + 1}`}>{section.heading}</a></li>)}</ol>
            </aside>
            <div className="learn-article-body">
              {article.sections.map((section, index) => (
                <section id={`section-${index + 1}`} key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                  {section.blocks?.map((block, blockIndex) => renderLearnBlock(block, `${section.heading}-${blockIndex}`))}
                </section>
              ))}
              <aside className="learn-article-cta">
                <p className="eyebrow">RELACIONADO CON VECIDYA</p>
                <h2>{article.cta.copy}</h2>
                <Link className="button button--primary" to={article.cta.to}>{article.cta.label}</Link>
              </aside>
            </div>
          </div>
        </article>
        <section className="learn-related" aria-labelledby="learn-related-title">
          <p className="eyebrow">SIGUE APRENDIENDO</p>
          <h2 id="learn-related-title">Otras guías de Aprende Vecidya</h2>
          <div className="learn-related-grid">{related.map((item) => <Link className="learn-related-card" key={item.slug} to={`/aprende/${item.slug}`}><span>{item.category}</span><strong>{item.title}</strong><small>Leer guía →</small></Link>)}</div>
        </section>
      </main>
    </PublicLayout>
  );
}
