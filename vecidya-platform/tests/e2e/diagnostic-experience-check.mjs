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

async function chooseAndContinue(page, label, optionName) {
  const option = page.getByRole("button", { name: optionName, exact: true });
  await option.click();
  assert(await option.getAttribute("aria-pressed") === "true", `${label}: la opción ${optionName} no quedó seleccionada.`);
  const next = page.getByRole("button", { name: "Continuar" });
  assert(!(await next.isDisabled()), `${label}: Continuar quedó deshabilitado tras responder.`);
  await next.click();
}

async function runViewport(width, height) {
  const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  const page = await browser.newPage({ viewport: { width, height } });
  const label = `${width}x${height}`;

  await page.goto(new URL("/", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Hacer mi diagnóstico" }).first().click();
  await page.waitForURL("**/diagnostico");
  await page.goto(new URL("/diagnostico", baseUrl).toString(), { waitUntil: "networkidle" });
  assert(await page.locator("h1").count() === 1, `${label}: Diagnóstico debe tener un único H1.`);
  assert(await page.getByRole("heading", { name: "¿Qué quieres hacer visible?" }).isVisible(), `${label}: no mostró la pregunta inicial.`);
  const progress = page.getByRole("progressbar");
  assert(await progress.getAttribute("aria-valuemin") === "0", `${label}: progreso sin aria-valuemin.`);
  assert(Number(await progress.getAttribute("aria-valuemax")) >= 7, `${label}: progreso sin total de preguntas.`);
  assert((await page.getByText(/Pregunta 1 de/i).count()) > 0, `${label}: no mostró el contexto de progreso.`);

  const business = page.getByRole("button", { name: "Un negocio o empresa", exact: true });
  await business.focus();
  await page.keyboard.press("Enter");
  assert(await business.getAttribute("aria-pressed") === "true", `${label}: selección por teclado no funcionó.`);
  await page.getByRole("button", { name: "Continuar" }).click();
  assert(await page.getByRole("heading", { name: "¿Qué te gustaría mejorar principalmente?" }).isVisible(), `${label}: no avanzó a la segunda pregunta.`);

  await page.getByRole("button", { name: "Volver" }).click();
  assert(await page.getByRole("button", { name: "Un negocio o empresa", exact: true }).getAttribute("aria-pressed") === "true", `${label}: Volver no conservó la respuesta.`);
  await page.getByRole("button", { name: "Continuar" }).click();

  await chooseAndContinue(page, label, "Que más personas me encuentren");
  await chooseAndContinue(page, label, "Sitio web");
  await chooseAndContinue(page, label, "Sí");
  await chooseAndContinue(page, label, "No me encuentran");
  await chooseAndContinue(page, label, "Teléfono o llamadas");
  await chooseAndContinue(page, label, "Sí");

  assert(await page.getByRole("heading", { name: "¿Qué tan urgente es mejorar esto?" }).isVisible(), `${label}: no llegó a la última pregunta.`);
  await chooseAndContinue(page, label, "Este mes");
  await assertNoOverflow(page, `${label} resultado`);
  assert(await page.getByRole("heading", { name: /Presencia activa|Base en construcción|Punto de partida|Sistema en crecimiento|Presencia madura/ }).isVisible(), `${label}: no mostró resultado.`);
  assert(await page.getByRole("heading", { name: "Tus dimensiones" }).isVisible(), `${label}: no mostró dimensiones.`);
  assert(await page.getByRole("heading", { name: "Tus próximos focos" }).isVisible(), `${label}: no mostró prioridades.`);
  const serviceLink = page.locator('a[href="/servicios#visibilidad"]');
  assert(await serviceLink.count() > 0, `${label}: no enlazó la prioridad de visibilidad a Servicios.`);
  assert(await page.getByRole("button", { name: "Rehacer diagnóstico" }).isVisible(), `${label}: no mostró reinicio.`);
  await page.getByRole("button", { name: "Rehacer diagnóstico" }).click();
  assert(await page.getByRole("heading", { name: "¿Qué quieres hacer visible?" }).isVisible(), `${label}: reinicio no volvió al inicio.`);

  await browser.close();
}

for (const [width, height] of [[1366, 900], [768, 900], [390, 844], [360, 800]]) {
  await runViewport(width, height);
}

console.log("PASS: Diagnóstico verificó selector, progreso accesible, teclado, navegación anterior/siguiente, resultado, mapeo a Servicios, reinicio y responsive 1366/768/390/360.");
