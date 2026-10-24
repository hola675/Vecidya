import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";
import { AUTHORED_JOURNEYS } from "../unit/diagnostic/qa03b-fixtures.ts";
assertLocalBaseUrl();
const route = new URL("/diagnostico", baseUrl).toString();
const base = new URL(baseUrl);
const { version: platformVersion } = JSON.parse(readFileSync(resolve("package.json"), "utf8"));
const key = "vecidya.diagnostic.v3.candidate.session.8";
const oldKeys = ["vecidya.diagnostic.v3.session.2", "vecidya.diagnostic.v3.candidate.session.1", "vecidya.diagnostic.v3.candidate.session.2", "vecidya.diagnostic.v3.candidate.session.3", "vecidya.diagnostic.v3.candidate.session.4", "vecidya.diagnostic.v3.candidate.session.5", "vecidya.diagnostic.v3.candidate.session.6"];
const artifacts = "tmp/diag-v3-qa-03b/browser";
const fixtureRequestIds = [];
mkdirSync(artifacts, { recursive: true });
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe") ? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" : undefined);
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];
async function cleanupRequest(page, requestId) {
  const response = await page.request.post(new URL(`/__dev/diagnostico/lifecycle/fixture/${requestId}`, base).toString(), {
    headers: { Origin: base.origin, "Content-Type": "application/json" },
    data: { op: "cleanup" },
  });
  assert.ok(response.ok(), `limpieza D1 local de ${requestId}`);
}
async function inspectRequest(page, requestId) {
  const response = await page.request.post(new URL(`/__dev/diagnostico/lifecycle/fixture/${requestId}`, base).toString(), {
    headers: { Origin: base.origin, "Content-Type": "application/json" },
    data: { op: "inspect" },
  });
  assert.ok(response.ok(), `inspección local y reducida de ${requestId}`);
  return response.json();
}
async function answer(page, answers) {
  const runtimeErrors = [];
  const onError = error => runtimeErrors.push(error.message);
  page.on("pageerror", onError);
  await page.locator(".df-option__input, #candidate-ready-title").first().waitFor({ timeout: 8000 }).catch(async () => { const snapshot = await page.evaluate(k => localStorage.getItem(k), key); await page.screenshot({ path: `${artifacts}/question-missing.png`, fullPage: true }); throw new Error(`La ruta no presenta pregunta ni estado terminal; sesión=${snapshot}; errores=${runtimeErrors}: ${await page.locator("main").innerText()}`); });
  page.off("pageerror", onError);
  if (await page.locator("#candidate-ready-title").count()) return null;
  const id = await page.locator(".df-option__input").first().getAttribute("name");
  const authored = answers[id];
  assert.ok(authored !== undefined, `${id} tiene respuesta explícita, sin fallback`);
  for (const value of Array.isArray(authored) ? authored : [authored]) {
    const input = page.locator(`.df-option__input[name="${id}"][value="${value}"]`);
    if (!(await input.isChecked())) await input.click();
  }
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.waitForFunction(old => { const next = document.querySelector(".df-option__input"); return (next !== null && next.getAttribute("name") !== old) || !!document.querySelector("#candidate-ready-title"); }, id);
  return id;
}
async function startDiagnosis(page) {
  await page.locator("#df-start-title").waitFor();
  const previousCandidateSession = await page.evaluate(storageKey => localStorage.getItem(storageKey), key);
  if (previousCandidateSession) {
    await page.evaluate(storageKey => localStorage.removeItem(storageKey), key);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#df-start-title").waitFor();
  }
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll("button")].find((element) => element.textContent?.trim() === "Empezar diagnóstico");
    const propsKey = button && Object.keys(button).find((key) => key.startsWith("__reactProps$"));
    return Boolean(propsKey && typeof button?.[propsKey]?.onClick === "function");
  });
  await page.locator("#df-start-title").waitFor();
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
    const postRequests = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("request", request => { if (request.method() === "POST") postRequests.push(request.url()); });
    const started = Date.now();
    assert.equal((await page.goto(route, { waitUntil: "commit" })).status(), 200);
    await page.evaluate(keys => keys.forEach(k => localStorage.setItem(k, `preservado:${k}`)), oldKeys);
    await startDiagnosis(page);
    assert.equal(await page.evaluate(() => !!navigator.locks), true, "Web Locks disponible en navegador real");
    const order = [];
    for (let n = 0; n < 25 && !(await page.locator("#candidate-ready-title").count()); n++) {
      const id = await answer(page, fixture.answers);
      if (id === null) break;
      order.push(id);
      if (id === "q2_delivery") {
        await page.getByRole("button", { name: "Volver", exact: true }).click();
        assert.equal(await page.locator(".df-option__input").first().getAttribute("name"), id);
        const selected = await page.locator(".df-option__input:checked").evaluateAll(inputs => inputs.map(input => input.value));
        assert.deepEqual([...selected].sort(), [...fixture.answers[id]].sort());
        await page.getByRole("button", { name: "Continuar", exact: true }).click();
        await page.waitForFunction(old => { const next = document.querySelector(".df-option__input"); return (next !== null && next.getAttribute("name") !== old) || !!document.querySelector("#candidate-ready-title"); }, id);
      }
    }
    await page.locator("#candidate-ready-title").waitFor();
    const replayResponsePromise = page.waitForResponse(response => new URL(response.url()).pathname.replace(/\.data$/u, "") === "/api/diagnostic/anonymous-summary" && response.request().method() === "POST");
    await page.getByRole("button", { name: "Ver mi resumen" }).click();
    const replayResponse = await replayResponsePromise.catch(async (error) => {
      throw new Error(`no llegó respuesta del replay Worker; POST=${JSON.stringify(postRequests)}; main=${await page.locator("main").innerText()}; localSession=${await page.evaluate(k => localStorage.getItem(k), key)}; cause=${error.message}`);
    });
    assert.equal(replayResponse.status(), 200, "Worker local reproduce QA-03B");
    assert.ok(replayResponse.headers()["content-type"]?.includes("text/x-script"), "React Router serializa la acción fetcher, no expone un JSON endpoint");
    const replayWire = await replayResponse.text();
    assert.ok(replayWire.includes("anonymous-diagnostic-summary-v2"));
    assert.ok(!replayWire.includes("q2_delivery"));
    assert.ok(!replayWire.includes("reportJson"));
    assert.ok(!replayWire.includes("fullName") && !replayWire.includes("email"));
    await page.getByRole("heading", { name: "Tu resumen del diagnóstico" }).waitFor();
    assert.equal(await page.locator(".dr-area-overview__item").count(), 8, `${name}: el resumen presenta las ocho áreas`);
    assert.equal(await page.locator(".dr-area-overview__item img").count(), 8, `${name}: usa una ilustración local por área`);
    const illustrationsLoaded = await page.locator(".dr-area-overview__item img").evaluateAll(async (images) => {
      return Promise.all(images.map(async (image) => { image.loading = "eager"; await image.decode(); return image.naturalWidth > 0; }));
    });
    assert.deepEqual(illustrationsLoaded, Array(8).fill(true), `${name}: las ocho ilustraciones locales cargan correctamente`);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const animatedBars = page.locator(".dr-area-overview__bar-fill");
    if (await animatedBars.count()) {
      assert.equal(await animatedBars.first().evaluate((element) => getComputedStyle(element).animationDuration), "0s", "reduced motion desactiva el movimiento de entrada");
    }
    await page.emulateMedia({ reducedMotion: "no-preference" });
    if (name === "open-no-clients") {
      assert.equal(await page.locator(".dr-area-overview__item").filter({ hasText: "Sin lectura" }).count(), 8, "las áreas sin evidencia se expresan como Sin lectura, no como 0 %");
      const printSummary = page.getByRole("button", { name: "Imprimir o guardar resumen" });
      await printSummary.waitFor({ state: "visible" });
      await page.emulateMedia({ media: "print" });
      assert.equal(await page.locator(".dr-candidate-actions").evaluate(element => getComputedStyle(element).display), "none", "las acciones no se imprimen en el resumen anónimo");
      await page.emulateMedia({ media: "screen" });
    }
    const saved = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
    assert.equal(saved.schemaVersion, 8); assert.equal(saved.status, "completed"); assert.ok(saved.completedAt);
    assert.equal(saved.engineIdentity.engine, "diag-v3-candidate-global-quartiles-v5");
    assert.ok(Array.isArray(saved.replayTranscript));
    if (name === "open-no-clients") {
      const envelope = { replayVersion: "qa03b-worker-replay-v6", engineIdentity: saved.engineIdentity, answerSchema: "qbv2-answers-v6", questionBank: saved.questionBankIdentity, sessionSchema: 8, sessionKey: key, session: saved };
      const negative = [
        { case: "V3", body: { ...envelope, engineIdentity: { ...saved.engineIdentity, engine: "diag-v3-public" } } },
        { case: "ACT", body: { ...envelope, questionBank: "reviewed-evidence-v3", answerSchema: "qbv2-answers-v2" } },
        { case: "híbrida", body: { ...envelope, engineIdentity: { ...saved.engineIdentity, answerSchema: "qbv2-answers-v2" } } },
        { case: "duplicada", body: { ...envelope, session: { ...saved, answeredQuestionIds: [...saved.answeredQuestionIds, saved.answeredQuestionIds[0]] } } },
        { case: "fuera de orden", body: { ...envelope, session: { ...saved, answeredQuestionIds: [saved.answeredQuestionIds[1], saved.answeredQuestionIds[0], ...saved.answeredQuestionIds.slice(2)] } } },
        { case: "incompleta", body: { ...envelope, session: { ...saved, status: "in_progress", completedAt: null } } },
        { case: "score forjado", body: { ...envelope, score: 100 } },
      ];
      for (const invalid of negative) {
        const response = await page.evaluate(async (body) => {
          const result = await fetch("/api/diagnostic/anonymous-summary", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body) });
          return { status: result.status, body: await result.text() };
        }, invalid.body);
        assert.ok(response.status >= 400 && response.status < 500, `Worker rechaza ${invalid.case}: ${response.status}`);
        assert.ok(!response.body.includes("reportJson") && !response.body.includes("q2_delivery"), `rechazo ${invalid.case} no revela respuestas`);
      }
    }
    assert.ok(Object.keys(saved.answers).length <= 24);
    if (name === "institutional-funding") { assert.ok(!order.includes("q2_buyer_recipient_relation")); assert.ok(!order.includes("q2_b2b_pipeline")); }
    if (name === "education-third-party") assert.ok(order.includes("q2_buyer_recipient_relation"));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(overflow, false, `${name} sin overflow`);
    const synthesisLayout = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      overviewWidth: document.querySelector(".dr-area-overview")?.getBoundingClientRect().width ?? 0,
      synthesisDisplay: getComputedStyle(document.querySelector(".dr-candidate-synthesis")).display,
      overallBottom: document.querySelector(".dr-candidate-overall")?.getBoundingClientRect().bottom ?? 0,
      overviewTop: document.querySelector(".dr-area-overview")?.getBoundingClientRect().top ?? 0,
      overviewBottom: document.querySelector(".dr-area-overview")?.getBoundingClientRect().bottom ?? 0,
      nextSectionTop: document.querySelector(".dr-area-overview")?.parentElement?.nextElementSibling?.getBoundingClientRect().top ?? 0,
    }));
    if (mobile) assert.ok(synthesisLayout.overviewWidth >= 280, `${name}: resumen de áreas legible en móvil (${JSON.stringify(synthesisLayout)})`);
    assert.ok(synthesisLayout.overviewTop >= synthesisLayout.overallBottom - 1, `${name}: las áreas siguen al estado general (${JSON.stringify(synthesisLayout)})`);
    assert.ok(synthesisLayout.nextSectionTop >= synthesisLayout.overviewBottom - 1, `${name}: la sección siguiente no se superpone al resumen (${JSON.stringify(synthesisLayout)})`);
    await page.screenshot({ path: `${artifacts}/${name}.png`, fullPage: true });
    if (name === "open-no-clients") {
      await page.getByRole("button", { name: "Solicitar informe completo" }).click();
      await page.getByRole("heading", { name: "Solicita tu diagnóstico completo" }).waitFor();
      const retentionNotice = await page.locator(".df-identification__retention").innerText();
      assert.match(retentionNotice, /se conservan hasta 30 días/u);
      assert.match(retentionNotice, /vence a las 24 horas/u);
      assert.match(retentionNotice, /se eliminan automáticamente en lotes diarios/u);
      await page.getByLabel(/Tu nombre/).fill("QA03B Worker Sintético");
      await page.getByLabel(/Negocio o proyecto/).fill("Proyecto QA03B Local");
      await page.getByLabel(/Correo electrónico/).fill("qa-funnel@example.invalid");
      await page.locator(".df-identification__check input").first().check();
      const reportRequestPromise = page.waitForResponse(response => new URL(response.url()).pathname === "/api/diagnostic/report-requests" && response.request().method() === "POST");
      await page.getByRole("button", { name: "Solicitar acceso al informe" }).click();
      const reportRequestResponse = await reportRequestPromise;
      assert.equal(reportRequestResponse.status(), 202, "replay identificado guardado solo en D1 local");
      const requestPayload = await reportRequestResponse.json();
      assert.equal(requestPayload.status, "verification_pending");
      assert.equal(requestPayload.summary.contractVersion, "anonymous-diagnostic-summary-v2");
      assert.equal(requestPayload.summary.dimensions.length, 8, "la solicitud de informe conserva la misma proyección de ocho áreas");
      assert.equal(requestPayload.summary.diagnosticIdentity.engine, saved.engineIdentity.engine);
      assert.equal(Object.hasOwn(requestPayload, "report"), false, "POST anónimo no filtra el informe");
      const submitted = reportRequestResponse.request().postDataJSON();
      assert.equal(submitted.engineIdentity.engine, saved.engineIdentity.engine);
      assert.equal(submitted.answerSchema, "qbv2-answers-v6");
      assert.equal(submitted.sessionSchema, 8);
      assert.equal(submitted.sessionKey, key);
      assert.equal(submitted.anonymousSummary.diagnosticIdentity.engine, saved.engineIdentity.engine);
      assert.equal(Object.hasOwn(submitted, "answers"), false);
      assert.equal(Object.hasOwn(submitted, "score"), false);
      assert.equal(Object.hasOwn(submitted, "report"), false);
      const requestId = requestPayload.requestId;
      fixtureRequestIds.push(requestId);
      const repeatedRequest = await page.evaluate(async ({ body, idempotencyKey }) => {
        const response = await fetch("/api/diagnostic/report-requests", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify(body) });
        return { status: response.status, payload: await response.json() };
      }, { body: submitted, idempotencyKey: reportRequestResponse.request().headers()["idempotency-key"] });
      assert.equal(repeatedRequest.status, 202, "reintento idempotente QA");
      assert.equal(repeatedRequest.payload.requestId, requestId);
      assert.equal(repeatedRequest.payload.reused, true);
      assert.equal(repeatedRequest.payload.summaryVersion, requestPayload.summary.contractVersion);
      assert.deepEqual(repeatedRequest.payload.summary, requestPayload.summary);
      const reportPath = `/diagnostico/informe/${requestId}`;
      assert.equal((await page.request.get(new URL(reportPath, base).toString())).status(), 404, "el informe detallado no abre sin verificar el correo");
      const mailboxResponse = await page.request.get(new URL(`/__dev/diagnostico/buzon/${requestId}`, base).toString());
      assert.equal(mailboxResponse.status(), 200, "correo de verificación disponible solo en buzón local");
      const mailbox = await mailboxResponse.json();
      const verificationLink = mailbox.text.match(/https?:\/\/[^\s]+/u)?.[0];
      assert.ok(verificationLink);
      await page.goto(verificationLink, { waitUntil: "domcontentloaded" });
      assert.equal(await page.getByText("© 2026 Vecidya", { exact: true }).count(), 1, "verificación incluye el footer compartido");
      assert.equal(await page.locator(`.platform-footer [aria-label="Versión pública ${platformVersion}"]`).count(), 1, "verificación incluye la versión pública");
      const verificationViewport = page.viewportSize();
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await page.locator(".platform-footer").evaluate((footer) => getComputedStyle(footer).display), "flex", "footer de verificación sigue visible en móvil");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, "verificación no desborda en móvil");
      await page.setViewportSize(verificationViewport);
      await page.getByRole("button", { name: "Confirmar y abrir el informe" }).click();
      await page.getByRole("link", { name: "Abrir informe", exact: true }).waitFor();
      const accessCookies = await page.context().cookies(new URL(reportPath, base).toString());
      assert.equal(accessCookies.length, 1, "correo verificado concede solo cookie HttpOnly del informe");
      assert.equal(accessCookies[0].path, "/diagnostico/informe");
      const lifecycleState = await inspectRequest(page, requestId);
      assert.equal(lifecycleState.counts.activeAccess, 1);
      assert.equal(lifecycleState.counts.verifiedRequests, 1);
      assert.equal(lifecycleState.snapshot.engineIdentity, JSON.stringify(requestPayload.summary.diagnosticIdentity));
      assert.equal(lifecycleState.snapshot.reportVersion, "1.2");
      assert.equal(lifecycleState.snapshot.methodologyVersion, "3.2");
      await page.getByRole("link", { name: "Abrir informe", exact: true }).click();
      await page.waitForURL(`**${reportPath}`, { waitUntil: "domcontentloaded" });
      await page.locator('.rp[data-ready="true"]').waitFor().catch(async (error) => { throw new Error(`informe no renderizado: url=${page.url()}; main=${await page.locator("main").innerText()}; cause=${error.message}`); });
      const printReport = page.getByRole("button", { name: "Imprimir o guardar PDF" });
      await printReport.waitFor({ state: "visible" });
      const reportDocument = page.locator(".rp-doc");
      assert.equal(await reportDocument.getByRole("heading", { name: "Qué conviene revisar" }).count(), 1, "el informe sin evidencia directa evita inventar una acción correctiva");
      assert.equal(await reportDocument.getByRole("heading", { name: "Plan de acción recomendado" }).count(), 0, "no repite la acción en un plan separado");
      const reportText = await reportDocument.innerText();
      assert.equal(await reportDocument.locator("[data-primary-action]").count(), 0, "no presenta una prioridad sin evidencia directa");
      assert.doesNotMatch(reportText, /Estado de la evidencia|Cómo comprobar el resultado/u, "no etiqueta ni verifica recomendaciones que no existen");
      assert.doesNotMatch(reportText, /\bq2_[a-z0-9_]+\b|sourceQuestionIds/u, "las respuestas se muestran sin claves internas");
      const coverageNote = await reportDocument.locator(".rp-presence__meta > span").innerText();
      assert.ok(coverageNote.length > 0, "el informe presenta la cobertura calculada");
      assert.equal(reportText.split(coverageNote).length - 1, 1, "la nota de cobertura aparece una sola vez");
      const reportPages = await page.locator(".rp").getAttribute("data-pages");
      assert.ok(Number(reportPages) > 0, "el informe comunica su número de páginas");
      await page.emulateMedia({ media: "print" });
      assert.equal(await page.locator(".df-identified-report__nav").evaluate(element => getComputedStyle(element).display), "none", "la navegación y revocaciones no se imprimen");
      assert.equal(await page.locator(".df-identified-report__print").evaluateAll(elements => elements[0] ? getComputedStyle(elements[0]).display : null), "none", "el botón de impresión no se imprime");
      const printPdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
      const renderedPages = (Buffer.from(printPdf).toString("latin1").match(/\/Type\s*\/Page\b/gu) ?? []).length;
      assert.equal(renderedPages, Number(reportPages), `el PDF contiene solo las ${reportPages} páginas del informe, sin hojas en blanco`);
      if (process.env.VISUAL_OUTPUT_DIRECTORY) {
        mkdirSync(process.env.VISUAL_OUTPUT_DIRECTORY, { recursive: true });
        writeFileSync(`${process.env.VISUAL_OUTPUT_DIRECTORY}/diagnostic-identified-full-report.pdf`, printPdf);
      }
      await page.emulateMedia({ media: "screen" });
      assert.equal(await page.getByText("© 2026 Vecidya", { exact: true }).count(), 1, "informe incluye el footer compartido");
      assert.equal(await page.locator(`.platform-footer [aria-label="Versión pública ${platformVersion}"]`).count(), 1, "informe incluye la versión pública");
      const reportViewport = page.viewportSize();
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await page.locator(".platform-footer").evaluate((footer) => getComputedStyle(footer).display), "flex", "footer del informe sigue visible en móvil");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, "informe no desborda en móvil");
      await page.setViewportSize(reportViewport);
      await page.emulateMedia({ media: "print" });
      assert.equal(await page.locator(".platform-footer").evaluate((footer) => getComputedStyle(footer).display), "none", "footer no altera la paginación de impresión");
      assert.equal(await page.locator(".df-identified-report__nav").evaluate((nav) => getComputedStyle(nav).display), "none", "acciones de privacidad no aparecen en el PDF");
      const reportPdfPath = `${artifacts}/${name}-identified-report.pdf`;
      await page.pdf({ path: reportPdfPath, preferCSSPageSize: true });
      const pdfSource = readFileSync(reportPdfPath, "latin1");
      const pdfPages = Number(pdfSource.match(/\/Type\s*\/Pages\b[\s\S]{0,256}?\/Count\s+(\d+)/)?.[1]);
      assert.ok(Number.isFinite(pdfPages), "PDF contiene árbol de páginas legible");
      const visibleSheets = await page.locator(".rp-sheet:not(.rp-sheet--measure)").count();
      assert.equal(pdfPages, visibleSheets, "el PDF no añade hojas vacías frente a las hojas paginadas del informe");
      await page.emulateMedia({ media: "screen" });
      assert.equal(await page.locator(".rp-business").innerText(), "Proyecto QA03B Local");
      assert.equal(await page.locator(".rp-technical").count(), 0, "el informe del cliente no expone claves internas del motor");
      assert.equal(lifecycleState.snapshot.methodologyVersion, "3.2");
    }
    if (name === "open-no-clients") await page.goto(route, { waitUntil: "domcontentloaded" });
    else await page.reload({ waitUntil: "domcontentloaded" });
    const restoredReplayPromise = page.waitForResponse(response => new URL(response.url()).pathname.replace(/\.data$/u, "") === "/api/diagnostic/anonymous-summary" && response.request().method() === "POST");
    await page.getByRole("button", { name: "Ver mi resultado", exact: true }).click();
    const restoredReplay = await restoredReplayPromise;
    await page.getByRole("heading", { name: "Tu resumen del diagnóstico" }).waitFor().catch(async (cause) => { throw new Error(`replay restaurado ${name}: status=${restoredReplay.status()}, wire=${(await restoredReplay.text()).slice(0, 1500)}; main=${await page.locator("main").innerText()}; ${cause.message}`); });
    assert.equal(restoredReplay.status(), 200, "reanudación reproduce el resumen del Worker");
    const restored = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
    assert.equal(restored.completedAt, saved.completedAt); assert.deepEqual(restored.answers, saved.answers); assert.deepEqual(restored.engineIdentity, saved.engineIdentity); assert.deepEqual(restored.replayTranscript, saved.replayTranscript);
    await page.getByRole("link", { name: "Consultar metodología" }).click();
    await page.waitForURL("**/diagnostico/metodologia");
    assert.ok(page.url().includes("/diagnostico/metodologia"));
    await page.getByRole("heading", { name: "Cómo funciona el Diagnóstico de Vecidya" }).waitFor();
    assert.deepEqual(await page.evaluate(keys => keys.map(k => localStorage.getItem(k)), oldKeys), oldKeys.map(k => `preservado:${k}`));
    assert.deepEqual(errors, []);
    results.push({ id: name, viewport: mobile ? "390x844" : "1366x900", questions: order, count: Object.keys(saved.answers).length, terminal: saved.terminalReason, elapsedMs: Date.now() - started, completedAt: saved.completedAt, engineIdentity: saved.engineIdentity });
    console.log(`PASS QA-03B navegador ${name}, ${Object.keys(saved.answers).length} respuestas, ${saved.terminalReason}`);
    await context.close();
    if (name === "paused-history") {
      // The shared local Worker binding enforces the production-equivalent 12/minute limit.
      // The first scenario intentionally sends seven negative requests, so let its window expire.
      await new Promise(resolve => setTimeout(resolve, 61_000));
    }
  }
  const resumeContext = await browser.newContext(); const resumePage = await resumeContext.newPage();
  await resumePage.goto(route, { waitUntil: "domcontentloaded" }); await startDiagnosis(resumePage);
  await answer(resumePage, AUTHORED_JOURNEYS[0].answers);
  const beforeReload = await resumePage.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
  await resumePage.reload({ waitUntil: "domcontentloaded" }); await resumePage.getByRole("button", { name: "Continuar diagnóstico" }).waitFor();
  const afterReload = await resumePage.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
  assert.deepEqual(afterReload, beforeReload, "reload sin acción conserva bytes del snapshot");
  await resumePage.getByRole("button", { name: "Continuar diagnóstico" }).click();
  await resumePage.locator(".df-option__input").first().waitFor();
  const resumed = await resumePage.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
  assert.deepEqual(resumed.answers, beforeReload.answers); assert.equal(resumed.engineIdentity.questionBank, "reviewed-evidence-v8");
  results.push({ id: "reload-resume", status: "PASS", schemaVersion: resumed.schemaVersion }); await resumeContext.close();
  const context = await browser.newContext(); const first = await context.newPage();
  await first.goto(route, { waitUntil: "domcontentloaded" }); await startDiagnosis(first);
  const firstQuestionId = await first.locator(".df-option__input").first().getAttribute("name");
  const partialAnswers = { [firstQuestionId]: AUTHORED_JOURNEYS[0].answers[firstQuestionId] };
  await answer(first, partialAnswers);
  const second = await context.newPage(); await second.goto(route, { waitUntil: "domcontentloaded" });
  await second.waitForFunction(() => {
    const button = [...document.querySelectorAll("button")].find((element) => element.textContent?.trim() === "Continuar diagnóstico");
    const propsKey = button && Object.keys(button).find((key) => key.startsWith("__reactProps$"));
    return Boolean(propsKey && typeof button?.[propsKey]?.onClick === "function");
  });
  await second.getByRole("button", { name: "Continuar diagnóstico" }).click();
  await second.getByRole("button", { name: "Continuar", exact: true }).click();
  await first.getByRole("heading", { name: "Esta sesión se está editando en otra pestaña" }).waitFor();
  results.push({ id: "cross-tab-Web-Locks", status: "PASS" }); await context.close();
  writeFileSync(`${artifacts}/results.json`, JSON.stringify({ status: "PASS", runtime: "Cloudflare Vite plugin local", results }, null, 2));
} finally {
  try {
    const cleanupPage = await browser.newPage();
    for (const requestId of fixtureRequestIds.reverse()) {
      await cleanupRequest(cleanupPage, requestId);
    }
    await cleanupPage.close();
  } finally { await browser.close(); }
}
console.log("QA-03B Worker local: 6 rutas + reanudación, concurrencia, resumen anónimo imprimible e informe identificado/PDF sin páginas vacías verificados PASS.");
