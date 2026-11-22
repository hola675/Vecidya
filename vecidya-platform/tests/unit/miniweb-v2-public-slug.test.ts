import assert from "node:assert/strict";
import test from "node:test";
import { createMiniWebV2PublicSlug } from "../../app/features/miniweb-v2/public-slug";

test("MiniWeb V2 public slugs are readable, normalized and unique per site id", () => {
  assert.equal(createMiniWebV2PublicSlug("Mi Negocio_42", "f4c9a18b-8137-4b5d-8c21-550000000001"), "mi-negocio-42-site-f4c9a18b");
  assert.notEqual(createMiniWebV2PublicSlug("mi-negocio-42", "a4c9a18b-8137-4b5d-8c21-550000000001"), createMiniWebV2PublicSlug("mi-negocio-42", "f4c9a18b-8137-4b5d-8c21-550000000001"));
  assert.throws(() => createMiniWebV2PublicSlug("---", "not-a-site-id"));
});
