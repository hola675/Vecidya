import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright";

import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edgePath) ? edgePath : undefined);
const route = new URL("/__dev/diagnostico/resultado/professional_appointments", baseUrl).toString();
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const errors = [];
const failedImages = [];

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("requestfailed", (request) => { if (/\.(webp|png|svg)(\?|$)/i.test(request.url())) failedImages.push(request.url()); });

  const response = await page.goto(route, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200, "el resultado golden carga desde el runtime local");
  await page.locator("#dr-title").waitFor();
  assert.equal(await page.locator(".dr-quick-card").count(), 3, "resumen de tres tarjetas");
  assert.equal(await page.locator(".dr-dim").count(), 8, "ocho dimensiones");
  assert.equal(await page.locator(".dr-dim__toggle[aria-expanded=false]").count(), 8, "ninguna dimensión comienza abierta");
  assert.equal(await page.locator(".dr-method[open]").count(), 0, "metodología plegada");
  assert.equal(await page.locator(".dr-step").count(), await page.locator(".dr-step[data-step-order]").count(), "los pasos tienen un índice de presentación");

  const dimensionOrder = await page.locator(".dr-dim").evaluateAll((items) => items.map((item) => item.dataset.dimension));
  assert.deepEqual(dimensionOrder, [
    "clarity_positioning",
    "digital_foundation",
    "discovery",
    "trust_reputation",
    "conversion_access",
    "relationship_recurrence",
    "measurement_optimization",
    "digital_readiness",
  ], "orden canónico de las áreas");

  const firstToggle = page.getByRole("button", { name: "Ver detalle de Claridad de la oferta" });
  await firstToggle.focus();
  const outline = await firstToggle.evaluate((element) => getComputedStyle(element).outlineStyle);
  assert.notEqual(outline, "none", "el foco de teclado es visible");
  await page.keyboard.press("Space");
  await page.waitForFunction(() => document.querySelector(".dr-dim__toggle")?.getAttribute("aria-expanded") === "true");
  assert.equal(await page.locator("#dr-dim-detail-clarity_positioning").isVisible(), true, "Espacio abre el detalle");
  assert.equal(await page.locator(".dr-dim__toggle").first().getAttribute("aria-expanded"), "true", "aria-expanded refleja apertura");
  await page.keyboard.press("Space");
  await page.waitForFunction(() => document.querySelector(".dr-dim__toggle")?.getAttribute("aria-expanded") === "false");
  assert.equal(await page.locator("#dr-dim-detail-clarity_positioning").isVisible(), false, "Espacio cierra el detalle");
  await page.getByRole("button", { name: "Ver detalle de Base digital" }).click();
  assert.equal(await page.locator("#dr-dim-detail-digital_foundation").isVisible(), true, "otra área puede abrirse después");
  assert.equal(await page.locator(".dr-method[open]").count(), 0, "el método continúa plegado durante la lectura");
  await page.locator(".dr-method > summary").click();
  assert.equal(await page.locator(".dr-method[open]").count(), 1, "la metodología abre bajo demanda");
  await page.locator(".dr-method > summary").click();

  const actionOrders = await page.locator(".dr-step").evaluateAll((items) => items.map((item) => Number(item.getAttribute("data-step-order"))));
  assert.deepEqual(actionOrders, actionOrders.map((_, index) => index + 1), "la línea temporal conserva el orden recibido");
  assert.equal(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches), true);
  assert.equal(await page.locator(".dr-dim").first().evaluate((element) => getComputedStyle(element).animationName), "none", "sin movimiento para reduced motion");

  const widths = [];
  for (const width of [1440, 768, 415]) {
    await page.setViewportSize({ width, height: 1000 });
    const result = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      columns: getComputedStyle(document.querySelector(".dr-dim-list")).gridTemplateColumns.split(" ").length,
      cardCopy: Number.parseFloat(getComputedStyle(document.querySelector(".dr-quick-card__copy")).fontSize),
      target: document.querySelector(".dr-dim__toggle").getBoundingClientRect().height,
    }));
    assert(result.scroll <= result.client + 1, "sin desplazamiento horizontal a " + width + " px");
    assert.equal(result.columns, width >= 1088 ? 4 : width >= 768 ? 2 : 1, "grid adaptativo a " + width + " px");
    assert(result.cardCopy >= 16, "texto principal de al menos 16 px a " + width + " px");
    assert(result.target >= 44, "objetivo táctil de al menos 44 px a " + width + " px");
    widths.push({ width, ...result });
  }

  await page.goto(new URL("/__dev/diagnostico/resultado/idea_early_stage", baseUrl).toString(), { waitUntil: "networkidle" });
  const noScore = await page.locator(".dr-hero").innerText();
  assert.doesNotMatch(noScore, /\b\d+%/);
  assert.equal(await page.locator(".dr-dim__toggle[aria-expanded=false]").count(), 8, "prelaunch también empieza con ocho detalles plegados");

  await page.goto(new URL("/__dev/diagnostico/resultado/appointment_business", baseUrl).toString(), { waitUntil: "networkidle" });
  assert.equal(await page.locator(".dr-step").count(), 0, "una ruta sin acciones muestra su estado vacío");

  assert.deepEqual(failedImages, [], "todos los assets del catálogo cargan");
  assert.deepEqual(errors, [], "sin errores de consola ni de página");
  console.log(JSON.stringify({
    status: "PASS",
    route,
    goldenProfiles: ["professional_appointments", "idea_early_stage", "appointment_business"],
    viewports: widths,
    dimensions: 8,
    quickCards: 3,
    keyboard: "PASS",
    reducedMotion: "PASS",
    failedImages: failedImages.length,
    pageErrors: errors.length,
  }, null, 2));
} finally {
  await browser.close();
}
