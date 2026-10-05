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
    problem: "La información, las prioridades y los procesos están dispersos.",
    result: "Una base ordenada para tomar decisiones y saber qué construir primero.",
    support: ["Identidad", "Mensajes", "Guía de presencia"],
  },
  {
    id: "formalizacion",
    icon: publicAssets.icons.serviceFormalization,
    eyebrow: "CONVERTIR",
    title: "Web & Conversión",
    problem: "Ya hay actividad, pero falta una estructura clara para operar y presentarse.",
    result: "Una base más responsable para sostener el trabajo y explicar cómo funciona.",
    support: ["Web", "Landing", "Ecommerce"],
  },
  {
    id: "presencia-digital",
    icon: publicAssets.catalog.services.presenciaDigital,
    eyebrow: "ENCONTRAR",
    title: "Visibilidad & Marketing",
    problem: "Lo publicado no explica bien qué haces, para quién es ni cuál es el siguiente paso.",
    result: "Una presencia clara donde quienes te buscan puedan encontrarte y entenderte.",
    support: ["SEO local", "Contenido", "Campañas"],
  },
  {
    id: "automatizacion",
    icon: publicAssets.catalog.services.automatizacion,
    eyebrow: "CAPTAR",
    title: "Sistema Comercial",
    problem: "Las tareas repetitivas consumen tiempo y dependen de recordatorios manuales.",
    result: "Procesos más ordenados para sostener formularios, seguimiento e integraciones.",
    support: ["Captación", "Pipeline", "Seguimiento"],
  },
  {
    id: "inteligencia-artificial",
    icon: publicAssets.catalog.services.inteligenciaArtificial,
    eyebrow: "CONECTAR",
    title: "Automatización & Integraciones",
    problem: "Quieres atender, clasificar o acompañar conversaciones con más capacidad.",
    result: "Asistentes conversacionales o de voz definidos para un caso concreto.",
    support: ["Workflows", "Integraciones", "Procesos"],
  },
  {
    id: "visibilidad",
    icon: publicAssets.catalog.services.visibilidad,
    eyebrow: "ASISTIR",
    title: "IA Aplicada",
    problem: "Tu negocio necesita más visibilidad, pero no quieres sumar acciones sin dirección.",
    result: "Mejores criterios para conectar contenido, campañas y descubrimiento.",
    support: ["IA conversacional", "IA de voz", "Asistentes"],
  },
  {
    id: "desarrollo-empresarial",
    icon: publicAssets.catalog.services.organizacion,
    eyebrow: "DESARROLLAR",
    title: "Desarrollo Empresarial",
    problem: "La operación necesita una mirada más amplia para avanzar con criterio.",
    result: "Decisiones y capacidades alineadas con el siguiente momento.",
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

        <section className="services-needs" aria-labelledby="services-needs-title">
          <div className="services-section-heading">
            <p className="eyebrow">ÁREAS DE SERVICIO</p>
            <h2 id="services-needs-title">Siete familias para resolver mejor.</h2>
          </div>
          <nav className="services-needs-grid" aria-label="Áreas de servicio">
            {services.map((service) => (
              <a className="services-need" href={`#${service.id}`} key={service.id}>
                <span>{service.eyebrow}</span>
                <strong>{service.title}</strong>
                <span aria-hidden="true">↓</span>
              </a>
            ))}
          </nav>
          <p className="services-needs-note">Si todavía no sabes qué necesitas, empieza por el diagnóstico.</p>
        </section>

        <section className="services-core" aria-labelledby="services-core-title">
          <div className="services-section-heading">
            <p className="eyebrow">LO QUE PODEMOS CONSTRUIR</p>
            <h2 id="services-core-title">Del problema concreto a un siguiente paso claro.</h2>
          </div>
          <div className="services-core-grid">
            {services.map((service) => (
              <article className="services-core-card" id={service.id} key={service.id}>
                <div className="services-core-card__top">
                  <img alt="" aria-hidden="true" className="catalog-card__image catalog-card__image--feature" height={112} src={service.icon} width={128} />
                  <p className="eyebrow">{service.eyebrow}</p>
                </div>
                <h3>{service.title}</h3>
                <p className="services-core-card__result">{service.result}</p>
                <p className="services-core-card__support"><span>Ejemplos</span> {service.support.join(" · ")}</p>
                <Link className="text-link services-core-card__cta" to="/contacto">Solicitar propuesta <span aria-hidden="true">→</span></Link>
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
