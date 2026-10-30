import { Link } from "react-router";

import { PUBLIC_ACTION_LABELS } from "../content/public-copy";
import { SERVICE_OFFERS } from "../content/commercial-detail";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { Route } from "./+types/services";

const services = SERVICE_OFFERS.map((offer) => ({
  id: offer.id,
  title: offer.title,
  promise: offer.promise,
  problem: offer.bestFor,
  result: offer.summary,
  support: offer.includes,
  detailPath: offer.detailPath,
}));

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Servicios",
    "Servicios digitales, automatización e inteligencia artificial para negocios.",
    "/servicios",
  );
}

export default function Services() {
  return (
    <PublicLayout>
      <main className="public-page services-experience-page">
        <section className="services-experience-hero" aria-labelledby="services-title">
          <div className="services-experience-hero__copy">
            <h1 id="services-title">Trabajo especializado para tu siguiente paso.</h1>
            <p>Elegimos el alcance después de entender tu necesidad.</p>
            <div className="public-actions">
              <Link className="button button--primary" to="/diagnostico">{PUBLIC_ACTION_LABELS.diagnostic}</Link>
              <Link className="button button--secondary" to="/contacto">{PUBLIC_ACTION_LABELS.contact}</Link>
            </div>
          </div>
          <div className="services-experience-hero__note">
            <strong>Primero entendemos lo que ya existe. Después decidimos qué construir.</strong>
          </div>
        </section>

        <section className="services-process" aria-labelledby="services-process-title">
          <div className="services-section-heading">
            <h2 id="services-process-title">De la necesidad al siguiente paso.</h2>
            <p>Explora lo que quieres resolver, revisa el alcance y conversa sobre la opción que tenga sentido.</p>
          </div>
          <ol className="services-process-list">
            <li>
              <h3>Ubica tu punto de partida</h3>
              <span>El Diagnóstico te ayuda a entender qué conviene atender primero.</span>
              <Link className="services-process-list__link" to="/diagnostico">Hacer el Diagnóstico <span aria-hidden="true">→</span></Link>
            </li>
            <li>
              <h3>Explora las familias</h3>
              <span>Compara las siete áreas de trabajo y abre los detalles de las que se relacionen con tu necesidad.</span>
              <a className="services-process-list__link" href="#services-needs-title">Ver las siete familias <span aria-hidden="true">↓</span></a>
            </li>
            <li>
              <h3>Conversa sobre el alcance</h3>
              <span>Los servicios se cotizan según el trabajo acordado; no necesitas elegir una licencia por defecto.</span>
              <Link className="services-process-list__link" to="/contacto">Consultar un servicio <span aria-hidden="true">→</span></Link>
            </li>
          </ol>
        </section>

        <nav className="services-needs" aria-labelledby="services-needs-title">
          <div className="services-section-heading services-needs-heading">
            <h2 id="services-needs-title">¿Qué necesitas resolver?</h2>
          </div>
          <div className="services-needs-grid">
            {services.map((service) => (
              <a className="services-need" href={`#${service.id}`} key={service.id}>
                <strong>{service.title}</strong>
                <span className="services-need__action">Ver enfoque <span aria-hidden="true">↓</span></span>
              </a>
            ))}
          </div>
        </nav>

        <section className="services-core" aria-labelledby="services-core-title">
          <div className="services-section-heading">
            <h2 id="services-core-title">Un alcance claro para cada necesidad.</h2>
            <p>Son trabajos profesionales con entregables acordados; no todos requieren licencia. Las funciones estándar incluidas en Barrio o Ciudad no se cobran nuevamente como servicio.</p>
          </div>
          <div className="services-offers">
            {services.map((service) => (
              <article className="services-offer" id={service.id} key={service.id}>
                <div className="services-offer__intro">
                  <h3>{service.title}</h3>
                  <p className="services-offer__promise">{service.promise}</p>
                  <div className="services-offer__actions commercial-catalog__actions">
                    <Link className="button button--secondary" to={service.detailPath}>Ver alcance <span aria-hidden="true">→</span></Link>
                    <Link className="text-link services-offer__cta" to={`/contacto?interes=servicio-${service.id}`}>Consultar servicio <span aria-hidden="true">→</span></Link>
                  </div>
                </div>
                <div className="services-offer__details">
                  <div><h4>Para quién</h4><p>{service.problem}</p></div>
                  <div><h4>Qué abordamos</h4><p>{service.result}</p></div>
                  <div className="services-offer__scope">
                    <h4>Alcance habitual</h4>
                    <ul>{service.support.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>
    </PublicLayout>
  );
}
