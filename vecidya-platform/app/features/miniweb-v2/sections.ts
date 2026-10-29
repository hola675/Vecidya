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

export type V2HoursInterval = Readonly<{
  opens: string;
  closes: string;
}>;

export type V2HoursDay = Readonly<{
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  closed: boolean;
  intervals: readonly V2HoursInterval[];
}>;

export type V2HoursContent = Readonly<{
  timezone: string;
  days: readonly V2HoursDay[];
  note: string;
}>;

export type V2Section = Readonly<{
  instanceId: string;
  type: V2SectionType;
  enabled: boolean;
  content: Readonly<Record<string, unknown>> | V2HoursContent;
}>;

export type V2Draft = Readonly<{
  schemaVersion: 2;
  family: V2TemplateFamily;
  visualTier: V2VisualTier;
  sections: readonly V2Section[];
  sourcePublicationId: string | null;
}>;

export function createEmptyV2Hours(): V2HoursContent {
  return { timezone: "", days: [], note: "" };
}

export function createV2Draft(
  family: V2TemplateFamily = "vecidya-default",
  visualTier: V2VisualTier = "base",
): V2Draft {
  return {
    schemaVersion: 2,
    family,
    visualTier,
    sections: [{ instanceId: "hours-1", type: "hours", enabled: false, content: createEmptyV2Hours() }],
    sourcePublicationId: null,
  };
}

export function validateV2Hours(value: V2HoursContent): string[] {
  const errors: string[] = [];
  if (!value.timezone.trim()) errors.push("timezone_required");
  const seen = new Set<number>();
  for (const day of value.days) {
    if (!Number.isInteger(day.day) || day.day < 0 || day.day > 6 || seen.has(day.day)) {
      errors.push("invalid_or_duplicate_day");
    }
    seen.add(day.day);
    if (day.closed && day.intervals.length > 0) errors.push("closed_day_has_intervals");
    let lastClose = "";
    for (const interval of day.intervals) {
      const valid = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!valid.test(interval.opens) || !valid.test(interval.closes) || interval.opens >= interval.closes) {
        errors.push("invalid_interval");
      }
      if (lastClose && interval.opens < lastClose) errors.push("overlapping_intervals");
      lastClose = interval.closes;
    }
  }
  return errors;
}
