import { createDatabase } from "../../db/client.server";
import { listPublishedBusinessProfiles } from "../../db/queries/business-profile.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { learnArticles } from "../content/learn";

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

export async function loader({ context, request }: Route.LoaderArgs) {
  const { origin } = new URL(request.url);
  const { env } = context.get(cloudflareContext);
  const profiles = await listPublishedBusinessProfiles(createDatabase(env.DB));
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
    "/terminos",
  ];
  const profilePaths = profiles.map((profile) => `/vecindario/${profile.slug}`);
  const articlePaths = learnArticles.filter((article) => !article.editorialDraft).map((article) => `/aprende/${article.slug}`);
  const entries = [...staticPaths, ...articlePaths, ...profilePaths].map((path) => urlEntry(`${origin}${path}`));
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
