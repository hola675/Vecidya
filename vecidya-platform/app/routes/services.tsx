import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { PUBLIC_ACTION_LABELS } from "../content/public-copy";
import { SERVICE_OFFERS } from "../content/commercial-detail";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { Route } from "./+types/services";

const serviceIcons = {
  estructuracion: publicAssets.catalog.services.organizacion,
  formalizacion: publicAssets.icons.serviceFormalization,
  "presencia-digital": publicAssets.catalog.services.presenciaDigital,
  automatizacion: publicAssets.catalog.services.automatizacion,
  "inteligencia-artificial": publicAssets.catalog.services.inteligenciaArtificial,
  visibilidad: publicAssets.catalog.services.visibilidad,
  "desarrollo-empresarial": publicAssets.catalog.services.organizacion,
} as const;

const serviceEyebrows = ["ORDENAR", "CONVERTIR", "ENCONTRAR", "CAPTAR", "CONECTAR", "ASISTIR", "DESARROLLAR"] as const;
const services = SERVICE_OFFERS.map((offer, index) => ({
  id: offer.id,
  icon: serviceIcons[offer.id as keyof typeof serviceIcons],
  eyebrow: serviceEyebrows[index],
  number: String(index + 1).padStart(2, "0"),
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
          <div>
            <p className="eyebrow">SERVICIOS PROFESIONALES</p>
            <h1 id="services-title">Trabajo especializado para tu siguiente paso.</h1>
            <p>Elegimos el alcance después de entender tu necesidad.</p>
            <div className="public-actions">
              <Link className="button button--primary" to="/diagnostico">{PUBLIC_ACTION_LABELS.diagnostic}</Link>
              <Link className="button button--secondary" to="/contacto">{PUBLIC_ACTION_LABELS.contact}</Link>
            </div>
          </div>
          <div className="services-experience-hero__note">
            <span className="services-experience-hero__mark" aria-hidden="true">→</span>
            <p className="eyebrow">DE LA IDEA AL SISTEMA</p>
            <strong>Primero entendemos lo que ya existe. Después decidimos qué construir.</strong>
          </div>
        </section>

        <section className="services-process" aria-labelledby="services-process-title">
          <div className="services-section-heading">
            <p className="eyebrow">UN RECORRIDO CLARO</p>
            <h2 id="services-process-title">De la necesidad al siguiente paso.</h2>
            <p>Explora lo que quieres resolver, revisa el alcance y conversa sobre la opción que tenga sentido.</p>
          </div>
          <ol className="services-process-list">
            <li>
              <strong>Ubica tu punto de partida</strong>
              <span>El Diagnóstico te ayuda a entender qué conviene atender primero.</span>
              <Link className="services-process-list__link" to="/diagnostico">Hacer el Diagnóstico <span aria-hidden="true">→</span></Link>
            </li>
            <li>
              <strong>Explora las familias</strong>
              <span>Compara las siete áreas de trabajo y abre los detalles de las que se relacionen con tu necesidad.</span>
              <a className="services-process-list__link" href="#services-needs-title">Ver las siete familias <span aria-hidden="true">↓</span></a>
            </li>
            <li>
              <strong>Conversa sobre el alcance</strong>
              <span>Los servicios se cotizan según el trabajo acordado; no necesitas elegir una licencia por defecto.</span>
              <Link className="services-process-list__link" to="/contacto">Consultar un servicio <span aria-hidden="true">→</span></Link>
            </li>
          </ol>
        </section>

        <nav className="services-needs" aria-labelledby="services-needs-title">
          <div className="services-section-heading services-needs-heading">
            <p className="eyebrow">ENCUENTRA TU PUNTO DE PARTIDA</p>
            <h2 id="services-needs-title">¿Qué necesitas resolver?</h2>
          </div>
          <div className="services-needs-grid">
            {services.map((service) => (
              <a className="services-need" href={`#${service.id}`} key={service.id}>
                <span>{service.number} · {service.eyebrow}</span>
                <strong>{service.title}</strong>
                <span className="services-need__action">Ver enfoque <span aria-hidden="true">↓</span></span>
              </a>
            ))}
          </div>
        </nav>

        <section className="services-core" aria-labelledby="services-core-title">
          <div className="services-section-heading">
            <p className="eyebrow">SERVICIOS PROFESIONALES</p>
            <h2 id="services-core-title">Un alcance claro para cada necesidad.</h2>
            <p>Son trabajos profesionales con entregables acordados; no todos requieren licencia. Las funciones estándar incluidas en Barrio o Ciudad no se cobran nuevamente como servicio.</p>
          </div>
          <div className="services-core-grid services-core-grid--bento">
            {services.map((service) => (
              <article className="services-core-card" id={service.id} key={service.id}>
                <div className="services-core-card__top">
                  <img alt="" aria-hidden="true" className="catalog-card__image catalog-card__image--feature" height={112} src={service.icon} width={128} />
                  <div className="services-core-card__identity">
                    <p className="eyebrow"><span>{service.number}</span> · {service.eyebrow}</p>
                    <h3>{service.title}</h3>
                  </div>
                </div>
                <p className="services-core-card__promise">{service.promise}</p>
                <div className="services-core-card__problem"><span>Para quién</span><p>{service.problem}</p></div>
                <div className="services-core-card__result"><span>Qué abordamos</span><p>{service.result}</p></div>
                <div className="services-core-card__support">
                  <span>Alcance habitual</span>
                  <ul>{service.support.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div className="commercial-catalog__actions">
                  <Link className="button button--secondary" to={service.detailPath}>Ver alcance <span aria-hidden="true">→</span></Link>
                  <Link className="text-link services-core-card__cta" to={`/contacto?interes=servicio-${service.id}`}>Consultar servicio <span aria-hidden="true">→</span></Link>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>
    </PublicLayout>
  );
}
