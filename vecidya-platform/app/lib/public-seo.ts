/** Origen público autorizado para canonical, sitemap y robots. Nunca derivarlo del Host de una petición. */
export const PUBLIC_SITE_ORIGIN = "https://vecidya.com";

export function publicSiteUrl(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Se requiere una ruta pública absoluta relativa al sitio.");
  return `${PUBLIC_SITE_ORIGIN}${path}`;
}

export function publicListingRobots(search: string) {
  return search ? "noindex, follow" : "index, follow";
}
