import { Link } from "react-router";

import { LegalContact, LegalPageIntro } from "../components/legal-page";
import { PublicLayout, publicMeta } from "../components/public-layout";

import type { Route } from "./+types/terms";

const sections = [
  { id: "uso", label: "Cómo usar Vecidya" },
  { id: "publicaciones", label: "Lo que compartes" },
  { id: "orientacion", label: "Diagnóstico y servicios" },
  { id: "responsabilidad", label: "Buenas prácticas" },
  { id: "consultas", label: "Preguntas frecuentes" },
  { id: "contacto-legal", label: "Contacto" },
] as const;

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Condiciones de uso",
    "Conoce las reglas básicas para participar en Vecidya, publicar tu negocio y utilizar sus recursos con responsabilidad.",
    "/terminos",
  );
}

export default function Terms() {
  return (
    <PublicLayout>
      <main className="public-page legal-page">
        <LegalPageIntro
          description="Queremos que conozcas qué puedes esperar del sitio y qué responsabilidades acompañan el uso de tu cuenta, tu perfil y el contenido que compartes."
          eyebrow="CONDICIONES EN LENGUAJE CLARO"
          kind="terms"
          sections={sections}
          title="Una comunidad se cuida entre todos."
        />

        <section aria-labelledby="terms-overview-title" className="legal-section" id="uso">
          <div className="legal-section__heading">
            <p className="eyebrow">PRIMERO, LO IMPORTANTE</p>
            <h2 id="terms-overview-title">Vecidya tiene espacios públicos y espacios privados.</h2>
            <p>Puedes explorar el Vecindario, Aprende y el Diagnóstico público sin registrarte. Para gestionar una organización y colaborar en su cuenta, necesitas el acceso correspondiente.</p>
          </div>
          <div className="legal-cards legal-cards--three">
            <article className="legal-info-card">
              <span aria-hidden="true">01</span>
              <h3>Explorar</h3>
              <p>Consulta información pública y recursos de orientación. Úsalos para entender opciones, no como garantía de resultados.</p>
            </article>
            <article className="legal-info-card">
              <span aria-hidden="true">02</span>
              <h3>Colaborar</h3>
              <p>El acceso a una organización depende de una invitación y de los permisos asignados. No todas las personas pueden realizar las mismas acciones.</p>
            </article>
            <article className="legal-info-card">
              <span aria-hidden="true">03</span>
              <h3>Publicar</h3>
              <p>Si administras un perfil, verifica que su información sea correcta y que tengas derecho a compartirla.</p>
            </article>
          </div>
        </section>

        <section aria-labelledby="terms-content-title" className="legal-section" id="publicaciones">
          <div className="legal-section__heading">
            <p className="eyebrow">TU PRESENCIA PÚBLICA</p>
            <h2 id="terms-content-title">Publica información útil, verdadera y autorizada.</h2>
            <p>Lo que aparece en el Vecindario puede ser consultado por visitantes. Cuida la precisión de cada dato antes y después de publicarlo.</p>
          </div>
          <div className="legal-duo">
            <article className="legal-duo__panel">
              <h3>Lo que te corresponde hacer</h3>
              <ul>
                <li>Mantener actualizados los datos de tu negocio o actividad.</li>
                <li>Usar nombres, imágenes y marcas que tengas derecho a utilizar.</li>
                <li>Evitar publicar información privada de otras personas sin autorización.</li>
                <li>Respetar a los demás miembros y visitantes de la comunidad.</li>
              </ul>
            </article>
            <article className="legal-duo__panel legal-duo__panel--soft">
              <h3>Antes de pulsar «Publicar»</h3>
              <p>Piensa en la persona que te encontrará: ¿podrá comprender qué haces, dónde atiendes y cómo contactarte sin recibir información confusa?</p>
              <p>Revisa también que el número de teléfono, dirección o contacto mostrado pueda compartirse públicamente.</p>
              <Link className="text-link" to="/privacidad">Aprende a cuidar tus datos <span aria-hidden="true">→</span></Link>
            </article>
          </div>
        </section>

        <section aria-labelledby="terms-guidance-title" className="legal-highlight" id="orientacion">
          <div className="legal-highlight__intro">
            <p className="eyebrow">ORIENTACIÓN Y CONTRATACIÓN</p>
            <h2 id="terms-guidance-title">Una recomendación no es una promesa.</h2>
            <p>El Diagnóstico ayuda a comprender una situación y explorar próximos pasos según las respuestas proporcionadas. No garantiza ventas, posicionamiento, resultados comerciales ni reemplaza la asesoría especializada que requiera tu caso.</p>
            <Link className="button button--secondary" to="/diagnostico">Explorar el Diagnóstico</Link>
          </div>
          <div className="legal-highlight__steps">
            <div><strong>Diagnóstico</strong><p>Sus resultados son orientativos y dependen de la información disponible. No son una certificación del negocio.</p></div>
            <div><strong>Licencias</strong><p>Las páginas de licencias describen las opciones de Vecidya. Antes de contratar, confirma las características y condiciones concretas del servicio elegido.</p></div>
            <div><strong>Servicios personalizados</strong><p>Las propuestas, alcances, precios y compromisos particulares deben quedar claros mediante la comunicación o acuerdo correspondiente.</p></div>
            <div><strong>Plataformas externas</strong><p>Si decides utilizar herramientas de terceros, sus servicios y condiciones son independientes de los espacios propios de Vecidya.</p></div>
          </div>
        </section>

        <section aria-labelledby="terms-care-title" className="legal-section" id="responsabilidad">
          <div className="legal-section__heading">
            <p className="eyebrow">CONVIVENCIA Y SEGURIDAD</p>
            <h2 id="terms-care-title">Buenas prácticas para participar con responsabilidad.</h2>
          </div>
          <div className="legal-rights-grid">
            <article><h3>Protege tu cuenta</h3><p>No compartas contraseñas ni enlaces de acceso. Comunícanos cualquier problema que afecte la seguridad de tu cuenta.</p></article>
            <article><h3>Respeta a otras personas</h3><p>No publiques contenido que suplante identidades, engañe a visitantes o vulnere los derechos de terceros.</p></article>
            <article><h3>Comprueba la información</h3><p>Los recursos educativos pueden necesitar actualización. Antes de tomar decisiones importantes, verifica lo aplicable a tu situación.</p></article>
            <article><h3>Pregunta antes de contratar</h3><p>Si un precio, alcance o condición no está claro, solicítanos una explicación antes de asumir un compromiso.</p></article>
          </div>
        </section>

        <section aria-labelledby="terms-questions-title" className="legal-section" id="consultas">
          <div className="legal-section__heading">
            <p className="eyebrow">RESPUESTAS DIRECTAS</p>
            <h2 id="terms-questions-title">Preguntas que conviene resolver antes de avanzar.</h2>
          </div>
          <div className="legal-faq">
            <details>
              <summary>¿Necesito pagar para explorar Vecidya?</summary>
              <p>Puedes consultar las páginas públicas, el Vecindario, Aprende y el Diagnóstico público sin contratar una licencia. Los servicios y licencias tienen sus propias condiciones.</p>
            </details>
            <details>
              <summary>¿Mi perfil se publica automáticamente?</summary>
              <p>El perfil del negocio distingue entre edición y publicación. Antes de compartirlo, revisa la información y utiliza los controles correspondientes de tu cuenta.</p>
            </details>
            <details>
              <summary>¿Lo que recomienda el Diagnóstico es obligatorio?</summary>
              <p>No. Sus sugerencias sirven para orientarte. Puedes decidir qué pasos encajan con tus objetivos y recursos.</p>
            </details>
            <details>
              <summary>¿Dónde puedo consultar mis derechos sobre datos personales?</summary>
              <p>En <Link to="/privacidad">Privacidad y tratamiento de datos</Link> encontrarás una explicación de qué información interviene y cómo enviarnos tus solicitudes.</p>
            </details>
          </div>
          <div className="legal-inline-note">
            <strong>Sobre estos términos</strong>
            <p>Esta página explica las pautas generales de uso del sitio. No sustituye los acuerdos particulares que correspondan a una licencia, servicio o contratación específica, ni limita los derechos que te reconozca la normativa aplicable.</p>
          </div>
        </section>

        <LegalContact
          description="Si tienes dudas sobre la publicación de un perfil, el uso de Vecidya, una licencia o un servicio concreto, consulta antes de compartir información o asumir compromisos."
          title="Las condiciones se entienden mejor conversando."
        />
      </main>
    </PublicLayout>
  );
}
