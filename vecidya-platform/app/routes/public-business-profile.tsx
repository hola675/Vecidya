import { Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { getPublishedBusinessProfileBySlug } from "../../db/queries/business-profile.server";
import { listBusinessHoursForOrganization } from "../../db/queries/business-hours.server";
import { getMiniWebConfigurationForOrganization } from "../../db/queries/miniweb.server";
import { getPublicMiniWebV2BySlug } from "../../db/queries/miniweb-v2.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { publicSiteUrl } from "../lib/public-seo";
import { publicMeta } from "../components/public-layout";
import { JsonLd } from "../components/public-v2";
import { MiniWebRenderer } from "../components/miniweb/miniweb-renderer";
import { getRenderableMiniWebModules } from "../features/miniweb/render";
import { restrictMiniWebPublicModel, toMiniWebPublicProfile } from "../features/miniweb/public-model";
import { validateMiniWebV2Document } from "../features/miniweb-v2/sections";
import { miniWebV2ImageUrl } from "../features/miniweb-v2/media";
import { createPublicMiniWebV2Document } from "../features/miniweb-v2/promotions";
import { MiniWebV2Renderer } from "../components/miniweb-v2-renderer";
import { CookieConsent } from "../components/cookie-consent";
import { PlatformFooter } from "../components/platform-footer";

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
  const [profile, miniWebV2] = await Promise.all([
    getPublishedBusinessProfileBySlug(database, params.slug),
    getPublicMiniWebV2BySlug(database, params.slug),
  ]);

  if (miniWebV2 && (!profile || (profile.organizationId === miniWebV2.organizationId && miniWebV2.sourceOrganizationId === profile.organizationId))) {
    let parsed: unknown;
    try { parsed = JSON.parse(miniWebV2.documentJson); } catch { throw new Response("Publicación inválida", { status: 404 }); }
    const validated = validateMiniWebV2Document(parsed);
    if (!validated.valid) throw new Response("Publicación inválida", { status: 404 });
    const todayUtc = new Date().toISOString().slice(0, 10);
    const publicDocument = createPublicMiniWebV2Document(validated.value, todayUtc);
    return { kind: "v2" as const, siteId: miniWebV2.siteId, slug: params.slug, document: publicDocument, familyKey: miniWebV2.familyKey, variant: miniWebV2.visualVariant };
  }

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

  return { kind: "v1" as const, ...publicModel, configuration: miniweb.publishedConfiguration, offerings, faqs, media, logoUrl: publishedLogo?.publicUrl ?? null, cover: publishedCover ? { publicUrl: publishedCover.publicUrl, altText: publishedCover.altText } : null, visibleModuleTypes: renderableModules.map((module) => module.type) };
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "Perfil no encontrado | Vecidya" }, { name: "robots", content: "noindex" }];
  if (loaderData.kind === "v2") {
    const hero = loaderData.document.sections.find((section) => section.visible && section.type === "hero");
    const title = hero?.type === "hero" && hero.content.title.trim() ? hero.content.title.trim() : "Sitio del negocio";
    const summary = hero?.type === "hero" && hero.content.subtitle.trim() ? hero.content.subtitle.trim() : "Conoce este negocio, sus servicios y cómo contactarlo.";
    return publicMeta(title, summary, `/vecindario/${encodeURIComponent(loaderData.slug)}`);
  }
  return publicMeta(loaderData.profile.displayName, loaderData.profile.shortDescription ?? "Perfil público en Vecidya.", `/vecindario/${loaderData.profile.slug}`);
}

export default function PublicBusinessProfilePage() {
  const data = useLoaderData<typeof loader>();
  if (data.kind === "v2") {
    return <div className="public-site miniweb-standalone">
      <a className="skip-link" href="#miniweb-main">Saltar al contenido</a>
      <MiniWebV2Renderer mainId="miniweb-main" document={data.document} familyKey={data.familyKey} variant={data.variant} mediaUrl={(assetId) => miniWebV2ImageUrl(data.siteId, assetId)}/>
      <footer className="miniweb-standalone__footer">
        <nav aria-label="Enlaces de regreso">
          <Link to="/vecindario">Volver al Vecindario</Link>
          <Link to="/">Conocer Vecidya</Link>
        </nav>
        <p className="miniweb-standalone__credit">Creado con Vecidya</p>
        <CookieConsent />
      </footer>
      <PlatformFooter area="public" />
    </div>;
  }
  const { profile, hours, configuration, offerings, faqs, media, logoUrl, cover, visibleModuleTypes } = data;
  const sameAs = [profile.websiteUrl, profile.instagramUrl, profile.facebookUrl, profile.linkedinUrl, profile.tiktokUrl, profile.youtubeUrl].filter(
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
      <PlatformFooter area="public" />
    </div>
  );
}
