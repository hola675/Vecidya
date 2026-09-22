import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { Route } from "./+types/knowledge";

const topics = [
  { eyebrow: "PRIMEROS PASOS", title: "Presencia digital", copy: "Qué necesita una persona para entender qué haces, dónde estás y cómo contactarte." },
  { eyebrow: "ORGANIZAR", title: "Orden del negocio", copy: "Cómo reunir información, canales y prioridades antes de sumar herramientas." },
  { eyebrow: "ENCONTRAR", title: "Visibilidad online", copy: "Qué ayuda a que las personas descubran tu negocio sin prometer posiciones automáticas." },
  { eyebrow: "ELEGIR", title: "Tecnología útil", copy: "Cuándo una web, un perfil o una herramienta aporta valor y cuándo todavía no hace falta." },
];

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
            <p>Recursos para tomar mejores decisiones digitales, explicados sin tecnicismos innecesarios ni promesas vacías.</p>
            <div className="public-actions">
              <Link className="button button--primary" to="/diagnostico">Hacer diagnóstico</Link>
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
            {topics.map((topic, index) => (
              <article className="learn-topic-card" key={topic.title}>
                <span className="learn-topic-card__number">{String(index + 1).padStart(2, "0")}</span>
                <p className="eyebrow">{topic.eyebrow}</p>
                <h3>{topic.title}</h3>
                <p>{topic.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="learn-resources" aria-labelledby="learn-resources-title">
          <div className="learn-section-heading">
            <p className="eyebrow">RECURSOS</p>
            <h2 id="learn-resources-title">Estamos preparando las primeras guías.</h2>
          </div>
          <div className="learn-resources-empty">
            <span className="learn-resources-empty__mark" aria-hidden="true">+</span>
            <div>
              <h3>Contenido útil, no relleno.</h3>
              <p>Publicaremos recursos desde preguntas reales de negocios, proyectos y profesionales. Cada guía ayudará a tomar una decisión concreta y tendrá su propio contexto.</p>
            </div>
            <Link className="text-link" to="/diagnostico">Ubicar mi punto de partida <span aria-hidden="true">→</span></Link>
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
            <Link className="button button--primary" to="/diagnostico">Hacer diagnóstico</Link>
            <Link className="button button--secondary" to="/contacto">Contactar</Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
