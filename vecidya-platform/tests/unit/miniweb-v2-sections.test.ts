import assert from "node:assert/strict";
import { test } from "node:test";
import { createEmptyMiniWebV2Document, MINIWEB_V2_SECTION_TYPES, validateMiniWebV2Document, validateMiniWebV2Section } from "../../app/features/miniweb-v2/sections";
import { MINIWEB_V2_DEFAULT_DESIGN, MINIWEB_V2_DESIGN_PALETTES, miniWebV2DesignStyle, validateMiniWebV2Design } from "../../app/features/miniweb-v2/visual-design";
import { createEmptyV2HoursSection } from "../../app/features/miniweb-v2/hours";

const content: Record<string, unknown> = {
  hero: { title: "Welcome", subtitle: "Local business", cta: null, image: null },
  about: { headline: "About", description: "Details", blocks: [] },
  services: { items: [] }, products: { items: [] }, gallery: { images: [] },
  contact: { phone: null, email: null, links: [], cta: null },
  location: { address: null, city: null, area: null, mapUrl: null }, faq: { items: [] },
  team: { people: [] }, certifications: { items: [] }, testimonials: { items: [] },
  hours: { ...createEmptyV2HoursSection(), timezone: "America/New_York" },
};
const section = (type: string, order = 0) => ({ id: `s-${type}`, type, schemaVersion: 1, order, visible: true, content: content[type] });

test("IMP-01 covers every contracted section with a typed validation branch", () => {
  assert.equal(MINIWEB_V2_SECTION_TYPES.length, 12);
  for (const type of MINIWEB_V2_SECTION_TYPES) assert.equal(validateMiniWebV2Section(section(type)).valid, true, type);
});

test("IMP-01 rejects unsafe links, duplicate identities/order, and unknown section types", () => {
  assert.equal(validateMiniWebV2Section({ ...section("hero"), content: { ...content.hero as object, cta: { label: "Go", href: "javascript:alert(1)" } } }).valid, false);
  assert.equal(validateMiniWebV2Section({ ...section("hero"), content: { ...content.hero as object, cta: { label: "Go", href: "#contacto" } } }).valid, true);
  assert.equal(validateMiniWebV2Section(section("legacy-hours")).valid, false);
  assert.equal(validateMiniWebV2Document({ schemaVersion: 1, sections: [section("hero"), section("faq")] }).valid, false);
  assert.equal(validateMiniWebV2Document({ schemaVersion: 1, sections: [section("hero"), { ...section("faq"), id: "s-hero", order: 1 }] }).valid, false);
});

test("IMP-05 initializes incomplete hours hidden so the first draft can publish", () => {
  const document = createEmptyMiniWebV2Document(["hero", "hours"]);
  assert.equal(document.sections.find((entry) => entry.type === "hours")?.visible, false);
  assert.equal(validateMiniWebV2Document(document, { publishable: true }).valid, false);
  const hero = document.sections.find((entry) => entry.type === "hero");
  if (hero?.type === "hero") hero.content.title = "Mi negocio";
  assert.equal(validateMiniWebV2Document(document, { publishable: true }).valid, true);
});

test("APP-MINI-V2: los borradores legacy siguen siendo válidos sin diseño", () => {
  const original = createEmptyMiniWebV2Document(["hero"]);
  assert.equal(validateMiniWebV2Document(original).valid, true);
  assert.deepEqual(miniWebV2DesignStyle(undefined), {});
});

test("APP-MINI-V2: la personalización se guarda en el mismo documento validado", () => {
  const document = createEmptyMiniWebV2Document(["hero"]);
  document.design = { ...MINIWEB_V2_DEFAULT_DESIGN, palette: "bosque", ...MINIWEB_V2_DESIGN_PALETTES.bosque,
    font: "editorial", layout: "stacked", align: "center", imagePosition: "left", titleSize: 52, spacing: 30 };
  assert.equal(validateMiniWebV2Document(document).valid, true);
  assert.deepEqual(JSON.parse(JSON.stringify(document)).design, document.design);
  assert.equal(miniWebV2DesignStyle(document.design)["--mw2-title-size" as keyof ReturnType<typeof miniWebV2DesignStyle>], "52px");
});

test("APP-MINI-V2: los colores y rangos peligrosos fallan cerrado", () => {
  const document = createEmptyMiniWebV2Document(["hero"]);
  document.design = { ...MINIWEB_V2_DEFAULT_DESIGN, accentColor: "#ffffff" };
  assert.equal(validateMiniWebV2Document(document).valid, false);
  document.design = { ...MINIWEB_V2_DEFAULT_DESIGN, titleSize: 900 };
  assert.equal(validateMiniWebV2Document(document).valid, false);
  document.design = { ...MINIWEB_V2_DEFAULT_DESIGN, textColor: "url(javascript:alert(1))" };
  assert.equal(validateMiniWebV2Document(document).valid, false);
  document.design = { ...MINIWEB_V2_DEFAULT_DESIGN };
  assert.equal(validateMiniWebV2Design(document.design), true);
  assert.equal(validateMiniWebV2Document(document).valid, true);
});
