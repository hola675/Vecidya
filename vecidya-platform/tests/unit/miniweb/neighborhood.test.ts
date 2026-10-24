import assert from "node:assert/strict";
import { test } from "node:test";

import { getVisibleNeighborhoodOfferings, matchesNeighborhoodFilters, type NeighborhoodProfile } from "../../../app/features/miniweb/neighborhood.ts";

const profile: NeighborhoodProfile = {
  displayName: "Estudio del Café",
  shortDescription: "Tostado y asesoría para pequeños comercios.",
  category: "Alimentos y bebidas",
  city: "Bogotá",
  country: "Colombia",
  serviceArea: "Bogotá y alrededores",
  serviceMode: "hybrid",
  offerings: [
    { kind: "service", title: "Asesoría de café", description: "Acompañamiento para elegir y preparar café." },
    { kind: "product", title: "Café de origen", description: "Café tostado de origen local." },
  ],
  modules: ["hero", "location", "services", "products"],
};

test("el directorio encuentra perfiles por texto publicado y normaliza tildes", () => {
  assert.equal(matchesNeighborhoodFilters(profile, { q: "asesoria de cafe" }), true);
  assert.equal(matchesNeighborhoodFilters(profile, { q: "BOGOTA" }), true);
  assert.equal(matchesNeighborhoodFilters(profile, { q: "promoción secreta" }), false);
});

test("el directorio combina ubicación, modalidad, oferta y módulos publicados", () => {
  assert.equal(matchesNeighborhoodFilters(profile, {
    city: "Bogotá",
    serviceArea: "Bogotá y alrededores",
    serviceMode: "hybrid",
    offering: "product",
    module: "products",
  }), true);
  assert.equal(matchesNeighborhoodFilters(profile, { offering: "service", module: "faq" }), false);
});

test("el índice oculta ofertas inactivas y ofertas cuyo módulo no está visible", () => {
  const visible = getVisibleNeighborhoodOfferings([
    { kind: "service", title: "Servicio visible", description: "Publicado", isActive: true },
    { kind: "product", title: "Producto oculto por módulo", description: "Publicado", isActive: true },
    { kind: "service", title: "Servicio inactivo", description: "Borrador", isActive: false },
  ], ["services"]);
  assert.deepEqual(visible.map(({ title }) => title), ["Servicio visible"]);
});
