import { Link } from "react-router";

import { PublicLayout, publicMeta } from "../components/public-layout";
import { CTASection } from "../components/public-v2";

import type { Route } from "./+types/privacy";

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Privacidad",
    "Información clara sobre los datos que Vecidya usa para operar cuentas, organizaciones y perfiles públicos.",
    "/privacidad",
  );
}

export default function Privacy() {
  return (
    <PublicLayout>
      <main className="public-page privacy-experience-page">
        <section className="privacy-experience-hero" aria-labelledby="privacy-title">
          <p className="eyebrow">PRIVACIDAD</p>
          <h1 id="privacy-title">Qué datos usa Vecidya y para qué.</h1>
          <p>Esta página explica en lenguaje claro qué información puede formar parte de la plataforma, qué se publica y cómo pedir revisión o corrección.</p>
          <div className="privacy-experience-hero__links">
            <a className="text-link" href="mailto:hola@vecidya.com?subject=Privacidad%20Vecidya">Consultar sobre privacidad <span aria-hidden="true">→</span></a>
            <Link className="text-link" to="/contacto">Ver contacto <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="privacy-data" aria-labelledby="privacy-data-title">
          <div className="privacy-section-heading">
            <p className="eyebrow">DATOS ACTUALES</p>
            <h2 id="privacy-data-title">La plataforma usa información necesaria para operar.</h2>
          </div>
          <div className="privacy-data-grid">
            <article><span>01</span><h3>Cuenta</h3><p>Nombre, correo, sesión y credenciales necesarias para registro, acceso y seguridad.</p></article>
            <article><span>02</span><h3>Organización</h3><p>Organizaciones, membresías, roles y permisos para separar el acceso de cada equipo.</p></article>
            <article><span>03</span><h3>Perfil público</h3><p>La organización decide qué nombre, categoría, ubicación, descripción y contacto publicar.</p></article>
            <article><span>04</span><h3>Correo externo</h3><p>Los enlaces email abren tu aplicación de correo; la web pública no almacena esos mensajes.</p></article>
            <article><span>05</span><h3>Diagnóstico</h3><p>No necesitas crear una cuenta: usamos un identificador aleatorio para que puedas continuar donde quedaste en el mismo navegador. Tus respuestas pueden conservarse temporalmente para eso, y el diagnóstico completo puede guardarse de forma estructurada para operar y mejorar el servicio. Si eliges "Guardar para después", te damos un código para continuar desde otro dispositivo; ese guardado puede conservarse más tiempo que el autoguardado temporal, y el código no es un cifrado de tus respuestas. Por defecto no te pedimos nombre, correo ni teléfono para nada de esto.</p></article>
          </div>
        </section>

        <section className="privacy-use" aria-labelledby="privacy-use-title">
          <div>
            <p className="eyebrow">USO Y CONTROL</p>
            <h2 id="privacy-use-title">Menos datos, más claridad y acceso responsable.</h2>
          </div>
          <div className="privacy-use__copy">
            <p>Vecidya debe pedir solo lo necesario para operar la cuenta, la organización o el perfil que la persona administra.</p>
            <p>Los controles de sesión, membresía y permisos ayudan a que cada persona vea y gestione solo lo que le corresponde.</p>
            <p>Si una función futura captura información desde un formulario propio, deberá explicar su finalidad, acceso, retención y eliminación antes de activarse.</p>
          </div>
        </section>

        <section className="privacy-boundaries" aria-labelledby="privacy-boundaries-title">
          <p className="eyebrow">LÍMITES ACTUALES</p>
          <h2 id="privacy-boundaries-title">Lo que no ocurre desde la web pública.</h2>
          <ul>
            <li>No hay formularios propios persistentes en las páginas públicas actuales.</li>
            <li>El diagnóstico no exige registro, nombre, correo ni teléfono para completarse.</li>
            <li>No se crean historiales comerciales internos desde estas páginas.</li>
            <li>No se venden datos personales ni se publican datos privados de organizaciones.</li>
          </ul>
        </section>

        <section className="privacy-rights" aria-labelledby="privacy-rights-title">
          <div>
            <p className="eyebrow">DERECHOS Y CONTACTO</p>
            <h2 id="privacy-rights-title">¿Necesitas revisar o corregir algo?</h2>
          </div>
          <p>Escribe a <a className="text-link" href="mailto:hola@vecidya.com">hola@vecidya.com</a> para consultar sobre información asociada a tu cuenta, organización o perfil público. El mensaje se envía mediante tu aplicación de correo.</p>
        </section>

        <CTASection
          actions={[{ label: "Contactar por privacidad", href: "mailto:hola@vecidya.com?subject=Privacidad%20Vecidya", variant: "primary" }, { label: "Volver al inicio", to: "/", variant: "secondary" }]}
          eyebrow="TRANSPARENCIA"
          title="La confianza también se construye explicando los límites."
        >
          <p>Si algo no está claro, pregúntanos antes de compartir más datos.</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
