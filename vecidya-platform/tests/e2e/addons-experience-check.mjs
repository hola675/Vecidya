import { existsSync } from "node:fs";

import { chromium } from "playwright";

import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();

const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return [...document.body.querySelectorAll("*")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.right > width + 1;
      })
      .slice(0, 5)
      .map((element) => ({ tag: element.tagName, className: element.className, right: element.getBoundingClientRect().right, width }));
  });
  assert(overflow.length === 0, `${label} tiene overflow horizontal: ${JSON.stringify(overflow)}`);
}

async function runViewport(width, height) {
  const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  const page = await browser.newPage({ viewport: { width, height } });
  const label = `${width}x${height}`;

  await page.goto(new URL("/addons", baseUrl).toString(), { waitUntil: "networkidle" });
  assert(await page.locator("h1").count() === 1, `${label} Addons debe tener un único H1.`);
  assert(await page.locator('link[rel="canonical"]').getAttribute("href") === "https://vecidya.com/addons", `${label} canonical incorrecta.`);
  assert(await page.locator('meta[name="description"]').count() === 1, `${label} Addons no tiene description.`);
  assert(await page.locator('meta[property="og:image"]').count() === 1, `${label} Addons no tiene Open Graph image.`);
  const sitemap = await fetch(new URL("/sitemap.xml", baseUrl));
  assert((await sitemap.text()).includes("/addons"), `${label} sitemap no incluye Addons.`);
  assert(await page.getByRole("heading", { name: "Amplía tu sistema cuando tu negocio lo necesite." }).isVisible(), `${label} no mostró el hero.`);
  assert(await page.getByRole("heading", { name: "¿Qué es un addon?" }).isVisible(), `${label} no mostró la definición.`);
  for (const name of ["Comunicación", "Automatización", "Inteligencia Artificial", "Integraciones"]) {
    assert(await page.locator(".addons-category").getByRole("heading", { name, exact: true }).isVisible(), `${label} no mostró la categoría ${name}.`);
  }
  for (const name of ["WhatsApp", "SMS", "Telefonía", "Automatizaciones", "AI Conversacional", "AI Voice", "Integraciones"]) {
    assert(await page.locator(".addon-card").getByRole("heading", { name, exact: true }).isVisible(), `${label} no mostró el addon ${name}.`);
  }
  assert(await page.locator(".addons-hero").getByRole("link", { name: "Encontrar qué necesito" }).getAttribute("href") === "/diagnostico", `${label} CTA de Diagnóstico incorrecto.`);
  assert(await page.locator(".addons-hero").getByRole("link", { name: "Ver licencias" }).getAttribute("href") === "/licencias", `${label} CTA de Licencias incorrecto.`);
  assert(await page.getByRole("heading", { name: "Cada necesidad tiene su lugar." }).isVisible(), `${label} no mostró la separación comercial.`);
  assert(await page.getByRole("link", { name: /Ver servicios/i }).getAttribute("href") === "/servicios", `${label} CTA de Servicios incorrecto.`);
  assert(!(await page.content()).match(/precio de addon|USD \d+|checkout|compra inmediata|promoción/i), `${label} contiene precio o lenguaje comercial no autorizado.`);

  await page.getByRole("link", { name: "Encontrar qué necesito" }).focus();
  assert(await page.getByRole("link", { name: "Encontrar qué necesito" }).evaluate((element) => document.activeElement === element), `${label} CTA no recibe foco.`);
  await assertNoOverflow(page, label);
  await browser.close();
}

for (const [width, height] of [[1366, 900], [768, 900], [390, 844], [360, 800]]) {
  await runViewport(width, height);
}

console.log("PASS: Addons verificó hero, definición, categorías, cards, separación licencia/addon/servicio, CTAs, metadata, sitemap, keyboard focus y responsive 1366/768/390/360.");
