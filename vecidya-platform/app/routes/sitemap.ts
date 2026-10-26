import { createDatabase } from "../../db/client.server";
import { listPublishedBusinessProfiles } from "../../db/queries/business-profile.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { learnArticles } from "../content/learn";
import { getPublicLearnArticles } from "../content/learn-publication";
import { LICENSE_OFFERS, ADDON_OFFERS, SERVICE_OFFERS } from "../content/commercial-detail";
import { publicSiteUrl } from "../lib/public-seo";

import type { Route } from "./+types/sitemap";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function urlEntry(location: string) {
  return `  <url><loc>${escapeXml(location)}</loc></url>`;
}

export async function loader({ context }: Route.LoaderArgs) {
  // Las rutas públicas no deben depender de la disponibilidad de D1.
  let profiles: Awaited<ReturnType<typeof listPublishedBusinessProfiles>> = [];
  let profilesUnavailable = false;
  try {
    const { env } = context.get(cloudflareContext);
    profiles = await listPublishedBusinessProfiles(createDatabase(env.DB));
  } catch (error) {
    profilesUnavailable = true;
    console.error("No se pudieron consultar los perfiles publicados para el sitemap.", error);
  }
  const staticPaths = [
    "/",
    "/licencias",
    "/addons",
    "/servicios",
    "/unete",
    "/contacto",
    "/vecindario",
    "/diagnostico",
    "/sobre-nosotros",
    "/aprende",
    "/privacidad",
    "/cookies",
    "/terminos",
    "/informacion-legal",
  ];
  const detailPaths = [...LICENSE_OFFERS, ...ADDON_OFFERS, ...SERVICE_OFFERS].map((offer) => offer.detailPath);
  const profilePaths = profiles.map((profile) => `/vecindario/${profile.slug}`);
  const articlePaths = getPublicLearnArticles(learnArticles).map((article) => `/aprende/${article.slug}`);
  const entries = [...new Set([...staticPaths, ...detailPaths, ...articlePaths, ...profilePaths])].map((path) => urlEntry(publicSiteUrl(path)));
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Cache-Control": profilesUnavailable ? "public, max-age=60" : "public, max-age=3600",
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
