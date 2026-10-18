import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edgePath) ? edgePath : undefined);
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.setDefaultTimeout(15_000);
page.setDefaultNavigationTimeout(20_000);
const screenshotDir = "tmp/diag-v3-funnel-01c3-recovery/browser";
mkdirSync(screenshotDir, { recursive: true });
const base = new URL(baseUrl);
const fixtureRequestIds = [];
const lifecycleFixture = async (requestId, op) => {
  const response = await page.request.post(new URL(`/__dev/diagnostico/lifecycle/fixture/${requestId}`, base).toString(), { headers: { Origin: base.origin, "Content-Type": "application/json" }, data: { op } });
  assert.equal(response.ok(), true, `operación de fixture ${op} disponible en D1 local`);
  return response.json();
};
const funnelAggregate = async (requestId) => lifecycleFixture(requestId, "inspect_funnel_aggregate");
const funnelCount = (aggregate, event) => aggregate.metrics.find((metric) => metric.event === event)?.count ?? 0;
const funnelEndpoint = new URL("/api/diagnostic/funnel-analytics", base).toString();
const purgeExpired = async () => {
  const response = await page.request.post(new URL("/__dev/diagnostico/lifecycle/purge-expired", base).toString(), { headers: { Origin: base.origin, "Content-Type": "application/json" }, data: { confirm: "PURGE_EXPIRED_IDENTIFIED_DIAGNOSTICS" } });
  return { status: response.status(), body: await response.json() };
};
const preferred = { q2_entity: "business", q2_has_customers: "yes", q2_regularity: "regular", q2_delivery: "scheduled", q2_sector: "health_wellness", q2_goal: "opportunities", q2_friction: "follow_up" };
const questionId = async () => page.locator(".df-option__input").first().getAttribute("name");
const answer = async () => {
  const id = await questionId();
  const options = await page.locator(`.df-option__input[name="${id}"]`).evaluateAll((els) => els.map((el) => el.value));
  const value = preferred[id] ?? options[0];
  await page.locator(`.df-option__input[name="${id}"][value="${value}"]`).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForFunction((previous) => document.querySelector(".df-option__input")?.getAttribute("name") !== previous || !!document.querySelector(".df-ready"), id);
};

try {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const initialAggregate = await funnelAggregate(crypto.randomUUID());
  assert.deepEqual(initialAggregate.metrics, [], "la D1 temporal empieza sin agregados previos");
  assert.deepEqual(initialAggregate.columns, ["event_day", "diagnostic_version", "contract_version", "event_type", "event_count"], "la tabla agregada excluye columnas de identidad y contenido diagnóstico");
  await page.goto(new URL("/diagnostico", base).toString(), { waitUntil: "commit" });
  await page.evaluate(() => { localStorage.removeItem("vecidya.diagnostic.v3.session.2"); for (const key of Object.keys(localStorage)) if (key.startsWith("vecidya.diagnostic.v3.anonymous-summary.1.")) localStorage.removeItem(key); });
  await page.reload({ waitUntil: "commit" });
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll("button")].find((element) => element.textContent?.trim() === "Empezar diagnóstico");
    const propsKey = button && Object.keys(button).find((key) => key.startsWith("__reactProps$"));
    return Boolean(propsKey && typeof button?.[propsKey]?.onClick === "function");
  });
  const startedResponsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/diagnostic/funnel-analytics" && response.request().method() === "POST");
  await page.getByRole("button", { name: "Empezar diagnóstico" }).click();
  assert.equal((await startedResponsePromise).status(), 204, "el inicio envía solo la clave estimada sin cookies");
  await page.waitForSelector(".df-option__input");
  for (let index = 0; index < 24 && !(await page.locator(".df-ready").count()); index += 1) await answer();
  assert.equal(await page.locator(".df-ready").count(), 1, "el cuestionario V3 actual completa la ruta");
  await page.getByRole("button", { name: "Ver mi resultado" }).click();
  await page.waitForSelector(".df-anon-summary");
  const storedSession = await page.evaluate(() => JSON.parse(localStorage.getItem("vecidya.diagnostic.v3.session.2")));
  const ctaResponsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/diagnostic/funnel-analytics" && response.request().method() === "POST");
  await page.getByRole("button", { name: "Ver diagnóstico completo" }).click();
  assert.equal((await ctaResponsePromise).status(), 204, "el CTA registra solo la intención estimada y no crea solicitud");
  await page.getByRole("heading", { name: "Solicita tu diagnóstico completo" }).waitFor();
  await page.screenshot({ path: `${screenshotDir}/request-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, "formulario sin overflow móvil");
  await page.screenshot({ path: `${screenshotDir}/request-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByLabel(/Tu nombre/).fill("QA Funnel Sintético");
  await page.getByLabel(/Negocio o proyecto/).fill("Proyecto QA local");
  await page.getByLabel(/Correo electrónico/).fill("qa-funnel@example.invalid");
  await page.getByRole("checkbox").nth(0).check();
  await page.getByRole("checkbox").nth(1).check();
  assert.equal(await page.getByRole("checkbox").nth(2).isChecked(), false, "investigación permanece opt-in independiente");
  const submitted = [];
  const observedNetworkUrls = [];
  page.on("request", (request) => observedNetworkUrls.push(request.url()));
  page.on("request", (request) => { if (new URL(request.url()).pathname === "/api/diagnostic/report-requests" && request.method() === "POST") submitted.push({ body: request.postDataJSON(), key: request.headers()["idempotency-key"] }); });
  let loseFirstSubmitResponse = true;
  await page.route("**/api/diagnostic/report-requests", async (route) => {
    const upstream = await route.fetch();
    if (loseFirstSubmitResponse) {
      loseFirstSubmitResponse = false;
      assert.equal(upstream.status(), 202, "el primer submit queda persistido antes de simular pérdida de respuesta");
      await route.abort("failed");
      return;
    }
    await route.fulfill({ response: upstream });
  });
  await page.getByRole("button", { name: "Solicitar acceso al informe" }).click();
  await page.getByRole("alert").filter({ hasText: "No pudimos enviar la solicitud" }).waitFor();
  assert.equal(submitted.length, 1, "el Worker recibió el submit cuya respuesta se perdió en el navegador");
  const responsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/diagnostic/report-requests" && response.request().method() === "POST");
  await page.getByRole("button", { name: "Solicitar acceso al informe" }).click();
  const response = await responsePromise;
  await page.unroute("**/api/diagnostic/report-requests");
  const created = await response.json();
  fixtureRequestIds.push(created.requestId);
  assert.equal(response.status(), 202, "solicitud aceptada en D1 local");
  assert.equal(created.status, "verification_pending");
  assert.equal(Object.hasOwn(created, "report"), false, "POST no revela el informe");
  assert.equal(submitted.length, 2);
  assert.equal(submitted[0].key, submitted[1].key, "el retry conserva la clave idempotente tras perder la primera respuesta");
  assert.deepEqual(submitted[0].body, submitted[1].body, "el retry conserva exactamente el payload original");
  assert.equal(submitted[0].body.fullName, "QA Funnel Sintético");
  assert.deepEqual(submitted[0].body.answers.map((entry) => entry.questionId), storedSession.answeredQuestionIds, "se envían las respuestas reales de la sesión local activa");
  await page.getByRole("heading", { name: "Revisa la verificación de tu correo" }).waitFor();

  const invalidEvent = await page.request.post(funnelEndpoint, { headers: { Origin: base.origin, "Content-Type": "application/json" }, data: { event: "question_answered" } });
  assert.equal(invalidEvent.status(), 400, "telemetría rechaza eventos que no forman parte de la allowlist");
  const extraEventField = await page.request.post(funnelEndpoint, { headers: { Origin: base.origin, "Content-Type": "application/json" }, data: { event: "diagnostic_started", requestId: created.requestId } });
  assert.equal(extraEventField.status(), 400, "telemetría rechaza identificadores y campos adicionales");
  const crossOriginEvent = await page.request.post(funnelEndpoint, { headers: { Origin: "https://example.invalid", "Content-Type": "application/json" }, data: { event: "diagnostic_started" } });
  assert.equal(crossOriginEvent.status(), 403, "telemetría rechaza solicitudes de otro origen");
  const parallelStarts = await Promise.all(Array.from({ length: 5 }, () => page.request.post(funnelEndpoint, { headers: { Origin: base.origin, "Content-Type": "application/json" }, data: { event: "diagnostic_started" } })));
  assert.ok(parallelStarts.every((item) => item.status() === 204), "un solo Worker acepta cinco incrementos paralelos bajo el límite de frecuencia");
  const metricsAfterParallelStarts = await funnelAggregate(created.requestId);
  assert.equal(funnelCount(metricsAfterParallelStarts, "diagnostic_started"), 6, "los incrementos paralelos no se pierden");
  assert.equal(funnelCount(metricsAfterParallelStarts, "diagnostic_completed"), 1, "solo un replay correcto del resumen cuenta");
  assert.equal(funnelCount(metricsAfterParallelStarts, "detailed_report_cta_clicked"), 1);
  assert.equal(funnelCount(metricsAfterParallelStarts, "identified_request_created"), 1, "retry con la misma clave no vuelve a contar la solicitud creada");
  const startedAggregate = metricsAfterParallelStarts.metrics.find((metric) => metric.event === "diagnostic_started");
  assert.equal(startedAggregate.version, "diag-v3-public-v1");
  assert.match(startedAggregate.date, /^\d{4}-\d{2}-\d{2}$/u);
  const publicMetrics = await (await page.request.get(funnelEndpoint)).json();
  const todayMetrics = publicMetrics.metrics.filter((metric) => metric.date === startedAggregate.date && metric.version === startedAggregate.version);
  assert.deepEqual(todayMetrics.map((metric) => metric.event), ["diagnostic_started"], "la lectura visible suprime recuentos menores de cinco para el día actual, sin mezclar el sentinel histórico");
  assert.equal(todayMetrics[0].count, 6);

  const expiryMatrix = await lifecycleFixture(created.requestId, "expiry_matrix");
  assert.deepEqual(expiryMatrix.challengePending, [true, false, false], "challenge: before expiry is valid; exact and after are expired");
  assert.deepEqual(expiryMatrix.requestPending, [true, false, false], "request: before expiry is valid; exact and after are expired");
  assert.deepEqual(expiryMatrix.challengeConsume, [true, false, false], "one-use challenge consume is allowed only before expiry");
  assert.equal(expiryMatrix.grantsAfterConsume, 1, "the fixed-clock successful consume emits one grant");
  assert.deepEqual(expiryMatrix.authorizedRequest, [true, false, false], "expired request denies report access at exact boundary");
  assert.deepEqual(expiryMatrix.authorizedSnapshot, [true, false, false], "expired snapshot denies report access at exact boundary");
  assert.deepEqual(expiryMatrix.authorizedGrant, [true, false, false], "expired grant denies report access at exact boundary");
  assert.equal(expiryMatrix.revokedAccess, false, "revoked grant cannot authorize even before its expiration");
  assert.deepEqual(expiryMatrix.recoveryRequestBoundary, [true, false, false], "recovery challenge cannot issue at or after request expiry");
  assert.deepEqual(expiryMatrix.recoverySnapshotBoundary, [true, false, false], "recovery challenge cannot issue at or after snapshot expiry");
  assert.equal(expiryMatrix.pendingRecoveryAfterBoundaries, 1, "recovery boundary probes leave only the earlier eligible synthetic challenge");
  assert.deepEqual(expiryMatrix.cascadeCounts, { requests: 0, snapshots: 0, challenges: 0, access: 0 }, "deleting the synthetic request cascades all associated rows");

  const lostResponseFixture = await lifecycleFixture(created.requestId, "seed_lost_response_fixture");
  const lostResponseRequestId = lostResponseFixture.requestId;
  fixtureRequestIds.push(lostResponseRequestId);
  const lostResponseMailbox = await (await page.request.get(new URL(`/__dev/diagnostico/buzon/${lostResponseRequestId}`, base).toString())).json();
  const lostResponseLink = lostResponseMailbox.text.match(/https?:\/\/[^\s]+/u)?.[0];
  const lostResponseToken = new URLSearchParams(new URL(lostResponseLink).hash.slice(1)).get("token");
  assert.ok(lostResponseToken);
  await page.goto(lostResponseLink, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Confirmar y abrir el informe" }).waitFor();
  let lostVerifyUpstreamStatus = 0;
  await page.route("**/api/diagnostic/email/verify", async (route) => {
    if (route.request().postDataJSON().requestId !== lostResponseRequestId) return route.continue();
    const upstream = await fetch(route.request().url(), {
      method: "POST",
      headers: { Origin: base.origin, "Content-Type": "application/json", "cf-connecting-ip": "198.51.100.11" },
      body: route.request().postData(),
    });
    lostVerifyUpstreamStatus = upstream.status;
    return route.abort("failed");
  });
  await page.getByRole("button", { name: "Confirmar y abrir el informe" }).click();
  await page.getByRole("alert").filter({ hasText: "No pudimos completar la verificación" }).waitFor();
  await page.unroute("**/api/diagnostic/email/verify");
  assert.equal(lostVerifyUpstreamStatus, 200, "el Worker consumió el challenge y emitió el grant antes de perderse la respuesta");
  assert.equal((await page.context().cookies(new URL(`/diagnostico/informe/${lostResponseRequestId}`, base).toString())).length, 0, "la cookie no llega al navegador cuando se pierde la respuesta");
  const replayedConsumedToken = await page.evaluate(async ({ requestId, token, ip }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": ip }, body: JSON.stringify({ requestId, token }) });
    return response.status;
  }, { requestId: lostResponseRequestId, token: lostResponseToken, ip: "198.51.100.12" });
  assert.equal(replayedConsumedToken, 404, "reintentar un token consumido no emite otro grant");
  const lostState = await lifecycleFixture(lostResponseRequestId, "inspect");
  assert.equal(lostState.counts.access, 1, "la respuesta perdida no duplica el grant ya persistido");
  assert.equal(lostState.counts.consumedChallenges, 1, "el challenge consumido queda registrado una sola vez");
  assert.equal(funnelCount(await funnelAggregate(lostResponseRequestId), "email_verified"), 1, "la primera transición de verificación cuenta una vez aunque la respuesta se pierda");
  assert.ok(lostState.snapshot?.reportSha256, "la fixture expone solo metadata/hash del snapshot para comprobar integridad semántica");
  assert.equal((await page.request.get(new URL(`/diagnostico/informe/${lostResponseRequestId}`, base).toString())).status(), 404, "sin la cookie no hay acceso aunque exista un grant persistido");
  const recoveryUrl = new URL(`/api/diagnostic/report-requests/${lostResponseRequestId}/resend`, base).toString();
  const recoveryButton = page.getByRole("button", { name: "Enviar un nuevo enlace de acceso" });
  await recoveryButton.waitFor();
  const uiRecoveryResponsePromise = page.waitForResponse((response) => response.url() === recoveryUrl && response.request().method() === "POST");
  const parallelRecoveryResponsePromise = page.request.post(recoveryUrl, { headers: { Origin: base.origin, "cf-connecting-ip": "198.51.100.30" } });
  await recoveryButton.click();
  const [uiRecoveryResponse, parallelRecoveryResponse] = await Promise.all([uiRecoveryResponsePromise, parallelRecoveryResponsePromise]);
  const recoveryStatuses = [uiRecoveryResponse.status(), parallelRecoveryResponse.status()];
  assert.ok(recoveryStatuses.every((status) => status === 202 || status === 429), "recovery concurrente responde aceptada o limitada sin filtrar estado de la solicitud");
  assert.ok(recoveryStatuses.includes(202), "la acción explícita genera una recuperación local");
  assert.equal(uiRecoveryResponse.status(), 202, "la acción explícita recibe respuesta genérica");
  assert.equal((await parallelRecoveryResponse.json()).accepted, true, "la respuesta de recuperación no contiene el informe ni el ID");
  assert.equal((await page.request.get(new URL(`/diagnostico/informe/${lostResponseRequestId}`, base).toString())).status(), 404, "solicitar recuperación por UUID no autoriza el acceso");
  const recoveryMailbox = await (await page.request.get(new URL(`/__dev/diagnostico/buzon/${lostResponseRequestId}`, base).toString())).json();
  assert.equal(recoveryMailbox.purpose, "access_recovery", "el buzón distingue el propósito de recuperación del challenge inicial");
  const recoveryLink = recoveryMailbox.text.match(/https?:\/\/[^\s]+/u)?.[0];
  const recoveryToken = new URLSearchParams(new URL(recoveryLink).hash.slice(1)).get("token");
  assert.ok(recoveryToken);
  const recoveryScan = await page.request.get(recoveryLink);
  assert.equal(recoveryScan.status(), 200, "GET del enlace de recuperación no consume el token");
  const recoveryPending = await lifecycleFixture(lostResponseRequestId, "inspect");
  assert.equal(recoveryPending.counts.pendingRecoveryChallenges, 1, "los POST concurrentes dejan un único challenge de recuperación pendiente");
  assert.equal(recoveryPending.counts.pendingRecoveryAttempts, 0, "el challenge de recovery comienza sin intentos fallidos");
  assert.equal(recoveryPending.counts.activeAccess, 1, "el grant anterior permanece hasta completar el nuevo challenge");
  const staleTokenDuringRecovery = await page.evaluate(async ({ requestId, token }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": "198.51.100.32" }, body: JSON.stringify({ requestId, token }) });
    return response.status;
  }, { requestId: lostResponseRequestId, token: lostResponseToken });
  assert.equal(staleTokenDuringRecovery, 400, "un token de verification consumido no autentica ni bloquea el challenge nuevo de recovery");
  assert.equal((await lifecycleFixture(lostResponseRequestId, "inspect")).counts.pendingRecoveryAttempts, 0, "un token viejo no incrementa intentos del challenge de recovery vigente");
  const recoveryTabs = [page, await context.newPage()];
  await page.goto(new URL("/diagnostico", base).toString(), { waitUntil: "domcontentloaded" });
  await page.goto(recoveryLink, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll("button")].find((element) => element.textContent?.trim() === "Confirmar y abrir el informe");
    const propsKey = button && Object.keys(button).find((key) => key.startsWith("__reactProps$"));
    return Boolean(propsKey && typeof button?.[propsKey]?.onClick === "function");
  });
  await recoveryTabs[0].getByRole("button", { name: "Confirmar y abrir el informe" }).waitFor();
  await recoveryTabs[1].goto(recoveryLink, { waitUntil: "domcontentloaded" });
  await recoveryTabs[1].waitForFunction(() => {
    const button = [...document.querySelectorAll("button")].find((element) => element.textContent?.trim() === "Confirmar y abrir el informe");
    const propsKey = button && Object.keys(button).find((key) => key.startsWith("__reactProps$"));
    return Boolean(propsKey && typeof button?.[propsKey]?.onClick === "function");
  });
  await recoveryTabs[1].getByRole("button", { name: "Confirmar y abrir el informe" }).waitFor();
  const verifyRecoveryInTab = (tab) => tab.evaluate(async ({ requestId, token }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": "198.51.100.31" }, body: JSON.stringify({ requestId, token }) });
    return { status: response.status, body: await response.json() };
  }, { requestId: lostResponseRequestId, token: recoveryToken });
  const concurrentRecoveryVerify = await Promise.all(recoveryTabs.map(verifyRecoveryInTab));
  await recoveryTabs[1].close();
  assert.equal(concurrentRecoveryVerify.filter((entry) => entry.status === 200).length, 1, "dos pestañas de recovery solo consumen un challenge y emiten un grant");
  const recovered = concurrentRecoveryVerify.find((entry) => entry.status === 200)?.body;
  assert.equal(recovered?.requestId, lostResponseRequestId, "la recuperación conserva la solicitud original");
  const recoveredState = await lifecycleFixture(lostResponseRequestId, "inspect");
  assert.equal(recoveredState.counts.access, 2, "la recuperación conserva un grant revocado y registra uno nuevo");
  assert.equal(recoveredState.counts.activeAccess, 1, "solo el grant nuevo permanece activo");
  assert.equal(recoveredState.counts.revokedAccess, 1, "el grant anterior se revoca en el mismo canje");
  assert.equal(recoveredState.counts.consumedChallenges, 2, "se conserva evidencia de ambos canjes únicos");
  assert.equal(recoveredState.counts.consumedRecoveryChallenges, 1, "el challenge de recovery se consume exactamente una vez");
  assert.equal(recoveredState.counts.pendingChallenges, 0, "la recuperación no deja challenges activos incompatibles");
  assert.deepEqual(recoveredState.snapshot, lostState.snapshot, "la recuperación preserva hash/identidad/versiones del resultado original");
  assert.ok(recoveredState.counts.latestAccessExpiresAt <= recoveredState.counts.requestExpiresAt, "la recuperación no extiende la retención de la solicitud");
  assert.ok(recoveredState.counts.latestAccessExpiresAt <= recoveredState.counts.snapshotExpiresAt, "la recuperación no extiende la retención del snapshot");
  const recoveredReportResponse = await page.request.get(new URL(recovered.reportPath, base).toString());
  assert.equal(recoveredReportResponse.status(), 200, "la cookie nueva recupera acceso a la misma solicitud");
  assert.match(recoveredReportResponse.headers()["cache-control"] ?? "", /no-store/u, "el informe recuperado sigue sin cachearse");
  assert.equal((await page.context().cookies(new URL(recovered.reportPath, base).toString())).length, 1, "el navegador recibe solo la cookie del grant nuevo");
  assert.equal(funnelCount(await funnelAggregate(lostResponseRequestId), "detailed_report_first_opened"), 1, "primer load autorizado cuenta una sola vez por solicitud");
  const noCookieAfterRecovery = await browser.newContext();
  assert.equal((await noCookieAfterRecovery.request.get(new URL(recovered.reportPath, base).toString())).status(), 404, "ni siquiera después de solicitar recovery el UUID concede acceso a otro navegador");
  await noCookieAfterRecovery.close();
  const staleReplayAfterRecovery = await page.evaluate(async ({ requestId, token }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": "198.51.100.33" }, body: JSON.stringify({ requestId, token }) });
    return response.status;
  }, { requestId: lostResponseRequestId, token: lostResponseToken });
  assert.equal(staleReplayAfterRecovery, 404, "reutilizar el token inicial tras recovery no crea un grant adicional");
  const repeatRecoveryResponse = await page.request.post(recoveryUrl, { headers: { Origin: base.origin, "cf-connecting-ip": "198.51.100.36" } });
  assert.equal(repeatRecoveryResponse.status(), 202, "la misma solicitud admite una recuperación posterior después de abrir el informe");
  const repeatRecoveryMailbox = await (await page.request.get(new URL(`/__dev/diagnostico/buzon/${lostResponseRequestId}`, base).toString())).json();
  assert.equal(repeatRecoveryMailbox.purpose, "access_recovery");
  const repeatRecoveryLink = repeatRecoveryMailbox.text.match(/https?:\/\/[^\s]+/u)?.[0];
  const repeatRecoveryToken = new URLSearchParams(new URL(repeatRecoveryLink).hash.slice(1)).get("token");
  const repeatRecoveryVerification = await page.evaluate(async ({ requestId, token, ip }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": ip }, body: JSON.stringify({ requestId, token }) });
    return { status: response.status, body: (await response.text()).slice(0, 600) };
  }, { requestId: lostResponseRequestId, token: repeatRecoveryToken, ip: "198.51.100.37" });
  assert.equal(repeatRecoveryVerification.status, 200, `recovery reemite acceso sin volver a contar email_verified: ${JSON.stringify(repeatRecoveryVerification)}`);
  assert.equal((await page.request.get(new URL(recovered.reportPath, base).toString())).status(), 200, "el grant recuperado vuelve a abrir el informe");
  const afterRepeatRecovery = await funnelAggregate(lostResponseRequestId);
  assert.equal(funnelCount(afterRepeatRecovery, "detailed_report_first_opened"), 1, "recovery y revisitas no duplican la primera apertura de la solicitud");
  assert.equal(funnelCount(afterRepeatRecovery, "email_verified"), 1, "recovery no se cuenta como primera verificación");
  await lifecycleFixture(lostResponseRequestId, "expire_snapshot_only");
  const expiredSnapshotRecovery = await page.request.post(recoveryUrl, { headers: { Origin: base.origin, "cf-connecting-ip": "198.51.100.34" } });
  assert.equal(expiredSnapshotRecovery.status(), 202, "la solicitud con snapshot vencido conserva una respuesta genérica");
  assert.equal((await expiredSnapshotRecovery.json()).accepted, true);
  const noSnapshotRecoveryEmail = await lifecycleFixture(lostResponseRequestId, "inspect");
  assert.equal(noSnapshotRecoveryEmail.localMessage?.createdAt, recoveryMailbox.createdAt, "snapshot vencido no genera otro mensaje local");
  await lifecycleFixture(lostResponseRequestId, "restore_snapshot_expiry");
  await lifecycleFixture(lostResponseRequestId, "expire_request_only");
  const expiredRequestRecovery = await page.request.post(recoveryUrl, { headers: { Origin: base.origin, "cf-connecting-ip": "198.51.100.35" } });
  assert.equal(expiredRequestRecovery.status(), 202, "la solicitud vencida conserva una respuesta genérica");
  const noRequestRecoveryEmail = await lifecycleFixture(lostResponseRequestId, "inspect");
  assert.equal(noRequestRecoveryEmail.localMessage?.createdAt, recoveryMailbox.createdAt, "solicitud vencida no genera otro mensaje local");
  assert.equal((await page.request.get(new URL(recovered.reportPath, base).toString())).status(), 404, "la solicitud vencida niega el informe aun con la cookie nueva");

  const mailbox = await page.request.get(new URL(`/__dev/diagnostico/buzon/${created.requestId}`, base).toString());
  assert.equal(mailbox.status(), 200, "el mensaje solo está en el buzón local simulado");
  const email = await mailbox.json();
  assert.equal(email.recipient, "qa-funnel@example.invalid");
  const link = email.text.match(/https?:\/\/[^\s]+/u)?.[0];
  assert.ok(link, "el buzón contiene un enlace de verificación");
  const linkParameters = new URLSearchParams(new URL(link).hash.slice(1));
  assert.equal(linkParameters.get("requestId"), created.requestId, "el buzón devuelve el enlace asociado a la solicitud solicitada");
  const emailToken = linkParameters.get("token");
  assert.ok(emailToken);
  const scannerGets = await Promise.all([page.request.get(link), page.request.get(link)]);
  assert.ok(scannerGets.every((get) => get.status() === 200), "prefetch y aperturas GET del enlace se sirven sin confirmar");
  let fixtureState = await lifecycleFixture(created.requestId, "inspect");
  assert.equal(fixtureState.counts.pendingChallenges, 1, "GET/prefetch conserva el challenge pendiente");
  assert.equal(fixtureState.counts.consumedChallenges, 0, "GET/prefetch no consume challenge");
  assert.equal(fixtureState.counts.access, 0, "GET/prefetch no crea grant");
  const unauthorizedContext = await browser.newContext();
  const unauthorized = await unauthorizedContext.request.get(new URL(`/diagnostico/informe/${created.requestId}`, base).toString());
  assert.equal(unauthorized.status(), 404, "el ID público de solicitud no abre el informe en otro contexto");
  await unauthorizedContext.close();
  await page.goto(new URL("/diagnostico", base).toString(), { waitUntil: "domcontentloaded" });
  await page.goto(link, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Confirmar y abrir el informe" }).waitFor();
  assert.equal(new URL(page.url()).hash, "", "token retirado del fragmento al cargar y no enviado en GET");
  await page.goto(link, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Confirmar y abrir el informe" }).waitFor();
  assert.ok(observedNetworkUrls.every((url) => !url.includes(emailToken)), "el token del fragmento no aparece en URLs enviadas por el navegador");
  fixtureState = await lifecycleFixture(created.requestId, "inspect");
  assert.equal(fixtureState.counts.pendingChallenges, 1, "visitas repetidas sin confirmar no consumen el challenge");
  assert.equal(fixtureState.counts.access, 0, "la apertura automática no concede acceso");
  await lifecycleFixture(created.requestId, "lock_challenge");
  const lockedResponse = await page.evaluate(async ({ requestId, token, ip }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": ip }, body: JSON.stringify({ requestId, token }) });
    return response.status;
  }, { requestId: created.requestId, token: emailToken, ip: "198.51.100.13" });
  assert.equal(lockedResponse, 404, "challenge bloqueado no se consume aunque el token original sea correcto");
  const resendResponses = await Promise.all([0, 1].map(() => page.request.post(new URL(`/api/diagnostic/report-requests/${created.requestId}/resend`, base).toString(), { headers: { Origin: base.origin, "cf-connecting-ip": "198.51.100.20" } })));
  const resendStatuses = resendResponses.map((response) => response.status());
  assert.ok(resendStatuses.every((status) => status === 202 || status === 429), "reenvíos concurrentes se aceptan o limitan, sin error interno");
  assert.ok(resendStatuses.includes(202), "al menos un reenvío concurrente sustituye el challenge bloqueado");
  fixtureState = await lifecycleFixture(created.requestId, "inspect");
  assert.equal(fixtureState.counts.pendingChallenges, 1, "dos reenvíos concurrentes dejan como máximo un challenge activo");
  const resentMailbox = await (await page.request.get(new URL(`/__dev/diagnostico/buzon/${created.requestId}`, base).toString())).json();
  const resentLink = resentMailbox.text.match(/https?:\/\/[^\s]+/u)?.[0];
  const resentToken = new URLSearchParams(new URL(resentLink).hash.slice(1)).get("token");
  assert.ok(resentToken && resentToken !== emailToken, "el reenvío crea un token nuevo");
  await page.goto(resentLink, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Confirmar y abrir el informe" }).waitFor();
  const replacedTokenResponse = await page.evaluate(async ({ requestId, token, ip }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": ip }, body: JSON.stringify({ requestId, token }) });
    return response.status;
  }, { requestId: created.requestId, token: emailToken, ip: "198.51.100.14" });
  assert.equal(replacedTokenResponse, 400, "el token sustituido no verifica la solicitud");
  const verificationTabs = [page, await page.context().newPage()];
  await verificationTabs[1].goto(resentLink, { waitUntil: "domcontentloaded" });
  await verificationTabs[1].getByRole("button", { name: "Confirmar y abrir el informe" }).waitFor();
  const verifyInTab = (tab) => tab.evaluate(async ({ requestId, token, ip }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": ip }, body: JSON.stringify({ requestId, token }) });
    return { status: response.status, body: await response.json() };
  }, { requestId: created.requestId, token: resentToken, ip: "198.51.100.15" });
  await lifecycleFixture(created.requestId, "install_funnel_analytics_failpoint");
  const concurrentVerify = await Promise.all(verificationTabs.map(verifyInTab));
  await lifecycleFixture(created.requestId, "remove_funnel_analytics_failpoint");
  await verificationTabs[1].close();
  assert.equal(concurrentVerify.filter((entry) => entry.status === 200).length, 1, "dos verificaciones simultáneas solo consumen el challenge una vez");
  assert.ok(concurrentVerify.every((entry) => entry.status === 200 || (entry.status >= 400 && entry.status < 500)), "dos pestañas concurrentes fallan cerradas salvo el único canje");
  const verified = concurrentVerify.find((entry) => entry.status === 200).body;
  fixtureState = await lifecycleFixture(created.requestId, "inspect");
  assert.equal(fixtureState.counts.access, 1, "una carrera no emite más de un grant");
  assert.equal(fixtureState.counts.activeAccess, 1, "un solo grant queda activo tras dos pestañas");
  assert.equal(fixtureState.counts.pendingChallenges, 0, "no quedan challenges incompatibles activos tras verificar");
  assert.equal(fixtureState.counts.consumedChallenges, 1, "el challenge consumido queda registrado exactamente una vez");
  assert.equal(fixtureState.counts.verifiedRequests, 1, "la solicitud pasa a verified una sola vez");
  assert.equal(funnelCount(await funnelAggregate(created.requestId), "email_verified"), 1, "fallo analítico no revierte una verificación aceptada; queda el conteo confirmado previo");
  const cookies = await page.context().cookies(new URL(verified.reportPath, base).toString());
  assert.equal(cookies.length, 1);
  assert.equal(cookies[0].httpOnly, true);
  assert.equal(cookies[0].sameSite, "Strict");
  assert.equal(cookies[0].path, "/diagnostico/informe");
  assert.equal(cookies[0].secure, false, "HTTP local no activa Secure");
  assert.equal(verified.reportPath, `/diagnostico/informe/${created.requestId}`);
  await lifecycleFixture(created.requestId, "install_funnel_analytics_failpoint");
  let secondRequestResponse;
  try {
    secondRequestResponse = await page.evaluate(async (body) => {
      const response = await fetch("/api/diagnostic/report-requests", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify(body) });
      return { status: response.status, payload: await response.json() };
    }, submitted[0].body);
  } finally {
    await lifecycleFixture(created.requestId, "remove_funnel_analytics_failpoint");
  }
  assert.equal(secondRequestResponse.status, 202);
  assert.equal(Object.hasOwn(secondRequestResponse.payload, "report"), false);
  const secondRequestId = secondRequestResponse.payload.requestId;
  fixtureRequestIds.push(secondRequestId);
  assert.equal(funnelCount(await funnelAggregate(secondRequestId), "identified_request_created"), 1, "fallo analítico no bloquea la nueva solicitud y deja explícito el subconteo best-effort");
  const crossRequestToken = await page.evaluate(async ({ requestId, token, ip }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": ip }, body: JSON.stringify({ requestId, token }) });
    return response.status;
  }, { requestId: secondRequestId, token: resentToken, ip: "198.51.100.16" });
  assert.ok(crossRequestToken >= 400 && crossRequestToken < 500, "un token válido para otra solicitud no autentica esta");
  const copiedCookieContext = await browser.newContext();
  await copiedCookieContext.addCookies(cookies);
  const crossRequestReport = await copiedCookieContext.request.get(new URL(`/diagnostico/informe/${secondRequestId}`, base).toString());
  assert.equal(crossRequestReport.status(), 404, "cookie/grant de una solicitud no abre el informe de otra");
  await copiedCookieContext.close();

  const secondMailbox = await (await page.request.get(new URL(`/__dev/diagnostico/buzon/${secondRequestId}`, base).toString())).json();
  const secondLink = secondMailbox.text.match(/https?:\/\/[^\s]+/u)?.[0];
  const secondToken = new URLSearchParams(new URL(secondLink).hash.slice(1)).get("token");
  assert.ok(secondToken);
  const secondReportPath = `/diagnostico/informe/${secondRequestId}`;
  const [secondResendResponse, initialSecondVerification] = await Promise.all([
    page.request.post(new URL(`/api/diagnostic/report-requests/${secondRequestId}/resend`, base).toString(), { headers: { Origin: base.origin, "cf-connecting-ip": "198.51.100.21" } }),
    page.evaluate(async ({ requestId, token, ip }) => {
      const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": ip }, body: JSON.stringify({ requestId, token }) });
      return response.status;
    }, { requestId: secondRequestId, token: secondToken, ip: "198.51.100.22" }),
  ]);
  assert.ok([202, 429].includes(secondResendResponse.status()), "reenvío concurrente se acepta genéricamente o se limita");
  let secondVerification = initialSecondVerification;
  let secondRecovered = false;
  if (initialSecondVerification !== 200) {
    assert.ok([202, 429].includes(secondResendResponse.status()), "si el canje pierde la carrera, el challenge continúa o se sustituye sin emitir grant");
    const latestMailbox = await (await page.request.get(new URL(`/__dev/diagnostico/buzon/${secondRequestId}`, base).toString())).json();
    const latestLink = latestMailbox.text.match(/https?:\/\/[^\s]+/u)?.[0];
    const latestToken = new URLSearchParams(new URL(latestLink).hash.slice(1)).get("token");
    assert.ok(latestToken);
    secondVerification = await page.evaluate(async ({ requestId, token, ip }) => {
      const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": ip }, body: JSON.stringify({ requestId, token }) });
      return response.status;
    }, { requestId: secondRequestId, token: latestToken, ip: "198.51.100.23" });
  } else if (secondResendResponse.status() === 202) {
    const recoveryMailbox = await (await page.request.get(new URL(`/__dev/diagnostico/buzon/${secondRequestId}`, base).toString())).json();
    assert.equal(recoveryMailbox.purpose, "access_recovery", "un reenvío que pierde la carrera con verify recupera acceso con nuevo propósito");
    const recoveryLink = recoveryMailbox.text.match(/https?:\/\/[^\s]+/u)?.[0];
    const recoveryToken = new URLSearchParams(new URL(recoveryLink).hash.slice(1)).get("token");
    assert.ok(recoveryToken);
    secondVerification = await page.evaluate(async ({ requestId, token, ip }) => {
      const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": ip }, body: JSON.stringify({ requestId, token }) });
      return response.status;
    }, { requestId: secondRequestId, token: recoveryToken, ip: "198.51.100.24" });
    secondRecovered = secondVerification === 200;
  }
  assert.equal(secondVerification, 200, "la segunda solicitud obtiene un grant propio");
  assert.equal(funnelCount(await funnelAggregate(secondRequestId), "email_verified"), 2, "el total es una verificación de lost-response fixture más esta solicitud; access_recovery no suma");
  const secondFixtureState = await lifecycleFixture(secondRequestId, "inspect");
  assert.equal(secondFixtureState.counts.pendingChallenges, 0, "verificación/reenvío concurrente no deja challenges activos incompatibles");
  assert.equal(secondFixtureState.counts.access, secondRecovered ? 2 : 1, "el reenvío concurrente solo añade un grant si requirió recovery");
  assert.equal(secondFixtureState.counts.activeAccess, 1, "el canje/reenvío concurrente crea exactamente un grant activo");
  assert.equal(secondFixtureState.counts.revokedAccess, secondRecovered ? 1 : 0, "si el verify ganó primero, el recovery revoca el grant previo");
  const secondReportUrl = new URL(secondReportPath, base).toString();
  await lifecycleFixture(secondRequestId, "install_funnel_analytics_failpoint");
  const [readDuringRevocation] = await Promise.all([
    page.request.get(secondReportUrl),
    lifecycleFixture(secondRequestId, "revoke_access"),
  ]);
  assert.ok([200, 404].includes(readDuringRevocation.status()), "lectura concurrente con revocación puede precederla o fallar cerrado");
  assert.equal((await lifecycleFixture(secondRequestId, "inspect")).counts.activeAccess, 0, "la revocación invalida el grant existente");
  assert.equal((await page.request.get(secondReportUrl)).status(), 404, "lecturas posteriores a revocar no sirven el informe");
  await lifecycleFixture(secondRequestId, "restore_access");
  assert.equal((await page.request.get(secondReportUrl)).status(), 200, "el fixture restaura únicamente el grant sintético para la prueba de borrado");
  const secondRequestAfterFailedOpen = await lifecycleFixture(secondRequestId, "inspect");
  assert.ok(secondRequestAfterFailedOpen.counts.firstReportOpenedAt, "el marcador de primera apertura se persiste por solicitud aunque falle el agregado");
  assert.equal(funnelCount(await funnelAggregate(secondRequestId), "detailed_report_first_opened"), 1, "se conserva el único first-open previo; el failpoint no bloquea el informe ni crea otro conteo");
  await lifecycleFixture(secondRequestId, "remove_funnel_analytics_failpoint");
  const [racingRead, racingDelete] = await Promise.all([
    page.request.get(secondReportUrl),
    page.request.delete(secondReportUrl, { headers: { Origin: base.origin } }),
  ]);
  assert.ok([200, 404].includes(racingRead.status()), "la lectura concurrente solo puede preceder al borrado o fallar cerrado");
  assert.equal(racingDelete.status(), 204, "el borrado concurrente autorizado elimina la solicitud completa");
  assert.equal((await page.request.get(new URL(secondReportPath, base).toString())).status(), 404, "ninguna lectura posterior recupera el informe borrado");
  assert.equal((await lifecycleFixture(secondRequestId, "cleanup")).existed, false, "el DELETE del producto borró realmente la solicitud, no solo revocó el grant");
  await page.context().addCookies(cookies);

  const reportResponse = await page.goto(new URL(verified.reportPath, base).toString(), { waitUntil: "domcontentloaded" });
  assert.match(reportResponse.headers()["cache-control"] ?? "", /no-store/u, "el informe protegido no se cachea públicamente");
  assert.equal(funnelCount(await funnelAggregate(created.requestId), "detailed_report_first_opened"), 2, "first-open cuenta el fixture perdido y la solicitud principal; el otro request tuvo failpoint");
  await page.waitForTimeout(1200);
  await page.locator(".rp-doc").waitFor();
  assert.equal(await page.locator(".rp-dim").count(), 8, "el informe usa las ocho dimensiones V3");
  await page.screenshot({ path: `${screenshotDir}/report-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, "informe sin overflow móvil");
  await page.screenshot({ path: `${screenshotDir}/report-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  const repeatedRecoveryUrl = new URL(`/api/diagnostic/report-requests/${created.requestId}/resend`, base).toString();
  const repeatedRecovery = await page.request.post(repeatedRecoveryUrl, { headers: { Origin: base.origin, "cf-connecting-ip": "198.51.100.50" } });
  assert.equal(repeatedRecovery.status(), 202, "solicitud ya abierta permite recuperar acceso con un grant nuevo");
  const repeatedRecoveryMailbox = await (await page.request.get(new URL(`/__dev/diagnostico/buzon/${created.requestId}`, base).toString())).json();
  assert.equal(repeatedRecoveryMailbox.purpose, "access_recovery");
  const repeatedRecoveryLink = repeatedRecoveryMailbox.text.match(/https?:\/\/[^\s]+/u)?.[0];
  const repeatedRecoveryToken = new URLSearchParams(new URL(repeatedRecoveryLink).hash.slice(1)).get("token");
  const repeatedRecoveryStatus = await page.evaluate(async ({ requestId, token, ip }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json", "cf-connecting-ip": ip }, body: JSON.stringify({ requestId, token }) });
    return response.status;
  }, { requestId: created.requestId, token: repeatedRecoveryToken, ip: "198.51.100.51" });
  assert.equal(repeatedRecoveryStatus, 200, "recovery produce un grant distinto sin una nueva verificación de correo");
  assert.equal((await page.request.get(new URL(verified.reportPath, base).toString())).status(), 200, "la revisita autorizada carga con el nuevo grant");
  const afterRepeatedRecovery = await funnelAggregate(created.requestId);
  assert.equal(funnelCount(afterRepeatedRecovery, "detailed_report_first_opened"), 2, "recargas y grants recuperados no duplican primera apertura por solicitud");
  assert.equal(funnelCount(afterRepeatedRecovery, "email_verified"), 2, "access_recovery no incrementa email_verified");
  assert.equal(errors.length, 0, `sin errores en el navegador: ${errors.join("; ")}`);

  const duplicates = await page.evaluate(async ({ body, key }) => Promise.all([0, 1].map(async () => {
    const response = await fetch("/api/diagnostic/report-requests", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify(body) });
    return { status: response.status, payload: await response.json() };
  })), submitted[0]);
  assert.ok(duplicates.every((duplicate) => duplicate.status === 202 && duplicate.payload.requestId === created.requestId), "reintentos concurrentes con la misma clave no duplican la solicitud");
  fixtureState = await lifecycleFixture(created.requestId, "inspect");
  assert.equal(fixtureState.counts.requests, 1, "clave idempotente concurrente conserva una solicitud");
  const conflict = await page.evaluate(async ({ body, key }) => {
    const changed = { ...body, email: "other@example.invalid" };
    const response = await fetch("/api/diagnostic/report-requests", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify(changed) });
    return response.status;
  }, submitted[0]);
  assert.equal(conflict, 409, "una misma clave idempotente con otro contenido se rechaza");

  await lifecycleFixture(created.requestId, "tamper_snapshot");
  await page.reload({ waitUntil: "domcontentloaded" });
  assert.equal(page.url().includes(verified.reportPath), true);
  assert.equal(await page.locator(".rp-doc").count(), 0, "snapshot alterado no se sirve con un hash antiguo");
  await lifecycleFixture(created.requestId, "expire_children");
  const purgedChildren = await purgeExpired();
  assert.equal(purgedChildren.status, 200);
  assert.ok(purgedChildren.body.purged.expiredAccess >= 1);
  fixtureState = await lifecycleFixture(created.requestId, "inspect");
  assert.equal(fixtureState.counts.requests, 1, "purga parcial conserva solicitud vigente");
  assert.equal(fixtureState.counts.commercialIntents, 1, "purga de acceso no borra preferencia ligada a solicitud vigente");
  assert.equal(fixtureState.counts.access, 0);
  assert.equal(fixtureState.counts.snapshots, 0);
  assert.equal(fixtureState.counts.challenges, 0);
  await page.reload({ waitUntil: "domcontentloaded" });
  assert.equal(await page.locator(".rp-doc").count(), 0, "grant revocado/expirado o snapshot expirado falla cerrado");

  await lifecycleFixture(created.requestId, "install_purge_failpoint");
  await lifecycleFixture(created.requestId, "expire_request");
  const beforeFailure = (await lifecycleFixture(created.requestId, "inspect")).counts;
  const failedPurge = await purgeExpired();
  assert.equal(failedPurge.status, 500, "error D1 reporta fallo de purga");
  const afterFailure = (await lifecycleFixture(created.requestId, "inspect")).counts;
  assert.deepEqual(afterFailure, beforeFailure, "fallo al borrar solicitud revierte también borrados previos del batch");
  await lifecycleFixture(created.requestId, "remove_purge_failpoint");
  const purgedRequest = await purgeExpired();
  assert.equal(purgedRequest.status, 200);
  assert.ok(purgedRequest.body.purged.expiredRequests >= 1);
  const repeatedPurge = await purgeExpired();
  assert.equal(repeatedPurge.status, 200);
  assert.ok(Object.values(repeatedPurge.body.purged).every((count) => count === 0), "purga repetida es idempotente");
  const emptyPurge = await purgeExpired();
  assert.ok(Object.values(emptyPurge.body.purged).every((count) => count === 0), "purga sobre base sin fixture es inocua");

  await page.goto(new URL(verified.reportPath, base).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(await page.locator(".rp-doc").count(), 0, "solicitud purgada deja el informe inaccesible");
  const lostFixtureCleanup = await lifecycleFixture(lostResponseRequestId, "cleanup");
  assert.equal(lostFixtureCleanup.existed, false, "cleanup por ID sintético tolera que la purga ya haya eliminado la solicitud");
  assert.equal((await page.request.get(new URL(`/__dev/diagnostico/buzon/${lostResponseRequestId}`, base).toString())).status(), 404, "cleanup retira el mensaje sintético con el token del buzón local");
  const alreadyPurged = await lifecycleFixture(created.requestId, "cleanup");
  assert.equal(alreadyPurged.existed, false, "cleanup acotado es idempotente y limpia también el buzón de la fixture purgada");
  console.log("diagnostic-v3-funnel-01c-check: PASS — ciclo 01C.3 + seis métricas 01D.1, concurrencia, reintentos, recovery por request, celdas pequeñas, privacidad y limpieza");
} finally {
  try {
    for (const requestId of fixtureRequestIds.reverse()) await lifecycleFixture(requestId, "cleanup");
  } finally {
    await browser.close();
  }
}
