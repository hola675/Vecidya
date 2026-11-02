import assert from "node:assert/strict";
import { test } from "node:test";
import { BUSINESS_CATEGORIES, canonicalBusinessCategory } from "../../app/content/business-categories";
import { matchesNeighborhoodFilters } from "../../app/features/miniweb/neighborhood";

test("catálogo fijo y alias legados siguen coincidiendo sin modificar almacenamiento", () => {
  assert.equal(new Set(BUSINESS_CATEGORIES).size, BUSINESS_CATEGORIES.length);
  assert.equal(canonicalBusinessCategory("Peluquería"), "Belleza y bienestar");
  assert.equal(canonicalBusinessCategory("GASTRONOMIA"), "Alimentación y gastronomía");
  assert.equal(canonicalBusinessCategory("Categoría antigua"), "Otras actividades");
  const profile = { displayName: "Taller", shortDescription: null, category: "Taller", city: null, country: null, serviceArea: null, serviceMode: null, offerings: [], modules: [] };
  assert.equal(matchesNeighborhoodFilters(profile, { category: "Transporte y automoción" }), true);
  assert.equal(matchesNeighborhoodFilters(profile, { category: "Educación y formación" }), false);
});
