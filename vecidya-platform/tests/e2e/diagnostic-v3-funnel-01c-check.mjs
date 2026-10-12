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
  await page.goto(new URL("/diagnostico", base).toString(), { waitUntil: "networkidle" });
  await page.evaluate(() => { localStorage.removeItem("vecidya.diagnostic.v3.session.2"); for (const key of Object.keys(localStorage)) if (key.startsWith("vecidya.diagnostic.v3.anonymous-summary.1.")) localStorage.removeItem(key); });
  await page.reload({ waitUntil: "networkidle" });
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
  await page.goto(link, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Confirmar y abrir el informe" }).waitFor();
  assert.equal(new URL(page.url()).hash, "", "token retirado del fragmento al cargar y no enviado en GET");
  const wrongTokenResponse = await page.evaluate(async ({ requestId, token }) => {
    const wrong = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId, token: wrong }) });
    return response.status;
  }, { requestId: created.requestId, token: emailToken });
  assert.equal(wrongTokenResponse, 400, "un token incorrecto no verifica la dirección ni concede acceso");
  const verifyPromise = page.waitForResponse((r) => new URL(r.url()).pathname === "/api/diagnostic/email/verify" && r.request().method() === "POST");
  await page.getByRole("button", { name: "Confirmar y abrir el informe" }).click();
  const verifyResponse = await verifyPromise;
  const verified = await verifyResponse.json();
  assert.equal(verifyResponse.status(), 200, "token correcto canjeado una sola vez");
  assert.equal(verified.reportPath, `/diagnostico/informe/${created.requestId}`);
  await page.getByRole("link", { name: "Abrir informe" }).click();
  await page.waitForURL(`**${verified.reportPath}`);
  await page.locator(".rp-doc").waitFor();
  assert.equal(await page.locator(".rp-dim").count(), 8, "el informe usa las ocho dimensiones V3");
  await page.screenshot({ path: `${screenshotDir}/report-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, "informe sin overflow móvil");
  await page.screenshot({ path: `${screenshotDir}/report-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  assert.equal(errors.length, 0, `sin errores en el navegador: ${errors.join("; ")}`);

  const secondUse = await page.evaluate(async ({ requestId, token }) => {
    const response = await fetch("/api/diagnostic/email/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId, token }) });
    return response.status;
  }, { requestId: created.requestId, token: emailToken });
  assert.equal(secondUse, 404, "el enlace ya consumido no vuelve a conceder acceso");

  const duplicate = await page.evaluate(async ({ body, key }) => {
    const response = await fetch("/api/diagnostic/report-requests", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify(body) });
    return { status: response.status, payload: await response.json() };
  }, submitted[0]);
  assert.equal(duplicate.status, 202);
  assert.equal(duplicate.payload.requestId, created.requestId, "idempotencia no duplica la solicitud");
  const conflict = await page.evaluate(async ({ body, key }) => {
    const changed = { ...body, email: "other@example.invalid" };
    const response = await fetch("/api/diagnostic/report-requests", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify(changed) });
    return response.status;
  }, submitted[0]);
  assert.equal(conflict, 409, "una misma clave idempotente con otro contenido se rechaza");

  const deletion = await page.evaluate(async (requestId) => {
    const response = await fetch(`/diagnostico/informe/${requestId}`, { method: "DELETE" });
    return { status: response.status, text: await response.text() };
  }, created.requestId);
  assert.equal(deletion.status, 204, "el titular del acceso puede eliminar la solicitud completa");
  const afterDelete = await page.request.get(new URL(verified.reportPath, base).toString());
  assert.equal(afterDelete.status(), 404, "el informe deja de estar accesible tras la eliminación en cascada");
  console.log("diagnostic-v3-funnel-01c-check: 1/1 PASS — cálculo → identificación → verificación → informe protegido → idempotencia → borrado");
} finally {
  await browser.close();
}
