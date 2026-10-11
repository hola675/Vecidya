import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const route = new URL("/__dev/diagnostico/qa03b/embudo", baseUrl).toString();
const output = "tmp/diag-v3-funnel-01a/browser";
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const requests = [];
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("request", (request) => {
    if (!['GET', 'HEAD'].includes(request.method())) requests.push({ method: request.method(), url: request.url() });
  });
  page.on("pageerror", (error) => errors.push(error.message));

  const response = await page.goto(route, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200, "la ruta candidate-only responde desde el runtime de desarrollo local");
  await page.getByRole("heading", { name: "Tu diagnóstico, en dos niveles" }).waitFor();
  assert.equal((await page.locator(".q03bf-summary h2").textContent())?.trim(), "Resumen anónimo");
  assert.equal(await page.locator(".q03bf-score").count(), 0, "no se fabrica un porcentaje para la muestra insuficiente");
  assert.match(await page.locator(".q03bf-summary").innerText(), /No hay información suficiente/);
  assert.equal(await page.locator(".q03bf-summary").getByRole("button", { name: /Descargar resumen/ }).isDisabled(), true, "no se finge que la descarga existe");
  await page.screenshot({ path: `${output}/summary-desktop.png`, fullPage: true });

  await page.getByRole("button", { name: "Ver diagnóstico completo" }).click();
  await page.getByRole("heading", { name: "El informe completo requiere identificación" }).waitFor();
  await page.getByRole("button", { name: "Volver al resumen" }).click();
  await page.locator(".q03bf-summary").waitFor();
  await page.getByRole("button", { name: "Ver diagnóstico completo" }).click();
  await page.getByRole("button", { name: "Continuar a identificación" }).click();
  await page.getByRole("heading", { name: "¿A quién debe prepararse?" }).waitFor();
  const commercial = page.getByLabel(/Seguimiento comercial/);
  const research = page.getByLabel(/Estudios y validación/);
  assert.equal(await commercial.isChecked(), false, "la preferencia comercial empieza desmarcada");
  assert.equal(await research.isChecked(), false, "la preferencia de investigación empieza desmarcada");
  await commercial.check();
  assert.equal(await research.isChecked(), false, "marcar B no marca C");
  await commercial.uncheck();
  await research.check();
  assert.equal(await commercial.isChecked(), false, "marcar C no marca B");
  await research.uncheck();
  assert.equal(await page.getByLabel("Teléfono").inputValue(), "", "el teléfono se omite sin error");
  assert.equal(await page.getByLabel("Nombre del negocio o proyecto Opcional").inputValue(), "", "el nombre del negocio puede omitirse para una persona independiente");
  await page.screenshot({ path: `${output}/identification-desktop.png`, fullPage: true });

  const initialStorage = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  await page.getByLabel("Nombre de la persona responsable").fill("Persona sintética");
  await page.getByLabel("Correo electrónico").fill("no-es-correo");
  await page.getByRole("button", { name: "Solicitar informe completo" }).click();
  await page.getByText("Escribe un correo electrónico válido.").waitFor();
  await page.getByLabel("Correo electrónico").fill("demo@example.test");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${output}/identification-mobile.png`, fullPage: true });
  const mobileWidth = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert(mobileWidth.scroll <= mobileWidth.client + 1, `no hay desbordamiento móvil: ${JSON.stringify(mobileWidth)}`);

  await page.getByRole("button", { name: "Solicitar informe completo" }).click();
  await page.getByRole("heading", { name: "La solicitud no se registró" }).waitFor();
  assert.match(await page.locator("[role=alert]").innerText(), /No se envió ni guardó esta solicitud/);
  assert.equal(await page.getByText("La solicitud se registró correctamente.").count(), 0);
  assert.deepEqual(requests, [], "el formulario no ejecuta llamadas de red ni envíos de navegador");
  assert.deepEqual(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) })), initialStorage, "el prototipo no persiste formulario ni preferencias en el navegador");
  assert.deepEqual(errors, [], "el flujo no produce errores de página");
  await page.screenshot({ path: `${output}/no-submission-mobile.png`, fullPage: true });

  const secondSample = await context.newPage();
  await secondSample.setViewportSize({ width: 390, height: 844 });
  await secondSample.goto(`${route}?sample=contextual-focus`, { waitUntil: "networkidle" });
  await secondSample.getByRole("heading", { name: "Tu diagnóstico, en dos niveles" }).waitFor();
  await secondSample.getByLabel("Muestra de evaluación").selectOption("contextual-focus");
  assert.equal(await secondSample.locator(".q03bf-score").count(), 0, "el segundo fixture también conserva el score que devuelve el motor");
  await secondSample.screenshot({ path: `${output}/summary-mobile-context.png`, fullPage: true });
  const summaryWidth = await secondSample.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert(summaryWidth.scroll <= summaryWidth.client + 1, `no hay desbordamiento en el resumen móvil: ${JSON.stringify(summaryWidth)}`);
  await context.close();

  console.log(JSON.stringify({ status: "PASS", route, viewports: [1440, 390], states: ["ANONYMOUS_SUMMARY", "DETAILS_REQUESTED", "IDENTIFICATION_REQUIRED", "ERROR_RECOVERABLE"], networkWrites: requests.length, storageWrites: 0, pageErrors: errors.length, screenshots: output }, null, 2));
} finally {
  await browser.close();
}
