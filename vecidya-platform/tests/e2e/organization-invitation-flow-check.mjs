import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";

// INVITE-001: invitación → registro o login → verificación → aceptación → organización correcta,
// con estados controlados para cuenta equivocada, sin verificar, cancelada, expirada, aceptada e
// inexistente. La entrega real de correo no ocurre en local: el clic del enlace de verificación
// se simula con `email_verified = 1` y la prueba solo comprueba el comportamiento hasta el proveedor.
// Mismo arnés que `authz`: resultados acumulados, sin reintentos en lo evaluado, HARNESS aparte.
setDefaultAutoSelectFamilyAttemptTimeout(5_000); // TEST-LOCALHOST-001
assertLocalBaseUrl();
const suffix = Date.now().toString();
const results = [];
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);

class HarnessError extends Error {}
const harness = (condition, message) => { if (!condition) throw new HarnessError(`HARNESS: ${message}`); };
const check = (condition, label) => results.push({ ok: Boolean(condition), label });

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-invite-flow-"));
  const file = join(directory, "step.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute DB --local --json --file ${file}`], { cwd: process.cwd(), encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });
  harness(result.status === 0, `D1 local falló: ${result.stderr}`);
  return JSON.parse(result.stdout).flatMap((statement) => statement.results ?? []);
}

// TEST-D1-RESET-001: calentamiento tras cada uso de Wrangler; solo esta petición reintenta.
async function d1(sql) {
  const rows = executeD1(sql);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await (await fetch(new URL("/api/auth/ok", baseUrl))).arrayBuffer();
      return rows;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new HarnessError("HARNESS: el Worker local no respondió tras usar D1 (TEST-D1-RESET-001).");
}

class SessionClient {
  #cookies = new Map();
  async fetch(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; "));
    const response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
    for (const setCookie of response.headers.getSetCookie()) {
      const [pair] = setCookie.split(";", 1);
      const [name, ...value] = pair.split("=");
      this.#cookies.set(name, value.join("="));
    }
    return response;
  }
  json(path, body) { return this.fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
  form(path, values) { return this.fetch(path, { method: "POST", body: new URLSearchParams(values) }); }
}

const email = (key) => `inviteflow-${key}-${suffix}@vecidya.test`;
const password = `test-only-password-${suffix}`;
const orgName = `INVITE Org ${suffix}`;
const invitationPath = (id) => `/app/invitations/${id}`;
// El SSR de React separa fragmentos de texto con `<!-- -->`: se eliminan antes de quitar etiquetas.
const visibleText = (html) => (html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? html).replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ");

async function signUp(key, client = new SessionClient()) {
  const response = await client.json("/api/auth/sign-up/email", { name: `INVITE ${key} ${suffix}`, email: email(key), password });
  harness(response.status === 200, `registro de ${key} devolvió ${response.status}`);
  const { user } = await response.json();
  return { key, client, userId: user.id, email: user.email };
}

async function page(client, path, options) {
  const response = await client.fetch(path, options);
  return { status: response.status, location: response.headers.get("location"), text: visibleText(await response.text()) };
}

const memberRows = async (userId, organizationId) => d1(`SELECT role FROM member WHERE user_id = '${userId}' AND organization_id = '${organizationId}';`);
const invitationStatus = async (id) => (await d1(`SELECT status FROM invitation WHERE id = '${id}';`))[0]?.status ?? null;
const activeOrganizationOf = async (userId) => (await d1(`SELECT active_organization_id AS id FROM session WHERE user_id = '${userId}' ORDER BY created_at DESC LIMIT 1;`))[0]?.id ?? null;

let harnessFailure = null;
let browser;
try {
  // --- Preparación -------------------------------------------------------------------------
  const owner = await signUp("owner");
  const created = await owner.client.json("/api/auth/organization/create", { name: orgName, slug: `inviteflow-org-${suffix}` });
  harness(created.status === 200, `crear organización devolvió ${created.status}`);
  const orgId = (await created.json()).id;
  const [existing, wrong, unverified, canceledInvitee, expiredInvitee] = await Promise.all(["existing", "wrong", "unverified", "canceled", "expired"].map((key) => signUp(key)));
  const now = Date.now();
  const ids = Object.fromEntries(["newUser", "existing", "unverified", "canceled", "expired"].map((key) => [key, crypto.randomUUID()]));
  const invite = (id, to, role, expiresAt = now + 86_400_000) => `('${id}', '${orgId}', '${to}', '${role}', 'pending', ${expiresAt}, ${now}, '${owner.userId}')`;
  await d1(`
    UPDATE user SET email_verified = 1 WHERE id IN ('${existing.userId}', '${wrong.userId}', '${canceledInvitee.userId}', '${expiredInvitee.userId}');
    INSERT INTO invitation (id, organization_id, email, role, status, expires_at, created_at, inviter_id) VALUES
      ${[
        invite(ids.newUser, email("new"), "admin"),
        invite(ids.existing, existing.email, "member"),
        invite(ids.unverified, unverified.email, "member"),
        invite(ids.canceled, canceledInvitee.email, "member"),
        invite(ids.expired, expiredInvitee.email, "member", now - 1_000),
      ].join(",\n      ")};
  `);

  // --- Estados controlados (HTTP) ------------------------------------------------------------
  const anonymous = await page(new SessionClient(), invitationPath(ids.newUser));
  check(anonymous.status === 200 && anonymous.text.includes("Crear cuenta") && anonymous.text.includes("Iniciar sesión"), "Sin sesión: la invitación ofrece crear cuenta o iniciar sesión (200, sin 302)");
  check(!anonymous.text.includes(orgName), "Sin sesión: no se revela la organización");
  const notFound = await page(existing.client, invitationPath(crypto.randomUUID()));
  check(notFound.status === 404 && notFound.text.includes("no existe"), "Inexistente → 404 controlado");
  const wrongView = await page(wrong.client, invitationPath(ids.existing));
  check(wrongView.status === 403 && wrongView.text.includes("pertenece a otro correo") && wrongView.text.includes("i***@vecidya.test") && !wrongView.text.includes(orgName), "Cuenta equivocada → 403 con correo enmascarado y sin organización");
  const wrongAccept = await page(wrong.client, invitationPath(ids.existing), { method: "POST", body: new URLSearchParams({ intent: "accept" }) });
  check(wrongAccept.status === 403 && (await memberRows(wrong.userId, orgId)).length === 0, "Cuenta equivocada: aceptar → 403 sin membresía");
  const unverifiedView = await page(unverified.client, invitationPath(ids.unverified));
  check(unverifiedView.status === 200 && unverifiedView.text.includes("Verifica tu correo") && unverifiedView.text.includes(orgName), "Sin verificar → 200 con el paso de verificación");
  const unverifiedAccept = await page(unverified.client, invitationPath(ids.unverified), { method: "POST", body: new URLSearchParams({ intent: "accept" }) });
  check(unverifiedAccept.status === 403 && unverifiedAccept.text.includes("Verifica tu correo") && (await memberRows(unverified.userId, orgId)).length === 0, "Sin verificar: aceptar → 403 sin membresía");
  const resend = await page(unverified.client, invitationPath(ids.unverified), { method: "POST", body: new URLSearchParams({ intent: "send-verification" }) });
  check(resend.status === 503 && resend.text.includes("No pudimos enviar el correo de verificación"), "Sin verificar: reenviar verificación sin correo configurado → 503 honesto (límite del proveedor en local)");

  check(await (await owner.client.json(`/api/organizations/${orgId}/invitations`, { operation: "cancel", invitationId: ids.canceled })).status === 200, "El owner cancela una invitación pendiente");
  check(await (await owner.client.json(`/api/organizations/${orgId}/invitations`, { operation: "cancel", invitationId: ids.canceled })).status === 409 && await invitationStatus(ids.canceled) === "canceled", "Segunda cancelación → 409");
  const canceledView = await page(canceledInvitee.client, invitationPath(ids.canceled));
  check(canceledView.status === 410 && canceledView.text.includes("Esta invitación fue cancelada."), "Cancelada → 410 «Esta invitación fue cancelada.»");
  const canceledAccept = await page(canceledInvitee.client, invitationPath(ids.canceled), { method: "POST", body: new URLSearchParams({ intent: "accept" }) });
  check(canceledAccept.status === 410 && (await memberRows(canceledInvitee.userId, orgId)).length === 0, "Cancelada: aceptar → 410 sin membresía");
  const expiredView = await page(expiredInvitee.client, invitationPath(ids.expired));
  check(expiredView.status === 410 && expiredView.text.includes("Esta invitación ha expirado."), "Expirada → 410 «Esta invitación ha expirado.»");
  check(await (await owner.client.json(`/api/organizations/${orgId}/invitations`, { operation: "cancel", invitationId: ids.expired })).status === 409, "Una invitación expirada no se cancela (409)");

  // Pendientes vigentes en este punto: newUser, existing y unverified.
  const team = await owner.client.fetch("/app/organization");
  const teamHtml = await team.text();
  check(team.status === 200 && visibleText(teamHtml).includes("3 pendientes"), "Equipo: solo las 3 pendientes vigentes cuentan como pendientes");
  check(!teamHtml.includes(`value="${ids.canceled}"`) && !teamHtml.includes(`value="${ids.expired}"`), "Equipo: canceladas y expiradas no tienen botón Cancelar");
  check(teamHtml.includes(`value="${ids.existing}"`), "Equipo: una pendiente vigente sí tiene botón Cancelar");
  const pageCancel = await page(owner.client, "/app/organization", { method: "POST", body: new URLSearchParams({ operation: "cancel-invitation", invitationId: ids.canceled }) });
  check(pageCancel.status === 200 && pageCancel.text.includes("ya no está pendiente") && await invitationStatus(ids.canceled) === "canceled", "Equipo: cancelar otra vez muestra un error controlado");

  // --- Flujos de navegador -----------------------------------------------------------------
  browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  async function hydrated(browserPage, selector) {
    await browserPage.waitForFunction((target) => {
      const element = document.querySelector(target);
      return Boolean(element && Object.keys(element).some((key) => key.startsWith("__reactProps$")));
    }, selector, { timeout: 30_000 });
  }

  // Un recorrido de navegador que se rompe cuenta como fallo del flujo y no impide ver el resto.
  async function flow(label, run) {
    try {
      await run();
    } catch (error) {
      if (error instanceof HarnessError) throw error;
      check(false, `${label}: ${String(error.message).split("\n")[0]}`);
    }
  }

  // Usuario nuevo: invitación → registro → verificación → aceptar → /app en la organización.
  await flow("Usuario nuevo (navegador)", async () => {
    const newUserContext = await browser.newContext();
    const newUserPage = await newUserContext.newPage();
    newUserPage.setDefaultTimeout(15_000);
    await newUserPage.goto(new URL(invitationPath(ids.newUser), baseUrl).href, { waitUntil: "networkidle" });
    await newUserPage.getByRole("link", { name: "Crear cuenta" }).click();
    await newUserPage.waitForURL((url) => url.pathname === "/register" && url.searchParams.get("redirectTo") === invitationPath(ids.newUser));
    await hydrated(newUserPage, 'input[name="email"]');
    await newUserPage.fill('input[name="name"]', `INVITE new ${suffix}`);
    await newUserPage.fill('input[name="email"]', email("new"));
    await newUserPage.fill('input[name="password"]', password);
    await newUserPage.getByRole("button", { name: "Registrarme" }).click();
    await newUserPage.waitForURL((url) => url.pathname === invitationPath(ids.newUser), { timeout: 30_000 });
    await newUserPage.waitForLoadState("networkidle");
    const afterRegister = await newUserPage.locator("main").innerText();
    check(afterRegister.includes("Verifica tu correo") && afterRegister.includes(orgName), "Usuario nuevo: tras registrarse vuelve a su invitación, en el paso de verificación");
    check(afterRegister.includes("No pudimos enviar el correo de verificación"), "Usuario nuevo: el envío automático de verificación informa con honestidad que no hubo correo (local)");
    const newUserId = (await d1(`SELECT id FROM user WHERE email = '${email("new")}';`))[0]?.id;
    harness(newUserId, "el usuario nuevo no quedó registrado");
    await d1(`UPDATE user SET email_verified = 1 WHERE id = '${newUserId}';`); // simula el clic en el enlace
    await newUserPage.reload({ waitUntil: "networkidle" });
    await hydrated(newUserPage, "main form button");
    await newUserPage.getByRole("button", { name: "Aceptar invitación" }).click();
    await newUserPage.waitForURL((url) => url.pathname === "/app", { timeout: 30_000 });
    check((await newUserPage.locator("main").innerText()).includes(orgName), "Usuario nuevo: aceptar lleva a /app en la organización invitada");
    const newUserMembership = await memberRows(newUserId, orgId);
    check(newUserMembership.length === 1 && newUserMembership[0].role === "admin", "Usuario nuevo: membresía creada con el rol invitado (admin), no owner");
    check(await activeOrganizationOf(newUserId) === orgId, "Usuario nuevo: la organización invitada queda activa");
    await newUserContext.close();
  });

  // Usuario existente: invitación → login → vuelve → aceptar.
  await flow("Usuario existente (navegador)", async () => {
    const existingContext = await browser.newContext();
    const existingPage = await existingContext.newPage();
    existingPage.setDefaultTimeout(15_000);
    await existingPage.goto(new URL(invitationPath(ids.existing), baseUrl).href, { waitUntil: "networkidle" });
    await existingPage.getByRole("link", { name: "Iniciar sesión" }).click();
    await existingPage.waitForURL((url) => url.pathname === "/login" && url.searchParams.get("redirectTo") === invitationPath(ids.existing));
    await hydrated(existingPage, 'input[name="email"]');
    await existingPage.fill('input[name="email"]', existing.email);
    await existingPage.fill('input[name="password"]', password);
    await existingPage.getByRole("button", { name: "Entrar a mi espacio" }).click();
    await existingPage.waitForURL((url) => url.pathname === invitationPath(ids.existing), { timeout: 30_000 });
    await existingPage.waitForLoadState("networkidle");
    check((await existingPage.locator("main").innerText()).includes(orgName), "Usuario existente: tras iniciar sesión vuelve a su invitación");
    await hydrated(existingPage, "main form button");
    await existingPage.getByRole("button", { name: "Aceptar invitación" }).click();
    await existingPage.waitForURL((url) => url.pathname === "/app", { timeout: 30_000 });
    check((await memberRows(existing.userId, orgId)).length === 1, "Usuario existente: membresía creada");
    await existingContext.close();
  });

  // --- Ya aceptada -------------------------------------------------------------------------
  const acceptedView = await page(existing.client, invitationPath(ids.existing));
  check(acceptedView.status === 200 && acceptedView.text.includes("Ya formas parte de") && acceptedView.text.includes(orgName), "Ya aceptada → 200 «Ya formas parte de…»");
  const acceptAgain = await page(existing.client, invitationPath(ids.existing), { method: "POST", body: new URLSearchParams({ intent: "accept" }) });
  check(acceptAgain.status === 200 && acceptAgain.text.includes("Ya formas parte de") && (await memberRows(existing.userId, orgId)).length === 1, "Aceptar dos veces no duplica la membresía ni rompe la página");
  const open = await existing.client.fetch(invitationPath(ids.existing), { method: "POST", body: new URLSearchParams({ intent: "open" }) });
  check(open.status === 302 && open.headers.get("location") === "/app" && await activeOrganizationOf(existing.userId) === orgId, "Ya aceptada: continuar activa la organización y lleva a /app");
} catch (error) {
  if (!(error instanceof HarnessError || (error instanceof TypeError && error.message === "fetch failed"))) throw error;
  harnessFailure = error;
} finally {
  await browser?.close();
  try {
    executeD1(`DELETE FROM organization WHERE slug = 'inviteflow-org-${suffix}'; DELETE FROM user WHERE email LIKE 'inviteflow-%-${suffix}@vecidya.test';`);
  } catch (error) {
    console.error(`Limpieza de fixtures incompleta: ${error.message}`);
  }
}

for (const result of results) console.log(`${result.ok ? "ok  " : "FAIL"} ${result.label}`);
if (harnessFailure) {
  console.error(`\nHARNESS FAILURE (no es un resultado del flujo): ${harnessFailure.message} ${harnessFailure.cause?.code ?? ""}`);
  process.exit(2);
}
const failures = results.filter((result) => !result.ok);
if (failures.length) {
  console.error(`\nFAIL: ${failures.length}/${results.length} comprobaciones del flujo de invitación fallaron.`);
  process.exit(1);
}
console.log(`\nPASS: INVITE-001 ${results.length} comprobaciones: usuario nuevo, usuario existente, verificación, cuenta equivocada, cancelada, expirada, aceptada, inexistente y pendientes.`);
