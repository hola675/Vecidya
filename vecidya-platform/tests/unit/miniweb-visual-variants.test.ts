import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getMiniWebVisualVariant,
  isMiniWebVisualTierSufficient,
  MINIWEB_VISUAL_VARIANT_KEYS,
  MINIWEB_VISUAL_VARIANTS,
} from "../../app/features/miniweb/visual-variants";

test("V2A: tres variantes con composiciones diferentes", () => {
  assert.deepEqual(MINIWEB_VISUAL_VARIANT_KEYS, ["base", "pro", "premium"]);
  assert.equal(MINIWEB_VISUAL_VARIANTS.base.minimumTier, "cuadra");
  assert.equal(MINIWEB_VISUAL_VARIANTS.pro.minimumTier, "barrio");
  assert.equal(MINIWEB_VISUAL_VARIANTS.premium.minimumTier, "ciudad");
  assert.equal(new Set(MINIWEB_VISUAL_VARIANT_KEYS.map((key) => MINIWEB_VISUAL_VARIANTS[key].composition.hero)).size, 3);
});

test("V2A: claves desconocidas y heredadas no se aceptan", () => {
  assert.equal(getMiniWebVisualVariant("base")?.key, "base");
  assert.equal(getMiniWebVisualVariant("standard"), null);
  assert.equal(getMiniWebVisualVariant("__proto__"), null);
  assert.equal(getMiniWebVisualVariant("constructor"), null);
});

test("V2A: comparación de niveles visuales", () => {
  assert.equal(isMiniWebVisualTierSufficient("cuadra", "cuadra"), true);
  assert.equal(isMiniWebVisualTierSufficient("cuadra", "barrio"), false);
  assert.equal(isMiniWebVisualTierSufficient("barrio", "ciudad"), false);
  assert.equal(isMiniWebVisualTierSufficient("ciudad", "barrio"), true);
  assert.equal(isMiniWebVisualTierSufficient("ciudad", "cuadra"), true);
});
