import assert from "node:assert/strict";
import { test } from "node:test";
import { createEmptyMiniWebV2Document } from "../../app/features/miniweb-v2/sections";
import { publishedMiniWebV2ImageIds, miniWebV2ImageUrl } from "../../app/features/miniweb-v2/media";

test("media pública solo incluye referencias visibles y con consentimiento", () => {
  const document = createEmptyMiniWebV2Document(["hero", "gallery", "team"]);
  const hero = document.sections.find((s) => s.type === "hero");
  if (hero?.type === "hero") hero.content.image = { assetId: "hero-1", alt: "Portada" };
  const gallery = document.sections.find((s) => s.type === "gallery");
  if (gallery?.type === "gallery") { gallery.content.images.push({ assetId: "gallery-1", alt: "Interior" }); gallery.visible = false; }
  const team = document.sections.find((s) => s.type === "team");
  if (team?.type === "team") team.content.people.push({ id: "x", name: "Persona", role: null, bio: "", image: { assetId: "private-1", alt: "Persona" }, consented: false });
  assert.deepEqual([...publishedMiniWebV2ImageIds(document)], ["hero-1"]);
  assert.equal(miniWebV2ImageUrl("sitio demo", "medio/uno"), "/media/miniweb/sitio%20demo/medio%2Funo");
});
