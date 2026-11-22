import assert from "node:assert/strict";
import test from "node:test";

import { createEmptyMiniWebV2Document } from "../../app/features/miniweb-v2/sections";
import { createPublicMiniWebV2Document, isMiniWebV2PromotionActive } from "../../app/features/miniweb-v2/promotions";

test("PUBLIC-BLOCKS-01 promotions require an active UTC validity window", () => {
  const visible = { id: "active", title: "Oferta vigente", description: "Descripción", startsOn: "2026-11-01", endsOn: "2026-11-30", terms: null, cta: null };
  const future = { ...visible, id: "future", startsOn: "2026-11-20" };
  const expired = { ...visible, id: "expired", endsOn: "2026-11-18" };
  assert.equal(isMiniWebV2PromotionActive(visible, "2026-11-19"), true);
  assert.equal(isMiniWebV2PromotionActive(future, "2026-11-19"), false);
  assert.equal(isMiniWebV2PromotionActive(expired, "2026-11-19"), false);
  assert.equal(isMiniWebV2PromotionActive(visible, "invalid-date"), false);

  const document = createEmptyMiniWebV2Document(["products", "team", "testimonials", "contact"]);
  const products = document.sections.find((section) => section.type === "products");
  if (products?.type === "products") products.content.promotions = [visible, future, expired];
  const team = document.sections.find((section) => section.type === "team");
  if (team?.type === "team") team.content.people = [{ id: "private-person", name: "No consent", role: null, bio: "Private fixture", image: null, consented: false }];
  const testimonials = document.sections.find((section) => section.type === "testimonials");
  if (testimonials?.type === "testimonials") testimonials.content.items = [{ id: "private-review", author: "No consent", quote: "Private fixture", context: null, consented: false }];
  const hiddenContact = document.sections.find((section) => section.type === "contact");
  if (hiddenContact?.type === "contact") { hiddenContact.visible = false; hiddenContact.content.email = "hidden-only@example.test"; }
  const filtered = createPublicMiniWebV2Document(document, "2026-11-19");
  const publishedProducts = filtered.sections.find((section) => section.type === "products");
  assert.deepEqual(publishedProducts?.type === "products" ? publishedProducts.content.promotions?.map((promotion) => promotion.id) : [], ["active"]);
  assert.deepEqual(filtered.sections.find((section) => section.type === "team")?.type === "team" ? filtered.sections.find((section) => section.type === "team")?.content.people : [], [], "non-consented people are absent from serialized public loader data");
  assert.deepEqual(filtered.sections.find((section) => section.type === "testimonials")?.type === "testimonials" ? filtered.sections.find((section) => section.type === "testimonials")?.content.items : [], [], "non-consented reviews are absent from serialized public loader data");
  assert.equal(filtered.sections.some((section) => section.type === "contact"), false, "hidden sections are omitted before serialization");
  assert.equal((document.sections.find((section) => section.type === "products") as Extract<typeof document.sections[number], { type: "products" }>).content.promotions?.length, 3, "public filtering does not mutate the stored publication document");
});
