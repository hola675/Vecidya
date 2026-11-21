import assert from "node:assert/strict";
import { test } from "node:test";
import { createEmptyMiniWebV2Document, MINIWEB_V2_SECTION_TYPES, validateMiniWebV2Document, validateMiniWebV2Section } from "../../app/features/miniweb-v2/sections";
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

test("PUBLIC-BLOCKS-01 validates optional promo, WhatsApp, contact-form and consented review blocks additively", () => {
  const document = createEmptyMiniWebV2Document(["hero", "products", "contact", "testimonials"]);
  const hero = document.sections.find((entry) => entry.type === "hero");
  const products = document.sections.find((entry) => entry.type === "products");
  const contact = document.sections.find((entry) => entry.type === "contact");
  const testimonials = document.sections.find((entry) => entry.type === "testimonials");
  if (hero?.type === "hero") hero.content.title = "Mi negocio";
  if (products?.type === "products") products.content.promotions = [{ id: "promo-1", title: "Oferta de temporada", description: "Condiciones publicadas por el negocio.", startsOn: null, endsOn: "2099-12-31", terms: null, cta: null }];
  if (contact?.type === "contact") {
    contact.content.email = "hola@example.test";
    contact.content.whatsapp = { phone: "+15550100100", message: "Quiero información" };
    contact.content.form = { title: "Escríbenos", introduction: "El correo se prepara en tu dispositivo.", submitLabel: "Preparar correo" };
  }
  if (testimonials?.type === "testimonials") testimonials.content.items = [{ id: "review-1", author: "Cliente", quote: "Experiencia compartida con permiso.", context: null, consented: true, sourceLabel: "Fuente pública", sourceUrl: "https://example.test/review/1", reviewedOn: "2026-11-19" }];

  assert.equal(document.schemaVersion, 1, "optional blocks are additive to the existing document schema");
  assert.equal(validateMiniWebV2Document(document, { publishable: true }).valid, true);

  if (contact?.type === "contact") contact.content.email = "not-an-email";
  assert.equal(validateMiniWebV2Document(document).valid, true, "incomplete contact details remain editable in a draft");
  assert.equal(validateMiniWebV2Document(document, { publishable: true }).valid, false, "published forms require a valid public recipient address");

  if (contact?.type === "contact") contact.content.email = "hola@example.test";
  if (products?.type === "products") products.content.promotions![0]!.endsOn = "2026-02-31";
  assert.equal(validateMiniWebV2Document(document, { publishable: true }).valid, false, "calendar-invalid promotion dates are rejected");

  if (products?.type === "products") products.content.promotions![0]!.endsOn = null;
  assert.equal(validateMiniWebV2Document(document).valid, true, "an incomplete promotion can be saved as a draft");
  assert.equal(validateMiniWebV2Document(document, { publishable: true }).valid, false, "a promotion cannot be published without a valid end date");

  if (products?.type === "products") products.content.promotions![0]!.endsOn = "2099-12-31";
  if (contact?.type === "contact") contact.content.whatsapp = { phone: "123", message: null };
  assert.equal(validateMiniWebV2Document(document).valid, true, "WhatsApp can be edited before the number is complete");
  assert.equal(validateMiniWebV2Document(document, { publishable: true }).valid, false, "WhatsApp targets require a plausible international number");

  if (contact?.type === "contact") contact.content.whatsapp = { phone: "+15550100100", message: "Quiero información" };
  if (testimonials?.type === "testimonials") testimonials.content.items[0]!.sourceUrl = "http://example.test/review/1";
  assert.equal(validateMiniWebV2Document(document, { publishable: true }).valid, false, "review sources must use HTTPS");
});
