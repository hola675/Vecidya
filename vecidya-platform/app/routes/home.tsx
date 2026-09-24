import { Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { listPublishedBusinessProfiles } from "../../db/queries/business-profile.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { publicAssets } from "../assets/public-assets";
import { BusinessCardV2, CTASection, DiagnosticChoice, JsonLd, ServiceCard, VisualSection } from "../components/public-v2";
import { PublicLayout, publicMeta } from "../components/public-layout";

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
  { icon: publicAssets.icons.diagnosticCreator, label: "Creador", description: "Una voz o trabajo creativo", profile: "creator" },
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
  };

  return (
    <PublicLayout>
      <main>
        <JsonLd data={organizationSchema} />

        <section aria-labelledby="home-hero-title" className="public-home-hero">
        <div className="public-home-hero__copy">
          <p className="eyebrow">VECINDARIO DIGITAL</p>
          <h1 id="home-hero-title">Haz que tu presencia sea fácil de encontrar.</h1>
          <p>Explora negocios reales, entiende dónde estás y descubre qué puedes ordenar primero.</p>
          <div className="public-actions">
            <Link className="button button--primary" to="/vecindario">Explorar el Vecindario</Link>
            <Link className="button button--secondary" to="/diagnostico">Hacer mi diagnóstico</Link>
          </div>
        </div>
        <div className="home-hero-visual">
          <div className="home-hero-visual__glow" />
          <img alt="Aplicación móvil de Vecidya mostrando descubrimiento de negocios locales" decoding="async" height={1086} src={publicAssets.illustrations.mobileLocalDiscovery} width={1448} />
          <span className="home-hero-visual__pin" aria-hidden="true"><span>V</span></span>
        </div>
      </section>

      <section aria-labelledby="home-neighborhood-title" className="public-v2-section home-neighborhood-preview">
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">VECINDARIO REAL</p>
            <h2 id="home-neighborhood-title">Conoce quién ya está construyendo una presencia más clara.</h2>
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
            <h2 id="home-diagnostic-title">¿Qué estás construyendo?</h2>
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
            <h2 id="home-services-title">Ordena lo que tu presencia necesita.</h2>
          </div>
          <Link className="text-link" to="/servicios">Ver todos los servicios <span aria-hidden="true">→</span></Link>
        </div>
        <div className="home-services-grid">
          <ServiceCard icon={publicAssets.icons.serviceStructure} eyebrow="ORDENAR" title="Estructuración">
            <p>Una ruta clara para ideas, canales y tareas dispersas.</p>
          </ServiceCard>
          <ServiceCard icon={publicAssets.icons.serviceFormalization} eyebrow="BASE" title="Formalización">
            <p>Una base más organizada para operar y presentarte mejor.</p>
          </ServiceCard>
          <ServiceCard icon={publicAssets.icons.serviceDigitalPresence} eyebrow="EXPLICAR" title="Presencia digital">
            <p>Información y mensajes que ayudan a entender qué haces.</p>
          </ServiceCard>
          <ServiceCard icon={publicAssets.icons.serviceVisibility} eyebrow="ENCONTRAR" title="Visibilidad">
            <p>Contenido y estructura para ser encontrado sin promesas vacías.</p>
          </ServiceCard>
        </div>
      </section>

      <VisualSection
        eyebrow="CÓMO AYUDA VECIDYA"
        title="De información dispersa a un siguiente paso claro."
        visual={<img alt="Perfil digital de un comercio local conectado con señales de presencia pública" height={1254} loading="lazy" src={publicAssets.illustrations.storefrontDigitalProfile} width={1254} />}
      >
        <div className="home-transformation" aria-label="Transformación de presencia digital">
          <div><span>Antes</span><strong>Información dispersa</strong></div>
          <div className="home-transformation__arrow" aria-hidden="true">→</div>
          <div><span>Después</span><strong>Presencia clara y contacto real</strong></div>
        </div>
      </VisualSection>

      <CTASection
        eyebrow="SIGUIENTE PASO"
        title="Empieza por entender dónde estás."
        actions={[
          { label: "Hacer diagnóstico", to: "/diagnostico", variant: "primary" },
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
