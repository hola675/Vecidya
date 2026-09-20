import { Link, useLoaderData } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { AssetVisual, CTASection, JsonLd, ServiceCard, VisualSection } from "../components/public-v2";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return publicMeta("Vecidya", "Comunidad digital para negocios, emprendedores y profesionales que quieren ser encontrados, entendidos y contactados.", "/");
}

export function loader({ request }: Route.LoaderArgs) {
  const { origin } = new URL(request.url);
  return { origin };
}

export default function Home() {
  const { origin } = useLoaderData<typeof loader>();
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vecidya",
    url: origin,
    logo: `${origin}/brand/vecidya-app-icon.png`,
    description: "Comunidad digital para negocios, emprendedores y profesionales que quieren ser encontrados, entendidos y contactados.",
  };

  return (
    <PublicLayout>
      <JsonLd data={organizationSchema} />
      <section className="public-hero public-hero--brand public-home-hero">
        <div>
          <p className="eyebrow">VECINDARIO DIGITAL</p>
          <h1>Tu presencia ya tiene un lugar. Hagamos que puedan encontrarla.</h1>
          <p>
            Vecidya ayuda a negocios locales, emprendedores y profesionales independientes a ordenar su presencia digital para que alguien entienda qué hacen, confíe más rápido y sepa cómo contactar.
          </p>
          <div className="public-actions">
            <Link className="button button--primary" to="/vecindario">Explorar el Vecindario</Link>
            <Link className="button button--secondary" to="/diagnostico">Hacer mi diagnóstico</Link>
          </div>
        </div>
        <aside className="home-ecosystem" aria-label="Vista conceptual del ecosistema Vecidya">
          <img alt="Aplicación móvil de Vecidya mostrando descubrimiento de negocios locales" src={publicAssets.illustrations.mobileLocalDiscovery} />
        </aside>
      </section>

      <section className="public-v2-section home-neighborhood-preview">
        <p className="eyebrow">VECINDARIO</p>
        <h2>Primero mira el ecosistema. Después hablamos de servicios.</h2>
        <p className="section-intro">
          El Vecindario reúne perfiles publicados por negocios reales dentro de la plataforma. Puedes buscar por nombre, categoría o ciudad; si no hay datos reales, Vecidya no inventa resultados.
        </p>
        <div className="home-preview-grid">
          <article className="public-v2-card">
            <p className="eyebrow">BUSCAR</p>
            <h3>Encuentra por intención.</h3>
            <p>Nombre, categoría o ciudad ayudan a descubrir negocios publicados.</p>
          </article>
          <article className="public-v2-card">
            <p className="eyebrow">ENTENDER</p>
            <h3>Abre un perfil claro.</h3>
            <p>Cada perfil muestra solo información publicada por el negocio.</p>
          </article>
          <article className="public-v2-card">
            <p className="eyebrow">CONTACTAR</p>
            <h3>Da el siguiente paso.</h3>
            <p>Teléfono, email o web aparecen únicamente cuando existen.</p>
          </article>
        </div>
        <Link className="text-link" to="/vecindario">Explorar negocios publicados <span aria-hidden="true">→</span></Link>
      </section>

      <VisualSection
        eyebrow="UNA BASE QUE SE ENTIENDE"
        title="De una presencia difícil de entender a una presencia fácil de contactar."
        visual={<AssetVisual alt="Perfil digital de un comercio local conectado con señales de presencia pública" src={publicAssets.illustrations.storefrontDigitalProfile} />}
      >
        <p>El problema no suele ser falta de redes o herramientas. Muchas veces la información está incompleta, repartida o escrita de una forma que no ayuda a decidir.</p>
        <div className="home-result-list">
          <span>Información clara</span>
          <span>Presencia ordenada</span>
          <span>Contacto real</span>
        </div>
      </VisualSection>

      <section className="public-v2-section home-diagnostic-feature">
        <p className="eyebrow">DIAGNÓSTICO</p>
        <h2>Antes de decidir qué construir, entiende dónde estás.</h2>
        <p className="section-intro">
          El Diagnóstico Vecidya te ayuda a reconocer tu punto de partida sin pedir correo antes del resultado y sin guardar tus respuestas.
        </p>
        <div className="home-preview-grid">
          <article className="public-v2-card">
            <p className="eyebrow">PUNTO DE PARTIDA</p>
            <h3>Responde según tu caso.</h3>
            <p>Negocio, profesional, creador, proyecto u organización pueden empezar desde preguntas adaptadas.</p>
          </article>
          <article className="public-v2-card">
            <p className="eyebrow">CLARIDAD</p>
            <h3>Identifica oportunidades.</h3>
            <p>El resultado separa fortalezas, vacíos y próximos pasos razonables.</p>
          </article>
          <article className="public-v2-card">
            <p className="eyebrow">ACCIÓN</p>
            <h3>Decide qué ruta seguir.</h3>
            <p>Después puedes aprender, explorar el Vecindario, contactar o iniciar un proceso con Vecidya.</p>
          </article>
        </div>
        <Link className="text-link" to="/diagnostico">Conocer mi punto de partida <span aria-hidden="true">→</span></Link>
      </section>

      <section className="public-v2-section home-services-feature">
          <p className="eyebrow">SERVICIOS COMO RESULTADOS</p>
        <h2>Empezamos por entender qué presencia estás construyendo.</h2>
        <div className="public-grid public-grid--two">
          <ServiceCard eyebrow="BASE" title="Estructuración">
            <p>Convertimos ideas, canales y tareas dispersas en una ruta de prioridades clara.</p>
          </ServiceCard>
          <ServiceCard eyebrow="EMPRESA" title="Formalización">
            <p>Acompañamos la organización empresarial cuando esa base es parte del avance necesario.</p>
          </ServiceCard>
          <ServiceCard eyebrow="PRESENCIA" title="Presencia digital">
            <p>Ordenamos información, mensajes y canales para explicar qué haces y cómo contactarte.</p>
          </ServiceCard>
          <ServiceCard eyebrow="VISIBILIDAD" title="Marketing y SEO/GEO">
            <p>Trabajamos contenido y estructura para ser encontrado y comprendido sin promesas vacías.</p>
          </ServiceCard>
        </div>
        <Link className="text-link" to="/servicios">Conoce los servicios de Vecidya <span aria-hidden="true">→</span></Link>
      </section>

      <section className="public-v2-section home-audience-feature">
        <p className="eyebrow">PARA QUIÉN ES</p>
        <h2>Foco claro, alcance responsable.</h2>
        <div className="home-preview-grid">
          <article className="public-v2-card">
            <p className="eyebrow">PRIORIDAD</p>
            <h3>Negocios y microempresas.</h3>
            <p>Comercios, servicios locales y pequeñas empresas que necesitan una presencia pública más clara.</p>
          </article>
          <article className="public-v2-card">
            <p className="eyebrow">TAMBIÉN</p>
            <h3>Emprendedores y profesionales.</h3>
            <p>Personas que ofrecen servicios, están empezando o necesitan explicar mejor su trabajo.</p>
          </article>
          <article className="public-v2-card">
            <p className="eyebrow">EXTENDIDO</p>
            <h3>Proyectos y organizaciones.</h3>
            <p>Casos que pueden diagnosticarse como presencia digital, sin prometer todavía perfiles universales.</p>
          </article>
        </div>
      </section>

      <section className="public-v2-section home-learn-feature">
        <p className="eyebrow">APRENDE</p>
        <h2>Entender también es parte del avance.</h2>
        <p className="section-intro">
          La biblioteca de Vecidya explica decisiones digitales con lenguaje claro: presencia, web y redes, SEO/GEO, organización comercial y control de cuentas.
        </p>
        <Link className="text-link" to="/que-debes-saber">Leer lo esencial <span aria-hidden="true">→</span></Link>
      </section>

      <section className="public-section">
        <p className="eyebrow">CÓMO FUNCIONA</p>
        <h2>Tres pasos para aparecer mejor.</h2>
        <ol className="public-steps">
          <li><strong>01</strong><div><h3>Reconoce tu punto de partida</h3><p>Explora el Vecindario o haz el diagnóstico para entender qué existe y qué falta.</p></div></li>
          <li><strong>02</strong><div><h3>Ordenamos la presencia</h3><p>Priorizamos información, canales y los primeros elementos útiles.</p></div></li>
          <li><strong>03</strong><div><h3>Conectas con tu audiencia</h3><p>Tu presencia queda preparada para ser entendida y contactada.</p></div></li>
        </ol>
      </section>

      <section className="public-section">
        <p className="eyebrow">PREGUNTAS FRECUENTES</p>
        <h2>Lo esencial antes de empezar.</h2>
        <div className="faq-list">
          <details><summary>¿Vecidya es solo para negocios grandes?</summary><p>No. Está pensado para negocios locales, emprendimientos, profesionales independientes y pequeñas empresas que necesitan una presencia digital más clara.</p></details>
          <details><summary>¿Necesito tener página web para unirme?</summary><p>No. El punto de partida se revisa según la presencia que ya tenga tu negocio y lo que necesite comunicar.</p></details>
          <details><summary>¿Qué necesito para empezar?</summary><p>Nombre, actividad, una descripción, datos de contacto, ubicación o zona de atención y los enlaces que ya uses.</p></details>
          <details><summary>¿Qué es Vecidya?</summary><p>Es una comunidad digital para ordenar presencia, aprendizaje, perfiles públicos y próximos pasos sin inventar resultados.</p></details>
        </div>
      </section>

      <CTASection
        eyebrow="SIGUIENTE PASO"
        title="Tu presencia puede ser más clara antes de volverse más grande."
        actions={[
          { label: "Hacer diagnóstico", to: "/diagnostico", variant: "primary" },
          { label: "Explorar el Vecindario", to: "/vecindario", variant: "light" },
        ]}
        tone="dark"
      >
        <p>
          Empieza por entender dónde estás, explorar lo que ya existe y decidir el siguiente paso con más criterio. Si ya sabes qué necesitas, <Link className="public-v2-cta__inline-link" to="/contacto">habla con Vecidya</Link>.
        </p>
      </CTASection>
    </PublicLayout>
  );
}
