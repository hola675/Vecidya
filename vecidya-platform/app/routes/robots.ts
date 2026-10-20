import { publicSiteUrl } from "../lib/public-seo";

export function loader() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /app",
    "Disallow: /api",
    "Disallow: /login",
    "Disallow: /register",
    "",
    `Sitemap: ${publicSiteUrl("/sitemap.xml")}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
