import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { learnArticles, learnCategories } from "../content/learn";
import { PUBLIC_ACTION_LABELS } from "../content/public-copy";

import type { Route } from "./+types/knowledge";

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Aprende",
    "Ideas claras para entender y mejorar la presencia digital de tu negocio.",
    "/aprende",
  );
}

export default function Knowledge() {
  return (
    <PublicLayout>
      <main className="public-page learn-experience-page">
        <section className="learn-experience-hero" aria-labelledby="learn-title">
          <div>
            <p className="eyebrow">APRENDE</p>
            <h1 id="learn-title">Aprende a organizar, mejorar y entender la presencia digital de tu negocio.</h1>
            <p>Guías escritas por Yoan Ortiz para entender problemas digitales reales y elegir el siguiente paso sin tecnicismos innecesarios ni promesas vacías.</p>
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

        <section className="learn-topics" aria-labelledby="learn-topics-title">
          <div className="learn-section-heading">
            <p className="eyebrow">TEMAS PRINCIPALES</p>
            <h2 id="learn-topics-title">Empieza por la pregunta que tienes hoy.</h2>
          </div>
          <div className="learn-topics-grid">
            {learnCategories.map((topic, index) => (
              <article className="learn-topic-card" key={topic.name}>
                <span className="learn-topic-card__number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{topic.name}</h3>
                <p>{topic.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="learn-resources" aria-labelledby="learn-resources-title">
          <div className="learn-section-heading">
            <p className="eyebrow">GUÍAS DE APRENDE</p>
            <h2 id="learn-resources-title">Empieza por una pregunta concreta.</h2>
          </div>
          <div className="learn-articles-grid">
            {learnArticles.map((article) => (
              <article className="learn-article-card" key={article.slug}>
                <img src={article.image} alt="" width={900} height={360} loading="lazy" />
                <div>
                  <p className="eyebrow">{article.category}</p>
                  <h3><Link to={`/aprende/${article.slug}`}>{article.title}</Link></h3>
                  <p>{article.excerpt}</p>
                  <Link className="text-link" to={`/aprende/${article.slug}`}>Leer guía <span aria-hidden="true">→</span></Link>
                </div>
              </article>
            ))}
          </div>
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
