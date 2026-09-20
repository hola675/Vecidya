import type { Route } from "./+types/robots";

export function loader({ request }: Route.LoaderArgs) {
  const { origin } = new URL(request.url);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /app",
    "Disallow: /api",
    "Disallow: /login",
    "Disallow: /register",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
