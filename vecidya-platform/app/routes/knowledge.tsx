import { Link } from "react-router";

import { PublicLayout, publicMeta } from "../components/public-layout";
import { learnArticles, learnCategories, learnPathways } from "../content/learn";
import { getPublicLearnPathways } from "../content/learn-publication";
import { getPublicLearnArticles } from "../content/learn-publication";
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
  return "/aprende" + (query ? "?" + query : "") + "#guias";
}

export function loader({ request }: Route.LoaderArgs) {
  const params = new URL(request.url).searchParams;
  const search = (params.get("q") ?? "").trim().slice(0, 100);
  const requestedCategory = params.get("tema");
  const category = learnCategories.find((topic) => topic.name === requestedCategory)?.name ?? null;
  const needle = searchable(search);
  const publicArticles = getPublicLearnArticles(learnArticles);
  const articles = publicArticles
    .filter((article) => {
      if (category && article.category !== category) return false;
      if (!needle) return true;
      const summary = [
        article.title,
        article.intro,
        article.excerpt,
        article.category,
        ...article.enPocasPalabras,
        ...article.sections.flatMap((section) => [
          section.heading,
          ...section.paragraphs,
          ...(section.bullets ?? []),
          ...((section.blocks ?? []).flatMap((block) =>
            Object.values(block).flatMap((value) =>
              typeof value === "string"
                ? [value]
                : Array.isArray(value)
                  ? value.map((item) => typeof item === "string" ? item : JSON.stringify(item))
                  : [],
            ),
          )),
        ]),
      ].join(" ");
      return searchable(summary).includes(needle);
    })
    .map(({ slug, title, excerpt, image, category: articleCategory, editorialDraft }) => ({
      slug, title, excerpt, image, category: articleCategory, editorialDraft: editorialDraft ?? false,
    }));
  const topics = learnCategories.map((topic) => ({
    ...topic,
    count: publicArticles.filter((article) => article.category === topic.name).length,
  }));
  const pathways = getPublicLearnPathways(learnPathways, publicArticles).map((path) => ({
    title: path.title,
    description: path.description,
    guides: path.slugs.map((slug) => {
      const guide = publicArticles.find((article) => article.slug === slug);
      if (!guide) throw new Error("Guía pública del itinerario no encontrada: " + slug);
      return { slug: guide.slug, title: guide.title, editorialDraft: false };
    }),
  }));
  return { articles, topics, pathways, search, category, total: publicArticles.length };
}

export function meta({ location }: Route.MetaArgs) {
  return publicMeta(
    "Aprende",
    "Guías claras para entender la tecnología, elegir prioridades y tomar mejores decisiones en tu vida digital y en tu negocio.",
    "/aprende",
    publicListingRobots(location.search),
  );
}

export default function Knowledge({ loaderData }: Route.ComponentProps) {
  const { articles, topics, pathways, search, category, total } = loaderData;

  return (
    <PublicLayout>
      <main className="public-page learn-experience-page">
        <section className="learn-atlas" aria-labelledby="learn-title">
          <div className="learn-atlas__masthead">
            <div className="learn-atlas__lead">
              <p className="learn-atlas__label">APRENDE</p>
              <h1 id="learn-title">Aprende a entender y usar la tecnología con criterio.</h1>
              <p>Para tu vida digital y para tu negocio: comprende primero, prioriza lo importante y decide qué herramienta realmente necesitas.</p>
            </div>
          </div>
          <form className="learn-discovery__form learn-atlas__form" method="get" action="/aprende#guias" role="search">
            <label htmlFor="learn-guide-search">Buscar en las guías</label>
            <div className="learn-discovery__search">
              <input id="learn-guide-search" type="search" name="q" maxLength={100} defaultValue={search} placeholder="Ej. contraseñas, IA, consultas o sitio web" />
              {category && <input type="hidden" name="tema" value={category} />}
              <button className="button button--primary" type="submit">Buscar</button>
            </div>
          </form>
          <div className="learn-atlas__map">
            <p className="learn-atlas__caption">Decisiones claras</p>
            <img
              src="/assets/learn/learn-atlas-routes.svg"
              alt="Ilustración esquemática de rutas que conectan preguntas, temas y guías."
              width={720}
              height={430}
              decoding="async"
            />
            <dl className="learn-atlas__facts" aria-label="Contenido disponible en Aprende">
              <div><dt>Guías</dt><dd>{total}</dd></div>
              <div><dt>Itinerarios</dt><dd>{pathways.length}</dd></div>
              <div><dt>Temas</dt><dd>{topics.length}</dd></div>
            </dl>
          </div>
          <nav className="learn-atlas__jump" aria-label="Explorar Aprende">
            <a href="#itinerarios">Seguir un itinerario</a>
            <a href="#temas">Explorar temas</a>
          </nav>
        </section>

        <section className="learn-why" aria-labelledby="learn-method-title">
          <div>
            <p className="learn-section-kicker">CÓMO APRENDEMOS</p>
            <h2 id="learn-method-title">Comprende. Prioriza. Decide.</h2>
          </div>
          <ul>
            <li><strong>Comprende:</strong> empieza por el problema y entiende lo suficiente para no depender de palabras complicadas.</li>
            <li><strong>Prioriza:</strong> el que mucho abarca, poco aprieta. Elige pocas mejoras que puedas terminar y mantener.</li>
            <li><strong>Decide:</strong> domina la tecnología; no dejes que ella decida por ti. Usa cada herramienta con un propósito y conserva el control.</li>
          </ul>
        </section>

        <section className="learn-resources" id="guias" aria-labelledby="learn-resources-title">
          <p className="learn-section-kicker">GUÍAS DE APRENDE</p>
          <h2 className="learn-resources__title" id="learn-resources-title">Empieza por una pregunta concreta.</h2>
          <div className="learn-discovery">
            <nav className="learn-discovery__topics" aria-label="Filtrar guías por tema">
              <Link className="learn-discovery__chip" to={learnHref(null, search)} aria-current={category === null ? "page" : undefined}>Todas</Link>
              {topics.map((topic) => (
                <Link className="learn-discovery__chip" to={learnHref(topic.name, search)} aria-current={category === topic.name ? "page" : undefined} key={topic.name}>
                  {topic.name}
                </Link>
              ))}
            </nav>
            <p className="learn-discovery__summary" role="status" aria-live="polite">
              {articles.length === 1 ? "1 guía encontrada" : articles.length + " guías encontradas"} de {total}
              {category ? " · " + category : ""}{search ? " · Búsqueda: «" + search + "»" : ""}
            </p>
            <div className="learn-discovery__support">
              <p className="learn-discovery__note">Explora las guías por tema o busca una duda específica. No necesitas registrarte.</p>
              <p className="learn-discovery__note">Encuentra respuestas sencillas, ejemplos cotidianos y pasos que puedes aplicar sin aprender palabras complicadas.</p>
              {articles.some((article) => article.editorialDraft) && (
                <p className="learn-editorial-note"><strong>Estado editorial</strong><span>Las guías que siguen en revisión se identifican de forma visible.</span></p>
              )}
            </div>
          </div>
          {articles.length === 0 ? (
            <div className="learn-discovery__empty">
              <h3>No encontramos guías con esos criterios.</h3>
              <p>Prueba otra palabra o consulta todas las guías disponibles.</p>
              <Link className="text-link" to="/aprende#guias">Ver todas las guías</Link>
            </div>
          ) : (
            <ol className="learn-guide-list" aria-label="Guías disponibles">
              {articles.map((article) => (
                <li key={article.slug}>
                  <article className="learn-guide">
                    <img src={article.image} alt="" width={144} height={108} loading="lazy" />
                    <div className="learn-guide__copy">
                      <p className="learn-guide__topic">
                        {article.category}
                        {article.editorialDraft && <span> · En revisión editorial</span>}
                      </p>
                      <h3><Link to={"/aprende/" + article.slug}>{article.title}</Link></h3>
                      <p>{article.excerpt}</p>
                      <Link className="learn-guide__action" aria-label={"Leer guía: " + article.title} to={"/aprende/" + article.slug}>Leer guía</Link>
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="learn-pathways" id="itinerarios" aria-labelledby="learn-pathways-title">
          <div className="learn-section-heading">
            <p className="learn-section-kicker">APRENDE A TU RITMO</p>
            <h2 id="learn-pathways-title">Elige por dónde empezar.</h2>
            <p>No necesitas leerlo todo. Sigue un camino corto según lo que hoy te cuesta resolver.</p>
          </div>
          <ol className="learn-path-list">
            {pathways.map((path) => (
              <li key={path.title}>
                <details className="learn-path">
                  <summary>
                    <span className="learn-path__title">{path.title}</span>
                    <span className="learn-path__description">{path.description}</span>
                    <span className="learn-path__count">{path.guides.length} guías</span>
                  </summary>
                  <ol className="learn-path__guides">
                    {path.guides.map((guide) => (
                      <li key={guide.slug}>
                        <Link to={"/aprende/" + guide.slug}>{guide.title}</Link>
                        {guide.editorialDraft && <span>En revisión editorial</span>}
                      </li>
                    ))}
                  </ol>
                </details>
              </li>
            ))}
          </ol>
        </section>

        <section className="learn-topics" id="temas" aria-labelledby="learn-topics-title">
          <div className="learn-section-heading">
            <p className="learn-section-kicker">TEMAS PRINCIPALES</p>
            <h2 id="learn-topics-title">Empieza por la pregunta que tienes hoy.</h2>
          </div>
          <ul className="learn-topic-list">
            {topics.map((topic) => (
              <li key={topic.name}>
                <Link to={learnHref(topic.name, search)}>
                  <span className="learn-topic-list__name">{topic.name}</span>
                  <span className="learn-topic-list__description">{topic.description}</span>
                  <span className="learn-topic-list__count">Ver {topic.count} {topic.count === 1 ? "guía" : "guías"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="learn-why" aria-labelledby="learn-why-title">
          <div>
            <p className="learn-section-kicker">POR QUÉ APRENDER ESTO</p>
            <h2 id="learn-why-title">Entender primero ayuda a elegir mejor.</h2>
          </div>
          <ul>
            <li>Evitas sumar herramientas, cuentas y canales que no resuelven un problema real.</li>
            <li>Puedes reconocer qué información necesitas comprender antes de actuar.</li>
            <li>Distingues qué conviene hacer ahora, qué puede esperar y qué debes supervisar.</li>
          </ul>
        </section>

        <section className="learn-final-cta" aria-labelledby="learn-final-title">
          <p className="learn-section-kicker">Siguiente paso</p>
          <h2 id="learn-final-title">¿No sabes qué necesitas todavía?</h2>
          <p>El diagnóstico te ayuda a convertir una duda general en prioridades iniciales. Si ya tienes una pregunta concreta, también puedes escribirnos.</p>
          <div className="public-actions">
            <Link className="button button--primary" to="/diagnostico">{PUBLIC_ACTION_LABELS.diagnostic}</Link>
            <Link className="button button--secondary" to="/contacto">Hacer una pregunta</Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
