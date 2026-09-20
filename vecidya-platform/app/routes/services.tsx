import { PublicLayout, publicMeta } from "../components/public-layout";
import { publicAssets } from "../assets/public-assets";
import { AssetVisual, CTASection, ServiceCard, VisualSection } from "../components/public-v2";

import type { Route } from "./+types/services";

const services = [
  {
    eyebrow: "01 / ESTRUCTURAR",
    title: "Estructuración",
    problem: "Hay ideas, canales, mensajes o tareas dispersas y cuesta decidir por dónde empezar.",
    work: "Ordenamos la situación actual, objetivos, prioridades, público y próximos pasos antes de construir nuevas piezas.",
    deliverables: ["diagnóstico de punto de partida", "mapa de prioridades", "ruta de trabajo por etapas"],
    fit: "Cuando necesitas claridad para avanzar sin convertir una necesidad sencilla en un sistema complicado.",
  },
  {
    eyebrow: "02 / BASE",
    title: "Formalización",
    problem: "El negocio o proyecto necesita una base más clara para operar, presentarse y crecer con responsabilidad.",
    work: "Acompañamos decisiones de organización, documentación básica, estructura comercial y criterios para sostener el trabajo.",
    deliverables: ["revisión de base operativa", "recomendaciones de formalización", "estructura inicial de procesos y responsabilidades"],
    fit: "Cuando ya existe actividad real, pero falta orden para tomar decisiones y presentarse mejor.",
  },
  {
    eyebrow: "03 / ENCONTRAR",
    title: "Visibilidad",
    problem: "Te buscan, pero encuentran información incompleta, débil o difícil de conectar con lo que haces.",
    work: "Mejoramos señales, contenido y estructura para que las personas correctas entiendan dónde estás y cómo encontrarte.",
    deliverables: ["revisión de descubrimiento", "optimización de perfiles o páginas", "recomendaciones de SEO local y contenido"],
    fit: "Cuando ya tienes algo publicado y necesitas ser encontrado con más claridad, sin prometer posiciones garantizadas.",
  },
  {
    eyebrow: "04 / EXPLICAR",
    title: "Presencia digital",
    problem: "Lo publicado no explica bien qué haces, para quién es, por qué confiar y cuál es el siguiente paso.",
    work: "Ordenamos mensajes, activos digitales, canales, web, perfiles y datos de contacto según tu situación.",
    deliverables: ["estructura de contenidos", "mejora o creación de páginas", "criterios para conectar canales y contacto"],
    fit: "Cuando necesitas que una persona nueva entienda rápido tu propuesta y pueda actuar sin fricción.",
  },
  {
    eyebrow: "05 / SEGUIR",
    title: "Organización y crecimiento",
    problem: "Llegan consultas, oportunidades o tareas, pero el seguimiento depende de memoria, mensajes sueltos o procesos poco claros.",
    work: "Revisamos el flujo real antes de sumar herramientas, y definimos qué conviene ordenar, automatizar o integrar.",
    deliverables: ["mapa de seguimiento", "criterios para CRM o automatización", "mejoras de flujo comercial y operativo"],
    fit: "Cuando ya hay movimiento suficiente para necesitar orden, pero todavía no está claro qué tecnología aporta valor.",
  },
];

export function meta(_: Route.MetaArgs) {
  return publicMeta("Servicios", "Servicios de estructuración, presencia digital, visibilidad y organización para negocios, emprendedores y profesionales.", "/servicios");
}

export default function Services() {
  return (
    <PublicLayout>
      <main className="public-page public-commercial-page">
        <section className="public-commercial-hero">
          <p className="eyebrow">SERVICIOS</p>
          <h1>Servicios para entender, ordenar y hacer visible tu presencia.</h1>
          <p>Vecidya parte de la situación real: qué existe, qué está disperso, cómo te encuentran hoy, qué necesita entender una persona y qué herramientas sí tienen sentido.</p>
          <div className="public-actions">
            <a className="button button--primary" href="/diagnostico">Hacer mi diagnóstico</a>
            <a className="button button--secondary" href="/contacto">Hablar con Vecidya</a>
          </div>
        </section>

        <section className="public-commercial-section public-commercial-section--services">
          <p className="eyebrow">SERVICIOS COMPRABLES</p>
          <h2>Qué problema resuelve cada área y qué podrías recibir.</h2>
          <div className="public-commercial-grid">
            {services.map((service) => (
              <ServiceCard eyebrow={service.eyebrow} key={service.title} title={service.title}>
                <div className="service-package">
                  <section>
                    <h3>Problema</h3>
                    <p>{service.problem}</p>
                  </section>
                  <section>
                    <h3>Cómo puede ayudar Vecidya</h3>
                    <p>{service.work}</p>
                  </section>
                  <section>
                    <h3>Qué puedes recibir</h3>
                    <ul>
                      {service.deliverables.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </section>
                  <section>
                    <h3>Cuándo tiene sentido</h3>
                    <p>{service.fit}</p>
                  </section>
                </div>
              </ServiceCard>
            ))}
          </div>
        </section>

        <VisualSection
          eyebrow="MÉTODO"
          title="Primero se entiende la presencia; después se decide qué construir."
          visual={<AssetVisual alt="Paneles de crecimiento y presencia digital de Vecidya para negocios locales" height={1086} src={publicAssets.illustrations.platformGrowthDashboard} width={1448} />}
        >
          <p>El trabajo empieza por revisar el punto de partida, definir objetivos y ordenar la base. Después se eligen canales, herramientas y mejoras que tengan sentido para el caso.</p>
        </VisualSection>

        <section className="public-v2-card public-commercial-limits">
          <p className="eyebrow">LÍMITES CLAROS</p>
          <h2>Trabajo consultivo, entregables reales.</h2>
          <ul>
            <li>Primero entendemos qué necesitas. La tecnología viene después.</li>
            <li>Los entregables se definen según tu situación, tus activos y el momento del negocio.</li>
            <li>Una integración, CRM o automatización solo tiene sentido cuando mejora un proceso real.</li>
            <li>La visibilidad se trabaja con método y evidencia, sin prometer posiciones o ventas garantizadas.</li>
          </ul>
        </section>

        <CTASection
          actions={[
            { label: "Hacer diagnóstico", to: "/diagnostico", variant: "primary" },
            { label: "Contactar", to: "/contacto", variant: "secondary" },
          ]}
          eyebrow="SIGUIENTE PASO"
          title="Empieza por ordenar lo esencial."
        >
          <p>El diagnóstico ayuda a entender el punto de partida. Si ya sabes qué necesitas, podemos conversar directamente.</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
