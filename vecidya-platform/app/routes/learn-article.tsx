import { Link } from "react-router";

import { learnArticles } from "../content/learn";
import { getLearnEditorialIdentity, getLearnGuideAccess, getPublicLearnArticle, toPublicLearnGuideSummary } from "../content/learn-publication";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { createDatabase } from "../../db/client.server";
import { getSession } from "../../server/auth/session.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { canReadLearnGuideBody } from "../../server/learn/entitlement.server";

import type { LearnBlock } from "../content/learn";
import type { Route } from "./+types/learn-article";

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const article = getPublicLearnArticle(learnArticles, params.slug);
  if (!article || article.editorialDraft) throw new Response("Artículo no encontrado", { status: 404 });
  const access = getLearnGuideAccess(article.slug);
  if (!access) throw new Response("Artículo no encontrado", { status: 404 });
  if (access === "licensed") {
    const { env } = context.get(cloudflareContext);
    const session = await getSession(env, request);
    const database = createDatabase(env.DB);
    if (!await canReadLearnGuideBody(database, session?.user.id ?? null, article.slug)) {
      return { preview: toPublicLearnGuideSummary(article), needsLogin: !session };
    }
  }

  const publicArticles = learnArticles.filter((candidate) => candidate.editorialDraft !== true);
  const relatedSlugs = article.relatedSlugs ?? publicArticles.filter((candidate) => candidate.slug !== article.slug).slice(0, 2).map((candidate) => candidate.slug);
  const relatedGuides = relatedSlugs.flatMap((slug) => {
    const candidate = publicArticles.find((item) => item.slug === slug && item.slug !== article.slug);
    return candidate ? [{ slug: candidate.slug, category: candidate.category, title: candidate.title }] : [];
  }).slice(0, 2);
  const readingText = [
    article.title, article.intro, ...article.enPocasPalabras,
    ...article.sections.flatMap((section) => [
      section.heading, ...section.paragraphs, ...(section.bullets ?? []),
      ...(section.blocks ?? []).map((block) => JSON.stringify(block)),
    ]),
  ].join(" ");
  const words = readingText.trim().split(/\s+/u).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(words / 200));
  return { article: getLearnEditorialIdentity(article), relatedGuides, readingMinutes };
}

export function headers({ errorHeaders, loaderHeaders }: Route.HeadersArgs) {
  return {
    "Cache-Control": errorHeaders?.get("Cache-Control") ?? loaderHeaders.get("Cache-Control") ?? "private, no-store",
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.article) return publicMeta("Artículo no encontrado", "El artículo que buscas no está disponible.", "/aprende", "noindex, nofollow");
  const { article } = loaderData;
  return [
    ...publicMeta(article.title, article.intro, `/aprende/${article.slug}`, article.editorialDraft ? "noindex, nofollow" : undefined).filter((tag) => !("property" in tag && tag.property === "og:type")),
    { property: "og:type", content: "article" },
    ...(!article.editorialDraft ? [{ property: "article:author", content: "Yoan Ortiz" }] : []),
    { property: "article:section", content: article.category },
    { property: "og:image:alt", content: article.imageAlt },
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
        <p><strong>Qué está pasando:</strong> {block.context}</p>
        <p><strong>Qué se complica:</strong> {block.problem}</p>
        <p><strong>Una forma sencilla de actuar:</strong> {block.approach}</p>
        <h4>Pasos</h4>
        <ol>{block.actions.map((action) => <li key={action}>{action}</li>)}</ol>
        <p><strong>Qué aprender de este ejemplo:</strong> {block.lesson}</p>
      </section>;
    case "callout":
      return <div className={`learn-block learn-block--callout learn-block--${block.tone}`} key={key}>
        <p className="learn-block__eyebrow">{block.tone === "tip" ? "Consejo" : "Precaución"}</p>
        <h3>{block.title}</h3>
        <p>{block.text}</p>
      </div>;
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
      return <div className="learn-block learn-block--summary" key={key}>
        <h3>Qué puedes hacer ahora</h3>
        <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>;
    default:
      return null;
  }
}

export default function LearnArticle({ loaderData }: Route.ComponentProps) {
  if (loaderData.preview) {
    const { preview, needsLogin } = loaderData;
    return (
      <PublicLayout>
        <main className="public-page learn-article-page">
          <article className="learn-article-preview">
            <p className="eyebrow">GUÍA PRÁCTICA · {preview.category}</p>
            <h1>{preview.title}</h1>
            <img className="learn-article-image" src={preview.image} alt={preview.imageAlt} width={900} height={360} />
            <p className="learn-article-intro">{preview.excerpt}</p>
            <h2>Contenido completo con una licencia Vecidya activa</h2>
            <p>Esta vista previa no incluye las secciones de la guía. El acceso se comprueba cuando vuelves a abrirla.</p>
            <div className="learn-article-cta">
              {needsLogin && <Link className="button button--secondary" to="/login">Iniciar sesión</Link>}
              <Link className="button button--primary" to="/licencias">Ver licencias Vecidya</Link>
            </div>
          </article>
        </main>
      </PublicLayout>
    );
  }
  const { article, relatedGuides, readingMinutes } = loaderData;

  return (
    <PublicLayout>
      <main className="public-page learn-article-page">
        <article>
          <div className="learn-article-feature">
            <header className="learn-article-header">
              <nav aria-label="Ruta de navegación" className="learn-article-breadcrumb">
                <Link to="/aprende">Aprende</Link>
                <span aria-hidden="true">/</span>
                <span>{article.category}</span>
              </nav>
              <p className="eyebrow">GUÍA PRÁCTICA · {article.category}</p>
              <h1>{article.title}</h1>
              <p className="learn-article-intro">{article.intro}</p>
              <p className="learn-article-byline">Lectura aproximada: {readingMinutes} {readingMinutes === 1 ? "minuto" : "minutos"}</p>
              {article.editorialDraft ? (
                <p className="learn-article-byline"><strong>Borrador educativo de Aprende Vecidya</strong> · contenido asistido por IA, pendiente de revisión editorial y autoría</p>
              ) : (
                <p className="learn-article-byline">Por <strong>Yoan Ortiz</strong> · Aprende Vecidya</p>
              )}
              <div className="learn-article-quick">
                <h2>En pocas palabras</h2>
                <ul>{article.enPocasPalabras.map((point) => <li key={point}>{point}</li>)}</ul>
              </div>
            </header>
            <img className="learn-article-image" src={article.image} alt={article.imageAlt} width={900} height={360} />
          </div>
          <div className="learn-article-layout">
            <div className="learn-article-rail">
              <nav className="learn-article-toc" aria-label="Índice del artículo">
                <strong>En esta guía</strong>
                <ol>{article.sections.map((section) => <li key={section.sectionId}><a href={`#${section.sectionId}`}>{section.heading}</a></li>)}</ol>
              </nav>
              <Link className="learn-article-rail-link" to="/aprende">Explorar todas las guías <span aria-hidden="true">→</span></Link>
            </div>
            <div id="contenido" className="learn-article-body">
              {article.sections.map((section) => (
                <section id={section.sectionId} key={section.sectionId}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
                  {section.blocks?.map((block, blockIndex) => renderLearnBlock(block, `${section.heading}-${blockIndex}`))}
                </section>
              ))}
              <p><a href="#contenido">Volver al inicio del contenido ↑</a></p>
              <section className="learn-article-review" aria-labelledby="learn-review-title">
                <h2 id="learn-review-title">Comprueba lo aprendido</h2>
                <p>Antes de continuar, responde con tus propias palabras y abre cada pista para comprobarlo.</p>
                <ol>
                  {article.enPocasPalabras.map((point, index) => (
                    <li key={point}>
                      <details>
                        <summary>{index === 0 ? "¿Cuál es la idea principal?" : index === 1 ? "¿Qué puedes aplicar?" : "¿Qué precaución debes recordar?"}</summary>
                        <p>{point}</p>
                      </details>
                    </li>
                  ))}
                </ol>
              </section>
              <div className="learn-article-cta">
                <p className="eyebrow">RELACIONADO CON VECIDYA</p>
                <h2>{article.cta.copy}</h2>
                <Link className="button button--primary" to={article.cta.to}>{article.cta.label}</Link>
              </div>
            </div>
          </div>
        </article>
        <section className="learn-related" aria-labelledby="learn-related-title">
          <p className="eyebrow">SIGUE APRENDIENDO</p>
          <h2 id="learn-related-title">Otras guías de Aprende Vecidya</h2>
          <div className="learn-related-grid">{relatedGuides.map((item) => <Link className="learn-related-card" key={item.slug} to={`/aprende/${item.slug}`}><span>{item.category}</span><strong>{item.title}</strong><small>Leer guía →</small></Link>)}</div>
        </section>
      </main>
    </PublicLayout>
  );
}
