import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";
import { AUTHORED_JOURNEYS } from "../unit/diagnostic/qa03b-fixtures.ts";
import { runCandidateDiagnosticPipelineV3 } from "../../app/features/diagnostic/qa03b/qbv2-candidate-pipeline.ts";
import { buildCandidateResultPresentationV3, buildCandidateDiagnosticReportV1 } from "../../app/components/diagnostic-flow/qa03b-presentation.ts";
assertLocalBaseUrl();
const route = new URL("/__dev/diagnostico/qa03b", baseUrl).toString();
const key = "vecidya.diagnostic.v3.candidate.session.3";
const oldKeys = ["vecidya.diagnostic.v3.session.2", "vecidya.diagnostic.v3.candidate.session.1", "vecidya.diagnostic.v3.candidate.session.2"];
const artifacts = "tmp/diag-v3-qa-03b/browser";
mkdirSync(artifacts, { recursive: true });
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe") ? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" : undefined);
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];
async function answer(page, answers) {
  const runtimeErrors = [];
  const onError = error => runtimeErrors.push(error.message);
  page.on("pageerror", onError);
  await page.locator(".df-option__input").first().waitFor({ timeout: 8000 }).catch(async () => { const snapshot = await page.evaluate(k => localStorage.getItem(k), key); await page.screenshot({ path: `${artifacts}/question-missing.png`, fullPage: true }); throw new Error(`La ruta no presenta pregunta; sesión=${snapshot}; errores=${runtimeErrors}: ${await page.locator("main").innerText()}`); });
  page.off("pageerror", onError);
  const id = await page.locator(".df-option__input").first().getAttribute("name");
  const authored = answers[id];
  assert.ok(authored !== undefined, `${id} tiene respuesta explícita, sin fallback`);
  for (const value of Array.isArray(authored) ? authored : [authored]) {
    const input = page.locator(`.df-option__input[name="${id}"][value="${value}"]`);
    if (!(await input.isChecked())) await input.click();
  }
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.waitForFunction(old => document.querySelector(".df-option__input")?.getAttribute("name") !== old || !!document.querySelector("#candidate-ready-title"), id);
  return id;
}
async function startDiagnosis(page) {
  await page.waitForLoadState("networkidle");
  await page.locator("#df-start-title").waitFor();
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: "Empezar diagnóstico" }).click();
  await page.waitForFunction(storageKey => localStorage.getItem(storageKey) !== null, key, { timeout: 10000 });
  await page.locator(".df-option__input").first().waitFor();
}
const scenarios = ["open-no-clients", "paused-history", "institutional-funding", "education-third-party", "remote-physical-appointments", "hybrid-retail-checkout"];
try {
  for (const [index, name] of scenarios.entries()) {
    const fixture = AUTHORED_JOURNEYS.find(f => f.id === name);
    const mobile = index % 2 === 1;
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 900 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage(); const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const started = Date.now();
    assert.equal((await page.goto(route)).status(), 200);
    await page.evaluate(keys => keys.forEach(k => localStorage.setItem(k, `preservado:${k}`)), oldKeys);
    await startDiagnosis(page);
    assert.equal(await page.evaluate(() => !!navigator.locks), true, "Web Locks disponible en navegador real");
    const order = [];
    for (let n = 0; n < 25 && !(await page.locator("#candidate-ready-title").count()); n++) {
      const id = await answer(page, fixture.answers); order.push(id);
      if (id === "q2_delivery") {
        await page.getByRole("button", { name: "Volver", exact: true }).click();
        assert.equal(await page.locator(".df-option__input").first().getAttribute("name"), id);
        const selected = await page.locator(".df-option__input:checked").evaluateAll(inputs => inputs.map(input => input.value));
        assert.deepEqual([...selected].sort(), [...fixture.answers[id]].sort());
        await page.getByRole("button", { name: "Continuar", exact: true }).click();
      }
    }
    await page.locator("#candidate-ready-title").waitFor();
    await page.getByRole("button", { name: "Reconstruir resultado candidato" }).click();
    await page.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
    const saved = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
    assert.equal(saved.schemaVersion, 3); assert.equal(saved.status, "completed"); assert.ok(saved.completedAt);
    const result = runCandidateDiagnosticPipelineV3(saved.answers); const view = buildCandidateResultPresentationV3(result);
    assert.equal(result.context.operationalStatus.status === "resolved" ? result.context.operationalStatus.value : "unknown", fixture.answers.q2_operational_status);
    assert.ok((await page.locator("main").innerText()).includes(view.currentState));
    assert.ok(Object.keys(saved.answers).length <= 24);
    if (name === "institutional-funding") { assert.ok(!order.includes("q2_buyer_recipient_relation")); assert.ok(!order.includes("q2_b2b_pipeline")); }
    if (name === "education-third-party") assert.ok(order.includes("q2_buyer_recipient_relation"));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(overflow, false, `${name} sin overflow`);
    await page.screenshot({ path: `${artifacts}/${name}.png`, fullPage: true });
    const report = buildCandidateDiagnosticReportV1(result, new Date(saved.completedAt));
    await page.reload(); await page.getByRole("button", { name: "Ver mi resultado", exact: true }).click();
    await page.getByRole("heading", { name: "Resultado de tu diagnóstico de prueba" }).waitFor();
    const restored = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
    assert.equal(restored.completedAt, saved.completedAt); assert.deepEqual(restored.answers, saved.answers); assert.deepEqual(restored.engineIdentity, saved.engineIdentity);
    assert.deepEqual(buildCandidateDiagnosticReportV1(runCandidateDiagnosticPipelineV3(restored.answers), new Date(restored.completedAt)), report);
    await page.getByRole("link", { name: "Leer metodología candidata" }).click();
    await page.waitForURL("**/qa03b/metodologia");
    assert.ok(page.url().includes("/qa03b/metodologia"));
    await page.getByRole("heading", { name: "Cómo funciona el diagnóstico candidato de Vecidya" }).waitFor();
    await page.goto(new URL("/__dev/diagnostico/qa03b/informe", baseUrl).toString());
    await page.locator('.rp[data-ready="true"]').waitFor();
    const pdfErrors = [];
    page.on("pageerror", error => pdfErrors.push(error.message));
    const downloadReady = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar informe PDF" }).click();
    await page.getByText(/Descarga iniciada;/).waitFor({ timeout: 30000 });
    const download = await downloadReady;
    await download.saveAs(`${artifacts}/${name}.pdf`);
    assert.ok((await (await import("node:fs/promises")).stat(`${artifacts}/${name}.pdf`)).size > 0);
    assert.deepEqual(pdfErrors, []);
    assert.deepEqual(await page.evaluate(keys => keys.map(k => localStorage.getItem(k)), oldKeys), oldKeys.map(k => `preservado:${k}`));
    assert.deepEqual(errors, []);
    results.push({ id: name, viewport: mobile ? "390x844" : "1366x900", questions: order, count: Object.keys(saved.answers).length, terminal: saved.terminalReason, elapsedMs: Date.now() - started, completedAt: saved.completedAt, engineIdentity: saved.engineIdentity });
    console.log(`PASS QA-03B navegador ${name}, ${Object.keys(saved.answers).length} respuestas, ${saved.terminalReason}`);
    await context.close();
  }
  const resumeContext = await browser.newContext(); const resumePage = await resumeContext.newPage();
  await resumePage.goto(route); await startDiagnosis(resumePage);
  await answer(resumePage, AUTHORED_JOURNEYS[0].answers);
  const beforeReload = await resumePage.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
  await resumePage.reload(); await resumePage.getByRole("button", { name: "Continuar diagnóstico" }).waitFor();
  const afterReload = await resumePage.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
  assert.deepEqual(afterReload, beforeReload, "reload sin acción conserva bytes del snapshot");
  await resumePage.getByRole("button", { name: "Continuar diagnóstico" }).click();
  await resumePage.locator(".df-option__input").first().waitFor();
  const resumed = await resumePage.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
  assert.deepEqual(resumed.answers, beforeReload.answers); assert.equal(resumed.engineIdentity.questionBank, "reviewed-evidence-v4");
  results.push({ id: "reload-resume", status: "PASS", schemaVersion: resumed.schemaVersion }); await resumeContext.close();
  const context = await browser.newContext(); const first = await context.newPage();
  await first.goto(route); await startDiagnosis(first);
  await answer(first, AUTHORED_JOURNEYS[0].answers);
  const second = await context.newPage(); await second.goto(route);
  await second.getByRole("button", { name: "Continuar diagnóstico" }).click();
  await second.getByRole("button", { name: "Continuar", exact: true }).click();
  await first.getByRole("heading", { name: "Esta sesión se está editando en otra pestaña" }).waitFor();
  results.push({ id: "cross-tab-Web-Locks", status: "PASS" }); await context.close();
  writeFileSync(`${artifacts}/results.json`, JSON.stringify({ status: "PASS", runtime: "Cloudflare Vite plugin local", results }, null, 2));
} finally { await browser.close(); }
console.log("QA-03B navegador: 6 recorridos + concurrencia PASS; sin exportar ni cambiar el generador PDF.");
