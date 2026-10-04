import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { CommercialBoundary, CTASection } from "../components/public-v2";
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
    eyebrow: "ORGANIZAR",
    title: "Organización del negocio",
    problem: "La información, las prioridades y los procesos están dispersos.",
    result: "Una base ordenada para tomar decisiones y saber qué construir primero.",
    support: ["diagnóstico y mapa de prioridades", "estructura de información", "ruta de trabajo por etapas"],
  },
  {
    id: "formalizacion",
    icon: publicAssets.icons.serviceFormalization,
    eyebrow: "PREPARAR",
    title: "Formalización de base",
    problem: "Ya hay actividad, pero falta una estructura clara para operar y presentarse.",
    result: "Una base más responsable para sostener el trabajo y explicar cómo funciona.",
    support: ["revisión de base operativa", "criterios de organización", "estructura inicial de procesos"],
  },
  {
    id: "presencia-digital",
    icon: publicAssets.catalog.services.presenciaDigital,
    eyebrow: "EXPLICAR",
    title: "Presencia digital",
    problem: "Lo publicado no explica bien qué haces, para quién es ni cuál es el siguiente paso.",
    result: "Una presencia clara donde quienes te buscan puedan encontrarte y entenderte.",
    support: ["páginas web y landing pages", "estructura de contenidos", "conexión entre canales y contacto"],
  },
  {
    id: "automatizacion",
    icon: publicAssets.catalog.services.automatizacion,
    eyebrow: "SIMPLIFICAR",
    title: "Automatización",
    problem: "Las tareas repetitivas consumen tiempo y dependen de recordatorios manuales.",
    result: "Procesos más ordenados para sostener formularios, seguimiento e integraciones.",
    support: ["CRM y seguimiento", "workflows y formularios", "integraciones y seguimiento"],
  },
  {
    id: "inteligencia-artificial",
    icon: publicAssets.catalog.services.inteligenciaArtificial,
    eyebrow: "ASISTIR",
    title: "Inteligencia artificial",
    problem: "Quieres atender, clasificar o acompañar conversaciones con más capacidad.",
    result: "Asistentes conversacionales o de voz definidos para un caso concreto.",
    support: ["agentes conversacionales", "asistentes de voz", "automatización inteligente"],
  },
  {
    id: "visibilidad",
    icon: publicAssets.catalog.services.visibilidad,
    eyebrow: "CONECTAR",
    title: "Marketing y crecimiento",
    problem: "Tu negocio necesita más visibilidad, pero no quieres sumar acciones sin dirección.",
    result: "Mejores criterios para conectar contenido, campañas y descubrimiento.",
    support: ["Google Ads y Meta Ads", "SEO y GEO/AEO", "contenido y medición"],
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
            <h1 id="services-title">Construimos soluciones digitales adaptadas a tu negocio.</h1>
            <p>Una licencia te da una base. Un servicio nos permite crear, configurar o mejorar algo específico para tu momento y tus objetivos.</p>
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
            <h2 id="services-needs-title">¿Qué necesitas resolver?</h2>
            <p className="services-intro">Cada servicio parte de un problema concreto y termina en un resultado que puedes entender.</p>
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
                <div className="services-core-card__problem">
                  <span>EL PROBLEMA</span>
                  <p>{service.problem}</p>
                </div>
                <div className="services-core-card__result">
                  <span>EL RESULTADO</span>
                  <p>{service.result}</p>
                </div>
                <div className="services-core-card__support">
                  <span>PODEMOS AYUDAR CON</span>
                  <ul>{service.support.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <Link className="text-link services-core-card__cta" to="/contacto">Conversar sobre este servicio <span aria-hidden="true">→</span></Link>
              </article>
            ))}
          </div>
        </section>

        <CommercialBoundary current="service" />

        <section className="services-process" aria-labelledby="services-process-title">
          <div className="services-section-heading">
            <p className="eyebrow">CÓMO TRABAJAMOS</p>
            <h2 id="services-process-title">La solución empieza por entender.</h2>
          </div>
          <ol className="services-process-list">
            <li><strong>Entendemos tu punto de partida</strong><span>Qué existe, qué falta y qué está disperso.</span></li>
            <li><strong>Definimos qué necesitas realmente</strong><span>Priorizamos antes de sumar canales o herramientas.</span></li>
            <li><strong>Construimos el siguiente paso</strong><span>Con entregables claros y adecuados para tu momento.</span></li>
          </ol>
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
