/** Typed, versioned content contract for the independently designed MiniWeb V2. */
import { createEmptyV2HoursSection, validateV2HoursSection, type V2HoursSection } from "./hours";
export const MINIWEB_V2_SCHEMA_VERSION = 1 as const;
export const MINIWEB_V2_SECTION_TYPES = [
  "hero", "about", "services", "products", "gallery", "contact",
  "location", "faq", "team", "certifications", "testimonials", "hours",
] as const;
export type MiniWebV2SectionType = (typeof MINIWEB_V2_SECTION_TYPES)[number];
export type V2Link = { label: string; href: string };
export type V2Image = { assetId: string; alt: string; caption?: string };
export type V2SectionContentMap = {
  hero: { title: string; subtitle: string; cta: V2Link | null; image: V2Image | null };
  about: { headline: string; description: string; blocks: { id: string; title: string; body: string; image: V2Image | null }[] };
  services: { items: { id: string; title: string; description: string; image: V2Image | null; cta: V2Link | null }[] };
  products: { items: { id: string; title: string; category: string | null; description: string; image: V2Image | null; cta: V2Link | null }[] };
  gallery: { images: V2Image[] };
  contact: { phone: string | null; email: string | null; links: V2Link[]; cta: V2Link | null };
  location: { address: string | null; city: string | null; area: string | null; mapUrl: string | null };
  faq: { items: { id: string; question: string; answer: string }[] };
  team: { people: { id: string; name: string; role: string | null; bio: string; image: V2Image | null; consented: boolean }[] };
  certifications: { items: { id: string; issuer: string; title: string; date: string | null; document: V2Image | null }[] };
  testimonials: { items: { id: string; quote: string; author: string; context: string | null; consented: boolean }[] };
  hours: import("./hours").V2HoursSection;
};
export type MiniWebV2Section = { [T in MiniWebV2SectionType]: {
  id: string; type: T; schemaVersion: number; order: number; visible: boolean; content: V2SectionContentMap[T];
} }[MiniWebV2SectionType];
export type MiniWebV2Document = { schemaVersion: typeof MINIWEB_V2_SCHEMA_VERSION; sections: MiniWebV2Section[] };
export type SectionValidation = { valid: true; value: MiniWebV2Section } | { valid: false; errors: string[] };

const isRecord = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const isText = (x: unknown, max = 4000) => typeof x === "string" && x.length <= max;
const validLink = (x: unknown): x is V2Link => isRecord(x) && isText(x.label, 120) && isText(x.href, 2048) && safeHref(x.href as string);
function safeHref(href: string): boolean {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try { const u = new URL(href); return ["https:", "http:", "mailto:", "tel:"].includes(u.protocol); } catch { return false; }
}
const validImage = (x: unknown): x is V2Image => isRecord(x) && isText(x.assetId, 160) && !!(x.assetId as string).trim() && isText(x.alt, 500) && (x.caption === undefined || isText(x.caption, 500));
const list = (x: unknown, check: (v: unknown) => boolean, max = 100) => Array.isArray(x) && x.length <= max && x.every(check);
const item = (x: unknown, fields: Record<string, (v: unknown) => boolean>) => isRecord(x) && typeof x.id === "string" && !!x.id.trim() && Object.entries(fields).every(([k, check]) => check(x[k]));
const nullableText = (max = 1000) => (x: unknown) => x === null || isText(x, max);
const imageOrNull = (x: unknown) => x === null || validImage(x);
const linkOrNull = (x: unknown) => x === null || validLink(x);

const validators: Record<MiniWebV2SectionType, (c: unknown) => boolean> = {
  hero: c => isRecord(c) && isText(c.title, 160) && isText(c.subtitle, 600) && linkOrNull(c.cta) && imageOrNull(c.image),
  about: c => isRecord(c) && isText(c.headline, 160) && isText(c.description) && list(c.blocks, x => item(x, { title: v => isText(v, 160), body: isText, image: imageOrNull })),
  services: c => isRecord(c) && list(c.items, x => item(x, { title: v => isText(v, 160), description: isText, image: imageOrNull, cta: linkOrNull })),
  products: c => isRecord(c) && list(c.items, x => item(x, { title: v => isText(v, 160), category: nullableText(120), description: isText, image: imageOrNull, cta: linkOrNull })),
  gallery: c => isRecord(c) && list(c.images, validImage),
  contact: c => isRecord(c) && nullableText(80)(c.phone) && nullableText(254)(c.email) && list(c.links, validLink, 30) && linkOrNull(c.cta),
  location: c => isRecord(c) && nullableText(300)(c.address) && nullableText(120)(c.city) && nullableText(200)(c.area) && (c.mapUrl === null || (typeof c.mapUrl === "string" && validLink({ label: "map", href: c.mapUrl }))),
  faq: c => isRecord(c) && list(c.items, x => item(x, { question: v => isText(v, 500), answer: isText })),
  team: c => isRecord(c) && list(c.people, x => item(x, { name: v => isText(v, 160), role: nullableText(120), bio: isText, image: imageOrNull, consented: v => typeof v === "boolean" })),
  certifications: c => isRecord(c) && list(c.items, x => item(x, { issuer: v => isText(v, 200), title: v => isText(v, 200), date: nullableText(40), document: imageOrNull })),
  testimonials: c => isRecord(c) && list(c.items, x => item(x, { quote: v => isText(v, 2000), author: v => isText(v, 160), context: nullableText(300), consented: v => typeof v === "boolean" })),
  hours: c => isRecord(c) && validateV2HoursSection(c as unknown as V2HoursSection, { requireTimezone: false }).valid,
};

export function createEmptyMiniWebV2Document(types: readonly MiniWebV2SectionType[]): MiniWebV2Document {
  const factories: { [T in MiniWebV2SectionType]: () => V2SectionContentMap[T] } = {
    hero: () => ({ title: "", subtitle: "", cta: null, image: null }),
    about: () => ({ headline: "", description: "", blocks: [] }), services: () => ({ items: [] }), products: () => ({ items: [] }),
    gallery: () => ({ images: [] }), contact: () => ({ phone: null, email: null, links: [], cta: null }),
    location: () => ({ address: null, city: null, area: null, mapUrl: null }), faq: () => ({ items: [] }), team: () => ({ people: [] }),
    certifications: () => ({ items: [] }), testimonials: () => ({ items: [] }), hours: () => createEmptyV2HoursSection(),
  };
  const unique = [...new Set(types)];
  if (unique.length !== types.length || unique.some((type) => !MINIWEB_V2_SECTION_TYPES.includes(type))) throw new TypeError("Invalid initial section list");
  const ordered: MiniWebV2SectionType[] = unique.includes("hero") ? ["hero", ...unique.filter((type) => type !== "hero")] : unique;
  return { schemaVersion: MINIWEB_V2_SCHEMA_VERSION, sections: ordered.map((type, order) => ({ id: crypto.randomUUID(), type, schemaVersion: 1, order, visible: true, content: factories[type]() })) as MiniWebV2Section[] };
}

export function validateMiniWebV2Section(value: unknown): SectionValidation {
  if (!isRecord(value) || typeof value.id !== "string" || !value.id.trim() || value.id.length > 160 ||
      !MINIWEB_V2_SECTION_TYPES.includes(value.type as MiniWebV2SectionType) || value.schemaVersion !== 1 ||
      !Number.isSafeInteger(value.order) || (value.order as number) < 0 || typeof value.visible !== "boolean")
    return { valid: false, errors: ["Invalid section envelope"] };
  const type = value.type as MiniWebV2SectionType;
  if (!validators[type](value.content)) return { valid: false, errors: [`Invalid ${type} content`] };
  return { valid: true, value: value as unknown as MiniWebV2Section };
}

export function validateMiniWebV2Document(value: unknown, options: { publishable?: boolean } = {}): { valid: true; value: MiniWebV2Document } | { valid: false; errors: string[] } {
  if (!isRecord(value) || value.schemaVersion !== MINIWEB_V2_SCHEMA_VERSION || !Array.isArray(value.sections))
    return { valid: false, errors: ["Invalid document envelope"] };
  const errors: string[] = [];
  const ids = new Set<string>(); const orders = new Set<number>();
  for (const section of value.sections) {
    const result = validateMiniWebV2Section(section);
    if (!result.valid) { errors.push(...result.errors); continue; }
    if (ids.has(result.value.id)) errors.push("Duplicate section id");
    if (orders.has(result.value.order)) errors.push("Duplicate section order");
    ids.add(result.value.id); orders.add(result.value.order);
    if (options.publishable && result.value.visible && result.value.type === "hero" && !result.value.content.title.trim()) errors.push("Visible hero requires a title");
    if (options.publishable && result.value.visible && result.value.type === "hours" && !validateV2HoursSection(result.value.content, { requireTimezone: true }).valid) errors.push("Visible hours section is incomplete");
  }
  return errors.length ? { valid: false, errors } : { valid: true, value: value as unknown as MiniWebV2Document };
}
