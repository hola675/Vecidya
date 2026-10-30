import assert from "node:assert/strict";
import { test } from "node:test";
import { convertPublishedV1ContentToV2 } from "../../app/features/miniweb-v2/conversion";
import { validateMiniWebV2Document } from "../../app/features/miniweb-v2/sections";

const profile = {
  displayName: "Taller Ejemplo", shortDescription: "Reparación", description: "Atención local", phone: "+1 555 0100",
  publicEmail: "hola@example.test", websiteUrl: "https://example.test", instagramUrl: "javascript:alert(1)", facebookUrl: null,
  linkedinUrl: null, tiktokUrl: null, youtubeUrl: null, city: "Queens", serviceArea: "Queens County",
};

test("IMP-08 maps only allowlisted published V1 business content and never imports hours", () => {
  const result = convertPublishedV1ContentToV2({
    profile,
    offerings: [
      { id: "svc-1", kind: "service", title: "Reparación", description: "Servicio", imageAssetId: null, isActive: true },
      { id: "svc-hidden", kind: "service", title: "Oculto", description: "Inactivo", imageAssetId: null, isActive: false },
      { id: "prd-1", kind: "product", title: "Pieza", description: "Producto", imageAssetId: "missing", isActive: true },
    ],
    faqs: [{ id: "faq-1", question: "¿Cómo?", answer: "Así", isActive: true }, { id: "faq-hidden", question: "Oculto", answer: "No", isActive: false }],
    media: [{ id: "logo-1", purpose: "logo", altText: "Logo del taller", mediaType: "image" }, { id: "vid-1", purpose: "gallery", altText: "Video", mediaType: "video" }],
    branding: { logoAssetId: "logo-1" },
  });

  const byType = Object.fromEntries(result.document.sections.map((section) => [section.type, section.content]));
  assert.equal(result.document.sections.some((section) => section.type === "hours"), false);
  assert.equal(byType.hero && "title" in byType.hero ? byType.hero.title : "", "Taller Ejemplo");
  assert.equal(byType.services && "items" in byType.services ? byType.services.items.length : -1, 1);
  assert.equal(byType.products && "items" in byType.products ? byType.products.items[0]?.image : null, null);
  assert.equal(byType.faq && "items" in byType.faq ? byType.faq.items.length : -1, 1);
  assert.equal(byType.contact && "links" in byType.contact ? byType.contact.links.length : -1, 1);
  assert.equal(result.imported.hours, 0);
  assert.equal(validateMiniWebV2Document(result.document).valid, true);
});

test("IMP-08 creates fresh V2 section identities without copying V1 layout identifiers", () => {
  const source = { profile, offerings: [], faqs: [], media: [], branding: { logoAssetId: null } };
  const first = convertPublishedV1ContentToV2(source).document;
  const second = convertPublishedV1ContentToV2(source).document;
  assert.notEqual(first.sections[0]?.id, second.sections[0]?.id);
  assert.ok(first.sections.every((section) => !section.id.startsWith("v1-")));
  assert.notEqual(first.sections.find((section) => section.type === "services")?.content.items[0]?.id, "svc-1");
  assert.notEqual(first.sections.find((section) => section.type === "faq")?.content.items[0]?.id, "faq-1");
});

test("IMP-08 adapts oversized published V1 text to V2 limits and reports truncation", () => {
  const result = convertPublishedV1ContentToV2({
    profile: { ...profile, description: "d".repeat(4500), serviceArea: "a".repeat(250) },
    offerings: [], faqs: [], media: [], branding: { logoAssetId: null },
  });
  const about = result.document.sections.find((section) => section.type === "about");
  const location = result.document.sections.find((section) => section.type === "location");
  assert.equal(about?.type === "about" ? about.content.description.length : -1, 4000);
  assert.equal(location?.type === "location" ? location.content.area?.length : -1, 200);
  assert.equal(validateMiniWebV2Document(result.document).valid, true);
  assert.equal(result.omitted.length, 2);
});
