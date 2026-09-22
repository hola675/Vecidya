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

  await page.goto(new URL("/aprende", baseUrl).toString(), { waitUntil: "networkidle" });
  assert(await page.locator("h1").count() === 1, `${label} Aprende debe tener un único H1.`);
  assert(await page.locator('link[rel="canonical"]').getAttribute("href") === "https://vecidya.com/aprende", `${label} canonical incorrecta.`);
  assert(await page.locator('meta[name="description"]').count() === 1, `${label} Aprende no tiene description.`);
  assert(await page.locator('meta[property="og:image"]').count() === 1, `${label} Aprende no tiene Open Graph image.`);
  assert(await page.getByRole("heading", { name: "Empieza por la pregunta que tienes hoy." }).isVisible(), `${label} no mostró temas.`);
  assert(await page.getByRole("heading", { name: "Estamos preparando las primeras guías." }).isVisible(), `${label} no mostró estado editorial honesto.`);
  assert(await page.getByRole("link", { name: "Hacer diagnóstico" }).first().getAttribute("href") === "/diagnostico", `${label} CTA de Diagnóstico incorrecto.`);
  assert(await page.getByRole("link", { name: "Hacer una pregunta" }).getAttribute("href") === "/contacto", `${label} CTA de Contacto incorrecto.`);
  assert(await page.getByRole("link", { name: /Ubicar mi punto de partida/i }).getAttribute("href") === "/diagnostico", `${label} recurso vacío no enlazó Diagnóstico.`);
  assert(!(await page.content()).match(/autor:|lectura|lectores|artículos publicados/i), `${label} contiene metadata editorial inventada.`);
  await page.getByRole("link", { name: "Hacer diagnóstico" }).first().focus();
  assert(await page.getByRole("link", { name: "Hacer diagnóstico" }).first().evaluate((element) => document.activeElement === element), `${label} CTA no recibe foco.`);
  await assertNoOverflow(page, label);

  await browser.close();
}

for (const [width, height] of [[1366, 900], [768, 900], [390, 844], [360, 800]]) {
  await runViewport(width, height);
}

console.log("PASS: Aprende verificó propósito, temas, estado editorial vacío honesto, CTAs, metadata, keyboard focus y responsive 1366/768/390/360.");
