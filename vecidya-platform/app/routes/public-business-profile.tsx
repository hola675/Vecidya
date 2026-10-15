import { Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { getPublishedBusinessProfileBySlug } from "../../db/queries/business-profile.server";
import { listBusinessHoursForOrganization } from "../../db/queries/business-hours.server";
import { getMiniWebConfigurationForOrganization } from "../../db/queries/miniweb.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { PublicLayout, publicMeta } from "../components/public-layout";
import { JsonLd } from "../components/public-v2";
import { MiniWebRenderer } from "../components/miniweb/miniweb-renderer";
import { getRenderableMiniWebModules } from "../features/miniweb/render";
import { restrictMiniWebPublicModel, toMiniWebPublicProfile } from "../features/miniweb/public-model";

import type { Route } from "./+types/public-business-profile";

const schemaOrgDayNames: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const { origin } = new URL(request.url);
  const database = createDatabase(env.DB);
  const profile = await getPublishedBusinessProfileBySlug(database, params.slug);

  if (!profile) {
    throw new Response("Perfil no encontrado", { status: 404 });
  }

  const rawHours = await listBusinessHoursForOrganization(database, profile.organizationId);
  const hours = rawHours.map(({ dayOfWeek, isClosed, opensAt, closesAt }) => ({ dayOfWeek, isClosed, opensAt, closesAt }));
  const miniweb = await getMiniWebConfigurationForOrganization(database, profile.organizationId, profile, hours);
  const publicProfile = toMiniWebPublicProfile(profile, profile.verificationStatus);
  if (!publicProfile) throw new Response("Perfil no encontrado", { status: 404 });
  const renderableModules = getRenderableMiniWebModules(miniweb.publishedConfiguration, publicProfile, hours);
  const publicModel = restrictMiniWebPublicModel(publicProfile, hours, renderableModules.map((module) => module.type));

  return { origin, ...publicModel, configuration: miniweb.publishedConfiguration };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.profile) return [{ title: "Perfil no encontrado | Vecidya" }, { name: "robots", content: "noindex" }];
  return publicMeta(loaderData.profile.displayName, loaderData.profile.shortDescription ?? "Perfil público en Vecidya.", `/vecindario/${loaderData.profile.slug}`);
}

export default function PublicBusinessProfilePage() {
  const { origin, profile, hours, configuration } = useLoaderData<typeof loader>();
  const sameAs = [profile.websiteUrl, profile.instagramUrl, profile.facebookUrl, profile.linkedinUrl].filter(
    (url): url is string => Boolean(url),
  );
  const openingHoursSpecification = hours
    .filter((entry) => !entry.isClosed && entry.opensAt && entry.closesAt)
    .map((entry) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: schemaOrgDayNames[entry.dayOfWeek],
      opens: entry.opensAt,
      closes: entry.closesAt,
    }));
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: profile.displayName,
    url: `${origin}/vecindario/${profile.slug}`,
    description: profile.description ?? profile.shortDescription ?? undefined,
    image: profile.logoUrl ?? undefined,
    telephone: profile.phone ?? undefined,
    email: profile.publicEmail ?? undefined,
    address: profile.city || profile.country
      ? {
          "@type": "PostalAddress",
          addressLocality: profile.city ?? undefined,
          addressCountry: profile.country ?? undefined,
        }
      : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    areaServed: profile.serviceArea ?? undefined,
    openingHoursSpecification: openingHoursSpecification.length ? openingHoursSpecification : undefined,
  };

  return (
    <PublicLayout>
      <main className="public-page public-business-profile">
        <JsonLd data={localBusinessSchema} />
        <MiniWebRenderer configuration={configuration} profile={profile} hours={hours} />

        <section aria-labelledby="business-neighborhood-title" className="public-business-neighborhood">
          <div>
            <h2 id="business-neighborhood-title">Explora más negocios del Vecindario</h2>
            <p>Conoce otros perfiles locales y encuentra opciones para lo que necesitas.</p>
          </div>
          <Link className="button button--secondary" to="/vecindario">Volver al Vecindario</Link>
        </section>
      </main>
    </PublicLayout>
  );
}
