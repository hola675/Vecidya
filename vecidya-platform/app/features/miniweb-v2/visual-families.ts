export const MINIWEB_V2_FAMILIES = ["vecidya-default", "services-studio", "catalog-store", "gastronomy-table", "professional-profile"] as const;
export type MiniWebV2Family = (typeof MINIWEB_V2_FAMILIES)[number];
export const MINIWEB_V2_VARIANTS = ["base", "pro", "premium"] as const;
export type MiniWebV2Variant = (typeof MINIWEB_V2_VARIANTS)[number];

export const MINIWEB_V2_FAMILY_CATALOG: Record<MiniWebV2Family, { label: string; description: string; initialSections: readonly MiniWebV2SectionType[] }> = {
  "vecidya-default": { label: "Vecidya", description: "Presentación equilibrada para tu negocio.", initialSections: ["hero", "about", "services", "contact", "location", "hours"] },
  "services-studio": { label: "Estudio de servicios", description: "Enfoque editorial en servicios, confianza y contacto.", initialSections: ["hero", "services", "testimonials", "faq", "contact", "hours"] },
  "catalog-store": { label: "Catálogo", description: "Destaca productos, imágenes y preguntas frecuentes.", initialSections: ["hero", "products", "gallery", "faq", "contact", "hours"] },
  "gastronomy-table": { label: "Gastronomía", description: "Presenta productos, ubicación y horarios.", initialSections: ["hero", "products", "gallery", "hours", "location", "contact"] },
  "professional-profile": { label: "Perfil profesional", description: "Enfoque en trayectoria, equipo y credenciales.", initialSections: ["hero", "about", "certifications", "team", "testimonials", "contact"] },
};

export function isMiniWebV2Family(value: unknown): value is MiniWebV2Family { return typeof value === "string" && MINIWEB_V2_FAMILIES.includes(value as MiniWebV2Family); }
export function isMiniWebV2Variant(value: unknown): value is MiniWebV2Variant { return typeof value === "string" && MINIWEB_V2_VARIANTS.includes(value as MiniWebV2Variant); }
import type { MiniWebV2SectionType } from "./sections";
