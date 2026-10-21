import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { learnArticles, learnCategories, learnPathways } from "../content/learn";
import { PUBLIC_ACTION_LABELS } from "../content/public-copy";
import { publicListingRobots } from "../lib/public-seo";

import type { Route } from "./+types/knowledge";


function searchable(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
}

function learnHref(category: string | null, search: string) {
  const params = new URLSearchParams();
  if (category) params.set("tema", category);
  if (search) params.set("q", search);
  const query = params.toString();
  return `/aprende${query ? `?${query}` : ""}#guias`;
}

export function loader({ request }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const search = (params.get("q") ?? "").trim().slice(0, 100);
  const requestedCategory = params.get("tema");
  const category = learnCategories.find((topic) => topic.name === requestedCategory)?.name ?? null;
  const needle = searchable(search);
  const articles = learnArticles
    .filter((article) => {
      if (category && article.category !== category) return false;
      if (!needle) return true;
      const summary = [article.title, article.intro, article.excerpt, article.category, ...article.sections.map((section) => section.heading)].join(" ");
      return searchable(summary).includes(needle);
    })
    .map(({ slug, title, excerpt, image, category: articleCategory, editorialDraft }) => ({
      slug, title, excerpt, image, category: articleCategory, editorialDraft: editorialDraft ?? false,
    }));
  const topics = learnCategories.map((topic, index) => ({
    ...topic,
    number: String(index + 1).padStart(2, "0"),
    count: learnArticles.filter((article) => article.category === topic.name).length,
  }));
  const pathways = learnPathways.map((path) => ({
    title: path.title, description: path.description,
    guides: path.slugs.map((slug) => {
      const guide = learnArticles.find((article) => article.slug === slug);
      if (!guide) throw new Error(`Guía del itinerario no encontrada: ${slug}`);
      return { slug: guide.slug, title: guide.title, editorialDraft: guide.editorialDraft ?? false };
    }),
  }));
  return { articles, topics, pathways, search, category, total: learnArticles.length };
}

export function meta({ location }: Route.MetaArgs) {
  return publicMeta(
    "Aprende",
    "Guías para usar tecnología, organizar equipos y mejorar negocios y empresas de cualquier tamaño.",
    "/aprende",
    publicListingRobots(location.search),
  );
}

export default function Knowledge({ loaderData }: Route.ComponentProps) {
  const { articles, topics, pathways, search, category, total } = loaderData;

  return (
    <PublicLayout>
      <main className="public-page learn-experience-page">
        <section className="learn-experience-hero" aria-labelledby="learn-title">
          <div>
            <p className="eyebrow">APRENDE</p>
            <h1 id="learn-title">Aprende a usar la tecnología para mejorar tu negocio o empresa.</h1>
            <p>Desde un negocio pequeño hasta empresas con equipos, sedes o varias marcas. Encuentra respuestas sencillas, ejemplos cotidianos y pasos que puedes aplicar sin aprender palabras complicadas. Los materiales nuevos siguen identificados como borradores hasta su revisión editorial.</p>
            <div className="public-actions">
              <Link className="button button--primary" to="/diagnostico">{PUBLIC_ACTION_LABELS.diagnostic}</Link>
              <Link className="button button--secondary" to="/contacto">Hacer una pregunta</Link>
            </div>
          </div>
          <div className="learn-experience-hero__visual" aria-hidden="true">
            <img alt="" decoding="async" height={1254} src={publicAssets.illustrations.taskSchedulePanel} width={1254} />
            <span>Decisiones claras</span>
          </div>
        </section>

        <section className="learn-pathways" aria-labelledby="learn-pathways-title">
          <div className="learn-section-heading">
            <p className="eyebrow">APRENDE A TU RITMO</p>
            <h2 id="learn-pathways-title">Elige por dónde empezar.</h2>
            <p>No necesitas leerlo todo. Sigue un camino corto según lo que hoy te cuesta resolver.</p>
          </div>
          <div className="learn-pathways-grid">
            {pathways.map((path, index) => (
              <article className="learn-pathway-card" key={path.title}>
                <p className="learn-pathway-card__step">CAMINO {String(index + 1).padStart(2, "0")}</p>
                <h3>{path.title}</h3>
                <p>{path.description}</p>
                <ol>{path.guides.map((guide) => (
                  <li key={guide.slug}><Link to={`/aprende/${guide.slug}`}>{guide.title}</Link>{guide.editorialDraft && <small>En revisión</small>}</li>
                ))}</ol>
              </article>
            ))}
          </div>
        </section>

        <section className="learn-topics" aria-labelledby="learn-topics-title">
          <div className="learn-section-heading">
            <p className="eyebrow">TEMAS PRINCIPALES</p>
            <h2 id="learn-topics-title">Empieza por la pregunta que tienes hoy.</h2>
          </div>
          <div className="learn-topics-grid">
            {topics.map((topic) => (
              <article className="learn-topic-card" key={topic.name}>
                <span className="learn-topic-card__number">{topic.number}</span>
                <h3>{topic.name}</h3>
                <p>{topic.description}</p>
                <Link className="text-link learn-topic-card__link" to={learnHref(topic.name, search)} aria-label={`Ver ${topic.count} guías de ${topic.name}`}>
                  Ver {topic.count === 1 ? "1 guía" : `${topic.count} guías`} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="learn-resources" id="guias" aria-labelledby="learn-resources-title">
          <div className="learn-section-heading">
            <p className="eyebrow">GUÍAS DE APRENDE</p>
            <h2 id="learn-resources-title">Empieza por una pregunta concreta.</h2>
            <p>Explora las guías por tema o busca una duda específica. No necesitas registrarte.</p>
          </div>
          <div className="learn-discovery">
            <form className="learn-discovery__form" method="get" action="/aprende" role="search">
              <label htmlFor="learn-guide-search">Buscar en las guías</label>
              <div className="learn-discovery__search">
                <input id="learn-guide-search" type="search" name="q" maxLength={100} defaultValue={search} placeholder="Ej. SEO, consultas, IA o hosting" />
                {category && <input type="hidden" name="tema" value={category} />}
                <button className="button button--primary" type="submit">Buscar</button>
              </div>
            </form>
            <nav className="learn-discovery__topics" aria-label="Filtrar guías por tema">
              <Link className="learn-discovery__chip" to={learnHref(null, search)} aria-current={category === null ? "page" : undefined}>Todas</Link>
              {topics.map((topic) => (
                <Link className="learn-discovery__chip" to={learnHref(topic.name, search)} aria-current={category === topic.name ? "page" : undefined} key={topic.name}>
                  {topic.name}
                </Link>
              ))}
            </nav>
            <p className="learn-discovery__summary" role="status">
              {articles.length === 1 ? "1 guía encontrada" : `${articles.length} guías encontradas`} de {total}
              {category ? ` · ${category}` : ""}{search ? ` · Búsqueda: «${search}»` : ""}
            </p>
          </div>
          {articles.length === 0 ? (
            <div className="learn-discovery__empty">
              <h3>No encontramos guías con esos criterios.</h3>
              <p>Prueba otra palabra o consulta todas las guías disponibles.</p>
              <Link className="text-link" to="/aprende#guias">Ver todas las guías <span aria-hidden="true">→</span></Link>
            </div>
          ) : (
            <div className="learn-articles-grid">
              {articles.map((article) => (
                <article className="learn-article-card" key={article.slug}>
                  <img src={article.image} alt="" width={900} height={360} loading="lazy" />
                  <div>
                    <p className="eyebrow">{article.category}{article.editorialDraft ? " · En revisión" : ""}</p>
                    <h3><Link to={`/aprende/${article.slug}`}>{article.title}</Link></h3>
                    <p>{article.excerpt}</p>
                    <Link className="text-link" to={`/aprende/${article.slug}`}>Leer guía <span aria-hidden="true">→</span></Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="learn-why" aria-labelledby="learn-why-title">
          <div>
            <p className="eyebrow">POR QUÉ APRENDER ESTO</p>
            <h2 id="learn-why-title">Entender primero ayuda a construir mejor.</h2>
          </div>
          <ul>
            <li>Evitas sumar herramientas que no resuelven tu problema.</li>
            <li>Puedes explicar mejor qué haces y para quién.</li>
            <li>Identificas qué conviene ordenar antes de crecer.</li>
          </ul>
        </section>

        <section className="learn-final-cta" aria-labelledby="learn-final-title">
          <p className="eyebrow">SIGUIENTE PASO</p>
          <h2 id="learn-final-title">¿No sabes qué necesitas todavía?</h2>
          <p>El diagnóstico te ayuda a convertir una duda general en prioridades iniciales. Si ya tienes una pregunta concreta, también puedes escribirnos.</p>
          <div className="public-actions">
            <Link className="button button--primary" to="/diagnostico">{PUBLIC_ACTION_LABELS.diagnostic}</Link>
            <Link className="button button--secondary" to="/contacto">{PUBLIC_ACTION_LABELS.contact}</Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
