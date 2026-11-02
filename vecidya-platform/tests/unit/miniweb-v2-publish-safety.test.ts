import assert from "node:assert/strict";
import { test } from "node:test";
import { createEmptyMiniWebV2Document, validateMiniWebV2Document } from "../../app/features/miniweb-v2/sections";

test("nunca permite publicar un documento vacío ni una portada oculta", () => {
  assert.equal(validateMiniWebV2Document({ schemaVersion: 1, sections: [] }, { publishable: true }).valid, false);
  const document = createEmptyMiniWebV2Document(["hero", "about"]);
  const hero = document.sections.find((item) => item.type === "hero");
  assert.ok(hero && hero.type === "hero");
  hero.content.title = "Negocio de prueba";
  assert.equal(validateMiniWebV2Document(document, { publishable: true }).valid, true);
  hero.visible = false;
  assert.equal(validateMiniWebV2Document(document, { publishable: true }).valid, false);
});
