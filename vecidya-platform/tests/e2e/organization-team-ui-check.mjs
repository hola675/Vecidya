import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { chromium } from "playwright";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";

// INVITE-UI-001: experiencia de `/app/organization` (formulario, roles y estados en español,
// pendientes e historial, feedback, estados vacíos, responsive y accesibilidad básica).
// Los correos de los fixtures no contienen owner/admin/member para detectar roles sin traducir.
// Mismo arnés que `authz` e `invite-flow`: resultados acumulados y HARNESS aparte.
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
  const directory = mkdtempSync(join(tmpdir(), "vecidya-team-ui-"));
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
  cookies = new Map();
  async fetch(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.cookies.size) headers.set("cookie", [...this.cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; "));
    const response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
    for (const setCookie of response.headers.getSetCookie()) {
      const [pair] = setCookie.split(";", 1);
      const [name, ...value] = pair.split("=");
      this.cookies.set(name, value.join("="));
    }
    return response;
  }
  json(path, body) { return this.fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
}

const email = (key) => `teamui-${key}-${suffix}@vecidya.test`;
const orgName = (key) => `TEAMUI ${key} ${suffix}`;
const longEmail = `teamui-una-direccion-de-correo-muy-larga-para-probar-el-ajuste-${suffix}@negocio-con-nombre-largo.test`;

async function signUp(key) {
  const client = new SessionClient();
  const response = await client.json("/api/auth/sign-up/email", { name: `Persona ${key}`, email: email(key), password: `test-only-password-${suffix}` });
  harness(response.status === 200, `registro de ${key} devolvió ${response.status}`);
  const { user } = await response.json();
  return { key, client, userId: user.id };
}

async function createOrganization(identity, key) {
  const response = await identity.client.json("/api/auth/organization/create", { name: orgName(key), slug: `teamui-${key}-${suffix}` });
  harness(response.status === 200, `crear organización ${key} devolvió ${response.status}`);
  return (await response.json()).id;
}

async function setActive(identity, organizationId) {
  const response = await identity.client.json("/api/auth/organization/set-active", { organizationId });
  harness(response.status === 200, `activar organización para ${identity.key} devolvió ${response.status}`);
}

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return [...document.body.querySelectorAll("*")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.right > width + 1;
      })
      .slice(0, 3)
      .map((element) => `${element.tagName}.${element.className}`);
  });
  check(overflow.length === 0, `${label}: sin overflow horizontal ${overflow.length ? JSON.stringify(overflow) : ""}`);
}

let harnessFailure = null;
let browser;
try {
  // --- Preparación -------------------------------------------------------------------------
  const jefa = await signUp("jefa");
  const orgId = await createOrganization(jefa, "principal");
  const orgEmpty = await createOrganization(jefa, "vacia");
  await setActive(jefa, orgId);
  const [ayudante, lector] = await Promise.all([signUp("ayudante"), signUp("lector")]);
  const now = Date.now();
  const ids = Object.fromEntries(["pending", "long", "canceled", "expired", "accepted"].map((key) => [key, crypto.randomUUID()]));
  const invite = (id, to, role, status, expiresAt) => `('${id}', '${orgId}', '${to}', '${role}', '${status}', ${expiresAt}, ${now}, '${jefa.userId}')`;
  await d1(`
    INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES
      ('${crypto.randomUUID()}', '${orgId}', '${ayudante.userId}', 'admin', ${now}),
      ('${crypto.randomUUID()}', '${orgId}', '${lector.userId}', 'member', ${now});
    INSERT INTO invitation (id, organization_id, email, role, status, expires_at, created_at, inviter_id) VALUES
      ${[
        invite(ids.pending, email("pendiente"), "admin", "pending", now + 86_400_000),
        invite(ids.long, longEmail, "member", "pending", now + 86_400_000),
        invite(ids.canceled, email("cancelada"), "member", "canceled", now + 86_400_000),
        invite(ids.expired, email("expirada"), "member", "pending", now - 1_000),
        invite(ids.accepted, email("aceptada"), "admin", "accepted", now + 86_400_000),
      ].join(",\n      ")};
  `);
  for (const identity of [ayudante, lector]) await setActive(identity, orgId);

  browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  async function openAs(identity, viewport) {
    const context = await browser.newContext({ viewport });
    // Better Auth emite `__Secure-…`: el navegador lo acepta en localhost si se declara `secure`.
    const { hostname } = new URL(baseUrl);
    await context.addCookies([...identity.client.cookies.entries()].map(([name, value]) => ({ name, value, domain: hostname, path: "/", secure: true, httpOnly: true, sameSite: "Lax" })))
      .catch((error) => { throw new HarnessError(`HARNESS: no se pudo copiar la sesión al navegador: ${error.message}`); });
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    const response = await page.goto(new URL("/app/organization", baseUrl).href, { waitUntil: "networkidle" });
    harness(response?.status() === 200, `/app/organization devolvió ${response?.status()} para ${identity.key}`);
    return { context, page };
  }

  // Un bloque que se rompe (elemento inexistente) cuenta como fallo y no impide ver el resto.
  async function flow(label, run) {
    try {
      await run();
    } catch (error) {
      if (error instanceof HarnessError) throw error;
      check(false, `${label}: ${String(error.message).split("\n")[0]}`);
    }
  }

  // --- Owner en cuatro resoluciones (solo lectura) -----------------------------------------
  for (const [width, height] of [[1366, 900], [768, 900], [390, 844], [360, 800]]) await flow(`${width}px`, async () => {
    const label = `${width}px`;
    const { context, page } = await openAs(jefa, { width, height });
    const main = page.locator("main");
    const text = await main.innerText();

    check(await page.getByRole("heading", { name: "Invitar miembro" }).isVisible(), `${label}: el formulario tiene el título «Invitar miembro»`);
    const emailInput = page.getByLabel("Correo electrónico", { exact: true });
    check(await emailInput.getAttribute("type") === "email" && await emailInput.isVisible(), `${label}: «Correo electrónico» es un input de correo con etiqueta`);
    const roleSelect = page.getByLabel("Rol", { exact: true });
    check(JSON.stringify(await roleSelect.locator("option").allInnerTexts()) === JSON.stringify(["Administrador", "Miembro"]), `${label}: el selector de rol ofrece «Administrador» y «Miembro»`);
    check(JSON.stringify(await roleSelect.locator("option").evaluateAll((options) => options.map((option) => option.value))) === JSON.stringify(["admin", "member"]), `${label}: los valores internos del rol siguen siendo admin y member`);
    check(await page.getByRole("button", { name: "Enviar invitación" }).isVisible(), `${label}: botón «Enviar invitación»`);
    check(text.includes("Puede editar y publicar el perfil del negocio y gestionar el equipo") && text.includes("sin hacer cambios"), `${label}: el formulario explica Administrador y Miembro desde la matriz real`);
    check(text.includes("La persona recibirá un correo con un enlace para unirse a tu organización."), `${label}: texto de apoyo sin prometer entrega`);
    check(!/proveedor de correo|correo transaccional real|No se simula/i.test(text), `${label}: sin el mensaje obsoleto del proveedor de correo`);
    check(!/\b(owner|admin|member|pending|canceled|accepted|expired)\b/.test(text), `${label}: ningún rol ni estado en inglés en la página`);

    const pendingSection = page.getByRole("region", { name: "Invitaciones pendientes" });
    const historySection = page.getByRole("region", { name: "Historial de invitaciones" });
    const pendingText = await pendingSection.innerText();
    const historyText = await historySection.innerText();
    check(pendingText.includes(email("pendiente")) && pendingText.includes("Administrador") && pendingText.includes("Pendiente") && /Enviada el \d/.test(pendingText) && pendingText.includes("2 pendientes"), `${label}: pendientes con correo, rol, estado, fecha y recuento`);
    check(await pendingSection.getByRole("button", { name: `Cancelar invitación a ${email("pendiente")}` }).isVisible(), `${label}: cada pendiente tiene «Cancelar invitación» con nombre accesible`);
    check(historyText.includes("Cancelada") && historyText.includes("Expirada") && historyText.includes("Aceptada") && !historyText.includes("Pendiente"), `${label}: el historial muestra Cancelada, Expirada y Aceptada`);
    check(await historySection.getByRole("button").count() === 0, `${label}: el historial no tiene acciones`);
    const pendingBox = await pendingSection.boundingBox();
    const historyBox = await historySection.boundingBox();
    check(pendingBox && historyBox && historyBox.y > pendingBox.y, `${label}: el historial queda debajo de las pendientes`);

    const membersText = await page.getByRole("region", { name: "Miembros del equipo" }).innerText();
    check(["Persona jefa", email("jefa"), "Propietario", "Persona ayudante", "Administrador", "Persona lector", "Miembro"].every((value) => membersText.includes(value)), `${label}: miembros con nombre, correo y rol en español`);

    await assertNoOverflow(page, label);
    const longRow = pendingSection.locator("li", { hasText: longEmail });
    const longBox = await longRow.boundingBox();
    check(longBox && longBox.x + longBox.width <= width + 1, `${label}: un correo muy largo no desborda su fila`);

    const unlabeled = await page.evaluate(() => [...document.querySelectorAll("main input:not([type=hidden]), main select")]
      .filter((element) => !(element.labels?.length || element.getAttribute("aria-label")))
      .map((element) => element.outerHTML.slice(0, 80)));
    check(unlabeled.length === 0, `${label}: todos los campos tienen etiqueta ${unlabeled.length ? JSON.stringify(unlabeled) : ""}`);
    const unnamedButtons = await main.locator("button").evaluateAll((buttons) => buttons.filter((button) => !(button.textContent?.trim() || button.getAttribute("aria-label"))).length);
    check(unnamedButtons === 0, `${label}: todos los botones tienen texto comprensible`);
    await emailInput.focus();
    check(await emailInput.evaluate((element) => getComputedStyle(element).outlineStyle !== "none"), `${label}: el foco del correo es visible`);
    await context.close();
  });

  // --- Feedback de acciones (owner) --------------------------------------------------------
  await flow("Feedback", async () => {
    const { context, page } = await openAs(jefa, { width: 1366, height: 900 });
    const pendingSection = page.getByRole("region", { name: "Invitaciones pendientes" });
    await page.waitForFunction(() => Object.keys(document.querySelector('input[name="email"]') ?? {}).some((key) => key.startsWith("__reactProps$")), undefined, { timeout: 30_000 });
    await pendingSection.getByRole("button", { name: `Cancelar invitación a ${email("pendiente")}` }).click();
    const canceled = page.getByRole("status").filter({ hasText: "Invitación cancelada." });
    await canceled.waitFor();
    check(await canceled.isVisible(), "Cancelar: mensaje visible «Invitación cancelada.» (role=status)");
    const movedToHistory = await page.getByRole("region", { name: "Historial de invitaciones" }).getByText(email("pendiente")).waitFor({ timeout: 10_000 }).then(() => true, () => false);
    check(movedToHistory, "Cancelar: la invitación pasa al historial");
    await pendingSection.getByRole("button", { name: `Cancelar invitación a ${longEmail}` }).click();
    await page.getByText("Todavía no tienes invitaciones pendientes.").waitFor();
    check(await page.getByText("Todavía no tienes invitaciones pendientes.").isVisible(), "Sin pendientes: estado vacío visible");
    await page.getByLabel("Correo electrónico", { exact: true }).fill(email("nueva"));
    await page.getByLabel("Rol", { exact: true }).selectOption("member");
    await page.getByRole("button", { name: "Enviar invitación" }).click();
    const error = page.getByRole("alert");
    await error.waitFor();
    check((await error.innerText()).includes("La invitación no se creó"), "Crear sin correo configurado (local): error visible (role=alert)");
    await context.close();
  });

  // --- Admin, member y organización vacía ---------------------------------------------------
  await flow("Administrador", async () => {
    const { context, page } = await openAs(ayudante, { width: 1366, height: 900 });
    const roleOptions = await page.getByRole("region", { name: "Miembros del equipo" }).locator("select").first().locator("option").allInnerTexts();
    check(roleOptions.length > 0 && !roleOptions.includes("Propietario"), "Administrador: no puede ofrecer el rol Propietario");
    check(await page.getByRole("heading", { name: "Invitar miembro" }).isVisible(), "Administrador: puede invitar");
    await context.close();
  });
  await flow("Miembro", async () => {
    const { context, page } = await openAs(lector, { width: 390, height: 844 });
    const text = await page.locator("main").innerText();
    check(!(await page.getByRole("heading", { name: "Invitar miembro" }).count()), "Miembro: no ve el formulario de invitar");
    check(await page.locator("main select").count() === 0 && await page.locator("main").getByRole("button", { name: /Retirar|Guardar rol/ }).count() === 0, "Miembro: no ve controles de rol ni de retirada");
    check(text.includes("Propietario") && text.includes("Miembro"), "Miembro: ve el equipo con roles en español");
    await assertNoOverflow(page, "Miembro 390px");
    await context.close();
  });
  await flow("Organización vacía", async () => {
    await setActive(jefa, orgEmpty);
    const { context, page } = await openAs(jefa, { width: 1366, height: 900 });
    check(await page.getByText("Todavía no tienes invitaciones pendientes.").isVisible() && await page.getByText("Aún no hay invitaciones anteriores.").isVisible(), "Organización sin invitaciones: estados vacíos de pendientes e historial");
    await context.close();
  });
} catch (error) {
  if (!(error instanceof HarnessError || (error instanceof TypeError && error.message === "fetch failed"))) throw error;
  harnessFailure = error;
} finally {
  await browser?.close();
  try {
    executeD1(`DELETE FROM organization WHERE slug LIKE 'teamui-%-${suffix}'; DELETE FROM user WHERE email LIKE 'teamui-%-${suffix}@vecidya.test';`);
  } catch (error) {
    console.error(`Limpieza de fixtures incompleta: ${error.message}`);
  }
}

for (const result of results) console.log(`${result.ok ? "ok  " : "FAIL"} ${result.label}`);
if (harnessFailure) {
  console.error(`\nHARNESS FAILURE (no es un resultado de la UI): ${harnessFailure.message} ${harnessFailure.cause?.code ?? ""}`);
  process.exit(2);
}
const failures = results.filter((result) => !result.ok);
if (failures.length) {
  console.error(`\nFAIL: ${failures.length}/${results.length} comprobaciones de la experiencia de equipo fallaron.`);
  process.exit(1);
}
console.log(`\nPASS: INVITE-UI-001 ${results.length} comprobaciones de formulario, roles, estados, pendientes, historial, feedback, vacíos, responsive y accesibilidad.`);
