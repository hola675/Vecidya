import { PublicLayout, publicMeta } from "../components/public-layout";
import { publicAssets } from "../assets/public-assets";
import { CTASection } from "../components/public-v2";

import type { Route } from "./+types/services";

const services = [
  {
    id: "estructuracion",
    icon: publicAssets.icons.serviceStructure,
    eyebrow: "ORDENAR",
    title: "Estructuración",
    problem: "Tengo ideas, canales y tareas dispersas, pero no sé por dónde empezar.",
    result: "Tu punto de partida queda claro y puedes avanzar con prioridades reales.",
    support: ["diagnóstico de punto de partida", "mapa de prioridades", "ruta de trabajo por etapas"],
    cta: "Quiero ordenar mi negocio",
  },
  {
    id: "formalizacion",
    icon: publicAssets.icons.serviceFormalization,
    eyebrow: "PREPARAR LA BASE",
    title: "Formalización",
    problem: "Ya hay actividad, pero falta una base clara para operar y presentarse con responsabilidad.",
    result: "Tu negocio cuenta con una base más ordenada para tomar decisiones y sostener el trabajo.",
    support: ["revisión de base operativa", "recomendaciones de formalización", "estructura inicial de procesos"],
    cta: "Quiero formalizar mi base",
  },
  {
    id: "presencia-digital",
    icon: publicAssets.icons.serviceDigitalPresence,
    eyebrow: "EXPLICAR",
    title: "Presencia digital",
    problem: "Lo que está publicado no explica bien qué haces, para quién es ni cuál es el siguiente paso.",
    result: "Tu negocio se presenta con claridad y sus canales apuntan a una misma identidad.",
    support: ["estructura de contenidos", "mejora o creación de páginas", "criterios para conectar canales y contacto"],
    cta: "Quiero mejorar mi presencia",
  },
  {
    id: "visibilidad",
    icon: publicAssets.icons.serviceVisibility,
    eyebrow: "ENCONTRAR",
    title: "Visibilidad",
    problem: "Te buscan, pero encuentran información incompleta o difícil de conectar con lo que haces.",
    result: "Es más fácil entender dónde estás y cómo encontrarte, sin prometer posiciones garantizadas.",
    support: ["revisión de descubrimiento", "optimización de perfiles o páginas", "recomendaciones de SEO local y contenido"],
    cta: "Quiero mejorar mi visibilidad",
  },
] as const;

export function meta(_: Route.MetaArgs) {
  return publicMeta("Servicios", "Servicios de Vecidya para ordenar, preparar y hacer más clara tu presencia digital.", "/servicios");
}

export default function Services() {
  return (
    <PublicLayout>
      <main className="public-page services-experience-page">
        <section className="services-experience-hero" aria-labelledby="services-title">
          <div>
            <p className="eyebrow">SERVICIOS</p>
            <h1 id="services-title">¿Qué necesitas ordenar para avanzar?</h1>
            <p>Vecidya te ayuda a entender el punto de partida, aclarar tu presencia y elegir los siguientes pasos que sí tienen sentido para tu negocio o proyecto.</p>
            <div className="public-actions">
              <a className="button button--primary" href="/diagnostico">Hacer mi diagnóstico</a>
              <a className="button button--secondary" href="/contacto">Hablar con Vecidya</a>
            </div>
          </div>
          <aside className="services-experience-hero__note" aria-label="Cómo empezar">
            <span className="services-experience-hero__mark" aria-hidden="true">→</span>
            <p className="eyebrow">UN PUNTO DE PARTIDA</p>
            <strong>Primero entendemos lo que ya existe. Después decidimos qué construir.</strong>
          </aside>
        </section>

        <section className="services-needs" aria-labelledby="services-needs-title">
          <div className="services-section-heading">
            <p className="eyebrow">ELIGE UNA PUERTA</p>
            <h2 id="services-needs-title">¿Qué necesitas resolver?</h2>
          </div>
          <nav className="services-needs-grid" aria-label="Áreas de apoyo">
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
            <p className="eyebrow">ÁREAS DE APOYO</p>
            <h2 id="services-core-title">De un problema concreto a un siguiente paso claro.</h2>
          </div>
          <div className="services-core-grid">
            {services.map((service) => (
              <article className="services-core-card" id={service.id} key={service.id}>
                <div className="services-core-card__top">
                  <img alt="" aria-hidden="true" height={56} src={service.icon} width={56} />
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
                  <ul>
                    {service.support.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <a className="text-link services-core-card__cta" href="/contacto">{service.cta} <span aria-hidden="true">→</span></a>
              </article>
            ))}
          </div>
        </section>

        <section className="services-secondary" aria-labelledby="services-secondary-title">
          <div>
            <p className="eyebrow">CUANDO YA HAY MOVIMIENTO</p>
            <h2 id="services-secondary-title">Organización y crecimiento</h2>
          </div>
          <p>Si llegan consultas, oportunidades o tareas y el seguimiento depende de mensajes sueltos, revisamos el flujo real antes de sumar herramientas. El objetivo es ordenar lo que ya existe y decidir qué aporta valor.</p>
          <a className="text-link" href="/contacto">Quiero ordenar mi seguimiento <span aria-hidden="true">→</span></a>
        </section>

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
          actions={[
            { label: "Hacer diagnóstico", to: "/diagnostico", variant: "primary" },
            { label: "Contactar", to: "/contacto", variant: "secondary" },
          ]}
          eyebrow="SIGUIENTE PASO"
          title="¿No sabes por dónde empezar?"
        >
          <p>El diagnóstico te ayuda a ubicar tu punto de partida. Si ya sabes qué quieres resolver, podemos conversar directamente.</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
