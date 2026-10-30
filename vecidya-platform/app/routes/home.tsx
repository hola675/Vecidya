import { Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { listPublishedBusinessProfiles } from "../../db/queries/business-profile.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { publicAssets } from "../assets/public-assets";
import { BusinessCardV2, CTASection, DiagnosticChoice, JsonLd, ServiceCard } from "../components/public-v2";
import { JourneyGuide } from "../components/experience-system";
import { PublicLayout, publicMeta, whatsAppChannelUrl } from "../components/public-layout";
import { PUBLIC_ACTION_LABELS } from "../content/public-copy";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return publicMeta("Vecidya", "Explora negocios reales, entiende tu punto de partida y ordena tu presencia digital.", "/");
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const { origin } = new URL(request.url);
  const database = createDatabase(env.DB);
  const publishedProfiles = await listPublishedBusinessProfiles(database);

  return { origin, profiles: publishedProfiles.slice(0, 3) };
}

const diagnosticChoices = [
  { icon: publicAssets.icons.diagnosticBusiness, label: "Negocio", description: "Una actividad comercial", profile: "business" },
  { icon: publicAssets.icons.diagnosticProfessional, label: "Profesional", description: "Tu trabajo y experiencia", profile: "professional" },
  { icon: publicAssets.icons.diagnosticProject, label: "Proyecto", description: "Una idea en construcción", profile: "project" },
  { icon: publicAssets.icons.diagnosticCreator, label: "Artista o creador de contenido", description: "Una voz o trabajo creativo", profile: "creator" },
] as const;

export default function Home() {
  const { origin, profiles } = useLoaderData<typeof loader>();
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vecidya",
    url: origin,
    logo: `${origin}/brand/vecidya-icon-3d.png`,
    description: "Plataforma para explorar negocios reales y ordenar la presencia digital.",
    sameAs: [whatsAppChannelUrl],
  };

  return (
    <PublicLayout>
      <main className="public-home">
        <JsonLd data={organizationSchema} />

          <section aria-labelledby="home-hero-title" className="public-home-hero">
            <div className="public-home-hero__copy">
              <p className="eyebrow">VECINDARIO DIGITAL</p>
              <h1 id="home-hero-title">Haz clara tu presencia.</h1>
              <p>Entiende dónde estás y decide qué ordenar primero.</p>
              <div className="public-actions">
                <Link className="button button--primary" to="/diagnostico">{PUBLIC_ACTION_LABELS.diagnostic}</Link>
                <Link className="button button--secondary" to="/vecindario">Explorar el Vecindario</Link>
              </div>
            </div>
            <div className="home-hero-visual">
              <div aria-hidden="true" className="home-hero-visual__glow" />
              <img alt="Visualización de Presencia Digital, CRM, Vecindario, Diagnóstico y Aprende." className="home-hero-visual__product" decoding="async" height={1024} src={publicAssets.illustrations.homeVecidyaCompanion} width={1536} />
              <img alt="Vico, la mascota de Vecidya, da la bienvenida." className="home-hero-visual__vico" decoding="async" height={1536} src={publicAssets.illustrations.vicoHome} width={1024} />
              <img alt="Logotipo de Vecidya" className="home-hero-visual__brand" decoding="async" height={1254} src={publicAssets.brand.symbol3d} width={1254} />
            </div>
          </section>

      <JourneyGuide
        area="public"
        className="experience-journey--home"
        title="Tu recorrido, con un siguiente paso claro."
        description="Empieza con lo que hoy necesitas. Explorar y conocer tu punto de partida no te obliga a contratar."
        steps={[
          { title: "Descubre", description: "Conoce negocios y perfiles reales de la comunidad.", to: "/vecindario", action: "Explorar Vecindario" },
          { title: "Comprende", description: "Responde a tu ritmo y recibe orientación según tu situación.", to: "/diagnostico", action: "Hacer el Diagnóstico" },
          { title: "Decide", description: "Conoce las opciones de Vecidya y pregunta antes de avanzar.", to: "/licencias", action: "Conocer licencias" },
        ]}
      />

      <section aria-labelledby="home-neighborhood-title" className="public-v2-section home-neighborhood-preview">
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">VECINDARIO REAL</p>
            <h2 id="home-neighborhood-title">Descubre el Vecindario.</h2>
          </div>
          <Link className="text-link" to="/vecindario">Explorar todo el Vecindario <span aria-hidden="true">→</span></Link>
        </div>
        {profiles.length ? (
          <ul aria-label="Perfiles publicados destacados" className="home-business-grid">
            {profiles.map((profile) => <li key={profile.slug}><BusinessCardV2 profile={profile} /></li>)}
          </ul>
        ) : (
          <div className="home-neighborhood-empty" role="status">
            <p>El Vecindario está empezando a crecer.</p>
            <Link className="text-link" to="/diagnostico">Prepara tu presencia <span aria-hidden="true">→</span></Link>
          </div>
        )}
      </section>

      <section aria-labelledby="home-diagnostic-title" className="public-v2-section home-diagnostic-feature">
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">PUNTO DE PARTIDA</p>
            <h2 id="home-diagnostic-title">Empieza por tu diagnóstico.</h2>
          </div>
          <p className="home-section-heading__note">El diagnóstico adapta sus preguntas a tu situación.</p>
        </div>
        <div className="home-diagnostic-grid">
          {diagnosticChoices.map((choice) => <DiagnosticChoice {...choice} key={choice.label} />)}
        </div>
      </section>

      <section aria-labelledby="home-services-title" className="public-v2-section home-services-feature">
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">SERVICIOS</p>
          <h2 id="home-services-title">Servicios para avanzar.</h2>
          </div>
          <Link className="text-link" to="/servicios">Ver todos los servicios <span aria-hidden="true">→</span></Link>
        </div>
        <div className="home-services-grid">
          <ServiceCard icon={publicAssets.icons.serviceStructure} eyebrow="ORDENAR" title="Presencia & Marca">
            <p>Identidad y presentación para explicar quién eres y qué ofreces.</p>
            <Link className="text-link" to="/servicios#estructuracion">Conocer Presencia & Marca <span aria-hidden="true">→</span></Link>
          </ServiceCard>
          <ServiceCard icon={publicAssets.icons.serviceFormalization} eyebrow="CONVERTIR" title="Web & Conversión">
            <p>Webs y páginas que ayudan a encontrar tus servicios y cómo contactarte.</p>
            <Link className="text-link" to="/servicios#formalizacion">Conocer Web & Conversión <span aria-hidden="true">→</span></Link>
          </ServiceCard>
          <ServiceCard icon={publicAssets.icons.serviceDigitalPresence} eyebrow="ENCONTRAR" title="Visibilidad & Marketing">
            <p>Contenido, posicionamiento y campañas para facilitar el descubrimiento.</p>
            <Link className="text-link" to="/servicios#presencia-digital">Conocer Visibilidad & Marketing <span aria-hidden="true">→</span></Link>
          </ServiceCard>
          <ServiceCard icon={publicAssets.catalog.services.visibilidad} eyebrow="CAPTAR" title="Sistema Comercial">
            <p>Una ruta de captación y seguimiento cuando tu negocio la necesita.</p>
            <Link className="text-link" to="/servicios#visibilidad">Conocer Sistema Comercial <span aria-hidden="true">→</span></Link>
          </ServiceCard>
        </div>
      </section>

      <section aria-labelledby="home-learn-contact-title" className="public-v2-section home-guidance-feature">
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">GUÍAS Y AYUDA</p>
            <h2 id="home-learn-contact-title">Aprende a tu ritmo o consúltanos.</h2>
          </div>
          <p className="home-section-heading__note">Explora recursos prácticos o comparte directamente tu necesidad.</p>
        </div>
        <div className="public-actions">
          <Link className="button button--secondary" to="/aprende">Explorar guías de Aprende</Link>
          <Link className="text-link" to="/contacto">Hablar con Vecidya <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <CTASection
        eyebrow="SIGUIENTE PASO"
        title="Empieza por entender dónde estás."
        actions={[
          { label: PUBLIC_ACTION_LABELS.diagnostic, to: "/diagnostico", variant: "primary" },
          { label: "Explorar el Vecindario", to: "/vecindario", variant: "light" },
        ]}
        tone="dark"
      >
        <p>Una decisión clara empieza por una presencia que se entiende.</p>
      </CTASection>
      </main>
    </PublicLayout>
  );
}
