import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { CTASection } from "../components/public-v2";
import { DIAGNOSTIC_CTA_COPY, PUBLIC_ACTION_LABELS } from "../content/public-copy";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { Route } from "./+types/services";

type ServiceArea = {
  id: string;
  icon: string;
  eyebrow: string;
  title: string;
  problem: string;
  result: string;
  support: string[];
};

const services: ServiceArea[] = [
  {
    id: "estructuracion",
    icon: publicAssets.catalog.services.organizacion,
    eyebrow: "ORDENAR",
    title: "Presencia & Marca",
    problem: "Tu negocio no tiene identidad, mensajes o presentación consistentes.",
    result: "Identidad y presentación profesional para que se entienda quién eres y qué ofreces.",
    support: ["Identidad", "Mensajes", "Guía de presencia"],
  },
  {
    id: "formalizacion",
    icon: publicAssets.icons.serviceFormalization,
    eyebrow: "CONVERTIR",
    title: "Web & Conversión",
    problem: "Tus visitantes no encuentran fácilmente tus servicios ni cómo contactarte.",
    result: "Webs y páginas de captación con información clara y pasos de contacto definidos.",
    support: ["Web", "Landing", "Ecommerce"],
  },
  {
    id: "presencia-digital",
    icon: publicAssets.catalog.services.presenciaDigital,
    eyebrow: "ENCONTRAR",
    title: "Visibilidad & Marketing",
    problem: "Tu negocio es difícil de encontrar o sus canales no explican bien lo que ofrece.",
    result: "Estrategia de contenido, posicionamiento y campañas para mejorar el descubrimiento.",
    support: ["SEO local", "Contenido", "Campañas"],
  },
  {
    id: "automatizacion",
    icon: publicAssets.catalog.services.automatizacion,
    eyebrow: "CAPTAR",
    title: "Sistema Comercial",
    problem: "Las consultas llegan por varios canales y no existe un proceso de atención definido.",
    result: "Diseño de captación, atención y seguimiento; la operación CRM corresponde a GHL cuando aplica.",
    support: ["Captación", "Pipeline", "Seguimiento"],
  },
  {
    id: "inteligencia-artificial",
    icon: publicAssets.catalog.services.automatizacion,
    eyebrow: "CONECTAR",
    title: "Automatización & Integraciones",
    problem: "Las tareas repetitivas y las herramientas desconectadas consumen tiempo.",
    result: "Automatizaciones e integraciones diseñadas para procesos y sistemas concretos.",
    support: ["Workflows", "Integraciones", "Procesos"],
  },
  {
    id: "visibilidad",
    icon: publicAssets.catalog.services.inteligenciaArtificial,
    eyebrow: "ASISTIR",
    title: "IA Aplicada",
    problem: "Quieres utilizar IA para apoyar la atención o tareas internas con límites claros.",
    result: "IA aplicada a la atención y procesos concretos, con supervisión humana.",
    support: ["IA conversacional", "IA de voz", "Asistentes"],
  },
  {
    id: "desarrollo-empresarial",
    icon: publicAssets.catalog.services.organizacion,
    eyebrow: "DESARROLLAR",
    title: "Desarrollo Empresarial",
    problem: "La operación necesita una mirada más amplia para avanzar con criterio.",
    result: "Acompañamiento para ordenar prioridades, procesos y próximos pasos.",
    support: ["Diagnóstico", "Planificación", "Acompañamiento"],
  },
];

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
            <p>Son servicios profesionales con alcance acordado; no todos requieren una licencia.</p>
          </div>
          <div className="services-core-grid">
            {services.map((service) => (
              <article className="services-core-card" id={service.id} key={service.id}>
                <div className="services-core-card__top">
                  <img alt="" aria-hidden="true" className="catalog-card__image catalog-card__image--feature" height={112} src={service.icon} width={128} />
                  <p className="eyebrow">{service.eyebrow}</p>
                </div>
                <h3>{service.title}</h3>
                <p className="services-core-card__problem">{service.problem}</p>
                <p className="services-core-card__result">{service.result}</p>
                <p className="services-core-card__support"><span>Ejemplos</span> {service.support.join(" · ")}</p>
                <Link className="text-link services-core-card__cta" to={`/contacto?interes=servicio-${service.id}`}>Consultar este servicio <span aria-hidden="true">→</span></Link>
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
