import assert from "node:assert/strict";
import { test } from "node:test";

import { COMMERCIAL_BOUNDARY_COPY, COMMERCIAL_EXTERNAL_COSTS, DIAGNOSTIC_CTA_COPY, PUBLIC_ACTION_LABELS } from "../../app/content/public-copy.ts";

test("public copy exposes one canonical commercial boundary", () => {
  assert.deepEqual(Object.keys(COMMERCIAL_BOUNDARY_COPY), ["license", "addon", "service"]);
  assert.equal(COMMERCIAL_BOUNDARY_COPY.license.label, "Licencia");
  assert.equal(COMMERCIAL_BOUNDARY_COPY.addon.label, "Addon");
  assert.equal(COMMERCIAL_BOUNDARY_COPY.service.label, "Servicio");
  assert.match(COMMERCIAL_EXTERNAL_COSTS, /consumos externos/);
});

test("public actions keep stable labels while pages stop duplicating literals", () => {
  assert.deepEqual(PUBLIC_ACTION_LABELS, {
    diagnostic: "Hacer diagnóstico",
    diagnosticDiscovery: "Encontrar qué necesito",
    contact: "Contactar",
    services: "Ver servicios",
    addons: "Ver complementos",
    licenses: "Ver licencias",
  });
});

test("commercial pages share one diagnostic CTA explanation", () => {
  assert.equal(DIAGNOSTIC_CTA_COPY, "El diagnóstico te ayuda a ubicar tu punto de partida antes de elegir una licencia, addon o servicio.");
});
