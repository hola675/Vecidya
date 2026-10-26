import assert from "node:assert/strict";
import test from "node:test";

import {
  BUSINESS_SECTOR_TAXONOMY_VERSION,
  BUSINESS_SECTORS,
  NAICS_2022_SECTORS,
  businessCategoryOptions,
  getBusinessSectorById,
  getBusinessSectorByLabel,
} from "../../app/content/business-sectors.ts";

test("taxonomía compartida V1: 15 sectores y salida explícita, sin cientos de opciones", () => {
  assert.equal(BUSINESS_SECTOR_TAXONOMY_VERSION, "vecidya-business-sectors-v1");
  assert.equal(BUSINESS_SECTORS.length, 16);
  assert.equal(new Set(BUSINESS_SECTORS.map((sector) => sector.id)).size, 16);
  assert.equal(new Set(BUSINESS_SECTORS.map((sector) => sector.label)).size, 16);
  assert.equal(BUSINESS_SECTORS.at(-1)?.id, "other");
  for (const sector of BUSINESS_SECTORS) {
    assert.ok(sector.label.length <= 100 && sector.label.length > 3);
    assert.ok(sector.description.length > 15);
    assert.ok(sector.examples.length > 0 && sector.examples.length <= 6);
    assert.strictEqual(getBusinessSectorById(sector.id), sector);
    assert.strictEqual(getBusinessSectorByLabel(sector.label), sector);
  }
});

test("referencia de cobertura: 20 sectores NAICS 2022 representados sin afirmar equivalencia", () => {
  const covered = new Set(BUSINESS_SECTORS.flatMap((sector) => [...sector.naicsCoverage]));
  assert.deepEqual([...covered].sort(), [...NAICS_2022_SECTORS].sort());
});

test("comercio por internet y B2B son modalidades/compradores, no sectores inventados", () => {
  const sectors = new Set(BUSINESS_SECTORS.map((sector) => sector.id));
  for (const forbidden of ["ecommerce", "b2b", "b2c", "online", "startup", "nonprofit", "individual"]) {
    assert.equal(sectors.has(forbidden), false, forbidden);
  }
  assert.equal(getBusinessSectorById("commerce")?.examples.includes("tienda en línea"), true);
});

test("categorías antiguas no se reclasifican en silencio y siguen editables", () => {
  const previous = "Alimentos y bebidas";
  const options = businessCategoryOptions(previous);
  assert.equal(options.legacy, previous);
  assert.equal(options.canonical.length, 16);
  assert.equal(options.canonical.some(({ label }) => label === previous), false);
  assert.equal(businessCategoryOptions("Gastronomía y alimentación").legacy, null);
  assert.equal(businessCategoryOptions(null).legacy, null);
  assert.equal(getBusinessSectorByLabel(previous), undefined);
  assert.equal(getBusinessSectorByLabel("Servicios"), undefined);
  assert.equal(getBusinessSectorById("legal_professional")?.label, "Servicios profesionales y legales");
  assert.equal(getBusinessSectorById("invalid"), undefined);
});

test("Vecindario filtra por la misma etiqueta sectorial y conserva los filtros legacy", async () => {
  const { matchesNeighborhoodFilters } = await import("../../app/features/miniweb/neighborhood.ts");
  const category = getBusinessSectorById("agro_nature")?.label;
  assert.ok(category);
  const base = {
    displayName: "Actividad de prueba",
    shortDescription: "Cultivo y producción agrícola.",
    category,
    city: "Las Tunas",
    country: "Cuba",
    serviceArea: null,
    serviceMode: "in_person",
    offerings: [],
    modules: [],
  };
  assert.equal(matchesNeighborhoodFilters(base, { category }), true);
  assert.equal(matchesNeighborhoodFilters(base, { category: getBusinessSectorById("commerce")!.label }), false);
  assert.equal(matchesNeighborhoodFilters({ ...base, category: "Alimentos y bebidas" }, { category: "Alimentos y bebidas" }), true);
  assert.equal(matchesNeighborhoodFilters(base, { q: "agrícola" }), true);
});

test("buscador por oficios y términos habituales, con tildes y sin clasificación automática", async () => {
  const { searchBusinessSectors } = await import("../../app/content/business-sectors.ts");
  assert.equal(searchBusinessSectors("dentista")[0]?.id, "health_wellness");
  assert.equal(searchBusinessSectors("FINCA")[0]?.id, "agro_nature");
  assert.equal(searchBusinessSectors("taller mecánico")[0]?.id, "personal_maintenance");
  assert.equal(searchBusinessSectors("abogado")[0]?.id, "legal_professional");
  assert.equal(searchBusinessSectors("Tienda online")[0]?.id, "commerce");
  assert.equal(searchBusinessSectors("restaurante")[0]?.id, "food");
  assert.deepEqual(searchBusinessSectors(""), []);
  assert.deepEqual(searchBusinessSectors("xyz-no-existe"), []);
  assert.ok(searchBusinessSectors("a").length <= 7);
  assert.deepEqual(searchBusinessSectors("a", 0), []);
});
