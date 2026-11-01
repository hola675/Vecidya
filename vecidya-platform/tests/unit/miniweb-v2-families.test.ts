import assert from "node:assert/strict";
import { test } from "node:test";
import { createEmptyMiniWebV2Document, validateMiniWebV2Document } from "../../app/features/miniweb-v2/sections";
import { MINIWEB_V2_FAMILIES, MINIWEB_V2_FAMILY_CATALOG, MINIWEB_V2_VARIANTS } from "../../app/features/miniweb-v2/visual-families";

test("IMP-05 defines five compositional families and three visual-only tiers", () => {
  assert.equal(MINIWEB_V2_FAMILIES.length, 5);
  assert.equal(MINIWEB_V2_VARIANTS.length, 3);
  for (const family of MINIWEB_V2_FAMILIES) {
    const document = createEmptyMiniWebV2Document(MINIWEB_V2_FAMILY_CATALOG[family].initialSections);
    assert.equal(document.sections[0]?.type, "hero");
    assert.equal(new Set(document.sections.map((x) => x.type)).size, document.sections.length);
    assert.equal(validateMiniWebV2Document(document).valid, true);
    assert.equal(validateMiniWebV2Document(document, { publishable: true }).valid, false);
  }
});
