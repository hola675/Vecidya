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
  // El sitio comercial público no debe revelar la marca del proveedor de CRM.
  assert(!/\bGHL\b|HighLevel|GoHighLevel/i.test(html), `${path} revela marca de proveedor CRM.`);
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
    assert(await page.locator("main").count() === 1, `${label} ${path} debe tener un único main.`);
    assert(await page.locator('meta[property="og:image"]').count() === 1, `${label} ${path} no tiene og:image.`);
    assert(await page.locator("img").evaluateAll((images) => images.every((image) => image.hasAttribute("alt") && image.hasAttribute("width") && image.hasAttribute("height"))), `${label} ${path} tiene imágenes sin alt o dimensiones.`);
    await assertNoOverflow(page, `${label} ${path}`);
  }
  await page.goto(new URL("/aprende", baseUrl).toString(), { waitUntil: "networkidle" });
  for (const href of ["/vecindario", "/servicios", "/aprende", "/contacto", "/diagnostico"]) {
    assert(await page.locator(`header .site-nav a[href="${href}"]`).count() === 1 || await page.locator(`header .site-nav__panel a[href="${href}"]`).count() === 1, `${label} header no enlaza ${href}.`);
  }
  for (const href of ["/licencias", "/servicios", "/addons"]) {
    assert(await page.locator(`header .site-nav__panel a[href="${href}"]`).count() === 1, `${label} menú Soluciones no enlaza ${href}.`);
  }
  assert(await page.locator('footer .site-footer__nav a[href="/sobre-nosotros"]').count() === 1, `${label} Nosotros no está disponible en footer.`);
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
const robotsResponse = await fetch(new URL("/robots.txt", baseUrl));
const robots = await robotsResponse.text();
assert(robotsResponse.status === 200 && robots.includes("Disallow: /app") && robots.includes("Sitemap:"), "robots.txt no contiene las guardas esperadas.");
const faviconResponse = await fetch(new URL("/favicon.ico", baseUrl), { redirect: "manual" });
assert(faviconResponse.status === 302 && faviconResponse.headers.get("location")?.includes("vecidya-icon-3d.png"), "favicon.ico no redirige al asset canónico.");
const legacyResponse = await fetch(new URL("/que-debes-saber", baseUrl), { redirect: "manual" });
assert(legacyResponse.status === 301 && legacyResponse.headers.get("location")?.endsWith("/aprende"), "El alias legado no conserva su redirect 301.");
const sitemapResponse = await fetch(new URL("/sitemap.xml", baseUrl));
const sitemap = await sitemapResponse.text();
assert(sitemapResponse.status === 200, `Sitemap devolvió ${sitemapResponse.status}.`);
for (const path of ["/", "/vecindario", "/servicios", "/licencias", "/addons", "/diagnostico", "/aprende", "/sobre-nosotros", "/unete", "/contacto", "/privacidad"]) assert(sitemap.includes(path), `Sitemap no incluye ${path}.`);
for (const path of ["/app", "/app/internal", "/api/auth", "/login", "/register"]) assert(!sitemap.includes(path), `Sitemap incluye ruta privada ${path}.`);

const licenses = await fetchPage("/licencias");
assert(licenses.includes("Precios públicos en USD."), "Licencias no aclara sus precios públicos.");
assert(/USD\s*39\/mes/.test(licenses) && /USD\s*59\/mes/.test(licenses) && /USD\s*89\/mes/.test(licenses), "Licencias no muestra los tres precios públicos.");
assert((licenses.match(/Empezar con/g) ?? []).length === 3, "Licencias no ofrece el CTA en cada nivel.");
const addons = await fetchPage("/addons");
assert(/Costes de uso/i.test(addons) && /Desde \$15\/mes \+ consumo/.test(addons) && /margen bruto objetivo del 20\s*%/i.test(addons), "Complementos no explican la propuesta WhatsApp desde USD 15 y el margen objetivo de costes externos.");

console.log("PASS: UX-002.7 verificó flujo comercial, CTAs cruzados, navegación agrupada, SEO, precios públicos de licencias en USD, exclusión de rutas privadas y responsive 1366/768/390/360.");
