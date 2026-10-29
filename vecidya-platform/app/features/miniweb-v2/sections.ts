import { newHoursV2, type HoursV2Content } from "./hours";
/**
 * MiniWeb V2 — contrato independiente de secciones.
 * DEC-19: no importar componentes, horarios ni esquemas de secciones V1.
 * La disponibilidad por familia/plan afecta solo a la presentación visual.
 */
export const V2_SECTION_TYPES = [
  "hero", "about", "services", "products", "gallery", "contact",
  "location", "faq", "team", "certifications", "testimonials", "hours",
] as const;

export type V2SectionType = (typeof V2_SECTION_TYPES)[number];
export type V2VisualTier = "base" | "pro" | "premium";
export type V2TemplateFamily =
  | "vecidya-default"
  | "services-studio"
  | "catalog-store"
  | "gastronomy-table"
  | "professional-profile";

export type V2Section = Readonly<{
  instanceId: string;
  type: V2SectionType;
  enabled: boolean;
  content: Readonly<Record<string, unknown>> | HoursV2Content;
}>;

export type V2Draft = Readonly<{
  schemaVersion: 2;
  family: V2TemplateFamily;
  visualTier: V2VisualTier;
  sections: readonly V2Section[];
  sourcePublicationId: string | null;
}>;

export function createV2Draft(
  family: V2TemplateFamily = "vecidya-default",
  visualTier: V2VisualTier = "base",
): V2Draft {
  return {
    schemaVersion: 2,
    family,
    visualTier,
    sections: [{ instanceId: "hours-1", type: "hours", enabled: false, content: newHoursV2() }],
    sourcePublicationId: null,
  };
}

