import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { CTASection } from "../components/public-v2";
import { DIAGNOSTIC_CTA_COPY, PUBLIC_ACTION_LABELS } from "../content/public-copy";
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
  title: offer.title,
  problem: offer.bestFor,
  result: offer.summary,
  benefit: offer.benefits[0],
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
          <aside className="services-experience-hero__note" aria-label="Cómo se relacionan las soluciones">
            <span className="services-experience-hero__mark" aria-hidden="true">→</span>
            <p className="eyebrow">DE LA IDEA AL SISTEMA</p>
            <strong>Primero entendemos lo que ya existe. Después decidimos qué construir.</strong>
          </aside>
        </section>

        <section className="services-core" aria-labelledby="services-core-title">
          <div className="services-section-heading">
            <p className="eyebrow">SIETE FAMILIAS</p>
            <h2 id="services-core-title">Del problema concreto a un siguiente paso claro.</h2>
            <p>Son trabajos profesionales con alcance y entrega acordados; no todos requieren licencia. Las funciones estándar incluidas en Barrio o Ciudad no se cobran nuevamente como servicio.</p>
          </div>
          <div className="services-core-grid">
            {services.map((service) => (
              <article className="services-core-card" id={service.id} key={service.id}>
                <div className="services-core-card__top">
                  <img alt="" aria-hidden="true" className="catalog-card__image catalog-card__image--feature" height={112} src={service.icon} width={128} />
                  <p className="eyebrow">{service.eyebrow}</p>
                </div>
                <h3>{service.title}</h3>
                <div className="services-core-card__problem"><span>Tu situación</span><p>{service.problem}</p></div>
                <div className="services-core-card__result"><span>Qué podemos aportar</span><p>{service.result}</p></div>
                <p className="services-core-card__benefit"><strong>Lo que ganas:</strong> {service.benefit}</p>
                <p className="services-core-card__support"><span>Incluye según alcance</span> {service.support.join(" · ")}</p>
                <div className="commercial-catalog__actions">
                  <Link className="text-link" to={service.detailPath}>Ver detalles de {service.title} <span aria-hidden="true">→</span></Link>
                  <Link className="text-link services-core-card__cta" to={`/contacto?interes=servicio-${service.id}`}>Consultar este servicio <span aria-hidden="true">→</span></Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <CTASection
          actions={[{ label: PUBLIC_ACTION_LABELS.diagnostic, to: "/diagnostico", variant: "primary" }, { label: PUBLIC_ACTION_LABELS.contact, to: "/contacto", variant: "secondary" }]}
          eyebrow="SIGUIENTE PASO"
          title="¿No sabes por dónde empezar?"
        >
          <p>{DIAGNOSTIC_CTA_COPY}</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
