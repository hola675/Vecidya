import { commercialWhatsAppUrl, PublicLayout, publicMeta, whatsAppChannelUrl } from "../components/public-layout";
import { publicAssets } from "../assets/public-assets";
import { CTASection } from "../components/public-v2";
import { PUBLIC_ACTION_LABELS } from "../content/public-copy";

import type { Route } from "./+types/contact";

const contactMailto = "mailto:hola@vecidya.com";

export function meta(_: Route.MetaArgs) {
  return publicMeta("Contacto", "Cómo contactar con Vecidya para hacer una pregunta o conversar sobre tu siguiente paso.", "/contacto");
}

export default function Contact() {
  return (
    <PublicLayout>
      <main className="public-page contact-experience-page">
        <section className="contact-experience-hero" aria-labelledby="contact-title">
          <p className="eyebrow">CONTACTO</p>
          <h1 id="contact-title">Hablemos de lo que estás intentando resolver.</h1>
          <p>Cuéntanos tu contexto y te orientamos sobre el siguiente paso apropiado. El canal directo disponible hoy es el correo electrónico.</p>
          <div className="public-actions">
            <a className="button button--primary" href={contactMailto}>Escribir a hola@vecidya.com</a>
            <a className="button button--secondary" href={commercialWhatsAppUrl} rel="noreferrer" target="_blank">
              <img alt="" height={20} src={publicAssets.icons.whatsapp} width={20} />
              Escribir por WhatsApp
            </a>
          </div>
        </section>

        <section className="contact-channel" aria-labelledby="contact-channel-title">
          <div>
            <p className="eyebrow">CANALES DIRECTOS</p>
            <h2 id="contact-channel-title">Habla con Vecidya</h2>
            <p>Elige el canal que te resulte más cómodo para compartir una pregunta o una breve descripción de tu caso.</p>
          </div>
          <div className="contact-channel__actions">
            <a className="contact-channel__email" href={contactMailto}>hola@vecidya.com</a>
            <a className="button button--secondary contact-community__link" href={commercialWhatsAppUrl} rel="noreferrer" target="_blank">
              <img alt="" height={20} src={publicAssets.icons.whatsapp} width={20} />
              WhatsApp directo
            </a>
          </div>
        </section>

        <section className="contact-community" aria-labelledby="contact-community-title">
          <div>
            <p className="eyebrow">CANAL DE WHATSAPP</p>
            <h2 id="contact-community-title">Sigue a Vecidya en WhatsApp.</h2>
            <p>Recibe novedades, aprendizajes y avisos de Vecidya en nuestro canal oficial. Es un canal de difusión: para escribirnos usa el WhatsApp directo o el correo.</p>
          </div>
          <a className="button button--secondary contact-community__link" href={whatsAppChannelUrl} rel="noreferrer" target="_blank">
            <img alt="" height={20} src={publicAssets.icons.whatsapp} width={20} />
            Seguir el canal
          </a>
        </section>

        <section className="contact-guidance" aria-labelledby="contact-guidance-title">
          <div className="contact-section-heading">
            <p className="eyebrow">PARA AYUDARNOS A ENTENDER</p>
            <h2 id="contact-guidance-title">Un poco de contexto es suficiente.</h2>
          </div>
          <div className="contact-guidance-grid">
            <article>
              <span>01</span>
              <h3>Quién eres</h3>
              <p>Tu nombre y el nombre de tu negocio, proyecto o perfil.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Qué quieres resolver</h3>
              <p>La situación concreta que quieres ordenar o mejorar.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Qué tienes hoy</h3>
              <p>Un enlace relevante, ciudad o zona si ayuda a entender el caso.</p>
            </article>
          </div>
        </section>

        <section className="contact-expectations" aria-labelledby="contact-expectations-title">
          <div>
            <p className="eyebrow">QUÉ ESPERAR</p>
            <h2 id="contact-expectations-title">Una conversación situada en tu realidad.</h2>
          </div>
          <p>Revisaremos el contexto y responderemos con el siguiente paso apropiado. No hay un formulario propio ni un sistema de tickets detrás de esta página: el mensaje se envía mediante tu aplicación de correo.</p>
        </section>

        <section className="contact-boundaries" aria-labelledby="contact-boundaries-title">
          <div>
            <p className="eyebrow">SI AÚN NO SABES</p>
            <h2 id="contact-boundaries-title">Empieza por ubicar tu punto de partida.</h2>
          </div>
          <div className="public-actions">
            <a className="button button--secondary" href="/diagnostico">{PUBLIC_ACTION_LABELS.diagnostic}</a>
            <a className="text-link" href="/privacidad">Ver privacidad <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <CTASection actions={[{ label: "Enviar correo", href: contactMailto, variant: "primary" }]} eyebrow="CONVERSACIÓN" title="Una pregunta concreta también es un buen comienzo.">
          <p>Actualmente, el correo electrónico es el canal directo para hablar con Vecidya.</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
