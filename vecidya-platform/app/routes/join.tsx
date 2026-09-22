import { PublicLayout, publicMeta } from "../components/public-layout";
import { publicAssets } from "../assets/public-assets";
import { CTASection } from "../components/public-v2";

import type { Route } from "./+types/join";

export function meta(_: Route.MetaArgs) {
  return publicMeta("Únete", "Cómo empezar con Vecidya según lo claro que tengas tu punto de partida.", "/unete");
}

export default function Join() {
  return (
    <PublicLayout>
      <main className="public-page join-experience-page">
        <section className="join-experience-hero" aria-labelledby="join-title">
          <div>
            <p className="eyebrow">ÚNETE</p>
            <h1 id="join-title">Empieza por el siguiente paso que sí tienes claro.</h1>
            <p>No necesitas tener todo resuelto. Elige la entrada que mejor describe dónde estás hoy.</p>
            <div className="public-actions">
              <a className="button button--primary" href="/diagnostico">Hacer diagnóstico</a>
              <a className="button button--secondary" href="/contacto">Hablar con Vecidya</a>
            </div>
          </div>
          <div className="join-experience-hero__visual">
            <img alt="" aria-hidden="true" decoding="async" height={1086} src={publicAssets.illustrations.businessOnboardingForm} width={1448} />
            <span>Un comienzo claro</span>
          </div>
        </section>

        <section className="join-decision" aria-labelledby="join-decision-title">
          <div className="join-section-heading">
            <p className="eyebrow">¿CÓMO QUIERES EMPEZAR?</p>
            <h2 id="join-decision-title">Dos entradas. Una conversación con sentido.</h2>
          </div>
          <div className="join-decision-grid">
            <article className="join-decision-card join-decision-card--diagnostic">
              <span className="join-decision-card__number" aria-hidden="true">01</span>
              <p className="eyebrow">NO ESTOY SEGURO</p>
              <h3>Empieza con diagnóstico</h3>
              <p>Responde unas preguntas y recibe una orientación inicial sobre tu punto de partida.</p>
              <a className="text-link" href="/diagnostico">Hacer diagnóstico <span aria-hidden="true">→</span></a>
            </article>
            <article className="join-decision-card join-decision-card--contact">
              <span className="join-decision-card__number" aria-hidden="true">02</span>
              <p className="eyebrow">SÉ QUÉ NECESITO</p>
              <h3>Habla con Vecidya</h3>
              <p>Cuéntanos tu caso, tu prioridad y lo que ya tienes para revisar el siguiente paso.</p>
              <a className="text-link" href="/contacto">Hablar con Vecidya <span aria-hidden="true">→</span></a>
            </article>
          </div>
        </section>

        <section className="join-preparation" aria-labelledby="join-preparation-title">
          <div className="join-section-heading">
            <p className="eyebrow">PARA PREPARARTE</p>
            <h2 id="join-preparation-title">Llega con lo esencial.</h2>
          </div>
          <ul>
            <li>Nombre del negocio, proyecto o perfil.</li>
            <li>Qué haces y para quién.</li>
            <li>Qué quieres mejorar primero.</li>
            <li>Qué tienes hoy: web, perfiles o canales.</li>
            <li>Cómo prefieres continuar la conversación.</li>
          </ul>
        </section>

        <section className="join-next-steps" aria-labelledby="join-next-steps-title">
          <div className="join-section-heading">
            <p className="eyebrow">DESPUÉS</p>
            <h2 id="join-next-steps-title">El siguiente paso se define contigo.</h2>
          </div>
          <ol>
            <li><strong>Revisamos tu punto de partida</strong><span>Qué existe, qué falta y qué está disperso.</span></li>
            <li><strong>Aclaramos qué necesitas</strong><span>Priorizamos antes de sumar canales o herramientas.</span></li>
            <li><strong>Definimos un avance razonable</strong><span>Sin hacer promesas ni construir más de lo necesario.</span></li>
          </ol>
        </section>

        <CTASection
          actions={[{ label: "Hacer diagnóstico", to: "/diagnostico", variant: "primary" }, { label: "Hablar con Vecidya", to: "/contacto", variant: "secondary" }]}
          eyebrow="PRIMER PASO"
          title="No necesitas llegar con todo resuelto."
        >
          <p>Si aún estás ubicando tu necesidad, empieza por el diagnóstico. Si ya tienes una pregunta, escríbenos.</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
