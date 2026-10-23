import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edgePath) ? edgePath : undefined);
const route = new URL("/diagnostico", baseUrl).toString();
const apiPath = "/api/diagnostic/anonymous-summary";
const qa03bKey = "vecidya.diagnostic.v3.candidate.session.6";
const legacyKey = "vecidya.diagnostic.v3.session.2";
const legacyValue = "legacy-session-preserved-byte-for-byte";
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const errors = [];
const requests = [];
const responses = [];
const pass = (message) => console.log(`PASS ${message}`);

try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.replace(/\.data$/u, "") === apiPath && request.method() === "POST") requests.push(request.postDataJSON());
  });
  page.on("response", async (response) => {
    if (new URL(response.url()).pathname.replace(/\.data$/u, "") === apiPath && response.request().method() === "POST") {
      responses.push({ status: response.status() });
    }
  });

  await page.goto(route, { waitUntil: "commit" });
  assert.equal(await page.getByText(/Motor candidato inactivo|Entorno local de prueba/).count(), 0, "la ruta pública no presenta etiquetas de prueba");
  assert.doesNotMatch(await page.title(), /QA-03B|candidate|candidata|diag-v3/i);
  assert.doesNotMatch((await page.locator('meta[name="description"]').getAttribute("content")) ?? "", /QA-03B|candidate|candidata|diag-v3/i);
  await page.evaluate(({ legacyKey, legacyValue, qa03bKey }) => {
    localStorage.setItem(legacyKey, legacyValue);
    localStorage.removeItem(qa03bKey);
  }, { legacyKey, legacyValue, qa03bKey });
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll("button")].find((element) => element.textContent?.trim() === "Empezar diagnóstico");
    const propsKey = button && Object.keys(button).find((key) => key.startsWith("__reactProps$"));
    return Boolean(propsKey && typeof button?.[propsKey]?.onClick === "function");
  });
  const startButton = page.getByRole("button", { name: "Empezar diagnóstico" });
  await startButton.focus();
  await page.keyboard.press("Enter");
  const firstOption = page.locator(".df-option__input").first();
  await firstOption.waitFor();
  await firstOption.focus();
  await page.keyboard.press("Space");
  assert.equal(await firstOption.isChecked(), true, "la primera respuesta funciona con teclado y conserva su estado accesible");
  const firstQuestionId = await firstOption.getAttribute("name");
  const firstContinue = page.getByRole("button", { name: "Continuar", exact: true });
  await firstContinue.focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction((previous) => document.querySelector(".df-option__input")?.getAttribute("name") !== previous, firstQuestionId);

  const answered = [firstQuestionId];
  for (let index = 0; index < 24 && !(await page.locator(".df-ready").count()); index += 1) {
    const input = page.locator(".df-option__input").first();
    const questionId = await input.getAttribute("name");
    assert.ok(questionId, "pregunta QA-03B presente");
    const value = await input.getAttribute("value");
    assert.ok(value, `${questionId} tiene opción válida`);
    await page.locator(`.df-option__input[name="${questionId}"][value="${value}"]`).click();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await page.waitForFunction((previous) => document.querySelector(".df-option__input")?.getAttribute("name") !== previous || !!document.querySelector(".df-ready"), questionId);
    assert.ok(!answered.includes(questionId), `${questionId} no se repite`);
    answered.push(questionId);
  }
  assert.ok(answered.length > 0 && answered.length <= 24, "ruta adaptativa termina dentro del límite");
  await page.getByRole("button", { name: "Ver mi resumen" }).click();
  await page.getByRole("heading", { name: "Tu resumen del diagnóstico" }).waitFor();
  const viewportResults = [];
  for (const width of [320, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    assert.equal(overflow, false, `el diagnóstico no debe desbordarse horizontalmente en ${width}px`);
    viewportResults.push({ width, overflow });
  }
  assert.equal(requests.length, 1, "un solo replay público");
  assert.deepEqual(Object.keys(requests[0]).sort(), ["answerSchema", "engineIdentity", "questionBank", "replayVersion", "session", "sessionKey", "sessionSchema"].sort());
  assert.equal(requests[0].engineIdentity.engine, "diag-v3-candidate-operation-history-v3");
  assert.equal(requests[0].sessionSchema, 6);
  assert.ok(!("score" in requests[0]) && !("email" in requests[0]), "el navegador no envía un resultado ni identificación");
  assert.equal(responses.length, 1);
  assert.equal(responses[0].status, 200);
  const rawReplay = await page.request.post(new URL(apiPath, baseUrl).toString(), {
    headers: { Origin: new URL(baseUrl).origin },
    data: requests[0],
  });
  assert.equal(rawReplay.status(), 200);
  assert.match(rawReplay.headers()["cache-control"], /no-store/i);
  const rawSummaryResponse = await rawReplay.json();
  assert.deepEqual(Object.keys(rawSummaryResponse), ["summary"], "el Worker devuelve solo la proyección allowlisted");
  assert.equal(rawSummaryResponse.summary.contractVersion, "anonymous-diagnostic-summary-v1");
  assert.equal(rawSummaryResponse.summary.diagnosticIdentity.engine, requests[0].engineIdentity.engine);
  assert.equal(await page.getByRole("button", { name: "Solicitar informe completo" }).count(), 0);
  assert.equal(await page.getByText(/diag-v3-candidate|candidata de prueba/i).count(), 0, "la interfaz pública no expone la identidad ni etiquetas internas de la candidata");
  assert.doesNotMatch(await page.locator("body").innerText(), /QA-03B|candidate|candidata|diag-v3/i);
  assert.equal(await page.getByText("Este resumen es anónimo. La solicitud del informe completo no está disponible en este momento.").count(), 1);
  assert.equal(await page.evaluate((key) => localStorage.getItem(key), legacyKey), legacyValue, "la sesión V3 preexistente no se reescribe");
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), qa03bKey);
  assert.equal(saved.schemaVersion, 6);
  assert.equal(saved.status, "completed");
  pass(`Worker local valida QA-03B y genera resumen anónimo para ${answered.length} respuestas; viewport ${JSON.stringify(viewportResults)}`);

  await page.getByRole("link", { name: "Consultar metodología" }).click();
  await page.waitForURL("**/diagnostico/metodologia");
  await page.getByRole("heading", { name: "Cómo funciona el diagnóstico de Vecidya" }).waitFor();
  assert.equal(await page.getByText(/todavía no está activo en producción|motor candidato/i).count(), 0);
  assert.doesNotMatch(await page.title(), /QA-03B|candidate|candidata|diag-v3/i);
  assert.doesNotMatch((await page.locator('meta[name="description"]').getAttribute("content")) ?? "", /QA-03B|candidate|candidata|diag-v3/i);
  assert.doesNotMatch(await page.locator("body").innerText(), /QA-03B|candidate|candidata|diag-v3/i);
  pass("metodología pública corresponde al motor QA-03B y no a una prueba privada");

  for (const identity of [
    { engine: "diag-v3-public", answerSchema: "qbv2-answers-v2", questionBank: "QUESTION_BANK_V2", sessionSchema: 2, sessionKey: legacyKey },
    { engine: "diag-v3-candidate-context-observability-v1", answerSchema: "qbv2-answers-v2", questionBank: "reviewed-evidence-v3", sessionSchema: 2, sessionKey: "vecidya.diagnostic.v3.candidate.session.2" },
  ]) {
    const rejected = await page.request.post(new URL(apiPath, baseUrl).toString(), {
      headers: { Origin: new URL(baseUrl).origin },
      data: { replayVersion: "qa03b-worker-replay-v4", engineIdentity: { version: 1, ...identity }, answerSchema: identity.answerSchema, questionBank: identity.questionBank, sessionSchema: identity.sessionSchema, sessionKey: identity.sessionKey, session: {} },
    });
    assert.equal(rejected.status(), 409, `el endpoint rechaza la identidad ${identity.engine}`);
    assert.match(rejected.headers()["cache-control"], /no-store/i);
    assert.equal((await rejected.json()).error, "La sesión no corresponde a la versión vigente del diagnóstico.");
  }
  const report = await page.request.get(new URL("/diagnostico/informe/00000000-0000-4000-8000-000000000000", baseUrl).toString());
  assert.equal(report.status(), 404, "el informe identificado no se expone antes de habilitar correo y acceso");
  const rollbackRoute = await page.request.get(new URL("/__dev/diagnostico/v3", baseUrl).toString());
  assert.equal(rollbackRoute.status(), 404, "la ruta V3 de desarrollo no se expone en el runtime de producción");
  assert.deepEqual(errors, []);
  pass("sesiones V3 incompatibles e informe identificado cerrados; ruta V3 dev-only aislada");
  await page.close();
} finally {
  await browser.close();
}

console.log("diagnostic-act-04-check: 3/3 PASS");
