import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { once } from "node:events";
import { chromium } from "playwright";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { assertLocalBaseUrl } from "./test-safety.mjs";
let baseUrl;
let bootstrapUserId;
let bootstrapOrganizationId;
const suffix = Date.now().toString();
const projectDirectory = process.cwd();
const wranglerCli = resolve(projectDirectory, "node_modules/wrangler/bin/wrangler.js");
if (!existsSync(wranglerCli)) throw new Error("Falta Wrangler local para preparar el fixture de invitación.");
const persistenceName = `.wrangler/platform-service-audit-${process.pid}-${suffix}`;
const persistence = resolve(projectDirectory, persistenceName);
const secret = randomBytes(32).toString("hex");
let worker;

async function getFreePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
  if (!address || typeof address === "string") throw new Error("No se pudo reservar un puerto local.");
  return address.port;
}

function executeD1(sql) {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "vecidya-4b-"));
  const sqlFile = join(temporaryDirectory, "setup.sql");
  writeFileSync(sqlFile, sql, "utf8");
  let result;
  try {
    result = spawnSync(process.execPath, [wranglerCli, "d1", "execute", "DB", "--local", "--persist-to", persistenceName, "--json", "--file", sqlFile], { cwd: projectDirectory, encoding: "utf8" });
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
  if (result.status !== 0) throw new Error(`D1 local falló: ${result.stdout}\n${result.stderr}`);
  const output = result.stdout;
  return JSON.parse(output.slice(output.indexOf("["))).flatMap((entry) => entry.results ?? []);
}

function applyLocalMigrations() {
  const result = spawnSync(process.execPath, [wranglerCli, "d1", "migrations", "apply", "DB", "--local", "--persist-to", persistenceName], { cwd: projectDirectory, encoding: "utf8", timeout: 600_000, maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`No se pudieron aplicar las migraciones locales: ${result.stdout}\n${result.stderr}`);
}

function sqlLiteral(value) { return `'${String(value).replaceAll("'", "''")}'`; }

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

class SessionClient {
  #cookies = new Map();

  async fetch(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.#cookies.size) {
      headers.set("cookie", [...this.#cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; "));
    }

    let response;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
        break;
      } catch (error) {
        if (attempt === 2) throw error;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    for (const setCookie of response.headers.getSetCookie()) {
      const [pair] = setCookie.split(";", 1);
      const [name, ...value] = pair.split("=");
      this.#cookies.set(name, value.join("="));
    }
    return response;
  }

  async json(path, body, additionalHeaders = {}) {
    return this.fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json", ...additionalHeaders },
      body: JSON.stringify(body),
    });
  }

  browserCookies() {
    return [...this.#cookies].map(([name, value]) => ({ name, value, domain: new URL(baseUrl).hostname, path: "/", httpOnly: true, secure: false, sameSite: "Lax" }));
  }
}

async function createIdentity(key) {
  const client = new SessionClient();
  const email = `phase-4b-${key}-${suffix}@vecidya.test`;
  const slug = `phase-4b-${key}-${suffix}`;
  const invitationId = crypto.randomUUID();
  executeD1(`INSERT INTO invitation (id, organization_id, email, role, status, expires_at, created_at, inviter_id)
    VALUES (${sqlLiteral(invitationId)}, ${sqlLiteral(bootstrapOrganizationId)}, ${sqlLiteral(email)}, 'member', 'pending', ${Date.now() + 3_600_000}, ${Date.now()}, ${sqlLiteral(bootstrapUserId)});`);
  const signUp = await client.json("/api/auth/sign-up/email", {
    name: `4B ${key} ${suffix}`,
    email,
    password: `test-only-password-${suffix}`,
  }, { "X-Vecidya-Invitation": invitationId });
  if (signUp.status !== 200) {
    throw new Error(`No se pudo registrar ${key}: ${signUp.status} ${await signUp.text()}`);
  }
  const signUpData = await signUp.json();

  const createOrganization = await client.json("/api/auth/organization/create", {
    name: `Organización ${key} ${suffix}`,
    slug,
  });
  if (createOrganization.status !== 200) {
    throw new Error(`No se pudo crear la organización de ${key}: ${createOrganization.status} ${await createOrganization.text()}`);
  }
  const organizationData = await createOrganization.json();

  const organizationId = organizationData.id;
  const userId = signUpData.user?.id;
  assert(organizationId && userId, `No se resolvieron los IDs de prueba para ${key}.`);

  const activate = await client.json("/api/auth/organization/set-active", { organizationId });
  assert(activate.status === 200, `No se pudo activar la organización de ${key}: ${activate.status}`);
  return { client, email, organizationId, userId };
}

async function workerReady(baseUrl) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { if ((await fetch(`${baseUrl}/api/auth/ok`, { signal: AbortSignal.timeout(1000) })).status === 200) return; }
    catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 200));
  }
  throw new Error("El Worker local no respondió contra la D1 aislada.");
}

async function assertStatus(client, path, expected, options) {
  const response = await client.fetch(path, options);
  assert(response.status === expected, `${path} devolvió ${response.status}; se esperaba ${expected}.`);
  return response;
}

const identities = {};
try {
const port = await getFreePort();
baseUrl = `http://127.0.0.1:${port}`;
assertLocalBaseUrl(baseUrl);
worker = spawn(process.execPath, [wranglerCli, "dev", "--local", "--persist-to", persistenceName, "--ip", "127.0.0.1", "--port", String(port), "--var", "APP_ENV:staging", "--var", "EMAIL_PROVIDER:fake", "--var", "EMAIL_FROM:admin-audit@vecidya.test", "--var", `APP_URL:${baseUrl}`, "--var", `BETTER_AUTH_URL:${baseUrl}`, "--show-interactive-dev-session=false", "--log-level", "error"], { cwd: projectDirectory, env: { ...process.env, BETTER_AUTH_SECRET: secret }, stdio: "ignore" });
await workerReady(baseUrl);
applyLocalMigrations();
bootstrapUserId = crypto.randomUUID();
bootstrapOrganizationId = crypto.randomUUID();
const bootstrapNow = Date.now();
executeD1(`INSERT INTO user (id, name, email, email_verified, created_at, updated_at)
  VALUES (${sqlLiteral(bootstrapUserId)}, '4B fixture inviter', ${sqlLiteral(`phase-4b-bootstrap-${suffix}@vecidya.test`)}, 1, ${bootstrapNow}, ${bootstrapNow});
  INSERT INTO organization (id, name, slug, created_at)
  VALUES (${sqlLiteral(bootstrapOrganizationId)}, '4B fixture inviter', ${sqlLiteral(`phase-4b-bootstrap-${suffix}`)}, ${bootstrapNow});`);
for (const key of ["platform", "inactive", "owner-a", "owner-b", "admin", "member", "normal"]) {
  identities[key] = await createIdentity(key);
}
const now = Date.now();
const businessProfileId = crypto.randomUUID();
const lifecycleRows = ["owner-a", "owner-b"].map((key) => `(${sqlLiteral(identities[key].organizationId)}, 'active', ${sqlLiteral(identities[key].email)}, ${sqlLiteral(identities[key].userId)}, ${sqlLiteral(identities.platform.userId)}, ${sqlLiteral(identities.platform.userId)}, ${now}, ${now})`).join(",");
executeD1(`
  INSERT INTO platform_member (id, user_id, role, status, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${identities.platform.userId}', 'platform_admin', 'active', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${identities.inactive.userId}', 'platform_admin', 'inactive', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${identities.normal.userId}', 'staff', 'active', ${now}, ${now});
  INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', '${identities.admin.userId}', 'admin', ${now}),
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', '${identities.member.userId}', 'member', ${now}),
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', '${identities.platform.userId}', 'owner', ${now}),
    ('${crypto.randomUUID()}', '${identities["owner-b"].organizationId}', '${identities.platform.userId}', 'owner', ${now});
  INSERT INTO business_profile (id, organization_id, display_name, slug, status, created_at, updated_at) VALUES
    ('${businessProfileId}', '${identities["owner-a"].organizationId}', 'Portal A ${suffix}', 'portal-a-${suffix}', 'published', ${now}, ${now});
  INSERT INTO platform_organization_lifecycle (organization_id, status, intended_owner_email, owner_user_id, created_by, updated_by, created_at, updated_at) VALUES ${lifecycleRows};
`);
const bootstrapPriceNow = Date.now();
executeD1(`INSERT OR IGNORE INTO license_price (id, plan_code, currency, amount_cents, billing_interval, effective_from, status, created_at, updated_at) VALUES
  ('audit-price-cuadra', 'cuadra', 'USD', 1000, 'monthly', ${bootstrapPriceNow}, 'active', ${bootstrapPriceNow}, ${bootstrapPriceNow}),
  ('audit-price-barrio', 'barrio', 'USD', 2000, 'monthly', ${bootstrapPriceNow}, 'active', ${bootstrapPriceNow}, ${bootstrapPriceNow}),
  ('audit-price-ciudad', 'ciudad', 'USD', 3000, 'monthly', ${bootstrapPriceNow}, 'active', ${bootstrapPriceNow}, ${bootstrapPriceNow});`);
const miniwebProfileId = crypto.randomUUID();
const miniwebBillingAccountId = crypto.randomUUID();
executeD1(`INSERT INTO billing_account (id, owner_user_id, kind, name, created_at, updated_at)
  VALUES (${sqlLiteral(miniwebBillingAccountId)}, ${sqlLiteral(identities["owner-b"].userId)}, 'individual', 'Synthetic MiniWeb audit', ${now}, ${now})
  ON CONFLICT(owner_user_id) DO NOTHING;
  INSERT INTO organization_license (id, organization_id, billing_account_id, plan_code, price_id, status, started_at, activated_at, ends_at, created_at, updated_at)
  VALUES (${sqlLiteral(crypto.randomUUID())}, ${sqlLiteral(identities["owner-b"].organizationId)}, (SELECT id FROM billing_account WHERE owner_user_id=${sqlLiteral(identities["owner-b"].userId)}), 'cuadra', 'audit-price-cuadra', 'active', ${now}, ${now}, NULL, ${now}, ${now});
  INSERT INTO business_profile (id, organization_id, display_name, slug, short_description, description, category, city, country, status, created_at, updated_at)
  VALUES (${sqlLiteral(miniwebProfileId)}, ${sqlLiteral(identities["owner-b"].organizationId)}, 'MiniWeb owner-b ${suffix}', 'miniweb-owner-b-${suffix}', 'Synthetic profile', 'Synthetic description', 'Certification category', 'Test city', 'Test country', 'draft', ${now}, ${now});`);

const apiA = `/api/platform/organizations/${identities["owner-a"].organizationId}/services`;
const apiB = `/api/platform/organizations/${identities["owner-b"].organizationId}/services`;
const integrationsA = `/api/platform/organizations/${identities["owner-a"].organizationId}/integrations`;
const integrationsB = `/api/platform/organizations/${identities["owner-b"].organizationId}/integrations`;
const tenantIntegrationsA = `/api/organizations/${identities["owner-a"].organizationId}/integrations`;
const tenantIntegrationsB = `/api/organizations/${identities["owner-b"].organizationId}/integrations`;
const jsonPost = (serviceId, status) => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ serviceId, status }),
});

await assertStatus(identities.platform.client, apiA, 200);
await assertStatus(identities.platform.client, apiB, 200);
await assertStatus(identities.platform.client, apiA, 201, jsonPost("service-crm", "pending"));
const serviceActivated = await (await assertStatus(identities.platform.client, apiA, 200, jsonPost("service-crm", "active"))).json();
assert(serviceActivated.activatedAt && serviceActivated.endedAt === null, "Activar servicio no escribió activated_at ni limpió ended_at.");
const serviceAudit = await (await identities.platform.client.fetch("/app/internal/audit")).text();
assert(serviceAudit.includes("Asignó un servicio") && serviceAudit.includes("Actualizó un servicio") && serviceAudit.includes("organization_service"), "La auditoría no mostró las mutaciones de servicios.");
const endedAt = Date.now();
const serviceEnded = await (await assertStatus(identities.platform.client, apiA, 200, jsonPost("service-crm", "ended"))).json();
assert(serviceEnded.endedAt && serviceEnded.activatedAt === serviceActivated.activatedAt, "Finalizar servicio no escribió ended_at o perdió la fecha de activación histórica.");
const serviceReactivated = await (await assertStatus(identities.platform.client, apiA, 200, jsonPost("service-crm", "active"))).json();
assert(Date.parse(serviceReactivated.activatedAt) >= endedAt && serviceReactivated.endedAt === null, "Reactivar servicio no actualizó sus timestamps.");
await assertStatus(identities.platform.client, apiB, 201, jsonPost("service-marketing", "pending"));
await assertStatus(identities.platform.client, apiB, 200, jsonPost("service-marketing", "active"));
const servicesAdminA = await (await assertStatus(identities.platform.client, `/app/internal/services?organizationId=${identities["owner-a"].organizationId}`, 200)).text();
assert(servicesAdminA.includes(`Organización owner-a ${suffix}`) && servicesAdminA.includes("Seleccionada") && servicesAdminA.includes("Activo"), "La pantalla interna no mostró la organización seleccionada ni estados humanizados.");
const organizationDetailA = await (await assertStatus(identities.platform.client, `/app/internal/organizations/${identities["owner-a"].organizationId}`, 200)).text();
assert(organizationDetailA.includes(`/app/internal/services?organizationId=${identities["owner-a"].organizationId}`) && organizationDetailA.includes("CRM"), "El detalle de organización no enlazó a su administración de servicios.");
const internalRoutes = [
  "/app/internal",
  "/app/internal/services",
  "/app/internal/organizations",
  "/app/internal/organizations/new",
  `/app/internal/organizations/${identities["owner-a"].organizationId}`,
  `/app/internal/organizations/${identities["owner-a"].organizationId}/training`,
  `/app/internal/organizations/${identities["owner-a"].organizationId}/miniweb`,
  "/app/internal/licenses",
  "/app/internal/businesses",
  `/app/internal/businesses/${businessProfileId}`,
  "/app/internal/integrations",
  "/app/internal/audit",
  "/app/internal/diagnostic-leads",
  "/app/internal/diagnostic-analytics",
];
for (const route of internalRoutes) await assertStatus(identities.platform.client, route, 200);
await assertStatus(identities.normal.client, `/app/internal/organizations/${identities["owner-b"].organizationId}/miniweb`, 403);
const organizationsHtml = await (await assertStatus(identities.platform.client, "/app/internal/organizations", 200)).text();
assert(organizationsHtml.includes('aria-label="Buscar negocios o clientes"') && organizationsHtml.includes("Publicado") && organizationsHtml.includes("Sin perfil"), "El listado no presentó búsqueda y estados de perfil del fixture.");
const organizationDetailLink = `/app/internal/organizations/${identities["owner-a"].organizationId}`;
const ownerDetailHtml = await (await assertStatus(identities.platform.client, organizationDetailLink, 200)).text();
assert(ownerDetailHtml.includes("Suspender organización") && ownerDetailHtml.includes("Guardar rol") && ownerDetailHtml.includes("Administrar servicios de esta organización"), "El detalle Admin no expuso los controles esperados para la organización de prueba.");
const staffDetailHtml = await (await assertStatus(identities.normal.client, organizationDetailLink, 200)).text();
assert(!staffDetailHtml.includes("Suspender organización") && !staffDetailHtml.includes("Guardar rol") && !staffDetailHtml.includes("Administrar capacitación") && !staffDetailHtml.includes("Administrar MiniWeb"), "La UI de staff expuso mutaciones de plataforma.");
await assertStatus(new SessionClient(), "/app/internal", 302);
await assertStatus(identities.inactive.client, "/app/internal", 403);
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.context().addCookies(identities.platform.client.browserCookies());
  const desktop = await page.goto(`${baseUrl}/app/internal/services`);
  assert(desktop?.status() === 200 && await page.getByRole("heading", { name: "Servicios por organización" }).count() === 1, "El navegador no pudo renderizar Servicios en escritorio.");
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Admin presenta overflow horizontal en escritorio.");
  await page.setViewportSize({ width: 390, height: 844 });
  const menuButton = page.getByRole("button", { name: "Abrir navegación administrativa" });
  assert(await menuButton.isVisible(), "El menú administrativo móvil no está visible a 390 px.");
  await menuButton.focus();
  await page.keyboard.press("Enter");
  assert(await page.getByRole("dialog", { name: "Navegación administrativa" }).isVisible(), "El drawer móvil no expuso un diálogo accesible.");
  await page.getByRole("link", { name: "Auditoría" }).click();
  await page.waitForURL("**/app/internal/audit");
  await page.getByRole("button", { name: "Abrir navegación administrativa" }).waitFor({ state: "visible" });
  assert(await page.getByRole("button", { name: "Abrir navegación administrativa" }).getAttribute("aria-expanded") === "false", "La navegación móvil no cerró el drawer tras cambiar de ruta.");
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Admin presenta overflow horizontal a 390 px.");

  await page.goto(`${baseUrl}/app/internal/organizations`);
  const organizationSearch = page.getByRole("searchbox", { name: "Buscar negocios o clientes" });
  await organizationSearch.fill(`Organización owner-a ${suffix}`);
  const organizationRow = page.locator("tr").filter({ hasText: `Organización owner-a ${suffix}` });
  assert(await organizationRow.count() === 1, "La búsqueda UI no redujo la lista al espacio de trabajo esperado.");
  await organizationRow.getByRole("link", { name: "Ver" }).click();
  await page.waitForURL(`**/app/internal/organizations/${identities["owner-a"].organizationId}`);
  await page.getByRole("button", { name: "Suspender organización" }).click();
  await page.getByRole("heading", { name: "suspended" }).waitFor();
  await page.getByRole("button", { name: "Reactivar organización" }).click();
  await page.getByRole("heading", { name: "active" }).waitFor();
  const memberRow = page.locator(".admin-detail-list li").filter({ hasText: identities.member.email });
  await memberRow.getByRole("combobox").selectOption("admin");
  await memberRow.getByRole("button", { name: "Guardar rol" }).click();
  await page.waitForURL(`**/app/internal/organizations/${identities["owner-a"].organizationId}`);
  const roleState = executeD1(`SELECT m.role,(SELECT count(*) FROM platform_audit_log WHERE organization_id=${sqlLiteral(identities["owner-a"].organizationId)} AND action='organization.team_role.update' AND entity_id=m.id) AS audit_count FROM member m WHERE m.organization_id=${sqlLiteral(identities["owner-a"].organizationId)} AND m.user_id=${sqlLiteral(identities.member.userId)};`)[0];
  const lifecycleState = executeD1(`SELECT status,(SELECT count(*) FROM platform_audit_log WHERE organization_id=${sqlLiteral(identities["owner-a"].organizationId)} AND action='organization.suspended') AS suspend_audit,(SELECT count(*) FROM platform_audit_log WHERE organization_id=${sqlLiteral(identities["owner-a"].organizationId)} AND action='organization.active') AS active_audit FROM platform_organization_lifecycle WHERE organization_id=${sqlLiteral(identities["owner-a"].organizationId)};`)[0];
  assert(roleState?.role === "admin" && Number(roleState.audit_count) === 1, "El cambio de rol desde UI no persistió ni dejó una sola auditoría.");
  assert(lifecycleState?.status === "active" && Number(lifecycleState.suspend_audit) === 1 && Number(lifecycleState.active_audit) === 1, "Suspender/reactivar desde UI no dejó el estado final y las auditorías esperadas.");

  const trainingPath = `/app/internal/organizations/${identities["owner-a"].organizationId}/training`;
  await page.goto(`${baseUrl}${trainingPath}`);
  const trainingSlug = "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo";
  await page.getByLabel("Artículo").selectOption(trainingSlug);
  await page.getByRole("button", { name: "Asignar" }).click();
  await page.getByRole("status").getByText("Capacitación asignada a la organización.").waitFor();
  const trainingAssignmentState = executeD1(`SELECT a.id,a.training_slug,(SELECT count(*) FROM platform_audit_log l WHERE l.organization_id=a.organization_id AND l.action='training.assign') AS audit_count FROM organization_training_assignment a WHERE a.organization_id=${sqlLiteral(identities["owner-a"].organizationId)} AND a.training_slug=${sqlLiteral(trainingSlug)};`)[0];
  assert(trainingAssignmentState?.id && Number(trainingAssignmentState.audit_count) === 1, "Asignar capacitación desde UI no persistió el vínculo y su auditoría.");
  const progressId = crypto.randomUUID();
  executeD1(`INSERT INTO organization_training_progress (id,assignment_id,user_id,status,updated_at) VALUES (${sqlLiteral(progressId)},${sqlLiteral(trainingAssignmentState.id)},${sqlLiteral(identities.member.userId)},'in_progress',${now});
    INSERT INTO organization_training_progress_history (id,progress_id,actor_user_id,previous_status,new_status,reason,created_at) VALUES (${sqlLiteral(crypto.randomUUID())},${sqlLiteral(progressId)},${sqlLiteral(identities.member.userId)},'not_started','in_progress',NULL,${now});`);
  await page.goto(`${baseUrl}${trainingPath}`);
  const progressRow = page.locator("tbody tr").filter({ hasText: identities.member.email });
  await progressRow.getByRole("combobox", { name: "Nuevo estado para 4B member" }).selectOption("completed");
  await progressRow.getByRole("textbox", { name: "Motivo de corrección" }).fill("Corrección verificada por administración");
  await progressRow.getByRole("button", { name: "Guardar" }).click();
  await page.getByRole("status").getByText("Progreso actualizado; motivo registrado en auditoría.").waitFor();
  const correctedProgress = executeD1(`SELECT p.status,h.previous_status,h.new_status,h.reason,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=${sqlLiteral(identities["owner-a"].organizationId)} AND a.action='training.progress.correct') AS audit_count FROM organization_training_progress p JOIN organization_training_progress_history h ON h.progress_id=p.id WHERE p.id=${sqlLiteral(progressId)} ORDER BY h.created_at DESC LIMIT 1;`)[0];
  assert(correctedProgress?.status === "completed" && correctedProgress.previous_status === "in_progress" && correctedProgress.new_status === "completed" && correctedProgress.reason === "Corrección verificada por administración" && Number(correctedProgress.audit_count) === 1, "La corrección de capacitación UI no persistió progreso, historial, motivo y auditoría.");
  await page.goto(`${baseUrl}/app/internal/audit`);
  const trainingAuditSearch = page.getByRole("searchbox", { name: "Buscar en auditoría" });
  await trainingAuditSearch.fill("capacitación");
  const trainingAuditRows = page.locator("tbody tr");
  const trainingAuditText = (await trainingAuditRows.allInnerTexts()).join("\n");
  assert(await trainingAuditRows.count() === 2 && trainingAuditText.includes("Asignó capacitación a la organización") && trainingAuditText.includes("Corrigió el progreso de capacitación"), `El historial de Admin no etiquetó ni filtró los eventos de capacitación: ${trainingAuditText}.`);

  await page.goto(`${baseUrl}/app/internal/organizations/new`);
  await page.getByLabel("Nombre").fill(`Admin UI ${suffix}`);
  await page.getByLabel("Slug").fill(`admin-ui-${suffix}`);
  await page.getByLabel("Correo del propietario").fill(`invited-admin-ui-${suffix}@vecidya.test`);
  await page.getByRole("button", { name: "Crear y enviar invitación" }).click();
  await page.waitForURL(/\/app\/internal\/organizations\/[0-9a-f-]+\?created=1&delivery=simulated$/);
  await page.getByRole("status").getByText("El correo quedó simulado por el proveedor local.").waitFor();
  const createdOrganizationId = new URL(page.url()).pathname.split("/").at(-1);
  const createdInvitationState = executeD1(`SELECT l.status,i.status AS invitation_status,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=l.organization_id AND a.action='organization.create_owner_invitation') AS audit_count FROM platform_organization_lifecycle l JOIN platform_owner_invitation i ON i.organization_id=l.organization_id WHERE l.organization_id=${sqlLiteral(createdOrganizationId)};`)[0];
  assert(createdInvitationState?.status === "owner_invited" && createdInvitationState.invitation_status === "pending" && Number(createdInvitationState.audit_count) === 1, "Crear organización UI no persistió invitación y auditoría.");
  await page.getByRole("button", { name: "Revocar invitación" }).click();
  await page.getByRole("heading", { name: "pending_owner" }).waitFor();
  const revokedInvitationState = executeD1(`SELECT l.status,i.status AS invitation_status,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=l.organization_id AND a.action='organization.owner_invitation.revoke') AS audit_count FROM platform_organization_lifecycle l JOIN platform_owner_invitation i ON i.organization_id=l.organization_id WHERE l.organization_id=${sqlLiteral(createdOrganizationId)};`)[0];
  assert(revokedInvitationState?.status === "pending_owner" && revokedInvitationState.invitation_status === "revoked" && Number(revokedInvitationState.audit_count) === 1, "Revocar invitación UI no actualizó lifecycle, token ni auditoría.");

  const miniwebPath = `/app/internal/organizations/${identities["owner-b"].organizationId}/miniweb`;
  await page.goto(`${baseUrl}${miniwebPath}`);
  await page.getByRole("heading", { name: `Configuración de Organización owner-b ${suffix}` }).waitFor();
  const miniwebConfiguration = { templateKey: "vecidya-default", templateVersion: 1, layoutVariant: "standard", modules: [{ type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null }] };
  const miniwebRevisionBefore = Number(await page.locator('input[name="draftRevision"]').first().inputValue());
  await page.getByRole("textbox", { name: "Configuración JSON" }).fill(JSON.stringify(miniwebConfiguration, null, 2));
  const savedMiniwebAction = page.waitForResponse((response) => response.url().startsWith(`${baseUrl}${miniwebPath}.data`) && response.request().method() === "POST" && response.status() === 202);
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await savedMiniwebAction;
  const miniwebDraftState = executeD1(`SELECT p.draft_revision,s.template_key,(SELECT count(*) FROM miniweb_module m WHERE m.miniweb_site_id=s.id AND m.module_type='hero' AND m.enabled=1) AS hero_count,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=${sqlLiteral(identities["owner-b"].organizationId)} AND a.action='organization.miniweb.save') AS audit_count FROM business_profile_publication p JOIN miniweb_site s ON s.organization_id=p.organization_id WHERE p.organization_id=${sqlLiteral(identities["owner-b"].organizationId)};`)[0];
  assert(Number(miniwebDraftState?.draft_revision) === miniwebRevisionBefore + 1 && miniwebDraftState.template_key === miniwebConfiguration.templateKey && Number(miniwebDraftState.hero_count) === 1 && Number(miniwebDraftState.audit_count) === 1, "Guardar borrador MiniWeb desde UI no persistió la revisión/configuración ni una auditoría.");
  await page.locator('input[name="draftRevision"]').first().evaluate((input, staleRevision) => { input.value = staleRevision; }, String(miniwebRevisionBefore));
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await page.getByRole("alert").getByText("El borrador cambió desde que lo abriste. Recarga la página antes de guardar.").waitFor();
  const staleMiniwebState = executeD1(`SELECT p.draft_revision,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=p.organization_id AND a.action='organization.miniweb.save') AS audit_count FROM business_profile_publication p WHERE p.organization_id=${sqlLiteral(identities["owner-b"].organizationId)};`)[0];
  assert(Number(staleMiniwebState?.draft_revision) === miniwebRevisionBefore + 1 && Number(staleMiniwebState.audit_count) === 1, "El conflicto CAS de MiniWeb alteró la revisión o creó una auditoría de escritura rechazada.");
  await page.goto(`${baseUrl}${miniwebPath}`);
  const publishedMiniwebAction = page.waitForResponse((response) => response.url().startsWith(`${baseUrl}${miniwebPath}.data`) && response.request().method() === "POST" && response.status() === 202);
  await page.getByRole("button", { name: "Publicar MiniWeb" }).click();
  await publishedMiniwebAction;
  const miniwebPublishedState = executeD1(`SELECT p.published_version,p.snapshot_schema_version,p.snapshot_json,b.status AS profile_status,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=${sqlLiteral(identities["owner-b"].organizationId)} AND a.action='organization.miniweb.publish') AS publish_audit_count FROM business_profile_publication p JOIN business_profile b ON b.organization_id=p.organization_id WHERE p.organization_id=${sqlLiteral(identities["owner-b"].organizationId)};`)[0];
  const miniwebSnapshot = miniwebPublishedState?.snapshot_json ? JSON.parse(miniwebPublishedState.snapshot_json) : null;
  const miniwebPublishChecks = [Number(miniwebPublishedState?.published_version) === 1, Number(miniwebPublishedState?.snapshot_schema_version) === 4, miniwebPublishedState?.profile_status === "published", miniwebSnapshot?.configuration?.templateKey === miniwebConfiguration.templateKey, Number(miniwebPublishedState?.publish_audit_count) === 1];
  assert(miniwebPublishChecks.every(Boolean), `Publicar MiniWeb desde UI no confirmó snapshot, estado del perfil y auditoría persistidos: ${JSON.stringify({ checks: miniwebPublishChecks, state: miniwebPublishedState, snapshot: miniwebSnapshot })}.`);
  await page.goto(`${baseUrl}${miniwebPath}`);
  await page.getByText("El perfil, los horarios y la configuración coinciden con la versión publicada.").waitFor();
  await page.goto(`${baseUrl}/app/internal/audit`);
  const miniwebAuditSearch = page.getByRole("searchbox", { name: "Buscar en auditoría" });
  await miniwebAuditSearch.fill("MiniWeb");
  const miniwebAuditRows = page.locator("tbody tr");
  const miniwebAuditText = (await miniwebAuditRows.allInnerTexts()).join("\n");
  assert(await miniwebAuditRows.count() === 2 && miniwebAuditText.includes("Guardó el borrador de MiniWeb") && miniwebAuditText.includes("Publicó la MiniWeb"), `El historial de Admin no etiquetó ni filtró las acciones MiniWeb: ${miniwebAuditText}.`);
  assert(pageErrors.length === 0, `El navegador reportó errores de página: ${pageErrors.join("; ")}`);
} finally {
  await browser.close();
}

const integrationPost = (externalId, status = "active", metadata = '{"region":"local"}') => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider: "test-provider", externalId, status, metadata }) });
await assertStatus(identities.platform.client, integrationsA, 200);
await assertStatus(identities.platform.client, integrationsB, 200);
await assertStatus(identities.platform.client, integrationsA, 201, integrationPost(`external-a-${suffix}`));
await assertStatus(identities.platform.client, integrationsB, 201, integrationPost(`external-b-${suffix}`, "pending"));
await assertStatus(identities.platform.client, integrationsB, 409, integrationPost(`external-a-${suffix}`));
await assertStatus(identities.platform.client, integrationsA, 400, integrationPost(`invalid-status-${suffix}`, "unknown"));
await assertStatus(identities.platform.client, integrationsA, 400, integrationPost(`secret-metadata-${suffix}`, "active", '{"apiKey":"forbidden"}'));

const tenantAConnections = await (await assertStatus(identities["owner-a"].client, tenantIntegrationsA, 200)).json();
const tenantBConnections = await (await assertStatus(identities["owner-b"].client, tenantIntegrationsB, 200)).json();
assert(tenantAConnections.some((connection) => connection.externalId === `external-a-${suffix}`), "A no recibió su conexión.");
assert(!tenantBConnections.some((connection) => connection.externalId === `external-a-${suffix}`), "B recibió una conexión de A.");
await assertStatus(identities["owner-a"].client, tenantIntegrationsB, 403);
await assertStatus(identities["owner-b"].client, tenantIntegrationsA, 403);

for (const key of ["normal", "owner-a", "admin", "member", "inactive"]) {
  await assertStatus(identities[key].client, apiA, 403);
  await assertStatus(identities[key].client, "/app/internal/services", 403);
  await assertStatus(identities[key].client, integrationsA, 403);
}

for (const key of ["owner-a", "admin", "member"]) {
  await assertStatus(identities[key].client, "/app/services", 200);
}
const ownerAServices = await (await assertStatus(identities["owner-a"].client, "/app/services", 200)).text();
assert(ownerAServices.includes("CRM") && ownerAServices.includes("active"), "El portal de la organización A no mostró CRM activo.");
const ownerBServices = await (await assertStatus(identities["owner-b"].client, "/app/services", 200)).text();
const ownerBMain = ownerBServices.match(/<main\b[^>]*\bid="client-page-content"[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";
const ownerBServiceList = ownerBMain.match(/<div\b[^>]*\baria-label="Servicios de la organización"[^>]*>([\s\S]*)$/)?.[1] ?? "";
assert(!ownerBServiceList.includes("CRM"), "El portal de la organización B mostró el CRM de A en sus servicios.");

const activatePlatformOrganization = async (organizationId) => {
  const response = await identities.platform.client.json("/api/auth/organization/set-active", { organizationId });
  assert(response.status === 200, `No se pudo cambiar la organización activa: ${response.status}.`);
};
await activatePlatformOrganization(identities["owner-a"].organizationId);
const dashboardA = await (await assertStatus(identities.platform.client, "/app", 200)).text();
assert(dashboardA.includes(`Portal A ${suffix}`) && dashboardA.includes("CRM") && dashboardA.includes("active"), "El dashboard no mostró los datos reales de la organización A.");
await activatePlatformOrganization(identities["owner-b"].organizationId);
const dashboardB = await (await assertStatus(identities.platform.client, "/app", 200)).text();
assert(!dashboardB.includes(`Portal A ${suffix}`), "El dashboard conservó el perfil de la organización A después del cambio.");

const licensePath = `/api/platform/organizations/${identities["owner-a"].organizationId}/license`;
let currentLicenseId;
const concurrentAssignments = await Promise.all([
  identities.platform.client.json(licensePath, { operation: "assign", ownerUserId: identities["owner-a"].userId, planCode: "cuadra", activate: true }),
  identities.platform.client.json(licensePath, { operation: "assign", ownerUserId: identities["owner-a"].userId, planCode: "cuadra", activate: true }),
]);
const assignmentStatuses = concurrentAssignments.map(({ status }) => status).sort((a, b) => a - b);
assert(assignmentStatuses[0] === 201 && assignmentStatuses[1] === 409, `Asignación simultánea produjo ${assignmentStatuses.join(", ")}; se esperaba un éxito y un conflicto 409.`);
const activeLicense = await (await identities.platform.client.fetch(licensePath)).json();
const assignmentCount = executeD1(`SELECT count(*) AS count FROM organization_license WHERE organization_id = ${sqlLiteral(identities["owner-a"].organizationId)} AND status <> 'cancelled';`)[0]?.count;
const assignmentAuditCount = executeD1(`SELECT count(*) AS count FROM platform_audit_log WHERE organization_id = ${sqlLiteral(identities["owner-a"].organizationId)} AND action = 'organization_license.assign';`)[0]?.count;
assert(Number(assignmentCount) === 1 && Number(assignmentAuditCount) === 1 && activeLicense.license?.status === "active", "La asignación concurrente dejó filas vigentes o auditoría duplicada/incompleta.");

const licenseBrowser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
try {
  const licensePage = await licenseBrowser.newPage({ viewport: { width: 1366, height: 900 } });
  const licenseErrors = [];
  licensePage.on("pageerror", (error) => licenseErrors.push(error.message));
  await licensePage.context().addCookies(identities.platform.client.browserCookies());
  const licenseUi = await licensePage.goto(`${baseUrl}/app/internal/licenses`);
  assert(licenseUi?.status() === 200, "La UI de licencias no cargó para el administrador activo.");
  const search = licensePage.getByRole("searchbox", { name: "Buscar cliente o negocio" });
  await search.fill(`Portal A ${suffix}`);
  const businessCard = licensePage.locator(".admin-detail-card").filter({ hasText: `Portal A ${suffix}` });
  assert(await businessCard.count() === 1, "El filtro no redujo la tabla de licencias al negocio sintético.");
  const changeForm = businessCard.locator("form").filter({ has: licensePage.locator('input[name="intent"][value="change-plan"]') });
  assert(await changeForm.count() === 1, "La licencia activa no mostró el formulario de cambio de plan.");
  await changeForm.locator('select[name="planCode"]').selectOption("barrio");
  await changeForm.getByRole("button", { name: "Cambiar plan" }).click();
  await licensePage.waitForURL("**/app/internal/licenses?updated=1");
  await licensePage.getByRole("status").getByText("Licencia actualizada y acción registrada en auditoría.").waitFor();
  const changedLicenseState = executeD1(`SELECT id,plan_code,status,(SELECT count(*) FROM organization_license WHERE organization_id=${sqlLiteral(identities["owner-a"].organizationId)} AND status <> 'cancelled') AS current_count,(SELECT count(*) FROM platform_audit_log WHERE organization_id=${sqlLiteral(identities["owner-a"].organizationId)} AND action='organization_license.change_plan') AS audit_count FROM organization_license WHERE organization_id=${sqlLiteral(identities["owner-a"].organizationId)} AND status <> 'cancelled';`)[0];
  currentLicenseId = changedLicenseState?.id;
  assert(changedLicenseState?.plan_code === "barrio" && changedLicenseState.status === "active" && Number(changedLicenseState.current_count) === 1 && Number(changedLicenseState.audit_count) === 1, "El cambio de plan desde UI no persistió exactamente una licencia y auditoría.");
  const licensePathUi = `${baseUrl}/app/internal/licenses`;
  const suspendAction = licensePage.waitForResponse((response) => response.url().startsWith(`${licensePathUi}.data`) && response.request().method() === "POST" && response.status() === 202);
  await licensePage.getByRole("button", { name: "Suspender licencia" }).click();
  await suspendAction;
  const suspendedLicenseState = executeD1(`SELECT status,(SELECT count(*) FROM platform_audit_log WHERE organization_id=${sqlLiteral(identities["owner-a"].organizationId)} AND action='organization_license.suspended') AS audit_count FROM organization_license WHERE organization_id=${sqlLiteral(identities["owner-a"].organizationId)} AND status <> 'cancelled';`)[0];
  assert(suspendedLicenseState?.status === "suspended" && Number(suspendedLicenseState.audit_count) === 1, "Suspender licencia desde UI no persistió el estado y su auditoría.");
  await licensePage.goto(licensePathUi);
  const reactivateAction = licensePage.waitForResponse((response) => response.url().startsWith(`${licensePathUi}.data`) && response.request().method() === "POST" && response.status() === 202);
  await licensePage.getByRole("button", { name: "Activar licencia" }).click();
  await reactivateAction;
  const reactivatedLicenseState = executeD1(`SELECT status,(SELECT count(*) FROM platform_audit_log WHERE organization_id=${sqlLiteral(identities["owner-a"].organizationId)} AND action='organization_license.active') AS audit_count FROM organization_license WHERE organization_id=${sqlLiteral(identities["owner-a"].organizationId)} AND status <> 'cancelled';`)[0];
  assert(reactivatedLicenseState?.status === "active" && Number(reactivatedLicenseState.audit_count) === 1, "Reactivar licencia desde UI no persistió el estado y su auditoría.");
  assert(licenseErrors.length === 0, `La UI de licencias produjo errores: ${licenseErrors.join("; ")}`);
} finally {
  await licenseBrowser.close();
}

const concurrentPlanChanges = await Promise.all([
  identities.platform.client.json(licensePath, { operation: "change-plan", currentLicenseId, planCode: "cuadra" }),
  identities.platform.client.json(licensePath, { operation: "change-plan", currentLicenseId, planCode: "ciudad" }),
]);
const planStatuses = concurrentPlanChanges.map(({ status }) => status);
assert(planStatuses.filter((status) => status === 200).length === 1 && planStatuses.filter((status) => status === 409).length === 1, `Los cambios simultáneos de plan no rechazaron la mutación obsoleta: ${planStatuses.join(", ")} ${await Promise.all(concurrentPlanChanges.map((response) => response.clone().text()))}.`);
const planState = executeD1(`SELECT count(*) AS current_count FROM organization_license WHERE organization_id = ${sqlLiteral(identities["owner-a"].organizationId)} AND status <> 'cancelled'; SELECT count(*) AS audit_count FROM platform_audit_log WHERE organization_id = ${sqlLiteral(identities["owner-a"].organizationId)} AND action = 'organization_license.change_plan'; SELECT count(*) AS cancelled_count FROM organization_license WHERE organization_id = ${sqlLiteral(identities["owner-a"].organizationId)} AND status = 'cancelled';`);
assert(Number(planState[0]?.current_count) === 1 && Number(planState[1]?.audit_count) === 2 && Number(planState[2]?.cancelled_count) === 2, `Cambios UI y simultáneo rompieron unicidad o auditoría: ${JSON.stringify(planState)}.`);
console.log("PASS: servicios/integraciones y licencias (concurrencia y auditoría) verificados contra el Worker y D1 locales aislados.");
} finally {
  if (worker && worker.exitCode === null) {
    const exited = once(worker, "exit");
    worker.kill("SIGINT");
    await Promise.race([exited, new Promise((resolveWait) => setTimeout(resolveWait, 5000))]);
  }
  rmSync(persistence, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
  if (existsSync(persistence)) throw new Error(`No se pudo limpiar la D1 aislada ${persistenceName}.`);
}
