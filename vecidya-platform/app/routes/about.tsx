import { Link } from "react-router";

import { publicAssets } from "../assets/public-assets";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { CTASection } from "../components/public-v2";
import { PUBLIC_ACTION_LABELS } from "../content/public-copy";

import type { Route } from "./+types/about";

export function meta(_: Route.MetaArgs) {
  return publicMeta(
    "Sobre nosotros",
    "Conoce la misión, el equipo y el acompañamiento de Vecidya para impulsar la presencia digital y el uso responsable de las TIC.",
    "/sobre-nosotros",
  );
}

export default function About() {
  return (
    <PublicLayout>
      <main className="public-page about-experience-page">
        <section className="about-experience-hero" aria-labelledby="about-title">
          <div>
            <p className="eyebrow">SOBRE VECIDYA</p>
            <h1 id="about-title">Acompañamos el desarrollo digital de negocios y organizaciones.</h1>
            <p>Impulsamos la presencia digital y el aprovechamiento responsable de las Tecnologías de la Información y las Comunicaciones (TIC) en negocios y organizaciones.</p>
            <div className="public-actions">
              <a className="button button--primary" href="#por-que">Conoce cómo ayudamos</a>
              <Link className="button button--secondary" to="/diagnostico">{PUBLIC_ACTION_LABELS.diagnostic}</Link>
            </div>
          </div>
          <figure className="about-experience-hero__photo">
            <picture>
              <source media="(max-width: 768px)" srcSet={publicAssets.about.teamMobile} />
              <img alt="Yoan y Edgar juntos frente al símbolo de Vecidya" decoding="async" height={1080} src={publicAssets.about.team} width={1440} />
            </picture>
            <figcaption>Dos perspectivas. Un mismo punto de partida: entender antes de construir.</figcaption>
          </figure>
        </section>

        <section className="about-origin" id="por-que" aria-labelledby="about-origin-title">
          <div className="about-section-heading">
            <p className="eyebrow">POR QUÉ NACE VECIDYA</p>
            <h2 id="about-origin-title">La tecnología debe ser una oportunidad de desarrollo, no una barrera.</h2>
          </div>
          <div className="about-origin__copy">
            <p>Muchos negocios y organizaciones necesitan fortalecer su presencia digital, organizar su información y comprender cómo aprovechar las herramientas tecnológicas disponibles.</p>
            <p>Vecidya busca acompañar ese proceso con orientación, aprendizaje y soluciones prácticas, fomentando un uso consciente, seguro y útil de las TIC.</p>
          </div>
        </section>

        <section className="about-practice" aria-labelledby="about-mission-title">
          <div className="about-section-heading">
            <p className="eyebrow">NUESTRA MISIÓN</p>
            <h2 id="about-mission-title">Aprender, adoptar y aprovechar la tecnología con propósito.</h2>
            <p>Acompañamos a negocios, emprendedores y organizaciones en el desarrollo de su presencia digital y en el uso de las TIC para fortalecer sus capacidades y contribuir a su desarrollo económico, social y organizacional.</p>
          </div>
          <div className="about-practice-grid">
            <article><span>01</span><h3>Presencia digital</h3><p>Construir una identidad clara, información útil y canales accesibles para conectar con las personas.</p></article>
            <article><span>02</span><h3>Educación y cultura digital</h3><p>Fomentar el conocimiento y el uso responsable, seguro y estratégico de las TIC.</p></article>
            <article><span>03</span><h3>Desarrollo organizacional</h3><p>Promover herramientas y procesos digitales que respondan a necesidades reales.</p></article>
          </div>
        </section>

        <section className="about-team" aria-labelledby="about-team-title">
          <div className="about-section-heading">
            <p className="eyebrow">LAS PERSONAS DETRÁS</p>
            <h2 id="about-team-title">Tecnología y desarrollo empresarial en la misma conversación.</h2>
          </div>
          <div className="about-team-grid">
            <article className="about-person-card">
              <img alt="Yoan Ortiz" decoding="async" height={1402} loading="lazy" src={publicAssets.about.yoan} width={1122} />
              <div>
                <p className="eyebrow">TECNOLOGÍA · PRODUCTO</p>
                <h3>Yoan Ortiz</h3>
                <strong>CEO &amp; Líder de Soporte Técnico</strong>
                <p>Responsable de la visión técnica de Vecidya: construir sistemas, herramientas y experiencias digitales que ayuden a los negocios a avanzar con una base sólida.</p>
              </div>
            </article>
            <article className="about-person-card">
              <img alt="Edgar Betin" decoding="async" height={1402} loading="lazy" src={publicAssets.about.edgar} width={1122} />
              <div>
                <p className="eyebrow">CLIENTES · DESARROLLO</p>
                <h3>Edgar Betin</h3>
                <strong>Director Comercial</strong>
                <p>Conecta las necesidades de cada negocio con soluciones prácticas, acompañando la conversación desde el primer contexto hasta el siguiente paso.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="about-practice" aria-labelledby="about-practice-title">
          <div className="about-section-heading">
            <p className="eyebrow">CÓMO TRABAJAMOS</p>
            <h2 id="about-practice-title">Nuestros valores se notan en lo que hacemos.</h2>
          </div>
          <div className="about-practice-grid">
            <article><span>01</span><h3>Entender primero</h3><p>Antes de construir, buscamos entender dónde está el negocio y qué necesita realmente.</p></article>
            <article><span>02</span><h3>Construir con propósito</h3><p>Creamos soluciones útiles y evitamos herramientas innecesarias o complejidad que no aporte.</p></article>
            <article><span>03</span><h3>Acompañar el proceso</h3><p>No entregamos solamente tecnología; ayudamos a que las personas puedan utilizarla y aprovecharla.</p></article>
          </div>
        </section>

        <section className="about-point-of-view" aria-labelledby="about-point-title">
          <div>
            <p className="eyebrow">NUESTRA FORMA DE VER EL DIGITAL</p>
            <h2 id="about-point-title">Un negocio no necesita estar en todos lados. Necesita estar bien organizado donde sus clientes lo buscan.</h2>
          </div>
          <ul>
            <li>Identidad clara</li>
            <li>Presencia digital</li>
            <li>Información organizada</li>
            <li>Conexiones útiles</li>
          </ul>
        </section>

        <section className="about-origin" aria-labelledby="about-identity-title">
          <div className="about-section-heading">
            <p className="eyebrow">NUESTRA IDENTIDAD</p>
            <h2 id="about-identity-title">Vecidya, una identidad digital con propósito.</h2>
          </div>
          <div className="about-origin__copy">
            <p>Vecidya es el nombre con el que presentamos nuestra plataforma y comunidad de acompañamiento digital dirigida a negocios, profesionales y organizaciones de habla hispana.</p>
            <p>Los datos de identificación jurídica y registral están pendientes de confirmación. Para consultas comerciales y legales, visita nuestra <Link to="/informacion-legal">información legal y comercial</Link>.</p>
          </div>
        </section>

        <CTASection
          actions={[{ label: PUBLIC_ACTION_LABELS.diagnostic, to: "/diagnostico", variant: "primary" }, { label: "Hablar con Vecidya", to: "/contacto", variant: "secondary" }]}
          eyebrow="SIGUIENTE PASO"
          title="¿Quieres ubicar lo que tu negocio necesita ahora?"
        >
          <p>Empieza por el diagnóstico si necesitas orientación. Si ya tienes claro el reto, escríbenos directamente.</p>
        </CTASection>
      </main>
    </PublicLayout>
  );
}
