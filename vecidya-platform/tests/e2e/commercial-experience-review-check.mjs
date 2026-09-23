import { existsSync } from "node:fs";

import { chromium } from "playwright";

import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const commercialPaths = ["/aprende", "/diagnostico", "/licencias", "/addons", "/servicios", "/contacto"];

async function fetchPage(path) {
  const response = await fetch(new URL(path, baseUrl));
  const html = await response.text();
  assert(response.status === 200, `${path} devolvió ${response.status}`);
  assert(html.includes("<title") && html.includes('name="description"') && html.includes('rel="canonical"'), `${path} no tiene metadata SEO base.`);
  assert(!/\bGHL\b|HighLevel/i.test(html), `${path} expone GHL/HighLevel como producto público.`);
  return html;
}

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return [...document.body.querySelectorAll("*")].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.right > width + 1;
    }).slice(0, 3).map((element) => ({ tag: element.tagName, className: element.className }));
  });
  assert(overflow.length === 0, `${label} tiene overflow horizontal: ${JSON.stringify(overflow)}`);
}

async function runViewport(width, height) {
  const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  const page = await browser.newPage({ viewport: { width, height } });
  const label = `${width}x${height}`;
  for (const path of commercialPaths) {
    await page.goto(new URL(path, baseUrl).toString(), { waitUntil: "networkidle" });
    assert(await page.locator("h1").count() === 1, `${label} ${path} debe tener un único H1.`);
    await assertNoOverflow(page, `${label} ${path}`);
  }
  await page.goto(new URL("/aprende", baseUrl).toString(), { waitUntil: "networkidle" });
  for (const href of ["/vecindario", "/servicios", "/aprende", "/sobre-nosotros", "/diagnostico"]) {
    assert(await page.locator(`header .site-nav a[href="${href}"]`).count() === 1, `${label} header no enlaza ${href}.`);
  }
  await page.goto(new URL("/aprende", baseUrl).toString(), { waitUntil: "networkidle" });
  for (const href of ["/diagnostico", "/contacto"]) assert(await page.locator(`a[href="${href}"]`).count() > 0, `${label} Aprende no enlaza ${href}.`);
  await page.goto(new URL("/licencias", baseUrl).toString(), { waitUntil: "networkidle" });
  for (const href of ["/diagnostico", "/addons", "/servicios"]) assert(await page.locator(`a[href="${href}"]`).count() > 0, `${label} Licencias no enlaza ${href}.`);
  await page.goto(new URL("/addons", baseUrl).toString(), { waitUntil: "networkidle" });
  for (const href of ["/diagnostico", "/licencias", "/servicios"]) assert(await page.locator(`a[href="${href}"]`).count() > 0, `${label} Addons no enlaza ${href}.`);
  await page.goto(new URL("/servicios", baseUrl).toString(), { waitUntil: "networkidle" });
  for (const href of ["/diagnostico", "/contacto", "/licencias", "/addons"]) assert(await page.locator(`a[href="${href}"]`).count() > 0, `${label} Servicios no enlaza ${href}.`);
  await page.goto(new URL("/contacto", baseUrl).toString(), { waitUntil: "networkidle" });
  assert(await page.locator('a[href^="mailto:hola@vecidya.com"]').count() > 0, `${label} Contacto no expone el email real.`);
  await browser.close();
}

for (const [width, height] of [[1366, 900], [768, 900], [390, 844], [360, 800]]) await runViewport(width, height);

for (const path of commercialPaths) await fetchPage(path);
const sitemapResponse = await fetch(new URL("/sitemap.xml", baseUrl));
const sitemap = await sitemapResponse.text();
assert(sitemapResponse.status === 200, `Sitemap devolvió ${sitemapResponse.status}.`);
for (const path of ["/", "/vecindario", "/servicios", "/licencias", "/addons", "/diagnostico", "/aprende", "/sobre-nosotros", "/unete", "/contacto", "/privacidad"]) assert(sitemap.includes(path), `Sitemap no incluye ${path}.`);
for (const path of ["/app", "/app/internal", "/api/auth", "/login", "/register"]) assert(!sitemap.includes(path), `Sitemap incluye ruta privada ${path}.`);

const licenses = await fetchPage("/licencias");
assert(licenses.includes("USD 39/mes") && licenses.includes("USD 59/mes") && licenses.includes("USD 89/mes"), "Licencias no muestra las referencias esperadas.");
assert(/referencias comerciales.*No son precios publicados/i.test(licenses), "Licencias no etiqueta sus importes como referencias.");
const addons = await fetchPage("/addons");
assert(/no tienen precios publicados/i.test(addons), "Addons no mantiene la separación de precios.");

console.log("PASS: UX-002.7 verificó flujo comercial, CTAs cruzados, navegación, SEO, referencias de precio, exclusión de rutas privadas y responsive 1366/768/390/360.");
