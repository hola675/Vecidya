import type { MiniWebModuleType } from "./registry";

export type MiniWebNavigationItem = {
  type: MiniWebModuleType;
  label: string;
  href: string;
};

const labels: Record<MiniWebModuleType, string> = {
  hero: "Inicio",
  about: "Quiénes somos",
  contact: "Contacto",
  hours: "Horarios",
  services: "Servicios",
  gallery: "Galería",
  location: "Ubicación",
  products: "Productos",
  articles: "Artículos",
  faq: "Preguntas",
  team: "Equipo",
  certifications: "Certificaciones",
  testimonials: "Testimonios",
};

/** Construye únicamente enlaces a módulos realmente renderizados.
 * Para evitar una cabecera saturada se muestran como máximo tres secciones
 * más Contacto (si existe), siempre con un destino anclado en la plantilla.
 */
export function buildMiniWebPublicNavigation(visibleModules: readonly MiniWebModuleType[]): MiniWebNavigationItem[] {
  const types: MiniWebModuleType[] = visibleModules.filter((type) => type !== "hero" && type !== "contact").slice(0, 3);
  if (visibleModules.includes("contact")) types.push("contact");
  return [...new Set(types)].map((type) => ({
    type,
    label: labels[type],
    href: `#miniweb-section-${type}`,
  }));
}
