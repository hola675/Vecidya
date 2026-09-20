import { PublicLayout, publicMeta } from "../components/public-layout";
import { publicAssets } from "../assets/public-assets";
import { AssetVisual, CTASection, ServiceCard, VisualSection } from "../components/public-v2";

import type { Route } from "./+types/privacy";

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Privacidad",
    "Información de privacidad de Vecidya sobre datos de cuenta, organizaciones, perfiles públicos, correo y límites de formularios propios.",
    "/privacidad",
  );
}

export default function Privacy() {
  return (
    <PublicLayout>
      <main className="public-page public-commercial-page">
        <section className="public-commercial-hero">
          <p className="eyebrow">PRIVACIDAD</p>
          <h1>Qué datos usa Vecidya y para qué.</h1>
          <p>
            Esta página explica, en lenguaje claro, qué información necesitamos
            para operar Vecidya y cómo puedes pedir revisión o corrección.
          </p>
        </section>

        <section className="public-commercial-section">
          <p className="eyebrow">DATOS ACTUALES</p>
          <h2>La plataforma trabaja con datos necesarios para operar.</h2>
          <div className="public-commercial-grid">
            <ServiceCard eyebrow="CUENTA" title="Identidad de acceso">
              <p>Nombre, correo electrónico, sesión y credenciales necesarias para registro, acceso y seguridad.</p>
            </ServiceCard>
            <ServiceCard eyebrow="ORGANIZACIÓN" title="Membresía y permisos">
              <p>Organizaciones, roles y permisos se usan para que cada persona vea y gestione solo lo que le corresponde.</p>
            </ServiceCard>
            <ServiceCard eyebrow="PERFIL" title="Información pública">
              <p>Los perfiles publicados muestran solo datos que la organización decide publicar: nombre, categoría, ubicación, descripción y contacto si existen.</p>
            </ServiceCard>
            <ServiceCard eyebrow="CONTACTO" title="Correo externo">
              <p>Los enlaces `mailto` abren tu aplicación de correo. Vecidya no almacena esos mensajes desde la web pública.</p>
            </ServiceCard>
          </div>
        </section>

        <VisualSection
          eyebrow="PRINCIPIOS"
          title="Menos datos, más claridad y acceso responsable."
          visual={<AssetVisual alt="Panel de tareas y prioridades para organizar información en Vecidya" src={publicAssets.illustrations.taskSchedulePanel} />}
        >
          <p>
            Vecidya debe pedir solo lo necesario, explicar el uso previsto y
            proteger la información de cada cuenta y organización con controles
            de acceso adecuados.
          </p>
        </VisualSection>

        <section className="public-v2-card public-commercial-limits">
          <p className="eyebrow">LÍMITES ACTUALES</p>
          <h2>Qué no hacemos desde la web pública.</h2>
          <ul>
            <li>No hay formularios propios persistentes en las páginas públicas actuales.</li>
            <li>No guardamos respuestas del diagnóstico ni resultados personalizados.</li>
            <li>No creamos historiales comerciales internos desde estas páginas.</li>
            <li>No vendemos datos personales ni publicamos datos privados de organizaciones.</li>
            <li>No usamos reseñas, ratings, horarios, productos o métricas que no existan en el producto.</li>
          </ul>
        </section>

        <section className="public-commercial-section">
          <p className="eyebrow">DERECHOS Y CONTACTO</p>
          <h2>Cómo pedir revisión o corrección.</h2>
          <p>
            Si quieres consultar, corregir o solicitar revisión de información
            asociada a tu cuenta, organización o perfil público, escribe a{" "}
            <a className="text-link" href="mailto:hola@vecidya.com">hola@vecidya.com</a>.
          </p>
          <p>
            Cualquier función futura que capture o guarde datos personales desde
            formularios propios deberá definir consentimiento, finalidad,
            retención, acceso y eliminación antes de activarse.
          </p>
        </section>

        <CTASection
          actions={[
            { label: "Contactar por privacidad", href: "mailto:hola@vecidya.com?subject=Privacidad%20Vecidya", variant: "primary" },
            { label: "Volver al inicio", to: "/", variant: "secondary" },
          ]}
          eyebrow="TRANSPARENCIA"
          title="Si algo no está claro, pregúntanos antes de compartir más datos."
        >
          <p>La privacidad debe avanzar junto con el producto, no después como parche.</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
