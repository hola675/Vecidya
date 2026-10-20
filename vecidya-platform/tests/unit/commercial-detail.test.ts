import assert from "node:assert/strict";
import { test } from "node:test";

import { ADDON_OFFERS, getCommercialOffer, LICENSE_OFFERS, SERVICE_OFFERS } from "../../app/content/commercial-detail.ts";
import { COMMERCIAL_CONTACT_INTERESTS } from "../../app/content/public-copy.ts";

const all = [...LICENSE_OFFERS, ...ADDON_OFFERS, ...SERVICE_OFFERS];

test("catálogo publica 3 licencias, 7 complementos y 7 servicios distintos", () => {
  assert.equal(LICENSE_OFFERS.length, 3);
  assert.equal(ADDON_OFFERS.length, 7);
  assert.equal(SERVICE_OFFERS.length, 7);
  assert.equal(new Set(all.map((o) => o.detailPath)).size, 17);
  assert.equal(new Set(all.map((o) => o.contactInterest)).size, 17);
  for (const offer of all) {
    assert.equal(getCommercialOffer(offer.kind, offer.id), offer);
    assert(offer.detailPath.startsWith(offer.catalogPath + "/"));
    assert(Object.prototype.hasOwnProperty.call(COMMERCIAL_CONTACT_INTERESTS, offer.contactInterest));
    assert(offer.includes.length > 0 && offer.excludes.length > 0);
    assert(offer.examples.length > 0);
    assert(offer.benefits.length >= 2, `${offer.title} sin beneficios comprensibles`);
    assert(offer.benefits.length >= 2, `Faltan ventajas prácticas de ${offer.id}`);
    assert(offer.benefits.every((benefit) => benefit.trim().length >= 25));

    assert(offer.dependencies.length > 20 && offer.externalCosts.length > 20);
  }
  for (const kind of ["license", "addon", "service"] as const) {
    assert.equal(getCommercialOffer(kind, "__proto__"), undefined);
    assert.equal(getCommercialOffer(kind, "../admin"), undefined);
  }
});

test("la diferencia de precio corresponde a capacidades, no a cuotas artificiales", () => {
  assert.deepEqual(LICENSE_OFFERS.map((o) => o.priceUsd), [39, 59, 89]);
  assert.deepEqual(LICENSE_OFFERS.map((o) => o.setupUsd), [0, 10, 15]);
  assert.equal(LICENSE_OFFERS[1].priceUsd - LICENSE_OFFERS[0].priceUsd, 20);
  assert.equal(LICENSE_OFFERS[2].priceUsd - LICENSE_OFFERS[1].priceUsd, 30);
  assert.equal(LICENSE_OFFERS[0].standardModules.length, 0);
  assert(LICENSE_OFFERS[1].standardModules.length > 0);
  assert(LICENSE_OFFERS[2].standardModules.length > LICENSE_OFFERS[1].standardModules.length);
  assert(LICENSE_OFFERS[1].includes.some((v) => /CRM/i.test(v)));
  assert(LICENSE_OFFERS[2].includes.some((v) => /módulos/i.test(v)));
  assert(!LICENSE_OFFERS.some((o) => /[0-9]+ (?:pipelines|workflows|automatizaciones)/i.test(o.summary + " " + o.decision)));
});

test("complementos y servicios no se facturan dentro de la plantilla estándar", () => {
  assert(ADDON_OFFERS.every((o) => o.kind === "addon" && o.price.length > 8));
  assert.equal(ADDON_OFFERS.find((o) => o.id === "whatsapp-business")?.price, "Desde USD 15/mes + consumo");
  assert(ADDON_OFFERS.some((o) => o.id === "reputation-reviews" && /incluid[ao]/i.test(o.price)));
  const whatsapp = ADDON_OFFERS.find((o) => o.id === "whatsapp-business");
  assert(whatsapp?.journey?.length === 4);
  assert(whatsapp?.benefits.some((benefit) => /contacto|CRM/i.test(benefit)));
  assert(whatsapp?.continuity?.includes("no están garantizados"));
  assert(SERVICE_OFFERS.every((o) => o.benefits.length >= 2));
  assert(SERVICE_OFFERS.every((o) => o.kind === "service" && o.price === "Propuesta según alcance"));
  assert(ADDON_OFFERS.every((o) => o.excludes.some((v) => /no incluye/i.test(v))));
  assert(SERVICE_OFFERS.some((o) => /sin licencia/i.test(o.dependencies)));
  assert(ADDON_OFFERS.find((o) => o.id === "connections-integrations")?.dependencies.includes("Cuadra"));
  const publicText = all.map((o) => Object.values(o).flat().join(" ")).join(" ");
  assert(!/\bGHL\b|HighLevel|GoHighLevel/i.test(publicText));
});

test("WhatsApp explica creación de contacto, relación comercial y continuidad con límites", () => {
  const whatsapp = ADDON_OFFERS.find((offer) => offer.id === "whatsapp-business");
  assert(whatsapp);
  assert(whatsapp.benefits.some((item) => /contacto|registr/i.test(item)));
  assert(whatsapp.journey && whatsapp.journey.length >= 3);
  assert(whatsapp.journey.some((step) => /oportunidad|responsable/i.test(step)));
  assert(whatsapp.continuity && /bloque|desconect|conexión/i.test(whatsapp.continuity));
  assert(/historial|mensaje/i.test(whatsapp.continuity));
  assert(/no|deja|depend/i.test(whatsapp.continuity));
});
