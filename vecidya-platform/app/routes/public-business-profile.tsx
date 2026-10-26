import { useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { getPublishedBusinessProfileBySlug } from "../../db/queries/business-profile.server";
import { listBusinessHoursForOrganization } from "../../db/queries/business-hours.server";
import { getMiniWebConfigurationForOrganization } from "../../db/queries/miniweb.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { publicSiteUrl } from "../lib/public-seo";
import { publicMeta } from "../components/public-layout";
import { JsonLd } from "../components/public-v2";
import { MiniWebRenderer } from "../components/miniweb/miniweb-renderer";
import { getRenderableMiniWebModules } from "../features/miniweb/render";
import { restrictMiniWebPublicModel, toMiniWebPublicProfile } from "../features/miniweb/public-model";

import { MiniWebSiteFooter, MiniWebSiteHeader } from "../components/miniweb/miniweb-site-chrome";
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
  const database = createDatabase(env.DB);
  const profile = await getPublishedBusinessProfileBySlug(database, params.slug);

  if (!profile) {
    throw new Response("Perfil no encontrado", { status: 404 });
  }

  const rawHours = profile.publicationSnapshot?.hours ?? await listBusinessHoursForOrganization(database, profile.organizationId);
  const hours = rawHours.map(({ dayOfWeek, isClosed, opensAt, closesAt }) => ({ dayOfWeek, isClosed, opensAt, closesAt }));
  const miniweb = profile.publicationSnapshot
    ? { publishedConfiguration: profile.publicationSnapshot.configuration }
    : await getMiniWebConfigurationForOrganization(database, profile.organizationId, profile, hours);
  const publicProfile = toMiniWebPublicProfile(profile, profile.verificationStatus);
  if (!publicProfile) throw new Response("Perfil no encontrado", { status: 404 });
  const offerings = (profile.publicationSnapshot?.offerings ?? []).filter((item) => item.isActive);
  const faqs = (profile.publicationSnapshot?.faqs ?? []).filter((item) => item.isActive);
  const media = (profile.publicationSnapshot?.media ?? []).map((asset) => ({ ...asset, publicUrl: `/media/business/${encodeURIComponent(profile.slug)}/${encodeURIComponent(asset.id)}`, sizeBytes: 0, createdAt: new Date(0) }));
  const publishedLogo = media.find((asset) => asset.id === profile.publicationSnapshot?.branding.logoAssetId);
  publicProfile.logoUrl = publishedLogo?.publicUrl ?? null;
  const publishedCover = media.find((asset) => asset.id === profile.publicationSnapshot?.media.find((item) => item.purpose === "cover" && item.mediaType === "image")?.id);
  const renderableModules = getRenderableMiniWebModules(miniweb.publishedConfiguration, publicProfile, hours, offerings, faqs, media);
  const publicModel = restrictMiniWebPublicModel(publicProfile, hours, renderableModules.map((module) => module.type));

  return { ...publicModel, configuration: miniweb.publishedConfiguration, offerings, faqs, media, logoUrl: publishedLogo?.publicUrl ?? null, cover: publishedCover ? { publicUrl: publishedCover.publicUrl, altText: publishedCover.altText } : null, visibleModuleTypes: renderableModules.map((module) => module.type) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.profile) return [{ title: "Perfil no encontrado | Vecidya" }, { name: "robots", content: "noindex" }];
  return publicMeta(loaderData.profile.displayName, loaderData.profile.shortDescription ?? "Perfil público en Vecidya.", `/vecindario/${loaderData.profile.slug}`);
}

export default function PublicBusinessProfilePage() {
  const { profile, hours, configuration, offerings, faqs, media, logoUrl, cover, visibleModuleTypes } = useLoaderData<typeof loader>();
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
    url: publicSiteUrl(`/vecindario/${profile.slug}`),
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
    <div className="public-site miniweb-standalone">
      <a className="skip-link" href="#miniweb-main">Saltar al contenido</a>
      <MiniWebSiteHeader logoUrl={logoUrl} profile={profile} visibleModules={visibleModuleTypes} />
      <main className="public-page public-business-profile" id="miniweb-main">
        <JsonLd data={localBusinessSchema} />
        <div id="miniweb-sections">
          <MiniWebRenderer configuration={configuration} profile={profile} hours={hours} offerings={offerings} faqs={faqs} media={media} heroCover={cover ?? undefined} />
        </div>
      </main>
      <MiniWebSiteFooter profile={profile} />
    </div>
  );
}
