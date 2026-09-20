import { PublicLayout, publicMeta } from "../components/public-layout";
import { publicAssets } from "../assets/public-assets";
import { CTASection, ServiceCard } from "../components/public-v2";

import type { Route } from "./+types/contact";

export function meta(_: Route.MetaArgs) {
  return publicMeta("Contacto", "Contacta con Vecidya para hacer una pregunta o conversar sobre presencia digital.", "/contacto");
}

export default function Contact() {
  return (
    <PublicLayout>
      <main className="public-page public-commercial-page">
        <section className="public-commercial-hero public-commercial-hero--media">
          <div>
            <p className="eyebrow">CONTACTO</p>
            <h1>Haz una pregunta o habla directamente con Vecidya.</h1>
            <p>Contacto es para conversar con una persona. Si todavía no sabes qué necesitas, el diagnóstico puede ayudarte antes de escribir.</p>
            <div className="public-actions">
              <a className="button button--primary" href="mailto:hola@vecidya.com">Escribir a hola@vecidya.com</a>
              <a className="button button--secondary" href="/diagnostico">Hacer diagnóstico</a>
            </div>
          </div>
          <img alt="Conversación móvil entre una persona y un negocio local en Vecidya" decoding="async" height={1086} src={publicAssets.illustrations.mobileCustomerChat} width={1448} />
        </section>

        <section className="public-commercial-grid contact-signal-grid">
          <ServiceCard eyebrow="CANAL REAL" title="Email">
            <p><a className="text-link" href="mailto:hola@vecidya.com">hola@vecidya.com</a></p>
            <p>Escríbenos con una pregunta concreta o una breve descripción de tu caso.</p>
          </ServiceCard>
          <ServiceCard eyebrow="QUÉ ENVIAR" title="Contexto útil">
            <p>Nombre, actividad, ciudad o zona, qué quieres mejorar y enlaces actuales si existen.</p>
          </ServiceCard>
          <ServiceCard eyebrow="QUÉ ESPERAR" title="Orientación inicial">
            <p>Una respuesta orientada a entender el punto de partida y el siguiente paso razonable.</p>
          </ServiceCard>
          <ServiceCard eyebrow="PRIVACIDAD" title="Sin formulario">
            <p>Esta página no almacena datos. La información se gestiona desde tu aplicación de email.</p>
          </ServiceCard>
        </section>

        <CTASection
          actions={[
            { label: "Enviar correo", href: "mailto:hola@vecidya.com", variant: "primary" },
            { label: "Hacer diagnóstico", to: "/diagnostico", variant: "secondary" },
          ]}
          eyebrow="CONVERSACIÓN"
          title="Una pregunta concreta también es un buen comienzo."
        >
          <p>Actualmente el canal directo de contacto es el correo electrónico.</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
