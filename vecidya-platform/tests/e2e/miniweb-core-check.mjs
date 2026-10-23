import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

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
  const wranglerCli = fileURLToPath(import.meta.resolve("wrangler"));
  const persistArgs = process.env.VECIDYA_E2E_PERSIST_TO ? ["--persist-to", process.env.VECIDYA_E2E_PERSIST_TO] : [];
  const result = spawnSync(process.execPath, [wranglerCli, "d1", "execute", "DB", "--local", ...persistArgs, "--json", "--file", file], { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
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
  #draftRevisions = new Map();
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
  json(path, body, method = "POST", extraHeaders = {}) {
    const isMiniWeb = path.includes("/miniweb-config");
    const payload = isMiniWeb && body && body.draftRevision === undefined
      ? { ...body, draftRevision: this.#draftRevisions.get(path) ?? 0 }
      : body;
    return this.fetch(path, { method, headers: { "content-type": "application/json", ...extraHeaders }, body: method === "GET" ? undefined : JSON.stringify(payload) }).then(async (response) => {
      if (isMiniWeb) {
        try {
          const result = await response.clone().json();
          if (Number.isInteger(result.draftRevision)) this.#draftRevisions.set(path, result.draftRevision);
        } catch {}
      }
      return response;
    });
  }
  cookies() {
    return [...this.#cookies.entries()].map(([name, value]) => ({ name, value }));
  }
}

async function signUp(key) {
  const client = new SessionClient();
  const email = `miniweb-${key}-${suffix}@vecidya.test`;
  const password = `test-only-password-${suffix}`;
  const invitationId = crypto.randomUUID();
  const now = Date.now();
  await d1(`INSERT INTO invitation (id, organization_id, email, role, status, expires_at, created_at, inviter_id) VALUES ('${invitationId}', '${fixtureOrganizationId}', '${email}', 'member', 'pending', ${now + 86400000}, ${now}, '${fixtureInviterId}');`);
  const response = await client.json("/api/auth/sign-up/email", {
    name: `MiniWeb ${key} ${suffix}`,
    email,
    password,
  }, "POST", { "X-Vecidya-Invitation": invitationId });
  harness(response.status === 200, `registro de ${key} devolvió ${response.status}: ${(await response.clone().text()).slice(0, 500)}`);
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
const fixtureInviterId = crypto.randomUUID();
const fixtureOrganizationId = crypto.randomUUID();
const fixturePriceId = crypto.randomUUID();
const priceAId = crypto.randomUUID();

let harnessFailure = null;
let browser = null;
try {
  const fixtureNow = Date.now();
  await d1(`INSERT INTO user (id, name, email, email_verified, created_at, updated_at) VALUES ('${fixtureInviterId}', 'MiniWeb CI inviter', 'miniweb-inviter-${suffix}@vecidya.test', 1, ${fixtureNow}, ${fixtureNow}); INSERT INTO organization (id, name, slug, created_at) VALUES ('${fixtureOrganizationId}', 'MiniWeb CI fixture', 'miniweb-fixture-${suffix}', ${fixtureNow});`);
  createdUserIds.push(fixtureInviterId);
  createdOrganizationIds.push(fixtureOrganizationId);
  const ownerA = await signUp("owner-a");
  const organizationA = await createOrganization(ownerA, "org-a");
  // Los perfiles públicos requieren una licencia activa del propietario (no basta el estado published).
  const billingAId = crypto.randomUUID();
  const licenseAId = crypto.randomUUID();
  const licenseAAt = Date.now();
  await d1(`INSERT INTO billing_account (id, owner_user_id, kind, created_at, updated_at) VALUES ('${billingAId}', '${ownerA.userId}', 'individual', ${licenseAAt}, ${licenseAAt}); INSERT INTO license_price (id, plan_code, currency, amount_cents, billing_interval, effective_from, status, created_at, updated_at) VALUES ('${priceAId}', 'cuadra', 'USD', 3900, 'monthly', ${licenseAAt}, 'active', ${licenseAAt}, ${licenseAAt}); INSERT INTO organization_license (id, organization_id, billing_account_id, plan_code, price_id, status, started_at, activated_at, created_at, updated_at) VALUES ('${licenseAId}', '${organizationA}', '${billingAId}', 'cuadra', '${priceAId}', 'active', ${licenseAAt}, ${licenseAAt}, ${licenseAAt}, ${licenseAAt});`);
  await setActive(ownerA, organizationA);
  const ownerB = await signUp("owner-b");
  const organizationB = await createOrganization(ownerB, "org-b");
  // La segunda organización exige una licencia activa: fixture local del propietario B.
  const billingId = crypto.randomUUID();
  const priceId = fixturePriceId;
  const licenseId = crypto.randomUUID();
  const licensedAt = Date.now();
  await d1(`INSERT INTO billing_account (id, owner_user_id, kind, created_at, updated_at) VALUES ('${billingId}', '${ownerB.userId}', 'individual', ${licensedAt}, ${licensedAt}); INSERT INTO license_price (id, plan_code, currency, amount_cents, billing_interval, effective_from, status, created_at, updated_at) VALUES ('${priceId}', 'cuadra', 'USD', 3900, 'monthly', ${licensedAt}, 'active', ${licensedAt}, ${licensedAt}); INSERT INTO organization_license (id, organization_id, billing_account_id, plan_code, price_id, status, started_at, activated_at, created_at, updated_at) VALUES ('${licenseId}', '${organizationB}', '${billingId}', 'cuadra', '${priceId}', 'active', ${licensedAt}, ${licensedAt}, ${licensedAt}, ${licensedAt});`);
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

  let staleLegacyPublish = await ownerA.client.json(pathA, { intent: "publish", draftRevision: 99 });
  let staleLegacyPublishBody = await staleLegacyPublish.clone().text();
  if (staleLegacyPublish.status >= 500 && staleLegacyPublishBody.includes("Network connection lost")) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    staleLegacyPublish = await ownerA.client.json(pathA, { intent: "publish", draftRevision: 99 });
    staleLegacyPublishBody = await staleLegacyPublish.clone().text();
  }
  check(staleLegacyPublish.status === 409, `publicar un perfil legacy con revisión incorrecta devuelve 409 (${staleLegacyPublish.status}: ${staleLegacyPublishBody.slice(0, 160)})`);
  const legacyAState = (await d1(`SELECT published_version, snapshot_json FROM business_profile_publication WHERE organization_id = '${organizationA}';`))[0];
  check(Number(legacyAState?.published_version) === 1 && JSON.parse(legacyAState.snapshot_json).profile.displayName === `MiniWeb público A ${suffix}`, "el 409 conserva el snapshot público legacy original");

  const profilePathB = `/api/organizations/${organizationB}/business-profile`;
  const legacyBProfile = await (await ownerB.client.json(profilePathB, null, "GET")).json();
  const makeProfileForm = (profile, revision, displayName) => {
    const form = new FormData();
    for (const key of ["displayName", "slug", "shortDescription", "description", "category", "city", "country", "phone", "publicEmail", "websiteUrl", "logoUrl", "whatsapp", "instagramUrl", "facebookUrl", "linkedinUrl", "serviceMode", "serviceArea"]) {
      const value = key === "displayName" ? displayName : profile[key];
      form.set(key, value ?? "");
    }
    form.set("draftRevision", String(revision));
    return form;
  };
  const concurrentInitializers = await Promise.all([
    ownerB.client.fetch(profilePathB, { method: "POST", body: makeProfileForm(legacyBProfile.profile, legacyBProfile.draftRevision, `Borrador B1 ${suffix}`) }),
    ownerB.client.fetch(profilePathB, { method: "POST", body: makeProfileForm(legacyBProfile.profile, legacyBProfile.draftRevision, `Borrador B2 ${suffix}`) }),
  ]);
  check(concurrentInitializers.map(({ status }) => status).sort().join(",") === "200,409", "dos inicializaciones/guardados legacy simultáneos producen un solo escritor ganador");
  const legacyBState = (await d1(`SELECT published_version, snapshot_json FROM business_profile_publication WHERE organization_id = '${organizationB}';`))[0];
  const legacyBSnapshot = JSON.parse(legacyBState.snapshot_json);
  check(Number(legacyBState.published_version) === 1 && legacyBSnapshot.profile.displayName === `MiniWeb legacy B ${suffix}`, "las dos inicializaciones conservan una única versión pública legacy coherente");
  const legacyBAnonymous = await fetch(new URL(`/vecindario/${profileSlug("legacy-b")}`, baseUrl));
  const legacyBAnonymousHtml = await legacyBAnonymous.text();
  check(legacyBAnonymous.status === 200 && legacyBAnonymousHtml.includes(`MiniWeb legacy B ${suffix}`) && !legacyBAnonymousHtml.includes("Borrador B"), "los cambios draft posteriores permanecen ocultos a visitantes anónimos");
  await d1(`UPDATE business_profile_publication SET snapshot_schema_version = NULL, snapshot_json = NULL WHERE organization_id = '${organizationB}';`);
  const incompleteLegacyAnonymous = await fetch(new URL(`/vecindario/${profileSlug("legacy-b")}`, baseUrl));
  check(incompleteLegacyAnonymous.status === 404, "un estado de publicación existente sin snapshot válido falla cerrado para visitantes anónimos");
  const escapedLegacySnapshot = legacyBState.snapshot_json.replaceAll("'", "''");
  await d1(`UPDATE business_profile_publication SET snapshot_schema_version = 1, snapshot_json = '${escapedLegacySnapshot}' WHERE organization_id = '${organizationB}';`);

  const invalidTemplate = { ...initial.draftConfiguration, templateKey: "custom-html" };
  let invalidTemplateResponse = await ownerA.client.json(pathA, { intent: "save", configuration: invalidTemplate });
  let invalidTemplateResponseBody = await invalidTemplateResponse.clone().text();
  if (invalidTemplateResponse.status >= 500 && invalidTemplateResponseBody.includes("Network connection lost")) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    invalidTemplateResponse = await ownerA.client.json(pathA, { intent: "save", configuration: invalidTemplate });
    invalidTemplateResponseBody = await invalidTemplateResponse.clone().text();
  }
  check(invalidTemplateResponse.status === 400, `una plantilla arbitraria se rechaza server-side (${invalidTemplateResponse.status}: ${invalidTemplateResponseBody.slice(0, 160)})`);
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
  const profilePathA = `/api/organizations/${organizationA}/business-profile`;
  const profileRead = await ownerA.client.json(profilePathA, null, "GET");
  const profileState = await profileRead.json();
  const makeProfileFormA = (revision, displayName) => makeProfileForm(profileState.profile, revision, displayName);
  const staleRevision = profileState.draftRevision;
  const draftName = `Nombre draft ${suffix}`;
  const profileSave = await ownerA.client.fetch(profilePathA, { method: "POST", body: makeProfileFormA(staleRevision, draftName) });
  check(profileSave.status === 200, `owner puede guardar perfil como borrador (${profileSave.status})`);
  const staleWrite = await adminA.client.fetch(profilePathA, { method: "POST", body: makeProfileFormA(staleRevision, `Nombre stale ${suffix}`) });
  check(staleWrite.status === 409, "un segundo editor con revisión obsoleta recibe conflicto y no sobrescribe el borrador");
  const hoursForm = new FormData();
  hoursForm.set("intent", "save-hours");
  hoursForm.set("draftRevision", String(staleRevision + 1));
  hoursForm.set("hours_1_opens", "09:00");
  hoursForm.set("hours_1_closes", "17:00");
  const hoursSave = await ownerA.client.fetch("/app/business-profile", { method: "POST", body: hoursForm });
  check(hoursSave.status === 200, `owner puede guardar horarios como borrador (${hoursSave.status})`);
  const profileAfterDraft = await (await ownerA.client.json(profilePathA, null, "GET")).json();
  const miniwebAfterDraft = await (await ownerA.client.json(pathA, null, "GET")).json();
  check(profileAfterDraft.draftRevision === staleRevision + 2 && miniwebAfterDraft.draftRevision === profileAfterDraft.draftRevision, "lecturas JSON de perfil y MiniWeb devuelven la revisión vigente tras guardar perfil y horarios");
  check(miniwebAfterDraft.profile.displayName === draftName && miniwebAfterDraft.hours.some((entry) => entry.dayOfWeek === 1 && entry.opensAt === "09:00"), "el endpoint JSON de MiniWeb entrega perfil y horarios del borrador junto con esa revisión");
  const publicBeforePublishResponse = await fetch(new URL(`/vecindario/${profileSlug("public-a")}`, baseUrl));
  const publicBeforePublish = await publicBeforePublishResponse.text();
  console.log(JSON.stringify({ miniwebPublicBeforePublish: { status: publicBeforePublishResponse.status, url: publicBeforePublishResponse.url, titlePresent: publicBeforePublish.includes(`MiniWeb público A ${suffix}`), descriptionPresent: publicBeforePublish.includes("Descripción A"), emailPresent: publicBeforePublish.includes(`a-${suffix}@example.invalid`), bodyExcerpt: publicBeforePublish.slice(0, 350) } }));
  check(publicBeforePublish.includes(`MiniWeb público A ${suffix}`) && !publicBeforePublish.includes(draftName), "editar nombre, perfil y MiniWeb conserva la versión pública previa hasta publicar");
  await adminA.client.json(pathA, null, "GET");
  check((await adminA.client.json(pathA, { intent: "publish" })).status === 200, "admin puede publicar explícitamente la configuración");

  const published = await (await ownerA.client.json(pathA, null, "GET")).json();
  check(published.hasPersistedConfiguration === true, "la configuración se persiste al guardar");
  check(published.draftConfiguration.modules.some((module) => module.type === "contact" && !module.enabled), "los módulos desactivados siguen en el draft");
  check(published.draftConfiguration.modules.map((module) => module.type).join(",") === draftOrder.map((module) => module.type).join(","), "el orden draft se guarda y se resuelve de forma determinística");
  check(published.publishedConfiguration.modules.some((module) => module.type === "contact" && !module.enabled), "el snapshot publicado conserva el módulo desactivado");
  check((await d1(`SELECT COUNT(*) AS count FROM miniweb_site WHERE organization_id = '${organizationA}';`))[0]?.count === 1, "una organización tiene una sola configuración MiniWeb");

  const publicAResponse = await fetch(new URL(`/vecindario/${profileSlug("public-a")}`, baseUrl));
  const publicA = await publicAResponse.text();
  const snapshotRows = await d1(`SELECT snapshot_json FROM business_profile_publication WHERE organization_id = '${organizationA}';`);
  const fullSnapshot = JSON.parse(snapshotRows[0].snapshot_json);
  console.log(JSON.stringify({ miniwebPublicAfterPublish: { status: publicAResponse.status, url: publicAResponse.url, titlePresent: publicA.includes(`MiniWeb público A ${suffix}`), bodyExcerpt: publicA.slice(0, 350) } }));
  const publicB = await (await ownerB.client.fetch(`/vecindario/${profileSlug("legacy-b")}`)).text();
  check(publicA.includes(draftName), "la publicación cambia el perfil y la composición en una sola versión pública");
  check(fullSnapshot.profile.displayName === draftName && fullSnapshot.hours.some((entry) => entry.dayOfWeek === 1 && entry.opensAt === "09:00") && fullSnapshot.configuration.modules.some((module) => module.type === "hero"), "una versión publicada contiene perfil, horarios y configuración juntos");
  check(!publicA.includes("Descripción A") && !publicA.includes(`a-${suffix}@example.invalid`) && !publicA.includes("Contacto directo"), "los módulos desactivados no aparecen en el sitio público");
  await d1(`UPDATE business_profile_publication SET snapshot_json = 'not-json' WHERE organization_id = '${organizationA}';`);
  const corruptedSnapshotResponse = await ownerA.client.fetch(`/vecindario/${profileSlug("public-a")}`);
  check(corruptedSnapshotResponse.status === 404, "un snapshot publicado inválido falla cerrado sin mostrar datos inconsistentes");
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
  // Retirar primero las licencias y la cuenta de facturación de prueba para respetar las FK.
  await d1(`DELETE FROM organization_license WHERE billing_account_id IN (SELECT id FROM billing_account WHERE owner_user_id IN (SELECT id FROM user WHERE email IN ('miniweb-owner-a-${suffix}@vecidya.test', 'miniweb-owner-b-${suffix}@vecidya.test'))); DELETE FROM billing_account WHERE owner_user_id IN (SELECT id FROM user WHERE email IN ('miniweb-owner-a-${suffix}@vecidya.test', 'miniweb-owner-b-${suffix}@vecidya.test')); DELETE FROM license_price WHERE id IN ('${priceAId}', '${fixturePriceId}');`);
  if (deletes.length) await d1(`${deletes.join(";\n")};`);
} catch (error) {
  harnessFailure ??= new HarnessError(`HARNESS: no se pudieron limpiar las fixtures de prueba: ${error instanceof Error ? error.message : String(error)}`);
}

const failed = checks.filter((result) => !result.ok);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.map((result) => result.label), fixturesCleaned: createdOrganizationIds.length > 0 || createdUserIds.length > 0, harness: harnessFailure?.message ?? null }, null, 2));
if (harnessFailure || failed.length) {
  process.exitCode = 1;
} else {
  console.log(`MINIWEB_02A_E2E_PASS checks=${checks.length}`);
}
