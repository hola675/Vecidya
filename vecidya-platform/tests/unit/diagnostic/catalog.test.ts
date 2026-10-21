import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { ADDON_OFFERS, LICENSE_OFFERS, SERVICE_OFFERS } from "../../../app/content/commercial-detail.ts";
import { addonCatalog, learnCatalog, licenseCatalog, serviceCatalog } from "../../../app/features/diagnostic/index.ts";

const read = (path: string) => readFileSync(new URL(`../../../${path}`, import.meta.url), "utf8");

test("cada servicio recomendado existe como anchor y título en /servicios", () => {
  const source = read("app/routes/services.tsx");
  for (const [id, service] of Object.entries(serviceCatalog)) {
    const offer = SERVICE_OFFERS.find((candidate) => candidate.id === id);
    assert.ok(offer, `anchor ${id} no existe en el catálogo comercial`);
    assert.equal(offer.title, service.title, `el catálogo público no conserva el título de ${id}`);
  }
  assert.match(source, /SERVICE_OFFERS\.map\(\(offer,/);
  assert.match(source, /id: offer\.id/);
  assert.match(source, /title: offer\.title/);
});

test("cada licencia recomendada existe con el mismo nombre y objetivo en /licencias", () => {
  const source = read("app/routes/licenses.tsx");
  for (const [id, license] of Object.entries(licenseCatalog)) {
    const offer = LICENSE_OFFERS.find((candidate) => candidate.id === id);
    assert.ok(offer, `licencia ${id} no existe en el catálogo comercial`);
    assert.equal(offer.title, license.name, `el catálogo público no conserva el nombre de ${id}`);
  }
  assert.match(source, /LICENSE_OFFERS\.map\(\(offer\)/);
  assert.match(source, /id: offer\.id/);
  assert.match(source, /name: offer\.title/);
});

test("cada addon recomendado existe con el mismo nombre en /addons", () => {
  const source = read("app/routes/addons.tsx");
  const offerByLegacyId: Record<string, string> = {
    whatsapp: "whatsapp-business",
    automatizaciones: "reputation-reviews",
    "ai-conversacional": "conversational-ai",
    sms: "telephony-sms",
    campaigns: "campaigns-diffusion",
    voice: "voice-ai",
    integrations: "connections-integrations",
  };
  for (const [id, addon] of Object.entries(addonCatalog)) {
    const offer = ADDON_OFFERS.find((candidate) => candidate.id === offerByLegacyId[id]);
    assert.ok(offer, `addon ${id} no existe en el catálogo comercial`);
    assert.equal(offer.title.replaceAll(" y ", " & ").replaceAll(" e ", " & "), addon.name, `el catálogo público no conserva el nombre de ${id}`);
  }
  assert.match(source, /ADDON_OFFERS\.map\(\(offer\)/);
  assert.match(source, /name: offer\.title/);
});

test("cada artículo recomendado existe en el catálogo editorial de Aprende", () => {
  const source = read("app/content/learn.ts");
  for (const article of Object.values(learnCatalog)) {
    assert.ok(source.includes(`slug: "${article.slug}"`), `slug ${article.slug} no existe en learn.ts`);
    assert.ok(source.includes(`title: "${article.title}"`), `título ${article.title} no existe en learn.ts`);
  }
});
