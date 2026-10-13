import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

assertLocalBaseUrl();
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(edgePath) ? edgePath : undefined);
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const screenshotDir = "tmp/diag-v3-funnel-01c/browser";
mkdirSync(screenshotDir, { recursive: true });
const base = new URL(baseUrl);
const fixtureRequestIds = [];
const lifecycleFixture = async (requestId, op) => {
  const response = await page.request.post(new URL(`/__dev/diagnostico/lifecycle/fixture/${requestId}`, base).toString(), { headers: { Origin: base.origin, "Content-Type": "application/json" }, data: { op } });
  assert.equal(response.ok(), true, `operación de fixture ${op} disponible en D1 local`);
  return response.json();
};
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
  await page.goto(new URL("/diagnostico", base).toString(), { waitUntil: "domcontentloaded" });
  await page.evaluate(() => { localStorage.removeItem("vecidya.diagnostic.v3.session.2"); for (const key of Object.keys(localStorage)) if (key.startsWith("vecidya.diagnostic.v3.anonymous-summary.1.")) localStorage.removeItem(key); });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Empezar diagnóstico" }).click();
  await page.waitForSelector(".df-option__input");
  for (let index = 0; index < 24 && !(await page.locator(".df-ready").count()); index += 1) await answer();
  assert.equal(await page.locator(".df-ready").count(), 1, "el cuestionario V3 actual completa la ruta");
  await page.getByRole("button", { name: "Ver mi resultado" }).click();
  await page.waitForSelector(".df-anon-summary");
  const storedSession = await page.evaluate(() => JSON.parse(localStorage.getItem("vecidya.diagnostic.v3.session.2")));
  await page.getByRole("button", { name: "Ver diagnóstico completo" }).click();
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
  page.on("request", (request) => { if (new URL(request.url()).pathname === "/api/diagnostic/report-requests" && request.method() === "POST") submitted.push({ body: request.postDataJSON(), key: request.headers()["idempotency-key"] }); });
  const responsePromise = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/diagnostic/report-requests" && response.request().method() === "POST");
  await page.getByRole("button", { name: "Solicitar acceso al informe" }).click();
  const response = await responsePromise;
  const created = await response.json();
  fixtureRequestIds.push(created.requestId);
  assert.equal(response.status(), 202, "solicitud aceptada en D1 local");
  assert.equal(created.status, "verification_pending");
  assert.equal(Object.hasOwn(created, "report"), false, "POST no revela el informe");
  assert.equal(submitted.length, 1);
  assert.equal(submitted[0].body.fullName, "QA Funnel Sintético");
  assert.deepEqual(submitted[0].body.answers.map((entry) => entry.questionId), storedSession.answeredQuestionIds, "se envían las respuestas reales de la sesión local activa");
  await page.getByRole("heading", { name: "Revisa la verificación de tu correo" }).waitFor();

  const mailbox = await page.request.get(new URL(`/__dev/diagnostico/buzon/${created.requestId}`, base).toString());
  assert.equal(mailbox.status(), 200, "el mensaje solo está en el buzón local simulado");
  const email = await mailbox.json();
  assert.equal(email.recipient, "qa-funnel@example.invalid");
  const link = email.text.match(/https?:\/\/[^\s]+/u)?.[0];
  assert.ok(link, "el buzón contiene un enlace de verificación");
  const linkParameters = new URLSearchParams(new URL(link).hash.slice(1));
  const emailToken = linkParameters.get("token");
  assert.ok(emailToken);
  const unauthorizedContext = await browser.newContext();
  const unauthorized = await unauthorizedContext.request.get(new URL(`/diagnostico/informe/${created.requestId}`, base).toString());
  assert.equal(unauthorized.status(), 404, "el ID público de solicitud no abre el informe en otro contexto");
  await unauthorizedContext.close();
  await page.goto(link, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Confirmar y abrir el informe" }).waitFor();
  assert.equal(new URL(page.url()).hash, "", "token retirado del fragmento al cargar y no enviado en GET");
  await lifecycleFixture(created.requestId, "lock_challenge");
  const lockedResponse = await page.evaluate(async ({ requestId, token }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId, token }) });
    return response.status;
  }, { requestId: created.requestId, token: emailToken });
  assert.equal(lockedResponse, 404, "challenge bloqueado no se consume aunque el token original sea correcto");
  const resendResponse = await page.request.post(new URL(`/api/diagnostic/report-requests/${created.requestId}/resend`, base).toString(), { headers: { Origin: base.origin } });
  assert.equal(resendResponse.status(), 202, "el reenvío sustituye un challenge bloqueado");
  const resentMailbox = await (await page.request.get(new URL(`/__dev/diagnostico/buzon/${created.requestId}`, base).toString())).json();
  const resentLink = resentMailbox.text.match(/https?:\/\/[^\s]+/u)?.[0];
  const resentToken = new URLSearchParams(new URL(resentLink).hash.slice(1)).get("token");
  assert.ok(resentToken && resentToken !== emailToken, "el reenvío crea un token nuevo");
  await page.goto(resentLink, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Confirmar y abrir el informe" }).waitFor();
  const replacedTokenResponse = await page.evaluate(async ({ requestId, token }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId, token }) });
    return response.status;
  }, { requestId: created.requestId, token: emailToken });
  assert.equal(replacedTokenResponse, 400, "el token sustituido no verifica la solicitud");
  const concurrentVerify = await page.evaluate(async ({ requestId, token }) => Promise.all([0, 1].map(async () => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId, token }) });
    return { status: response.status, body: await response.json() };
  })), { requestId: created.requestId, token: resentToken });
  assert.equal(concurrentVerify.filter((entry) => entry.status === 200).length, 1, "dos verificaciones simultáneas solo consumen el challenge una vez");
  assert.ok(concurrentVerify.every((entry) => entry.status === 200 || (entry.status >= 400 && entry.status < 500)), "la carrera perdedora falla cerrada sin respuesta exitosa");
  const verified = concurrentVerify.find((entry) => entry.status === 200).body;
  let fixtureState = await lifecycleFixture(created.requestId, "inspect");
  assert.equal(fixtureState.counts.access, 1, "una carrera no emite más de un grant");
  const cookies = await page.context().cookies(new URL(verified.reportPath, base).toString());
  assert.equal(cookies.length, 1);
  assert.equal(cookies[0].httpOnly, true);
  assert.equal(cookies[0].sameSite, "Strict");
  assert.equal(cookies[0].path, "/diagnostico/informe");
  assert.equal(cookies[0].secure, false, "HTTP local no activa Secure");
  assert.equal(verified.reportPath, `/diagnostico/informe/${created.requestId}`);
  const secondRequestResponse = await page.evaluate(async (body) => {
    const response = await fetch("/api/diagnostic/report-requests", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify(body) });
    return { status: response.status, payload: await response.json() };
  }, submitted[0].body);
  assert.equal(secondRequestResponse.status, 202);
  assert.equal(Object.hasOwn(secondRequestResponse.payload, "report"), false);
  const secondRequestId = secondRequestResponse.payload.requestId;
  fixtureRequestIds.push(secondRequestId);
  const crossRequestToken = await page.evaluate(async ({ requestId, token }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId, token }) });
    return response.status;
  }, { requestId: secondRequestId, token: resentToken });
  assert.ok(crossRequestToken >= 400 && crossRequestToken < 500, "un token válido para otra solicitud no autentica esta");
  const copiedCookieContext = await browser.newContext();
  await copiedCookieContext.addCookies(cookies);
  const crossRequestReport = await copiedCookieContext.request.get(new URL(`/diagnostico/informe/${secondRequestId}`, base).toString());
  assert.equal(crossRequestReport.status(), 404, "cookie/grant de una solicitud no abre el informe de otra");
  await copiedCookieContext.close();
  const reportResponse = await page.goto(new URL(verified.reportPath, base).toString(), { waitUntil: "domcontentloaded" });
  assert.match(reportResponse.headers()["cache-control"] ?? "", /no-store/u, "el informe protegido no se cachea públicamente");
  await page.waitForTimeout(1200);
  await page.locator(".rp-doc").waitFor();
  assert.equal(await page.locator(".rp-dim").count(), 8, "el informe usa las ocho dimensiones V3");
  await page.screenshot({ path: `${screenshotDir}/report-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, "informe sin overflow móvil");
  await page.screenshot({ path: `${screenshotDir}/report-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
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
  console.log("diagnostic-v3-funnel-01c-check: PASS — recorrido 01C, verificación concurrente, grant único, cookie, idempotencia concurrente, integridad snapshot y purga D1 atómica/idempotente");
} finally {
  for (const requestId of fixtureRequestIds.reverse()) {
    try { await lifecycleFixture(requestId, "cleanup"); } catch {}
  }
  await browser.close();
}
