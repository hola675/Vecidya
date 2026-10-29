import {
  createEmptyV2Hours, type V2Draft, type V2Section,
  type V2TemplateFamily, type V2VisualTier,
} from "./sections";

/**
 * One-time, opt-in import from a published legacy projection.
 * Never accepts a legacy hours field, schedule, or section configuration.
 */
export type V1PublishedImport = Readonly<{
  publicationId: string;
  displayName?: string | null;
  description?: string | null;
  phone?: string | null;
  publicEmail?: string | null;
  city?: string | null;
  country?: string | null;
}>;

export type V2ImportResult = Readonly<{
  draft: V2Draft;
  importedFields: readonly string[];
  omittedFields: readonly string[];
  migrationVersion: 1;
}>;

export function importPublishedV1ToV2(
  legacy: V1PublishedImport,
  family: V2TemplateFamily,
  visualTier: V2VisualTier,
): V2ImportResult {
  if (!legacy.publicationId.trim()) throw new Error("source_publication_required");
  const importedFields: string[] = [];
  const sections: V2Section[] = [];
  const pick = (keys: readonly (keyof V1PublishedImport)[]) => {
    const content: Record<string, string> = {};
    for (const key of keys) {
      const value = legacy[key];
      if (typeof value === "string" && value.trim()) {
        content[key] = value.trim();
        importedFields.push(key);
      }
    }
    return content;
  };
  const hero = pick(["displayName"]);
  if (Object.keys(hero).length) sections.push({ instanceId: "hero-1", type: "hero", enabled: true, content: hero });
  const about = pick(["description"]);
  if (Object.keys(about).length) sections.push({ instanceId: "about-1", type: "about", enabled: true, content: about });
  const contact = pick(["phone", "publicEmail"]);
  if (Object.keys(contact).length) sections.push({ instanceId: "contact-1", type: "contact", enabled: true, content: contact });
  const location = pick(["city", "country"]);
  if (Object.keys(location).length) sections.push({ instanceId: "location-1", type: "location", enabled: true, content: location });

  // Deliberately constructed without reading any legacy hours value.
  sections.push({ instanceId: "hours-1", type: "hours", enabled: false, content: createEmptyV2Hours() });
  return {
    draft: { schemaVersion: 2, family, visualTier, sections, sourcePublicationId: legacy.publicationId },
    importedFields,
    omittedFields: ["hours", "schedule", "legacyModules", "legacyTemplate"],
    migrationVersion: 1,
  };
}
