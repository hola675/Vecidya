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

  const response = await page.goto(new URL("/privacidad", baseUrl).toString(), { waitUntil: "networkidle" });
  assert(response?.status() === 200, `${label} Privacidad no devolvió 200.`);
  assert(await page.locator("h1").count() === 1, `${label} Privacidad debe tener un único H1.`);
  assert(await page.locator('link[rel="canonical"]').getAttribute("href") === "https://vecidya.com/privacidad", `${label} canonical incorrecta.`);
  assert(await page.locator('meta[name="description"]').count() === 1, `${label} Privacidad no tiene description.`);
  assert(await page.locator('meta[name="robots"]').getAttribute("content") === "index, follow", `${label} robots incorrecto.`);
  assert(await page.getByRole("heading", { name: "La plataforma usa información necesaria para operar." }).isVisible(), `${label} no mostró datos actuales.`);
  assert(await page.getByRole("heading", { name: "¿Necesitas revisar o corregir algo?" }).isVisible(), `${label} no mostró contacto de derechos.`);
  assert(await page.locator('a[href^="mailto:hola@vecidya.com"]').count() >= 2, `${label} no mostró mailto de privacidad.`);
  assert(await page.getByRole("link", { name: "Ver contacto" }).getAttribute("href") === "/contacto", `${label} no enlazó Contacto.`);
  assert(await page.getByRole("link", { name: "Volver al inicio" }).getAttribute("href") === "/", `${label} no enlazó Inicio.`);
  assert(await page.locator('a[href="/terminos"]').count() === 0, `${label} enlaza términos inexistentes.`);
  await page.getByRole("link", { name: "Ver contacto" }).focus();
  assert(await page.getByRole("link", { name: "Ver contacto" }).evaluate((element) => document.activeElement === element), `${label} el enlace no recibe foco.`);
  await assertNoOverflow(page, label);

  const footerLinks = await page.locator("footer a").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  for (const href of ["/privacidad", "/contacto", "/sobre-nosotros", "/aprende"]) {
    assert(footerLinks.includes(href), `${label} footer no incluye ${href}.`);
  }

  await browser.close();
}

for (const [width, height] of [[1366, 900], [768, 900], [390, 844], [360, 800]]) {
  await runViewport(width, height);
}

console.log("PASS: Legal/Trust verificó Privacidad 200, metadata, mailto, footer, ausencia de términos inexistentes, keyboard focus y responsive 1366/768/390/360.");
