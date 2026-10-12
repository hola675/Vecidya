import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";

import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();

// FUNNEL-01B: flujo público real, cálculo efímero en Worker y contrato anónimo allowlisted.
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edgePath) ? edgePath : undefined);
const route = new URL("/diagnostico", baseUrl).toString();
const reportRoute = new URL("/diagnostico/informe", baseUrl).toString();
const apiPath = "/api/diagnostic/anonymous-summary";
const sessionKey = "vecidya.diagnostic.v3.session.2";
const summaryPrefix = "vecidya.diagnostic.v3.anonymous-summary.1.";
const preferred = {
  q2_entity: "business",
  q2_has_customers: "yes",
  q2_regularity: "regular",
  q2_delivery: "scheduled",
  q2_sector: "health_wellness",
  q2_goal: "opportunities",
  q2_friction: "follow_up",
};
const summaryKeys = ["version", "score", "state", "confidence", "preliminary", "headline", "currentState", "focus", "firstAction", "coverageNote", "confidenceNote"];
const assertNoHorizontalOverflow = async (page, width) => assert(
  await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
  `sin overflow horizontal a ${width}px`,
);
const currentQuestionId = async (page) => page.locator(".df-option__input").first().getAttribute("name");

async function answerCurrent(page) {
  const id = await currentQuestionId(page);
  assert.ok(id, "pregunta actual disponible");
  const values = await page.locator(`.df-option__input[name="${id}"]`).evaluateAll((elements) => elements.map((element) => element.value));
  const value = preferred[id] ?? values[0];
  assert.ok(values.includes(value), `${id}: opción preferida disponible`);
  await page.locator(`.df-option__input[name="${id}"][value="${value}"]`).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForFunction((previous) => document.querySelector(".df-option__input")?.getAttribute("name") !== previous || !!document.querySelector(".df-ready"), id);
  return id;
}

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const screenshotDir = "tmp/diag-v3-funnel-01b/browser";
mkdirSync(screenshotDir, { recursive: true });
let passed = 0;
const pass = (message) => { passed += 1; console.log(`PASS ${message}`); };

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const pageErrors = [];
  const apiResponses = [];
  const apiRequests = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === apiPath && request.method() === "POST") apiRequests.push(request.postDataJSON());
  });
  page.on("response", async (response) => {
    if (new URL(response.url()).pathname === apiPath && response.request().method() === "POST") {
      let body = null;
      try { body = await response.json(); } catch { /* invalid-body behavior is checked separately */ }
      apiResponses.push({ status: response.status(), cacheControl: response.headers()["cache-control"], body });
    }
  });

  await page.goto(route, { waitUntil: "networkidle" });
  await page.evaluate(({ sessionKey, summaryPrefix }) => {
    localStorage.removeItem(sessionKey);
    for (const key of Object.keys(localStorage)) if (key.startsWith(summaryPrefix)) localStorage.removeItem(key);
  }, { sessionKey, summaryPrefix });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Empezar diagnóstico" }).click();
  await page.waitForSelector(".df-option__input");

  const answered = [];
  for (let count = 0; count < 24 && !(await page.locator(".df-ready").count()); count += 1) {
    const questionId = await answerCurrent(page);
    assert.ok(!answered.includes(questionId), `${questionId}: pregunta no repetida`);
    answered.push(questionId);
  }
  assert.ok(answered.length > 0 && answered.length <= 24, `ruta adaptativa completa (${answered.length} preguntas)`);
  assert.equal(await page.locator(".df-ready").count(), 1, "la ruta puede terminar");
  await page.getByRole("button", { name: "Ver mi resultado" }).click();
  await page.waitForSelector(".df-anon-summary");

  assert.equal(apiRequests.length, 1, "una solicitud de cálculo al Worker");
  assert.deepEqual(Object.keys(apiRequests[0]), ["answers"], "request sin session ID, contacto ni resultado del cliente");
  assert.equal(apiRequests[0].answers.length, answered.length, "todas las respuestas enviadas en orden");
  assert.deepEqual(apiRequests[0].answers.map((entry) => entry.questionId), answered, "el Worker recibe la ruta respondida y su orden");
  assert.ok(apiRequests[0].answers.every((entry) => Object.keys(entry).sort().join(",") === "questionId,value"), "cada entrada tiene solo ID y valor de respuesta");
  assert.equal(apiResponses.length, 1);
  assert.equal(apiResponses[0].status, 200);
  assert.match(apiResponses[0].cacheControl, /no-store/i);
  assert.deepEqual(Object.keys(apiResponses[0].body), ["summary"]);
  assert.deepEqual(Object.keys(apiResponses[0].body.summary), summaryKeys, "response DTO cerrado");
  assert.ok(apiResponses[0].body.summary.score === null || Number.isFinite(apiResponses[0].body.summary.score), "porcentaje ausente o calculado, sin default");
  pass(`Worker local recalcula ${answered.length} respuestas y entrega solo el resumen versionado, no-store`);

  assert.equal(await page.locator(".df-anon-summary").count(), 1);
  assert.equal(await page.locator(".dr-dim, .df-dim, .df-report, [data-detailed-report]").count(), 0, "ninguna sección detallada en DOM");
  assert.equal(await page.getByRole("button", { name: "Descargar resumen" }).isDisabled(), true);
  assert.equal(await page.getByText("Estados de contrato: 10").count(), 0, "sin selector de muestra ni referencia técnica");
  await page.getByRole("button", { name: "Ver diagnóstico completo" }).click();
  await page.getByText(/se habilitará más adelante/i).waitFor();
  assert.equal(apiRequests.length, 1, "el botón informativo no solicita identificación ni envía datos");
  pass("UI anónima oculta el informe completo y mantiene inactivos la descarga y el flujo futuro");

  for (const width of [1440, 768, 415]) {
    await page.setViewportSize({ width, height: width === 415 ? 900 : 1000 });
    await assertNoHorizontalOverflow(page, width);
    await page.screenshot({ path: `${screenshotDir}/summary-${width}.png`, fullPage: true });
  }
  assert.equal(pageErrors.length, 0, `sin errores de página: ${pageErrors.join(" | ")}`);
  pass("resumen responsive a 1440/768/415 px, sin overflow ni errores de runtime");

  const sessionAfterCompletion = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), sessionKey);
  assert.equal(sessionAfterCompletion.status, "completed");
  assert.ok(await page.evaluate((prefix) => Object.keys(localStorage).some((key) => key.startsWith(prefix)), summaryPrefix), "resumen local versionado para reanudar sin recalcular");
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Ver mi resultado" }).click();
  await page.waitForSelector(".df-anon-summary");
  assert.equal(apiRequests.length, 1, "reanudar lee el resumen V1 local y no reinterpreta ni recalcula la sesión");
  pass("reanudar conserva el resumen V1 sin recalcular respuestas guardadas");

  // Simula una sesión completada por la versión anterior: sin sidecar versionado no se recalcula.
  await page.evaluate((prefix) => { for (const key of Object.keys(localStorage)) if (key.startsWith(prefix)) localStorage.removeItem(key); }, summaryPrefix);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Ver mi resultado" }).click();
  await page.getByRole("heading", { name: "Tienes un resultado guardado anterior" }).waitFor();
  assert.equal(apiRequests.length, 1, "sesión previa no reenviada al motor actual");
  assert.equal((await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), sessionKey)).status, "completed", "no se modifica el registro histórico");
  pass("sesión anterior se conserva y no se reinterpreta sin contrato versionado");

  const invalid = await page.evaluate(async (apiPath) => {
    const response = await fetch(apiPath, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: [] }) });
    return { status: response.status, cacheControl: response.headers.get("cache-control"), body: await response.json() };
  }, apiPath);
  assert.equal(invalid.status, 400, "request vacía rechazada");
  assert.match(invalid.cacheControl, /no-store/i);
  assert.deepEqual(Object.keys(invalid.body), ["error"]);
  const savedSession = sessionAfterCompletion;
  const reversedAnswers = savedSession.answeredQuestionIds.map((questionId) => ({ questionId, value: savedSession.answers[questionId] })).reverse();
  const reversed = await fetch(new URL(apiPath, baseUrl), {
    method: "POST",
    headers: { Origin: new URL(baseUrl).origin, "Content-Type": "application/json" },
    body: JSON.stringify({ answers: reversedAnswers }),
  });
  assert.equal(reversed.status, 400, "replay con la ruta fuera de orden rechazado");
  assert.match(reversed.headers.get("cache-control"), /no-store/i);
  const crossOrigin = await fetch(new URL(apiPath, baseUrl), {
    method: "POST",
    headers: { Origin: "https://invalid.example", "Content-Type": "application/json" },
    body: JSON.stringify({ answers: savedSession.answeredQuestionIds.map((questionId) => ({ questionId, value: savedSession.answers[questionId] })) }),
  });
  assert.equal(crossOrigin.status, 403, "origen externo rechazado");
  assert.match(crossOrigin.headers.get("cache-control"), /no-store/i);
  const unsupportedMethod = await page.evaluate(async (apiPath) => {
    const response = await fetch(apiPath);
    return { status: response.status, body: await response.text() };
  }, apiPath);
  assert.equal(unsupportedMethod.status, 405, "GET responde explícitamente método no permitido");
  assert.ok(!unsupportedMethod.body.includes('"summary"'), "GET no devuelve resumen");
  const detailedRoute = await page.request.get(reportRoute);
  assert.equal(detailedRoute.status(), 404, "la ruta pública del informe detallado no está registrada");
  pass("validación de entrada, método GET y ruta pública detallada cerrados");

  console.log(`Capturas locales: ${screenshotDir}`);
  await page.close();
} finally {
  await browser.close();
}

console.log(`diagnostic-v3-funnel-01b-check: ${passed}/6 PASS`);
if (passed !== 6) process.exit(1);
