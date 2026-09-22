import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { chromium } from "playwright";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const d1Database = process.env.D1_DATABASE_NAME ?? "DB";
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const prohibitedPatterns = [
  /\bratings?\b/i,
  /\breviews?\b/i,
  /\btestimonios?\b/i,
  /\bleads?\b/i,
  /\bclientes?\b/i,
  /\boportunidades? (pendientes|comerciales|ganadas|perdidas)\b/i,
  /\b\d+%\b/,
  /★★★★★/,
];

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-product-a-"));
  const file = join(directory, "query.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute ${d1Database} --local --file ${file}`], { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  rmSync(directory, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(`D1 local falló: ${result.stderr || result.stdout}`);
  return result.stdout;
}

function seedVecidyaProfile() {
  executeD1(`
    DELETE FROM business_profile WHERE slug = 'vecidya';
    DELETE FROM member WHERE organization_id IN (SELECT id FROM organization WHERE slug = 'vecidya-product-experience-a');
    DELETE FROM organization WHERE slug = 'vecidya-product-experience-a';
    INSERT INTO organization (id, name, slug, created_at) VALUES
      ('org-product-experience-a-vecidya', 'Vecidya', 'vecidya-product-experience-a', ${Date.now()});
    INSERT INTO business_profile (
      id, organization_id, display_name, slug, short_description, description, category, city, country, phone, public_email, website_url, logo_url, status, created_at, updated_at
    ) VALUES (
      'profile-product-experience-a-vecidya',
      'org-product-experience-a-vecidya',
      'Vecidya',
      'vecidya',
      'Comunidad digital para negocios, emprendedores y profesionales que quieren ser encontrados, entendidos y contactados.',
      'Vecidya ayuda a ordenar presencia digital, servicios y próximos pasos para negocios reales sin inventar métricas, reseñas ni inventario artificial.',
      'Servicios digitales y desarrollo empresarial',
      'Medellín',
      'Colombia',
      NULL,
      'hola@vecidya.com',
      'https://vecidya.com',
      '/brand/vecidya-app-icon.png',
      'published',
      ${Date.now()},
      ${Date.now()}
    );
  `);
}

function cleanupVecidyaProfile() {
  executeD1(`
    DELETE FROM business_profile WHERE id = 'profile-product-experience-a-vecidya';
    DELETE FROM organization WHERE id = 'org-product-experience-a-vecidya';
  `);
}

async function fetchHtml(path) {
  const response = await fetch(new URL(path, baseUrl));
  const html = await response.text();
  assert(response.status === 200, `${path} devolvió ${response.status}`);
  return html;
}

function extractJsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
  assert(match, "No se encontró JSON-LD en el perfil.");
  return JSON.parse(match[1].replaceAll("\\u003c", "<"));
}

function assertNoProhibitedContent(label, html) {
  for (const pattern of prohibitedPatterns) {
    assert(!pattern.test(html), `${label} contiene patrón prohibido: ${pattern}`);
  }
}

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return [...document.body.querySelectorAll("*")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.right > width + 1;
      })
      .slice(0, 5)
      .map((element) => ({ tag: element.tagName, className: element.className, text: element.textContent?.trim().slice(0, 80), right: element.getBoundingClientRect().right, width }));
  });
  assert(overflow.length === 0, `${label} tiene overflow horizontal: ${JSON.stringify(overflow)}`);
}

async function assertPage(page, path, label) {
  await page.goto(new URL(path, baseUrl).toString(), { waitUntil: "networkidle" });
  assert(await page.locator("body").isVisible(), `${label} no renderizó body visible.`);
  await assertNoOverflow(page, label);
  const html = await page.content();
  assertNoProhibitedContent(label, html);
}

async function runViewport(width, height) {
  const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  const page = await browser.newPage({ viewport: { width, height } });
  const label = `${width}x${height}`;
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("Failed to fetch manifest patches")) consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await assertPage(page, "/", `${label} Home`);
  await page.getByRole("link", { name: /Explorar el Vecindario|Explorar negocios publicados/i }).first().click();
  await page.waitForURL("**/vecindario");
  await assertNoOverflow(page, `${label} Vecindario`);

  await page.getByRole("searchbox", { name: /Buscar por nombre/i }).fill("Vecidya");
  await page.getByRole("button", { name: "Buscar" }).click();
  await page.waitForURL("**/vecindario?q=Vecidya*");
  await page.locator('a[href="/vecindario/vecidya"]').first().click();
  await page.waitForURL("**/vecindario/vecidya");
  await assertNoOverflow(page, `${label} Perfil Vecidya`);

  const email = page.getByRole("link", { name: /Enviar email/i });
  await expectAttribute(email, "href", "mailto:hola@vecidya.com", `${label} email del perfil`);
  const website = page.getByRole("link", { name: /Visitar sitio web/i });
  await expectAttribute(website, "href", "https://vecidya.com", `${label} web del perfil`);
  await page.getByRole("link", { name: /Volver al Vecindario/i }).click();
  await page.waitForURL("**/vecindario");

  await page.goto(new URL("/vecindario/vecidya", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByRole("link", { name: /Ver servicios/i }).click();
  await page.waitForURL("**/servicios");
  await assertNoOverflow(page, `${label} Servicios`);

  await page.goto(new URL("/vecindario/vecidya", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByRole("link", { name: /Hacer diagnóstico/i }).last().click();
  await page.waitForURL("**/diagnostico");
  await assertNoOverflow(page, `${label} Diagnóstico`);

  await page.goto(new URL("/vecindario/vecidya", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByRole("link", { name: /Hablar con Vecidya/i }).click();
  await page.waitForURL("**/contacto");
  await assertNoOverflow(page, `${label} Contacto`);
  await expectAttribute(page.getByRole("link", { name: /Escribir a hola@vecidya.com/i }), "href", "mailto:hola@vecidya.com", `${label} email de contacto`);

  assert(consoleErrors.length === 0, `${label} registró errores de consola: ${consoleErrors.join(" | ")}`);
  await browser.close();
}

async function expectAttribute(locator, attribute, expected, label) {
  const value = await locator.getAttribute(attribute);
  assert(value === expected, `${label}: ${attribute}=${value}; se esperaba ${expected}`);
}

seedVecidyaProfile();
try {
  for (const path of ["/", "/vecindario", "/vecindario/vecidya", "/servicios", "/diagnostico", "/contacto"]) {
    const html = await fetchHtml(path);
    assert(html.includes("<title") && html.includes("description") && html.includes("canonical"), `${path} no contiene metadata base.`);
    assertNoProhibitedContent(path, html);
  }

  const directory = await fetchHtml("/vecindario?q=Vecidya");
  assert(directory.includes("Vecidya") && directory.includes("/vecindario/vecidya"), "La búsqueda no encontró Vecidya.");
  const literalPercent = await fetchHtml("/vecindario?q=%25");
  assert(!literalPercent.includes("/vecindario/vecidya"), "La búsqueda interpretó % como comodín LIKE.");
  const literalUnderscore = await fetchHtml("/vecindario?q=_");
  assert(!literalUnderscore.includes("/vecindario/vecidya"), "La búsqueda interpretó _ como comodín LIKE.");
  const filtered = await fetchHtml("/vecindario?category=Servicios+digitales+y+desarrollo+empresarial");
  assert(filtered.includes("Vecidya"), "El filtro por categoría no encontró Vecidya.");

  const profile = await fetchHtml("/vecindario/vecidya");
  assert(profile.includes("href=\"/servicios\"") && profile.includes("href=\"/diagnostico\"") && profile.includes("href=\"/contacto\""), "El perfil no enlaza servicios, diagnóstico y contacto.");
  assert(profile.includes("mailto:hola@vecidya.com") && profile.includes("https://vecidya.com"), "El perfil no muestra email o web reales.");

  const schema = extractJsonLd(profile);
  assert(schema["@type"] === "LocalBusiness", "JSON-LD no usa LocalBusiness.");
  assert(schema.name === "Vecidya", "JSON-LD no usa el nombre real.");
  assert(schema.email === "hola@vecidya.com", "JSON-LD no usa el email real.");
  assert(schema.url.endsWith("/vecindario/vecidya"), "JSON-LD no usa el slug real.");
  assert(schema.address?.addressLocality === "Medellín" && schema.address?.addressCountry === "Colombia", "JSON-LD no usa ubicación real.");

  await runViewport(1366, 900);
  await runViewport(390, 844);
  await runViewport(360, 800);

  console.log("PASS: PRODUCT-EXPERIENCE-001 A verificó recorrido público desktop/móvil, Vecidya real, búsqueda, filtro, CTAs, metadata, JSON-LD y ausencia de datos ficticios.");
} finally {
  cleanupVecidyaProfile();
}
