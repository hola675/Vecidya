import { Link } from "react-router";

import { getLearnArticle, learnArticles } from "../content/learn";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { Route } from "./+types/learn-article";

export function loader({ params }: Route.LoaderArgs) {
  const article = params.slug ? getLearnArticle(params.slug) : undefined;
  if (!article) throw new Response("Artículo no encontrado", { status: 404 });
  return { article };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.article) return publicMeta("Artículo no encontrado", "El artículo que buscas no está disponible.", "/aprende", "noindex, nofollow");
  const { article } = data;
  return [
    ...publicMeta(article.title, article.intro, `/aprende/${article.slug}`),
    { property: "article:author", content: "Yoan Ortiz" },
    { property: "article:section", content: article.category },
  ];
}

export default function LearnArticle({ loaderData }: Route.ComponentProps) {
  const { article } = loaderData;
  const related = learnArticles.filter((candidate) => candidate.slug !== article.slug).slice(0, 2);

  return (
    <PublicLayout>
      <main className="public-page learn-article-page">
        <article>
          <header className="learn-article-header">
            <Link className="text-link" to="/aprende">← Volver a Aprende</Link>
            <p className="eyebrow">{article.category}</p>
            <h1>{article.title}</h1>
            <p className="learn-article-intro">{article.intro}</p>
            <p className="learn-article-byline">Por <strong>Yoan Ortiz</strong> · Aprende Vecidya</p>
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
