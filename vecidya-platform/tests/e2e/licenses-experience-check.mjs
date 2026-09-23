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

  await page.goto(new URL("/licencias", baseUrl).toString(), { waitUntil: "networkidle" });
  assert(await page.locator("h1").count() === 1, `${label} Licencias debe tener un único H1.`);
  assert(await page.locator('link[rel="canonical"]').getAttribute("href") === "https://vecidya.com/licencias", `${label} canonical incorrecta.`);
  assert(await page.locator('meta[name="description"]').count() === 1, `${label} Licencias no tiene description.`);
  assert(await page.locator('meta[property="og:image"]').count() === 1, `${label} Licencias no tiene Open Graph image.`);
  const sitemap = await fetch(new URL("/sitemap.xml", baseUrl));
  assert((await sitemap.text()).includes("/licencias"), `${label} sitemap no incluye Licencias.`);
  assert(await page.getByRole("heading", { name: "Una base digital que crece contigo." }).isVisible(), `${label} no mostró el hero.`);
  for (const name of ["Cuadra", "Barrio", "Ciudad"]) {
    assert(await page.getByRole("heading", { name, exact: true }).isVisible(), `${label} no mostró la licencia ${name}.`);
  }
  assert(await page.getByRole("link", { name: "Encontrar mi punto de partida" }).getAttribute("href") === "/diagnostico", `${label} CTA de Diagnóstico incorrecto.`);
  assert(await page.getByRole("link", { name: "Ver servicios" }).getAttribute("href") === "/servicios", `${label} CTA de Servicios incorrecto.`);
  assert(await page.getByRole("heading", { name: "La evolución empieza con una señal real." }).isVisible(), `${label} no mostró evolución.`);
  assert(await page.getByRole("heading", { name: "Amplía tu sistema cuando lo necesites." }).isVisible(), `${label} no mostró addons.`);
  assert(await page.getByRole("heading", { name: "Decidir también puede ser sencillo." }).isVisible(), `${label} no mostró FAQ.`);
  assert(await page.getByText("Aún no hay precios públicos ni contratación en línea.").isVisible(), `${label} no aclaró el estado público de los precios.`);
  assert(await page.getByRole("link", { name: "Consultar disponibilidad" }).count() === 3, `${label} no ofrece consultar disponibilidad para cada nivel.`);
  assert(!(await page.content()).match(/USD\s*(39|59|89)\/mes/), `${label} mostró importes internos como precios públicos.`);
  assert(!(await page.content()).match(/oferta limitada|promoción|compra inmediata|checkout/i), `${label} contiene lenguaje comercial no autorizado.`);

  if (width > 760) {
    assert(await page.locator(".licenses-compare-table").isVisible(), `${label} no mostró la tabla comparativa.`);
  } else {
    assert(await page.locator(".licenses-compare-mobile").isVisible(), `${label} no mostró el comparador móvil.`);
    await page.locator(".licenses-compare-mobile details").first().locator("summary").click();
    assert(await page.locator(".licenses-compare-mobile details").first().locator("dd").count() === 5, `${label} comparador móvil incompleto.`);
  }

  await page.getByRole("link", { name: "Encontrar mi punto de partida" }).focus();
  assert(await page.getByRole("link", { name: "Encontrar mi punto de partida" }).evaluate((element) => document.activeElement === element), `${label} CTA no recibe foco.`);
  await assertNoOverflow(page, label);
  await browser.close();
}

for (const [width, height] of [[1366, 900], [768, 900], [390, 844], [360, 800]]) {
  await runViewport(width, height);
}

console.log("PASS: Licencias verificó hero, niveles, disponibilidad, ausencia de precios públicos, comparador desktop/móvil, evolución, addons, FAQ, CTAs, metadata, keyboard focus y responsive 1366/768/390/360.");
