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
  assert(await page.getByRole("heading", { name: "Empieza por una pregunta concreta." }).isVisible(), `${label} no mostró las guías.`);
  assert(await page.getByRole("heading", { name: /¿Qué es un CRM y por qué un negocio pequeño puede necesitarlo\?/i }).isVisible(), `${label} no mostró el artículo CRM.`);
  assert(await page.getByRole("link", { name: "Hacer diagnóstico" }).first().getAttribute("href") === "/diagnostico", `${label} CTA de Diagnóstico incorrecto.`);
  assert(await page.getByRole("link", { name: "Hacer una pregunta" }).getAttribute("href") === "/contacto", `${label} CTA de Contacto incorrecto.`);
  const articleLink = page.getByRole("link", { name: /Leer guía/i }).first();
  assert((await articleLink.getAttribute("href"))?.startsWith("/aprende/"), `${label} tarjeta no enlazó artículo.`);
  await page.getByRole("link", { name: "Hacer diagnóstico" }).first().focus();
  assert(await page.getByRole("link", { name: "Hacer diagnóstico" }).first().evaluate((element) => document.activeElement === element), `${label} CTA no recibe foco.`);
  await assertNoOverflow(page, label);

  const articleUrl = new URL((await articleLink.getAttribute("href")), baseUrl).toString();
  await page.goto(articleUrl, { waitUntil: "networkidle" });
  assert(await page.locator("h1").count() === 1, `${label} artículo debe tener un único H1.`);
  // Regresión TYPECHECK-001: `meta({ data })` dejó de recibir datos en React Router 8 y cada artículo
  // se publicaba como «Artículo no encontrado», `noindex, nofollow` y canonical a /aprende.
  const articleTitle = (await page.locator("h1").textContent())?.trim() ?? "";
  assert((await page.title()).startsWith(articleTitle), `${label} el título del documento no es el del artículo: «${await page.title()}».`);
  assert(!/noindex/i.test((await page.locator('meta[name="robots"]').getAttribute("content")) ?? ""), `${label} el artículo se sirve con noindex.`);
  assert(await page.locator('link[rel="canonical"]').getAttribute("href") === `https://vecidya.com${new URL(articleUrl).pathname}`, `${label} canonical del artículo incorrecta.`);
  assert(await page.locator('meta[property="og:type"]').getAttribute("content") === "article", `${label} el Open Graph del artículo no identifica el tipo article.`);
  assert(await page.getByText("Por Yoan Ortiz").isVisible(), `${label} artículo no muestra autoría.`);
  assert(await page.getByText("En esta guía", { exact: true }).isVisible(), `${label} artículo no muestra índice.`);
  assert(await page.getByRole("link", { name: /Revisar mi punto de partida digital|Explorar si IA tiene sentido|Hablar sobre un proceso/i }).count() > 0, `${label} artículo no muestra CTA contextual.`);
  assert(await page.getByText("Ejemplo hipotético", { exact: true }).isVisible(), `${label} la guía CRM no identifica explícitamente su ejemplo hipotético.`);
  assert(await page.getByRole("heading", { name: "De consulta a próximo paso: un ejemplo hipotético" }).isVisible(), `${label} la guía CRM no presenta su ejemplo práctico.`);
  assert(await page.getByRole("heading", { name: "Una rutina sencilla de seguimiento" }).isVisible(), `${label} la guía CRM no presenta una rutina aplicable.`);
  assert(await page.getByRole("heading", { name: "Fuentes y orientación adicional" }).isVisible(), `${label} la guía CRM no presenta sus referencias.`);
  assert(await page.getByRole("link", { name: "NIST Privacy Framework" }).isVisible(), `${label} la referencia de privacidad no es accesible como enlace.`);
  assert(await page.locator(".learn-block--steps ol").count() > 0, `${label} la guía CRM no renderizó pasos numerados.`);
  assert(await page.locator(".learn-block--definitions dl").count() > 0, `${label} la guía CRM no renderizó definiciones semánticas.`);
  await assertNoOverflow(page, `${label} artículo`);

  for (const [slug, heading] of [
    ["que-puede-hacer-una-inteligencia-artificial-por-un-negocio", "¿Qué puede hacer una inteligencia artificial por un negocio?"],
    ["antes-de-hacer-publicidad-organiza-tu-presencia-digital", "Antes de hacer publicidad, organiza tu presencia digital"],
    ["automatizaciones-ahorrar-tiempo-sin-complicar-tu-negocio", "Automatizaciones: ahorrar tiempo sin complicar tu negocio"],
  ]) {
    await page.goto(new URL(`/aprende/${slug}`, baseUrl).toString(), { waitUntil: "networkidle" });
    assert((await page.locator("h1").textContent())?.trim() === heading, `${label} el artículo existente ${slug} dejó de cargar su H1 esperado.`);
    assert(await page.getByText("En esta guía", { exact: true }).isVisible(), `${label} el artículo existente ${slug} perdió su índice.`);
  }

  await browser.close();
}

for (const [width, height] of [[1366, 900], [768, 900], [390, 844], [360, 800]]) {
  await runViewport(width, height);
}

console.log("PASS: Aprende verificó categorías, artículos, autoría, CTAs, metadata, keyboard focus y responsive 1366/768/390/360.");
