import { PublicLayout, publicMeta } from "../components/public-layout";
import { publicAssets } from "../assets/public-assets";
import { CTASection, ServiceCard } from "../components/public-v2";

import type { Route } from "./+types/join";

export function meta(_: Route.MetaArgs) {
  return publicMeta("Únete", "Inicia un proceso con Vecidya cuando quieras ordenar la presencia digital de tu negocio, proyecto o perfil profesional.", "/unete");
}

export default function Join() {
  return (
    <PublicLayout>
      <main className="public-page public-commercial-page">
        <section className="public-commercial-hero public-commercial-hero--media">
          <div>
            <p className="eyebrow">ÚNETE</p>
            <h1>Elige cómo empezar según lo claro que tengas tu punto de partida.</h1>
            <p>Si todavía no sabes por dónde empezar, haz el diagnóstico. Si ya sabes qué quieres mejorar, habla con Vecidya y comparte tu contexto.</p>
            <div className="public-actions">
              <a className="button button--primary" href="/diagnostico">Hacer diagnóstico</a>
              <a className="button button--secondary" href="/contacto">Hablar con Vecidya</a>
            </div>
          </div>
          <img alt="Formulario de incorporación de negocio local en Vecidya" decoding="async" height={1086} src={publicAssets.illustrations.businessOnboardingForm} width={1448} />
        </section>

        <section className="public-commercial-section">
          <p className="eyebrow">RECORRIDO</p>
          <h2>Del punto de partida a una mejora con sentido.</h2>
          <ol className="public-commercial-steps">
            <li><span>01</span><strong>Entiende tu punto de partida</strong><p>Usa el diagnóstico o reúne el contexto básico de tu presencia actual.</p></li>
            <li><span>02</span><strong>Decide qué merece atención</strong><p>Identifica si el reto está en claridad, visibilidad, organización, formalización o seguimiento.</p></li>
            <li><span>03</span><strong>Habla con Vecidya si necesitas ayuda</strong><p>Comparte tu caso, enlaces actuales, ciudad o zona y la prioridad que quieres atender.</p></li>
            <li><span>04</span><strong>Construimos lo que tenga sentido</strong><p>No todo se hace a la vez; se elige el avance más útil y razonable.</p></li>
            <li><span>05</span><strong>Medimos y evolucionamos</strong><p>Cuando corresponda, se revisan resultados y próximos pasos sin promesas automáticas.</p></li>
          </ol>
        </section>

        <section className="public-commercial-grid join-choice-grid" aria-label="Formas de empezar">
          <ServiceCard eyebrow="NO SÉ QUÉ NECESITO" title="Empieza con diagnóstico">
            <p>Responde unas preguntas y recibe una lectura inmediata de tu presencia actual, sin guardar respuestas.</p>
          </ServiceCard>
          <ServiceCard eyebrow="YA SÉ QUÉ QUIERO" title="Habla con Vecidya">
            <p>Comparte contexto y prioridad por correo para revisar el siguiente paso con una persona.</p>
          </ServiceCard>
          <ServiceCard eyebrow="PREPARA" title="Qué enviar">
            <p>Nombre, actividad, ciudad o zona, enlaces actuales y una frase sobre lo que quieres mejorar.</p>
          </ServiceCard>
          <ServiceCard eyebrow="SEGURIDAD" title="Qué no pasa aquí">
            <p>Esta página no guarda solicitudes. El diagnóstico no persiste respuestas y el contacto sale por tu aplicación de email.</p>
          </ServiceCard>
        </section>

        <CTASection
          actions={[
            { label: "Hacer diagnóstico", to: "/diagnostico", variant: "primary" },
            { label: "Hablar con Vecidya", to: "/contacto", variant: "secondary" },
          ]}
          eyebrow="INICIO"
          title="No necesitas tener todo resuelto para empezar bien."
        >
          <p>El diagnóstico no guarda respuestas. Si decides escribirnos, el contacto se gestiona desde tu aplicación de email.</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
