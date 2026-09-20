import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { AssetVisual, CTASection, ServiceCard, VisualSection } from "../components/public-v2";

import type { Route } from "./+types/knowledge";

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Qué debes saber",
    "Guía de Vecidya para entender presencia digital, buscadores, automatización y próximos pasos sin promesas vacías.",
    "/que-debes-saber",
  );
}

export default function Knowledge() {
  return (
    <PublicLayout>
      <main className="public-page public-commercial-page">
        <section className="public-commercial-hero">
          <p className="eyebrow">QUÉ DEBES SABER</p>
          <h1>Estar en internet no significa tener una estrategia digital.</h1>
          <p>
            Una presencia digital funciona como un sistema: página web, redes,
            directorios, reseñas, contenido, canales de contacto y seguimiento
            deberían trabajar hacia un mismo objetivo.
          </p>
          <div className="public-actions">
            <Link className="button button--primary" to="/diagnostico">Ver diagnóstico</Link>
            <Link className="button button--secondary" to="/contacto">Hacer una pregunta</Link>
          </div>
        </section>

        <section className="public-commercial-section public-commercial-section--knowledge">
          <p className="eyebrow">TEMAS BASE</p>
          <h2>La biblioteca crecerá desde decisiones concretas.</h2>
          <div className="knowledge-category-strip" aria-label="Categorías editoriales futuras">
            <span>Empezar</span>
            <span>Organizar</span>
            <span>Entender</span>
            <span>Decidir</span>
          </div>
          <div className="public-commercial-grid">
            <ServiceCard eyebrow="EMPEZAR" title="Qué necesita realmente una presencia digital">
              <p>Lo mínimo para que alguien entienda qué haces, dónde atiendes y cómo contactarte.</p>
            </ServiceCard>
            <ServiceCard eyebrow="EMPEZAR" title="Página web vs redes sociales">
              <p>Qué función cumple cada canal y por qué no conviene tratarlos como si fueran lo mismo.</p>
            </ServiceCard>
            <ServiceCard eyebrow="ORGANIZAR" title="Qué es un CRM y cuándo lo necesitas">
              <p>Cómo saber si necesitas organizar contactos y seguimiento o si todavía basta una base más simple.</p>
            </ServiceCard>
            <ServiceCard eyebrow="ENTENDER" title="Dominio, cuentas y control digital">
              <p>Qué accesos e información deberías controlar antes de depender de terceros.</p>
            </ServiceCard>
          </div>
        </section>

        <VisualSection
          eyebrow="CRITERIO EDITORIAL"
          title="Contenido útil, verificable y sin relleno."
          visual={<AssetVisual alt="Panel de tareas y prioridades para ordenar decisiones digitales" src={publicAssets.illustrations.taskSchedulePanel} />}
        >
          <p>
            La primera pregunta no debería ser en qué red social estar, sino qué
            quieres conseguir y dónde están las personas a las que necesitas
            llegar. Cada contenido futuro debe responder dudas reales con claridad
            y evidencia.
          </p>
        </VisualSection>

        <section className="public-commercial-section">
          <p className="eyebrow">HOJA DE RUTA</p>
          <h2>Un avance digital sano empieza por ordenar decisiones.</h2>
          <ol className="public-commercial-steps">
            <li><span>01</span><strong>Comprender el punto de partida</strong><p>Ver si el negocio existe, cómo está estructurado y qué presencia digital tiene hoy.</p></li>
            <li><span>02</span><strong>Definir objetivos</strong><p>Elegir si se busca más visibilidad, contactos, reservas, reputación, organización o crecimiento.</p></li>
            <li><span>03</span><strong>Ordenar la base</strong><p>Revisar información comercial, canales, mensajes, contacto y señales de confianza.</p></li>
            <li><span>04</span><strong>Medir y mejorar</strong><p>Avanzar con estrategia, ejecución, medición y mejora sin prometer resultados imposibles de controlar.</p></li>
          </ol>
        </section>

        <section className="public-v2-card public-commercial-limits">
          <p className="eyebrow">CRITERIO</p>
          <h2>Cómo crecerá esta biblioteca.</h2>
          <ul>
            <li>Publicaremos contenido desde preguntas reales de negocios, emprendedores y profesionales.</li>
            <li>Cada tema deberá ayudar a tomar una decisión concreta.</li>
            <li>No inventamos casos, clientes, métricas, reseñas o resultados.</li>
            <li>Si una recomendación requiere más contexto, te invitaremos a conversar antes de vender una solución.</li>
          </ul>
        </section>

        <CTASection
          actions={[
            { label: "Explorar diagnóstico", to: "/diagnostico", variant: "primary" },
            { label: "Contactar", to: "/contacto", variant: "secondary" },
          ]}
          eyebrow="SIGUIENTE PASO"
          title="Si tienes una duda concreta, podemos empezar por ahí."
        >
          <p>
            El contenido crecerá desde preguntas reales y decisiones verificables.
            Mientras tanto, el diagnóstico y el contacto son las rutas útiles.
          </p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
