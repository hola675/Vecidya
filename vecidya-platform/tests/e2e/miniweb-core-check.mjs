import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
import { chromium } from "playwright";

setDefaultAutoSelectFamilyAttemptTimeout(5_000);
assertLocalBaseUrl();

const suffix = Date.now().toString();
const checks = [];
class HarnessError extends Error {}
const harness = (condition, message) => { if (!condition) throw new HarnessError(`HARNESS: ${message}`); };
const check = (condition, label) => checks.push({ ok: Boolean(condition), label });

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-miniweb-"));
  const file = join(directory, "step.sql");
  writeFileSync(file, sql, "utf8");
  const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "pnpm";
  const args = process.platform === "win32"
    ? ["/d", "/s", "/c", `pnpm.cmd wrangler d1 execute DB --local --json --file "${file}"`]
    : ["exec", "wrangler", "d1", "execute", "DB", "--local", "--json", "--file", file];
  const result = spawnSync(command, args, { cwd: process.cwd(), encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });
  harness(result.status === 0, `D1 local falló: ${result.stderr}`);
  return JSON.parse(result.stdout).flatMap((statement) => statement.results ?? []);
}

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
  throw new HarnessError("HARNESS: el Worker local no respondió tras usar D1.");
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
  json(path, body, method = "POST") {
    return this.fetch(path, { method, headers: { "content-type": "application/json" }, body: method === "GET" ? undefined : JSON.stringify(body) });
  }
  cookies() {
    return [...this.#cookies.entries()].map(([name, value]) => ({ name, value }));
  }
}

async function signUp(key) {
  const client = new SessionClient();
  const email = `miniweb-${key}-${suffix}@vecidya.test`;
  const password = `test-only-password-${suffix}`;
  const response = await client.json("/api/auth/sign-up/email", {
    name: `MiniWeb ${key} ${suffix}`,
    email,
    password,
  });
  harness(response.status === 200, `registro de ${key} devolvió ${response.status}`);
  const { user } = await response.json();
  createdUserIds.push(user.id);
  return { client, userId: user.id, email, password };
}

async function createOrganization(identity, key) {
  const response = await identity.client.json("/api/auth/organization/create", { name: `MiniWeb ${key} ${suffix}`, slug: `miniweb-${key}-${suffix}` });
  harness(response.status === 200, `crear organización ${key} devolvió ${response.status}`);
  const organizationId = (await response.json()).id;
  createdOrganizationIds.push(organizationId);
  return organizationId;
}

async function setActive(identity, organizationId) {
  const response = await identity.client.json("/api/auth/organization/set-active", { organizationId });
  harness(response.status === 200, `activar organización devolvió ${response.status}`);
}

const pathFor = (organizationId) => `/api/organizations/${organizationId}/miniweb-config`;
const post = (body) => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const profileSlug = (key) => `miniweb-${key}-${suffix}`;
const profileId = () => crypto.randomUUID();
const localEdgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (existsSync(localEdgePath) ? localEdgePath : undefined);
const createdUserIds = [];
const createdOrganizationIds = [];

let harnessFailure = null;
let browser = null;
try {
  const ownerA = await signUp("owner-a");
  const organizationA = await createOrganization(ownerA, "org-a");
  await setActive(ownerA, organizationA);
  const ownerB = await signUp("owner-b");
  const organizationB = await createOrganization(ownerB, "org-b");
  const organizationC = await createOrganization(ownerB, "org-c");
  const organizationD = await createOrganization(ownerB, "org-d");
  await setActive(ownerB, organizationB);
  const [adminA, memberA] = await Promise.all([signUp("admin-a"), signUp("member-a")]);
  const now = Date.now();
  await d1(`INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES
    ('${crypto.randomUUID()}', '${organizationA}', '${adminA.userId}', 'admin', ${now}),
    ('${crypto.randomUUID()}', '${organizationA}', '${memberA.userId}', 'member', ${now});`);
  await setActive(adminA, organizationA);
  await setActive(memberA, organizationA);
  await setActive(ownerA, organizationA);

  const pathA = pathFor(organizationA);
  const pathB = pathFor(organizationB);
  const initialResponse = await ownerA.client.json(pathA, null, "GET");
  harness(initialResponse.status === 200, `leer configuración A devolvió ${initialResponse.status}`);
  const initial = await initialResponse.json();
  check(initial.hasPersistedConfiguration === false, "la configuración virtual legacy no crea filas al leer");
  check(initial.draftConfiguration.templateKey === "vecidya-default", "la configuración virtual usa la plantilla actual");
  check((await d1(`SELECT id FROM miniweb_site WHERE organization_id = '${organizationA}';`)).length === 0, "GET no persiste filas vacías");

  await d1(`INSERT INTO business_profile (id, organization_id, display_name, slug, short_description, description, category, city, country, phone, public_email, status, created_at, updated_at) VALUES
    ('${profileId()}', '${organizationA}', 'MiniWeb público A ${suffix}', '${profileSlug("public-a")}', 'Resumen A', 'Descripción A', 'Servicios', 'Bogotá', 'Colombia', '+573001112233', 'a-${suffix}@example.invalid', 'published', ${Date.now()}, ${Date.now()}),
    ('${profileId()}', '${organizationB}', 'MiniWeb legacy B ${suffix}', '${profileSlug("legacy-b")}', 'Resumen B', 'Descripción B', 'Servicios', 'Cali', 'Colombia', '+573004445566', 'b-${suffix}@example.invalid', 'published', ${Date.now()}, ${Date.now()});`);

  check((await ownerA.client.json(pathB, null, "GET")).status === 403, "la organización A no puede leer la configuración de B");
  check((await ownerA.client.json(pathB, { intent: "save", configuration: initial.draftConfiguration })).status === 403, "la organización A no puede escribir la configuración de B");

  const invalidTemplate = { ...initial.draftConfiguration, templateKey: "custom-html" };
  check((await ownerA.client.json(pathA, { intent: "save", configuration: invalidTemplate })).status === 400, "una plantilla arbitraria se rechaza server-side");
  const invalidModule = {
    ...initial.draftConfiguration,
    modules: [{ type: "products", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null }],
  };
  check((await ownerA.client.json(pathA, { intent: "save", configuration: invalidModule })).status === 400, "un módulo no disponible se rechaza server-side");

  const draftOrder = [...initial.draftConfiguration.modules].sort((left, right) => left.sortOrder - right.sortOrder);
  [draftOrder[1], draftOrder[2]] = [draftOrder[2], draftOrder[1]];
  const draft = {
    ...initial.draftConfiguration,
    modules: draftOrder.map((module, sortOrder) => ({ ...module, sortOrder, enabled: module.type === "hero" })),
  };
  check((await memberA.client.json(pathA, null, "GET")).status === 200, "member conserva acceso de lectura a la configuración");
  check((await memberA.client.json(pathA, { intent: "save", configuration: draft })).status === 403, "member read-only no puede modificar la configuración");
  check((await ownerA.client.json(pathA, { intent: "save", configuration: draft })).status === 200, "owner puede guardar la configuración draft");
  const publicBeforePublish = await (await ownerA.client.fetch(`/vecindario/${profileSlug("public-a")}`)).text();
  check(publicBeforePublish.includes("Descripción A") && publicBeforePublish.includes(`a-${suffix}@example.invalid`), "guardar un draft no altera un MiniWeb ya publicado");
  check((await adminA.client.json(pathA, { intent: "publish" })).status === 200, "admin puede publicar explícitamente la configuración");

  const published = await (await ownerA.client.json(pathA, null, "GET")).json();
  check(published.hasPersistedConfiguration === true, "la configuración se persiste al guardar");
  check(published.draftConfiguration.modules.some((module) => module.type === "contact" && !module.enabled), "los módulos desactivados siguen en el draft");
  check(published.draftConfiguration.modules.map((module) => module.type).join(",") === draftOrder.map((module) => module.type).join(","), "el orden draft se guarda y se resuelve de forma determinística");
  check(published.publishedConfiguration.modules.some((module) => module.type === "contact" && !module.enabled), "el snapshot publicado conserva el módulo desactivado");
  check((await d1(`SELECT COUNT(*) AS count FROM miniweb_site WHERE organization_id = '${organizationA}';`))[0]?.count === 1, "una organización tiene una sola configuración MiniWeb");

  const publicA = await (await ownerA.client.fetch(`/vecindario/${profileSlug("public-a")}`)).text();
  const publicB = await (await ownerB.client.fetch(`/vecindario/${profileSlug("legacy-b")}`)).text();
  check(publicA.includes(`MiniWeb público A ${suffix}`), "la página publicada A conserva su slug estable");
  check(!publicA.includes("Descripción A") && !publicA.includes(`a-${suffix}@example.invalid`) && !publicA.includes("Contacto directo"), "los módulos desactivados no aparecen en el sitio público");
  await d1(`UPDATE miniweb_site SET published_configuration_json = 'not-json' WHERE organization_id = '${organizationA}';`);
  const corruptedSnapshotPublic = await (await ownerA.client.fetch(`/vecindario/${profileSlug("public-a")}`)).text();
  check(corruptedSnapshotPublic.includes(`MiniWeb público A ${suffix}`) && !corruptedSnapshotPublic.includes("Descripción A") && !corruptedSnapshotPublic.includes(`a-${suffix}@example.invalid`), "un snapshot publicado inválido falla cerrado a hero y no reactiva contenido");
  check((await ownerA.client.json(pathA, { intent: "publish" })).status === 200, "se puede restaurar explícitamente un snapshot válido desde el draft");
  check(publicB.includes(`MiniWeb legacy B ${suffix}`) && publicB.includes("Descripción B"), "un perfil publicado legacy sin miniweb_site se renderiza con defaults virtuales");
  check(new RegExp(`href=["']https://vecidya\\.com/vecindario/${profileSlug("legacy-b")}(["']|/)`).test(publicB), "el canonical actual de Vecindario se conserva");
  check(publicB.includes('name="description" content="Resumen B"') && publicB.includes('property="og:type" content="website"') && publicB.includes('name="robots" content="index, follow"'), "los metadatos SEO públicos actuales se conservan");

  const draftSlug = profileSlug("draft");
  const suspendedSlug = profileSlug("suspended");
  const suspendedProfileId = profileId();
  const draftProfileId = profileId();
  await d1(`INSERT INTO business_profile (id, organization_id, display_name, slug, status, created_at, updated_at) VALUES
    ('${draftProfileId}', '${organizationC}', 'MiniWeb borrador ${suffix}', '${draftSlug}', 'draft', ${now}, ${now});
    INSERT INTO business_profile (id, organization_id, display_name, slug, status, created_at, updated_at) VALUES
    ('${suspendedProfileId}', '${organizationD}', 'MiniWeb suspendido ${suffix}', '${suspendedSlug}', 'published', ${now}, ${now});
    INSERT INTO business_profile_governance (id, business_profile_id, verification_status, platform_status, created_at, updated_at)
    VALUES ('${crypto.randomUUID()}', '${suspendedProfileId}', 'unverified', 'suspended', ${now}, ${now});`);
  check((await ownerB.client.fetch(`/vecindario/${draftSlug}`)).status === 404, "el perfil draft continúa fuera del público");
  check((await ownerB.client.fetch(`/vecindario/${suspendedSlug}`)).status === 404, "el perfil suspendido continúa fuera del público");
  await setActive(ownerB, organizationD);
  const suspendedEditor = await (await ownerB.client.fetch("/app/miniweb")).text();
  check(suspendedEditor.includes("El perfil del negocio está suspendido y no aparece en público."), "el editor no representa un perfil suspendido como publicado");
  await setActive(ownerB, organizationB);

  browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
  const browserContext = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await browserContext.newPage();
  await page.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByLabel("Correo electrónico").fill(ownerA.email);
  await page.getByLabel("Contraseña").fill(ownerA.password);
  await page.getByRole("button", { name: "Entrar a mi espacio" }).click();
  await page.waitForURL((url) => url.pathname === "/app", { timeout: 15000 });
  const editorResponse = await page.goto(new URL("/app/miniweb", baseUrl).toString(), { waitUntil: "networkidle" });
  check(editorResponse?.status() === 200, "el editor privado Mi MiniWeb responde para el owner");
  check(await page.getByRole("heading", { name: "Mi MiniWeb", level: 1 }).count() === 1, "el editor presenta el punto de entrada Mi MiniWeb");
  check(await page.getByRole("checkbox", { name: "Desactivar Presentación" }).isDisabled(), "la sección hero requerida no se puede apagar");
  check(await page.getByText("Galería", { exact: true }).count() === 0 && await page.getByText("Productos", { exact: true }).count() === 0, "el editor no ofrece módulos todavía no disponibles");
  const renderedModuleLabels = await page.locator(".miniweb-module-list__item strong").allTextContents();
  const renderedModuleOrder = renderedModuleLabels.map((label) => ({
    "Presentación": "hero",
    "Acerca del negocio": "about",
    "Contacto": "contact",
    "Horarios": "hours",
    "Ubicación y modalidad": "location",
  })[label]);
  check(renderedModuleOrder.join(",") === published.draftConfiguration.modules.map((module) => module.type).join(","), "la lista de secciones visualiza el orden configurado");
  const viewportResults = [];
  const captureDirectory = process.env.MINIWEB_CAPTURE_DIR ?? join(process.cwd(), ".playwright-mcp");
  mkdirSync(captureDirectory, { recursive: true });
  for (const width of [1366, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    viewportResults.push({ width, overflow });
    await page.screenshot({ fullPage: true, path: join(captureDirectory, `app-mini-02a-editor-${width}.png`) });
  }
  check(viewportResults.every(({ overflow }) => !overflow), "el editor no tiene overflow a 1366/768/390/360");
  console.log(JSON.stringify({ viewports: viewportResults }, null, 2));
  await page.goto(new URL(`/vecindario/${profileSlug("public-a")}`, baseUrl).toString(), { waitUntil: "networkidle" });
  for (const width of [1366, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({ fullPage: true, path: join(captureDirectory, `app-mini-02a-public-${width}.png`) });
  }
} catch (error) {
  harnessFailure = error;
}

if (browser) await browser.close();
try {
  const deletes = [];
  if (createdOrganizationIds.length) {
    deletes.push(`DELETE FROM organization WHERE id IN (${createdOrganizationIds.map((id) => `'${id}'`).join(",")})`);
  }
  if (createdUserIds.length) {
    deletes.push(`DELETE FROM user WHERE id IN (${createdUserIds.map((id) => `'${id}'`).join(",")})`);
  }
  if (deletes.length) await d1(`${deletes.join(";\n")};`);
} catch (error) {
  harnessFailure ??= new HarnessError(`HARNESS: no se pudieron limpiar las fixtures de prueba: ${error instanceof Error ? error.message : String(error)}`);
}

const failed = checks.filter((result) => !result.ok);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.map((result) => result.label), fixturesCleaned: createdOrganizationIds.length > 0 || createdUserIds.length > 0, harness: harnessFailure?.message ?? null }, null, 2));
if (harnessFailure || failed.length) process.exitCode = 1;
