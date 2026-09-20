import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { AssetVisual, CTASection, ServiceCard, VisualSection } from "../components/public-v2";

import type { Route } from "./+types/about";

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Sobre nosotros",
    "Conoce el propósito, equipo y enfoque de Vecidya para unir tecnología, presencia digital y desarrollo empresarial.",
    "/sobre-nosotros",
  );
}

export default function About() {
  return (
    <PublicLayout>
      <main className="public-page public-commercial-page">
        <section className="public-commercial-hero">
          <p className="eyebrow">SOBRE VECIDYA</p>
          <h1>Hacemos visible lo que ya tiene valor.</h1>
          <p>
            Vecidya nace para ayudar a negocios locales, emprendedores,
            profesionales independientes y pequeñas empresas a ser encontrados,
            comprendidos y contactados con más claridad.
          </p>
          <div className="public-actions">
            <Link className="button button--primary" to="/vecindario">Explorar Vecindario</Link>
            <Link className="button button--secondary" to="/contacto">Hablar con Vecidya</Link>
          </div>
        </section>

        <VisualSection
          eyebrow="DOS PERSPECTIVAS"
          title="Tecnología y desarrollo empresarial en una misma visión."
          visual={<AssetVisual alt="Red de negocios locales conectados alrededor de Vecidya" src={publicAssets.illustrations.neighborhoodMapPins} />}
        >
          <p>
            Unimos desarrollo digital, marketing, automatización e infraestructura
            con administración empresarial, formalización, estrategia comercial y
            acompañamiento.
          </p>
          <p>
            La pregunta no es solo qué web necesita un negocio, sino qué negocio
            está construyendo, qué presencia necesita y qué paso le conviene dar.
          </p>
        </VisualSection>

        <section className="public-commercial-section public-commercial-section--team">
          <p className="eyebrow">EQUIPO</p>
          <h2>Perfiles complementarios para mirar el negocio completo.</h2>
          <div className="public-commercial-grid">
            <ServiceCard eyebrow="TECNOLOGÍA" title="Yoan">
              <p>CEO y líder de Tecnología y Estrategia Digital. Dirige la evolución tecnológica de Vecidya y la construcción de soluciones útiles, seguras, comprensibles y preparadas para crecer.</p>
            </ServiceCard>
            <ServiceCard eyebrow="DESARROLLO" title="Edgar">
              <p>Gerente Comercial y de Desarrollo Empresarial. Acompaña estructuración, formalización empresarial, estrategia comercial, procesos y prioridades de crecimiento.</p>
            </ServiceCard>
            <ServiceCard eyebrow="DISTINCIÓN" title="Formalización responsable">
              <p>La formalización empresarial se comunica como orientación y acompañamiento. Cuando exista una necesidad jurídica especializada, debe diferenciarse y atenderse con el profesional correspondiente.</p>
            </ServiceCard>
            <ServiceCard eyebrow="MISIÓN" title="Una mirada completa">
              <p>La tecnología necesita objetivos claros; la estrategia necesita herramientas capaces de convertirlos en acciones. Vecidya trabaja donde esas dos piezas se encuentran.</p>
            </ServiceCard>
          </div>
        </section>

        <section className="public-commercial-section">
          <p className="eyebrow">CRITERIO</p>
          <h2>Lo que guía el producto.</h2>
          <div className="public-commercial-grid">
            <ServiceCard eyebrow="01" title="Existir">
              <p>Ayudar a que una presencia pública tenga identidad, contexto y una acción siguiente comprensible.</p>
            </ServiceCard>
            <ServiceCard eyebrow="02" title="Ser encontrado">
              <p>Conectar perfiles reales con personas que buscan opciones locales sin inventar datos ni métricas.</p>
            </ServiceCard>
            <ServiceCard eyebrow="03" title="Organizarse">
              <p>Distinguir lo que debe mostrarse al público de lo que necesita seguimiento, procesos y herramientas internas.</p>
            </ServiceCard>
            <ServiceCard eyebrow="04" title="Avanzar">
              <p>Convertir claridad en próximos pasos pequeños, verificables y adecuados al estado actual.</p>
            </ServiceCard>
          </div>
        </section>

        <section className="public-v2-card public-commercial-limits">
          <p className="eyebrow">COMPROMISOS</p>
          <h2>Límites que protegen la plataforma.</h2>
          <ul>
            <li>No usamos negocios, testimonios, equipo, cifras o autoridad ficticia.</li>
            <li>No recomendamos herramientas por moda, sino por necesidad y momento.</li>
            <li>No prometemos resultados que dependan de factores que nadie controla por completo.</li>
            <li>No pedimos datos personales sin explicar para qué se usan.</li>
          </ul>
        </section>

        <CTASection
          actions={[
            { label: "Ver negocios publicados", to: "/vecindario", variant: "primary" },
            { label: "Contactar", to: "/contacto", variant: "secondary" },
          ]}
          eyebrow="SIGUIENTE PASO"
          title="Si compartes este enfoque, podemos empezar por lo esencial."
        >
          <p>
            Explora el Vecindario o escríbenos para revisar cómo hacer más clara
            la presencia digital de tu negocio, proyecto u organización.
          </p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
