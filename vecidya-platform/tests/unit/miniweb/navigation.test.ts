import assert from "node:assert/strict";
import { test } from "node:test";

import { buildMiniWebPublicNavigation } from "../../../app/features/miniweb/navigation.ts";

test("la navegación solo enlaza módulos visibles y limita el ruido visual", () => {
  const items = buildMiniWebPublicNavigation(["hero", "about", "services", "products", "gallery", "contact", "hours"]);
  assert.deepEqual(items.map((item) => item.type), ["about", "services", "products", "contact"]);
  assert.deepEqual(items.map((item) => item.href), [
    "#miniweb-section-about",
    "#miniweb-section-services",
    "#miniweb-section-products",
    "#miniweb-section-contact",
  ]);
});

test("nunca inventa un enlace de contacto si el módulo está oculto", () => {
  const items = buildMiniWebPublicNavigation(["hero", "gallery"]);
  assert.deepEqual(items, [{ type: "gallery", label: "Galería", href: "#miniweb-section-gallery" }]);
  assert.deepEqual(buildMiniWebPublicNavigation(["hero"]), []);
});

test("la navegación no repite módulos en caso de entradas duplicadas", () => {
  const items = buildMiniWebPublicNavigation(["hero", "about", "about", "contact", "contact"]);
  assert.deepEqual(items.map((item) => item.type), ["about", "contact"]);
});
