import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  Qa03bV9ClassificationStep,
  classificationPromptV9,
  classificationSelectionReadyV9,
  specialtySelectorForSectorV9,
} from "../../../app/components/diagnostic-flow/qa03b-v9-classification-step";

const progress = { stage: "context", stageIndex: 0, answered: 3 } as const;
const noop = () => {};

test("V9 classification screen renders sector first and keeps Continue disabled until the atomic selection is complete", () => {
  const html = renderToStaticMarkup(createElement(Qa03bV9ClassificationStep, {
    value: {},
    progress,
    error: null,
    reviewing: false,
    canGoBack: true,
    onChange: noop,
    onSubmit: noop,
    onBack: noop,
  }));
  assert.match(html, /¿A qué se dedica principalmente/);
  assert.match(html, /Salud y bienestar/);
  assert.match(html, /Comercio electrónico y tiendas online/);
  assert.doesNotMatch(html, /¿Qué especialidad se acerca más/);
  assert.match(html, /disabled=""/);
  assert.match(html, /type="radio"/);
  assert.match(html, /name="q2_sector"/);
  assert.match(html, /3 respuestas/);
});

test("V9 classification progressively reveals only the specialty choices for the selected sector", () => {
  const html = renderToStaticMarkup(createElement(Qa03bV9ClassificationStep, {
    value: { sector: "food_hospitality" },
    progress,
    error: null,
    reviewing: false,
    canGoBack: true,
    onChange: noop,
    onSubmit: noop,
    onBack: noop,
  }));
  assert.match(html, /¿Qué especialidad se acerca más a tu actividad/);
  assert.match(html, /Restaurante/);
  assert.match(html, /Cafetería/);
  assert.match(html, /Food truck/);
  assert.match(html, /Otra especialidad/);
  assert.match(html, /Todavía no lo sé/);
  assert.match(html, /name="q2_niche_food_hospitality"/);
  assert.doesNotMatch(html, /Dentista/);
  assert.match(html, /disabled=""/);
});

test("V9 classification enables one Continue after sector plus specialty are explicitly selected", () => {
  const html = renderToStaticMarkup(createElement(Qa03bV9ClassificationStep, {
    value: { sector: "food_hospitality", niche: "restaurant" },
    progress,
    error: null,
    reviewing: false,
    canGoBack: true,
    onChange: noop,
    onSubmit: noop,
    onBack: noop,
  }));
  assert.match(html, /id="df-v9-specialty-restaurant"[^>]*checked=""[^>]*value="restaurant"/);
  assert.doesNotMatch(html, /aria-disabled="true"/);
  assert.doesNotMatch(html, /disabled=""/);
  assert.equal((html.match(/>Continuar</g) ?? []).length, 1);
});

test("sector without a reviewed specialty selector is complete in the same screen without inventing a niche", () => {
  assert.equal(specialtySelectorForSectorV9("legal"), undefined);
  assert.equal(classificationSelectionReadyV9({ sector: "legal" }), true);
  const html = renderToStaticMarkup(createElement(Qa03bV9ClassificationStep, {
    value: { sector: "legal" },
    progress,
    error: null,
    reviewing: false,
    canGoBack: false,
    onChange: noop,
    onSubmit: noop,
    onBack: noop,
  }));
  assert.match(html, /no necesitamos una segunda clasificación/);
  assert.doesNotMatch(html, /df-v9-classification__specialty/);
  assert.doesNotMatch(html, /button--secondary/);
});

test("organization wording and draft validation remain explicit and neutral", () => {
  assert.equal(classificationPromptV9("organization"), "¿A qué se dedica principalmente tu organización?");
  assert.equal(classificationSelectionReadyV9({ sector: "health_wellness" }), false);
  assert.equal(classificationSelectionReadyV9({ sector: "health_wellness", niche: "dentist" }), true);
  assert.equal(classificationSelectionReadyV9({ sector: "health_wellness", niche: "unknown" }), true);
  assert.equal(classificationSelectionReadyV9({ sector: "health_wellness", niche: "restaurant" }), false);
});
