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
  assert(await page.getByRole("heading", { name: "Añade capacidades cuando las necesites." }).isVisible(), `${label} no mostró el hero.`);
  const vico = page.locator(".addons-hero__vico");
  assert(await vico.getAttribute("src") === "/assets/selected/illustrations/vico-addons.webp", `${label} no mostró la variante de Vico para Complementos.`);
  assert(await vico.getAttribute("alt") === "Vico presenta capacidades digitales conectadas para tu negocio.", `${label} no describió la ilustración de Vico.`);
  assert(await vico.evaluate((image) => image.complete && image.naturalWidth > 0), `${label} no cargó la ilustración de Vico para Complementos.`);
  for (const name of ["WhatsApp Business", "Telefonía y SMS", "Reputación y Reseñas", "Campañas y Difusión", "IA Conversacional", "IA de Voz", "Conexiones e Integraciones"]) {
    assert(await page.locator(".addon-card").getByRole("heading", { name, exact: true }).isVisible(), `${label} no mostró el addon ${name}.`);
  }
  assert(await page.locator(".addons-hero").getByRole("link", { name: "Encontrar qué necesito" }).getAttribute("href") === "/diagnostico", `${label} CTA de Diagnóstico incorrecto.`);
  assert(await page.locator(".addons-hero").getByRole("link", { name: "Ver licencias" }).getAttribute("href") === "/licencias", `${label} CTA de Licencias incorrecto.`);
  assert(await page.getByRole("heading", { name: "Cada necesidad tiene su lugar." }).isVisible(), `${label} no mostró la separación comercial.`);
  assert(await page.getByRole("link", { name: /Ver servicios/i }).getAttribute("href") === "/servicios", `${label} CTA de Servicios incorrecto.`);
  assert(await page.locator(".addon-card__price").first().innerText() === "Desde $15/mes + consumo", `${label} propuesta WhatsApp no respeta el umbral documentado de margen bruto.`);
  assert(await page.locator('a[href="/addons/whatsapp-business"]').count() === 1, `${label} falta ficha de beneficios de WhatsApp.`);
  assert(!(await page.locator("main").innerText()).includes("$9/mes"), `${label} conserva fees ficticios anteriores.`);

  await page.getByRole("link", { name: "Encontrar qué necesito" }).focus();
  assert(await page.getByRole("link", { name: "Encontrar qué necesito" }).evaluate((element) => document.activeElement === element), `${label} CTA no recibe foco.`);
  await assertNoOverflow(page, label);
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert(await vico.evaluate((image) => getComputedStyle(image).animationName === "none"), `${label} no respeta movimiento reducido.`);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(400);
  const transformStart = await vico.evaluate((image) => getComputedStyle(image).transform);
  await page.waitForTimeout(750);
  const transformEnd = await vico.evaluate((image) => getComputedStyle(image).transform);
  assert(transformStart !== transformEnd, `${label} no anima Vico con movimiento permitido.`);
  await browser.close();
}

for (const [width, height] of [[1366, 900], [768, 900], [390, 844], [360, 800]]) {
  await runViewport(width, height);
}

console.log("PASS: Addons verificó hero/Vico, siete complementos V1, precios/costes, separación licencia/addon/servicio, CTAs, metadata, sitemap, foco, movimiento normal/reducido y responsive 1366/768/390/360.");
