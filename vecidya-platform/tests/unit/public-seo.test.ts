import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { PUBLIC_SITE_ORIGIN, publicListingRobots, publicSiteUrl } from "../../app/lib/public-seo.ts";
import { loader as robotsLoader } from "../../app/routes/robots.ts";

test("SEO público usa únicamente el dominio oficial de Vecidya", () => {
  assert.equal(PUBLIC_SITE_ORIGIN, "https://vecidya.com");
  assert.equal(publicSiteUrl("/sitemap.xml"), "https://vecidya.com/sitemap.xml");
  assert.equal(publicSiteUrl("/aprende/una-guia"), "https://vecidya.com/aprende/una-guia");
  for (const invalid of ["", "sitemap.xml", "//otro-dominio.test/falso"]) {
    assert.throws(() => publicSiteUrl(invalid));
  }
});

test("robots.txt apunta siempre al sitemap oficial", async () => {
  const response = robotsLoader();
  assert.equal(response.status, 200);
  const content = await response.text();
  assert.match(content, /Sitemap: https:\/\/vecidya\.com\/sitemap\.xml/);
  assert.doesNotMatch(content, /Sitemap: https?:\/\/(?!vecidya\.com\/)/);
});

test("sitemap.xml no toma el dominio externo de request.url", () => {
  const path = join(process.cwd(), "app", "routes", "sitemap.ts");
  const source = readFileSync(path, "utf8");
  assert.match(source, /urlEntry\(publicSiteUrl\(path\)\)/);
  assert.doesNotMatch(source, /new URL\(request\.url\)|\$\{origin\}/);
});

test("las búsquedas y filtros públicos de Aprende no se indexan", () => {
  assert.equal(publicListingRobots(""), "index, follow");
  assert.equal(publicListingRobots("?q=erp"), "noindex, follow");
  assert.equal(publicListingRobots("?tema=Gestión"), "noindex, follow");
  const source = readFileSync(join(process.cwd(), "app", "routes", "knowledge.tsx"), "utf8");
  assert.match(source, /publicListingRobots\(location\.search\)/);
});
