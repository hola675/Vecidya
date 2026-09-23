import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { addonCatalog, learnCatalog, licenseCatalog, serviceCatalog } from "../../../app/features/diagnostic/index.ts";

const read = (path: string) => readFileSync(new URL(`../../../${path}`, import.meta.url), "utf8");

test("cada servicio recomendado existe como anchor y título en /servicios", () => {
  const source = read("app/routes/services.tsx");
  for (const [id, service] of Object.entries(serviceCatalog)) {
    assert.ok(source.includes(`id: "${id}"`), `anchor ${id} no existe en services.tsx`);
    assert.ok(source.includes(`title: "${service.title}"`), `título ${service.title} no existe en services.tsx`);
  }
});

test("cada licencia recomendada existe con el mismo nombre y objetivo en /licencias", () => {
  const source = read("app/routes/licenses.tsx");
  for (const [id, license] of Object.entries(licenseCatalog)) {
    assert.ok(source.includes(`id: "${id}"`), `licencia ${id} no existe en licenses.tsx`);
    assert.ok(source.includes(`name: "${license.name}"`), `nombre ${license.name} no existe en licenses.tsx`);
    assert.ok(source.includes(`objective: "${license.objective}"`), `objetivo de ${license.name} difiere de licenses.tsx`);
  }
});

test("cada addon recomendado existe con el mismo nombre en /addons", () => {
  const source = read("app/routes/addons.tsx");
  for (const addon of Object.values(addonCatalog)) {
    assert.ok(source.includes(`name: "${addon.name}"`), `addon ${addon.name} no existe en addons.tsx`);
  }
});

test("cada artículo recomendado existe en el catálogo editorial de Aprende", () => {
  const source = read("app/content/learn.ts");
  for (const article of Object.values(learnCatalog)) {
    assert.ok(source.includes(`slug: "${article.slug}"`), `slug ${article.slug} no existe en learn.ts`);
    assert.ok(source.includes(`title: "${article.title}"`), `título ${article.title} no existe en learn.ts`);
  }
});
