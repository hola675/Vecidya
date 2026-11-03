import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BusinessSectorPicker } from "../../app/components/business-sector-picker.tsx";

test("buscador muestra lenguaje de negocio y conserva el valor anterior en el formulario", () => {
  const legacy = renderToStaticMarkup(createElement(BusinessSectorPicker, { initialCategory: "Alimentos y bebidas" }));
  assert.match(legacy, /¿A qué se dedica principalmente tu negocio o emprendimiento\?/);
  assert.match(legacy, /name="category"/);
  assert.match(legacy, /value="Alimentos y bebidas"/);
  assert.match(legacy, /Categoría anterior conservada/);
  assert.match(legacy, /type="search"/);
  assert.doesNotMatch(legacy, /¿A qué se dedica principalmente tu actividad/);
});

test("selector inicia vacío sin inventar una categoría y mantiene acceso a opciones", () => {
  const html = renderToStaticMarkup(createElement(BusinessSectorPicker, { initialCategory: null }));
  assert.match(html, /name="category"/);
  assert.match(html, /value=""/);
  assert.match(html, /Ver todas las categorías/);
  assert.match(html, /Otra actividad/);
  assert.doesNotMatch(html, /Categoría anterior conservada/);
});
