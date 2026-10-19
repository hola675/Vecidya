import { Link } from "react-router";

import { LegalContact, LegalPageIntro } from "../components/legal-page";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { Route } from "./+types/privacy";

const sections = [
  { id: "en-breve", label: "Lo esencial" },
  { id: "informacion", label: "Qué información" },
  { id: "diagnostico", label: "Tu diagnóstico" },
  { id: "control", label: "Tus derechos" },
  { id: "contacto-legal", label: "Consultas" },
] as const;

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Privacidad y tratamiento de datos",
    "Conoce qué información usa Vecidya, qué eliges publicar y cómo ejercer tus derechos, explicado de forma sencilla.",
    "/privacidad",
  );
}

export default function Privacy() {
  return (
    <PublicLayout>
      <main className="public-page legal-page">
        <LegalPageIntro
          description="Tus datos hablan de ti y de tu negocio. Mereces saber qué compartes, qué puede hacerse público y qué opciones tienes para mantener el control."
          eyebrow="PRIVACIDAD SIN COMPLICACIONES"
          kind="privacy"
          sections={sections}
          title="Tus datos merecen claridad."
        />

        <section aria-labelledby="privacy-brief-title" className="legal-section" id="en-breve">
          <div className="legal-section__heading">
            <p className="eyebrow">EMPIEZA AQUÍ</p>
            <h2 id="privacy-brief-title">Cuatro ideas para navegar con confianza.</h2>
            <p>No hace falta conocer términos legales para tomar buenas decisiones sobre tu información.</p>
          </div>
          <div className="legal-cards legal-cards--four">
            <article className="legal-info-card">
              <span aria-hidden="true">01</span>
              <h3>Comparte lo necesario</h3>
              <p>Si algo no es imprescindible para tu consulta o perfil, piensa si realmente necesitas incluirlo.</p>
            </article>
            <article className="legal-info-card">
              <span aria-hidden="true">02</span>
              <h3>Decide qué mostrar</h3>
              <p>Un perfil publicado puede ser visto por cualquier visitante. Revísalo antes de hacerlo visible.</p>
            </article>
            <article className="legal-info-card">
              <span aria-hidden="true">03</span>
              <h3>Cuida tus accesos</h3>
              <p>Tu contraseña y los enlaces de verificación son personales. No los compartas por mensajes.</p>
            </article>
            <article className="legal-info-card">
              <span aria-hidden="true">04</span>
              <h3>Pregunta y solicita cambios</h3>
              <p>Puedes escribirnos para conocer, actualizar, corregir o solicitar la eliminación de información que te corresponda.</p>
            </article>
          </div>
        </section>

        <section aria-labelledby="privacy-info-title" className="legal-section" id="informacion">
          <div className="legal-section__heading">
            <p className="eyebrow">QUÉ INFORMACIÓN INTERVIENE</p>
            <h2 id="privacy-info-title">No es lo mismo tener una cuenta que publicar un perfil.</h2>
            <p>Cada espacio tiene una finalidad distinta. Esto es lo que necesitas saber cuando lo utilizas.</p>
          </div>
          <div className="legal-topic-grid">
            <article className="legal-topic">
              <div className="legal-topic__tag">Acceso personal</div>
              <h3>Tu cuenta</h3>
              <p>El nombre, correo y credenciales permiten crear tu acceso, comprobar que eres tú y comunicarte avisos de seguridad, como verificaciones o recuperación de contraseña.</p>
              <p className="legal-topic__note">La contraseña no forma parte del perfil público.</p>
            </article>
            <article className="legal-topic">
              <div className="legal-topic__tag">Trabajo compartido</div>
              <h3>Tu organización y equipo</h3>
              <p>La información de la organización, sus miembros y sus funciones permite organizar quién puede consultar o modificar cada espacio de trabajo.</p>
              <p className="legal-topic__note">Tener acceso a una organización no significa ser su propietario.</p>
            </article>
            <article className="legal-topic">
              <div className="legal-topic__tag">Visible para todos</div>
              <h3>Tu perfil en el Vecindario</h3>
              <p>Si decides publicarlo, podrán verse los datos comerciales que incluyas: nombre, actividad, descripción, ubicación y medios de contacto, según la configuración del perfil.</p>
              <p className="legal-topic__note">Antes de publicar, comprueba que tienes autorización para mostrar datos de otras personas.</p>
            </article>
            <article className="legal-topic">
              <div className="legal-topic__tag">Conversación directa</div>
              <h3>Cuando nos escribes</h3>
              <p>Los enlaces de correo o WhatsApp te llevan al canal que elijas. Comparte únicamente el contexto necesario y ten presente que ese servicio también tiene sus propias condiciones de privacidad.</p>
              <p className="legal-topic__note">La página de contacto no tiene un formulario propio de recepción de mensajes.</p>
            </article>
          </div>
        </section>

        <section aria-labelledby="privacy-diagnostic-title" className="legal-highlight" id="diagnostico">
          <div className="legal-highlight__intro">
            <p className="eyebrow">DIAGNÓSTICO VECIDYA</p>
            <h2 id="privacy-diagnostic-title">Explora tu situación sin crear una cuenta.</h2>
            <p>El diagnóstico público está pensado para orientarte. Puedes responder sin indicar tu nombre, correo electrónico ni teléfono.</p>
            <Link className="button button--secondary" to="/diagnostico">Conocer el diagnóstico</Link>
          </div>
          <div className="legal-highlight__steps">
            <div><strong>Mientras avanzas</strong><p>Tus respuestas se conservan en este navegador para que puedas continuar si recargas la página.</p></div>
            <div><strong>Si dejas de utilizarlo</strong><p>Ese progreso se elimina tras 14 días sin actividad o antes si decides empezar de nuevo.</p></div>
            <div><strong>Al terminar</strong><p>Se calcula un resumen anónimo de las respuestas. El flujo público no guarda esas respuestas en el servidor ni ofrece todavía acceso al informe personalizado completo.</p></div>
            <div><strong>Si cambias de dispositivo</strong><p>El progreso de este flujo no se recupera mediante un código desde otro navegador.</p></div>
          </div>
        </section>

        <section aria-labelledby="privacy-rights-title" className="legal-section" id="control">
          <div className="legal-section__heading">
            <p className="eyebrow">TÚ TIENES VOZ</p>
            <h2 id="privacy-rights-title">Conocer tus opciones es parte de cuidar tu privacidad.</h2>
            <p>Hay solicitudes que puedes hacernos sobre la información personal que te pertenece. Su atención dependerá de la identidad acreditada y de las reglas legales que correspondan.</p>
          </div>
          <div className="legal-rights-grid">
            <article><h3>Conocer</h3><p>Pregúntanos qué información personal tuya tenemos y para qué se utiliza.</p></article>
            <article><h3>Corregir o actualizar</h3><p>Si un dato es incorrecto o ha cambiado, puedes solicitar que se revise.</p></article>
            <article><h3>Solicitar eliminación</h3><p>Puedes pedir que se suprima información personal, cuando proceda conforme a las obligaciones aplicables.</p></article>
            <article><h3>Consultar autorizaciones</h3><p>Si una finalidad requiere tu autorización, puedes consultar tus opciones y solicitar su revocación cuando corresponda.</p></article>
          </div>
          <div className="legal-inline-note">
            <strong>¿Durante cuánto tiempo?</strong>
            <p>El plazo depende del tipo de información y de las obligaciones asociadas. Si necesitas saber qué se conserva sobre ti o solicitar su eliminación, escríbenos. No compartas contraseñas ni enlaces de acceso al hacerlo.</p>
          </div>
        </section>

        <LegalContact
          description="Puedes consultar sobre la información de tu cuenta, organización o perfil, pedir una corrección o plantear una duda sobre privacidad. Describe la solicitud sin enviar contraseñas, códigos ni datos sensibles innecesarios."
          title="Si algo no está claro, conversemos."
        />
      </main>
    </PublicLayout>
  );
}
