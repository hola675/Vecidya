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
  assert(await page.getByRole("heading", { name: "Elige tu sistema base." }).isVisible(), `${label} no mostró el hero.`);
  for (const name of ["Cuadra", "Barrio", "Ciudad"]) {
    assert(await page.getByRole("heading", { name, exact: true }).isVisible(), `${label} no mostró la licencia ${name}.`);
  }
  assert(await page.getByRole("link", { name: "Encontrar mi punto de partida" }).getAttribute("href") === "/diagnostico", `${label} CTA de Diagnóstico incorrecto.`);
  assert(await page.getByRole("link", { name: "Ver servicios" }).getAttribute("href") === "/servicios", `${label} CTA de Servicios incorrecto.`);
  assert(await page.getByRole("heading", { name: "Tres productos. Una decisión clara." }).isVisible(), `${label} no mostró los productos.`);
  assert(await page.getByRole("heading", { name: "Amplía tu sistema cuando lo necesites." }).isVisible(), `${label} no mostró addons.`);
  assert(await page.getByText("Precios públicos en USD.").isVisible(), `${label} no aclaró precios.`);
  const comparisonRows = await page.locator(".licenses-compare-table tbody tr").allTextContents();
  assert(comparisonRows.some((row) => row.includes("Seguimiento CRM") && row.includes("No incluido") && row.includes("Proceso principal") && row.includes("Coordinado")), `${label} no deja claro que Cuadra no incluye seguimiento CRM.`);
  assert(comparisonRows.some((row) => row.includes("Automatizaciones CRM") && row.includes("No incluidas") && row.includes("Del proceso principal") && row.includes("Entre procesos")), `${label} no deja claro que Cuadra no incluye automatizaciones CRM.`);
  assert(!comparisonRows.some((row) => /Seguimiento.*Básico|Automatización.*Inicial/i.test(row)), `${label} conserva copy CRM ambiguo en Cuadra.`);
  assert(await page.getByRole("link", { name: /Empezar con/ }).count() === 3, `${label} no ofrece CTA para cada nivel.`);
  for (const plan of ["cuadra", "barrio", "ciudad"]) {
    const visibleName = plan[0].toUpperCase() + plan.slice(1);
    assert(await page.getByRole("link", { name: `Empezar con ${visibleName}` }).getAttribute("href") === `/contacto?interes=${plan}`, `${label} el CTA de ${visibleName} no conserva la selección.`);
  }
  assert(comparisonRows.some((row) => row.includes("MiniWeb y Vecindario") && row.includes("Incluidos")), `${label} no presenta MiniWeb y Vecindario.`);
  assert(comparisonRows.some((row) => row.includes("CRM operativo") && row.includes("No incluido")), `${label} no separa Cuadra del CRM.`);
  assert(await page.getByText(/Cuadra funciona de forma independiente/).isVisible(), `${label} no explica la independencia de Cuadra.`);
  for (const plan of ["cuadra", "barrio", "ciudad"]) {
    assert(await page.getByRole("link", { name: `Ver detalles de ${plan[0].toUpperCase() + plan.slice(1)}` }).getAttribute("href") === `/licencias/${plan}`, `${label} falta ficha detallada ${plan}`);
  }
  assert(!(await page.locator("main").innerText()).match(/\bGHL\b|HighLevel|GoHighLevel/i), `${label} muestra marca de proveedor en Licencias.`);

  const html = await page.content();
  for (const price of ["USD 39/mes", "USD 59/mes", "USD 89/mes"]) {
    assert(html.includes(price), `${label} no mostró el precio público ${price}.`);
  }
  assert(!html.match(/oferta limitada|promoción|compra inmediata|checkout/i), `${label} contiene lenguaje comercial no autorizado.`);

  if (width > 760) {
    assert(await page.locator(".licenses-compare-table").isVisible(), `${label} no mostró la tabla comparativa.`);
  } else {
    assert(await page.locator(".licenses-compare-mobile").isVisible(), `${label} no mostró el comparador móvil.`);
    await page.locator(".licenses-compare-mobile details").first().locator("summary").click();
    assert(await page.locator(".licenses-compare-mobile details").first().locator("dd").count() === 7, `${label} comparador móvil incompleto.`);
  }

  await page.getByRole("link", { name: "Encontrar mi punto de partida" }).focus();
  assert(await page.getByRole("link", { name: "Encontrar mi punto de partida" }).evaluate((element) => document.activeElement === element), `${label} CTA no recibe foco.`);
  await assertNoOverflow(page, label);
  await browser.close();
}

for (const [width, height] of [[1366, 900], [768, 900], [390, 844], [360, 800]]) {
  await runViewport(width, height);
}

console.log("PASS: Licencias verificó hero, tres productos, precios públicos en USD, comparador desktop/móvil, complementos, CTAs, metadata, keyboard focus y responsive 1366/768/390/360.");
