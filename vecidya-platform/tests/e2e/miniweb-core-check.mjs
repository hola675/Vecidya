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
  harness(result.status === 0, `D1 local falló (status=${result.status ?? "sin salida"}; error=${result.error?.message ?? "ninguno"}): ${result.stderr || result.stdout || "sin detalle del subproceso"}`);
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
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies.values()].map(({ name, value }) => `${name}=${value}`).join("; "));
    const response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
    for (const setCookie of response.headers.getSetCookie()) {
      const [pair, ...attributes] = setCookie.split(";").map((attribute) => attribute.trim());
      const [name, ...value] = pair.split("=");
      const cookie = { name, value: value.join("=") };
      for (const attribute of attributes) {
        const [attributeName, attributeValue] = attribute.split("=", 2);
        if (attributeName.toLowerCase() === "path") cookie.path = attributeValue;
        if (attributeName.toLowerCase() === "secure") cookie.secure = true;
        if (attributeName.toLowerCase() === "httponly") cookie.httpOnly = true;
        if (attributeName.toLowerCase() === "samesite" && ["strict", "lax", "none"].includes(attributeValue?.toLowerCase())) {
          cookie.sameSite = attributeValue[0].toUpperCase() + attributeValue.slice(1).toLowerCase();
        }
      }
      this.#cookies.set(name, cookie);
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
    return [...this.#cookies.values()];
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
const mediaPathFor = (organizationId, assetId) => `/api/organizations/${organizationId}/business-media/${assetId}`;
const publicMediaPathFor = (slug, assetId) => `/media/business/${slug}/${assetId}`;
const pngFixture = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jSh0AAAAASUVORK5CYII=", "base64"));
async function uploadPng(identity, organizationId, purpose, draftRevision, altText = `Imagen de prueba ${purpose}`) {
  const form = new FormData();
  form.set("file", new File([pngFixture], `${purpose}.png`, { type: "image/png" }));
  form.set("altText", altText);
  form.set("purpose", purpose);
  form.set("draftRevision", String(draftRevision));
  return identity.client.fetch(`/api/organizations/${organizationId}/business-media`, { method: "POST", body: form });
}
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
  await d1(`INSERT INTO platform_member (id, user_id, role, status, created_at, updated_at) VALUES ('${crypto.randomUUID()}', '${adminA.userId}', 'platform_admin', 'active', ${Date.now()}, ${Date.now()});`);

  const pathA = pathFor(organizationA);
  const pathB = pathFor(organizationB);
  const initialResponse = await ownerA.client.json(pathA, null, "GET");
  harness(initialResponse.status === 200, `leer configuración A devolvió ${initialResponse.status}`);
  const initial = await initialResponse.json();
  check(initial.hasPersistedConfiguration === false, "la configuración virtual legacy no crea filas al leer");
  check(initial.draftConfiguration.templateKey === "vecidya-default", "la configuración virtual usa la plantilla actual");
  check((await d1(`SELECT id FROM miniweb_site WHERE organization_id = '${organizationA}';`)).length === 0, "GET no persiste filas vacías");

  await d1(`INSERT INTO business_profile (id, organization_id, display_name, slug, short_description, description, category, city, country, phone, public_email, service_mode, service_area, status, created_at, updated_at) VALUES
    ('${profileId()}', '${organizationA}', 'MiniWeb público A ${suffix}', '${profileSlug("public-a")}', 'Resumen A', 'Descripción A', 'Servicios', 'Bogotá', 'Colombia', '+573001112233', 'a-${suffix}@example.invalid', 'hybrid', 'Bogotá y alrededores', 'published', ${Date.now()}, ${Date.now()}),
    ('${profileId()}', '${organizationB}', 'MiniWeb legacy B ${suffix}', '${profileSlug("legacy-b")}', 'Resumen B', 'Descripción B', 'Servicios', 'Cali', 'Colombia', '+573004445566', 'b-${suffix}@example.invalid', NULL, NULL, 'published', ${Date.now()}, ${Date.now()});`);

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
  const legacyBState = (await d1(`SELECT published_version, snapshot_schema_version, snapshot_json FROM business_profile_publication WHERE organization_id = '${organizationB}';`))[0];
  const legacyBSnapshot = JSON.parse(legacyBState.snapshot_json);
  check(Number(legacyBState.published_version) === 1 && legacyBSnapshot.profile.displayName === `MiniWeb legacy B ${suffix}`, "las dos inicializaciones conservan una única versión pública legacy coherente");
  const legacyBAnonymous = await fetch(new URL(`/vecindario/${profileSlug("legacy-b")}`, baseUrl));
  const legacyBAnonymousHtml = await legacyBAnonymous.text();
  check(legacyBAnonymous.status === 200 && legacyBAnonymousHtml.includes(`MiniWeb legacy B ${suffix}`) && !legacyBAnonymousHtml.includes("Borrador B"), "los cambios draft posteriores permanecen ocultos a visitantes anónimos");
  await d1(`UPDATE business_profile_publication SET snapshot_schema_version = NULL, snapshot_json = NULL WHERE organization_id = '${organizationB}';`);
  const incompleteLegacyAnonymous = await fetch(new URL(`/vecindario/${profileSlug("legacy-b")}`, baseUrl));
  check(incompleteLegacyAnonymous.status === 404, "un estado de publicación existente sin snapshot válido falla cerrado para visitantes anónimos");
  const escapedLegacySnapshot = legacyBState.snapshot_json.replaceAll("'", "''");
  await d1(`UPDATE business_profile_publication SET snapshot_schema_version = ${Number(legacyBState.snapshot_schema_version)}, snapshot_json = '${escapedLegacySnapshot}' WHERE organization_id = '${organizationB}';`);

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
  const qaOfferings = [
    { kind: "service", title: `QA servicio 1 ${suffix}`, description: "Contenido sintético de prueba.", priceLabel: null, sortOrder: 0, isActive: true },
    { kind: "service", title: `QA servicio 2 ${suffix}`, description: "Contenido sintético de prueba.", priceLabel: null, sortOrder: 1, isActive: true },
    { kind: "product", title: `QA producto 3 ${suffix}`, description: "Contenido sintético de prueba.", priceLabel: null, sortOrder: 2, isActive: true },
    { kind: "product", title: `QA producto 4 ${suffix}`, description: "Contenido sintético de prueba.", priceLabel: null, sortOrder: 3, isActive: true },
  ];
  const qaFaqs = [0, 1, 2, 3].map((index) => ({ question: `Pregunta QA ${index + 1} ${suffix}`, answer: "Respuesta sintética de prueba.", sortOrder: index, isActive: true }));
  let mediaRevision = (await (await ownerA.client.json(pathA, null, "GET")).json()).draftRevision;
  const galleryUploadResponse = await uploadPng(ownerA, organizationA, "gallery", mediaRevision, "Foto del servicio");
  check(galleryUploadResponse.status === 201, `el owner puede guardar una foto de galería (${galleryUploadResponse.status})`);
  const galleryUpload = await galleryUploadResponse.json();
  mediaRevision = galleryUpload.draftRevision;
  qaOfferings[0].imageAssetId = galleryUpload.asset.id;
  const logoUploadResponse = await uploadPng(ownerA, organizationA, "logo", mediaRevision, "Marca del negocio");
  check(logoUploadResponse.status === 201, `el owner puede cargar el logo como medio de marca (${logoUploadResponse.status})`);
  mediaRevision = (await logoUploadResponse.json()).draftRevision;
  const iconUploadResponse = await uploadPng(ownerA, organizationA, "icon", mediaRevision, "Icono compacto");
  check(iconUploadResponse.status === 201, `el owner puede cargar el icono separado del logo (${iconUploadResponse.status})`);
  mediaRevision = (await iconUploadResponse.json()).draftRevision;
  const invalidOfferImage = await ownerA.client.json(pathA, { intent: "save", configuration: draft, offerings: [{ ...qaOfferings[0], imageAssetId: crypto.randomUUID() }], faqs: qaFaqs, draftRevision: mediaRevision });
  check(invalidOfferImage.status === 400, "el editor rechaza referencias a imágenes que no pertenecen a los medios activos del negocio");
  const saveWithContent = await ownerA.client.json(pathA, { intent: "save", configuration: draft, offerings: qaOfferings, faqs: qaFaqs, draftRevision: mediaRevision });
  check(saveWithContent.status === 200, `owner puede guardar configuración, cuatro ofertas y cuatro FAQ en una escritura (${saveWithContent.status})`);
  const savedContent = await (await ownerA.client.json(pathA, null, "GET")).json();
  check(savedContent.offerings.length === 4 && savedContent.faqs.length === 4 && savedContent.draftConfiguration.modules.length === 9, "la lectura consistente conserva todos los módulos y el contenido de la ficha enriquecida");
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
  const draftOfferings = [
    { kind: "service", title: `Consulta activa ${suffix}`, description: "Atención inicial", priceLabel: "Desde $20", imageAssetId: galleryUpload.asset.id, sortOrder: 0, isActive: true },
    { kind: "product", title: `Producto activo ${suffix}`, description: "Producto de muestra", priceLabel: null, sortOrder: 1, isActive: true },
    { kind: "service", title: `Servicio pausado ${suffix}`, description: "No debe aparecer", priceLabel: null, sortOrder: 2, isActive: false },
  ];
  const draftFaqs = [
    { question: `Pregunta activa ${suffix}`, answer: "Respuesta publicada", sortOrder: 0, isActive: true },
    { question: `Pregunta pausada ${suffix}`, answer: "No debe aparecer", sortOrder: 1, isActive: false },
  ];
  const contentConfiguration = {
    ...miniwebAfterDraft.draftConfiguration,
    modules: miniwebAfterDraft.draftConfiguration.modules.map((module) => ({
      ...module,
      enabled: ["hero", "services", "products", "faq"].includes(module.type),
    })),
  };
  const contentSave = await ownerA.client.json(pathA, { intent: "save", configuration: contentConfiguration, offerings: draftOfferings, faqs: draftFaqs, draftRevision: miniwebAfterDraft.draftRevision });
  check(contentSave.status === 200, `ofertas, FAQ y configuración se guardan en una sola revisión CAS (${contentSave.status})`);
  const savedOfferingsContent = await (await ownerA.client.json(pathA, null, "GET")).json();
  check(savedOfferingsContent.offerings.map((item) => item.title).join(",") === draftOfferings.map((item) => item.title).join(",") && savedOfferingsContent.faqs.map((item) => item.question).join(",") === draftFaqs.map((item) => item.question).join(","), "la lectura JSON devuelve ofertas y FAQ del mismo borrador");
  check((await ownerA.client.json(pathB, { intent: "save", configuration: contentConfiguration, offerings: draftOfferings, faqs: draftFaqs })).status === 403, "la escritura de ofertas y FAQ respeta el aislamiento entre organizaciones");
  const invalidOfferings = draftOfferings.map((item, index) => ({ ...item, sortOrder: index === 1 ? 0 : item.sortOrder }));
  let invalidContentResponse = await ownerA.client.json(pathA, { intent: "save", configuration: contentConfiguration, offerings: invalidOfferings, faqs: draftFaqs });
  let invalidContentBody = await invalidContentResponse.clone().text();
  if (invalidContentResponse.status >= 500 && invalidContentBody.includes("Network connection lost")) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    invalidContentResponse = await ownerA.client.json(pathA, { intent: "save", configuration: contentConfiguration, offerings: invalidOfferings, faqs: draftFaqs });
    invalidContentBody = await invalidContentResponse.clone().text();
  }
  check(invalidContentResponse.status === 400, `el servidor rechaza contenido con orden duplicado (${invalidContentResponse.status}: ${invalidContentBody.slice(0, 120)})`);
  const staleContentSave = await ownerA.client.json(pathA, { intent: "save", configuration: contentConfiguration, offerings: [], faqs: [], draftRevision: savedOfferingsContent.draftRevision - 1 });
  check(staleContentSave.status === 409, "un guardado de contenido con revisión obsoleta devuelve 409");
  const contentAfterConflict = await (await ownerA.client.json(pathA, null, "GET")).json();
  check(contentAfterConflict.offerings.length === draftOfferings.length && contentAfterConflict.faqs.length === draftFaqs.length, "el 409 no modifica ofertas ni FAQ del ganador");
  const publicBeforePublishResponse = await fetch(new URL(`/vecindario/${profileSlug("public-a")}`, baseUrl));
  const publicBeforePublish = await publicBeforePublishResponse.text();
  console.log(JSON.stringify({ miniwebPublicBeforePublish: { status: publicBeforePublishResponse.status, url: publicBeforePublishResponse.url, titlePresent: publicBeforePublish.includes(`MiniWeb público A ${suffix}`), descriptionPresent: publicBeforePublish.includes("Descripción A"), emailPresent: publicBeforePublish.includes(`a-${suffix}@example.invalid`), bodyExcerpt: publicBeforePublish.slice(0, 350) } }));
  check(publicBeforePublish.includes(`MiniWeb público A ${suffix}`) && !publicBeforePublish.includes(draftName), "editar nombre, perfil y MiniWeb conserva la versión pública previa hasta publicar");
  check((await fetch(new URL(publicMediaPathFor(profileSlug("public-a"), galleryUpload.asset.id), baseUrl))).status === 404, "una imagen de galería del borrador no se entrega por HTTP anónimo antes de publicar");
  check(!publicBeforePublish.includes(`Consulta activa ${suffix}`) && !publicBeforePublish.includes(`Pregunta activa ${suffix}`), "ofertas y FAQ del borrador no son visibles por HTTP anónimo antes de publicar");
  const directoryBeforePublish = await (await fetch(new URL(`/vecindario?q=${encodeURIComponent(`Consulta activa ${suffix}`)}`, baseUrl))).text();
  check(directoryBeforePublish.includes("Sin coincidencias") && !directoryBeforePublish.includes(`href=\"/vecindario/${profileSlug("public-a")}\"`), "la búsqueda del Vecindario no indexa ofertas ni cambios del borrador antes de publicar");
  await adminA.client.json(pathA, null, "GET");
  check((await adminA.client.json(pathA, { intent: "publish" })).status === 200, "admin puede publicar explícitamente la configuración enriquecida");

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
  check(fullSnapshot.schemaVersion === 4 && fullSnapshot.branding.logoAssetId && fullSnapshot.branding.iconAssetId && fullSnapshot.offerings[0].imageAssetId === galleryUpload.asset.id, "la publicación reúne logo, icono e imagen asociada a la oferta en snapshot v4");
  check((await fetch(new URL(publicMediaPathFor(profileSlug("public-a"), galleryUpload.asset.id), baseUrl))).status === 200, "la imagen asociada a la oferta queda accesible anónimamente solo después de publicar");
  check((await fetch(new URL(publicMediaPathFor(profileSlug("public-a"), fullSnapshot.branding.logoAssetId), baseUrl))).status === 200 && (await fetch(new URL(publicMediaPathFor(profileSlug("public-a"), fullSnapshot.branding.iconAssetId), baseUrl))).status === 200, "logo e icono se publican juntos desde el snapshot vigente");
  console.log(JSON.stringify({ miniwebPublicAfterPublish: { status: publicAResponse.status, url: publicAResponse.url, titlePresent: publicA.includes(`MiniWeb público A ${suffix}`), bodyExcerpt: publicA.slice(0, 350) } }));
  const publicB = await (await ownerB.client.fetch(`/vecindario/${profileSlug("legacy-b")}`)).text();
  check(publicA.includes(draftName), "la publicación cambia el perfil y la composición en una sola versión pública");
  check(fullSnapshot.profile.displayName === draftName && fullSnapshot.hours.some((entry) => entry.dayOfWeek === 1 && entry.opensAt === "09:00") && fullSnapshot.configuration.modules.some((module) => module.type === "hero"), "una versión publicada contiene perfil, horarios y configuración juntos");
  check(fullSnapshot.offerings.some((item) => item.title === `Consulta activa ${suffix}`) && fullSnapshot.faqs.some((item) => item.question === `Pregunta activa ${suffix}`), "el snapshot público incorpora ofertas y FAQ al publicar");
  check(publicA.includes(`Consulta activa ${suffix}`), "la página pública presenta las ofertas de servicio activas");
  check(publicA.includes(`Producto activo ${suffix}`), "la página pública presenta las ofertas de producto activas");
  check(publicA.includes(`Pregunta activa ${suffix}`), "la página pública presenta las preguntas frecuentes activas");
  check(!publicA.includes(`Servicio pausado ${suffix}`) && !publicA.includes(`Pregunta pausada ${suffix}`), "la página pública omite ofertas y FAQ inactivas");
  check(!publicA.includes("Descripción A") && !publicA.includes(`a-${suffix}@example.invalid`) && !publicA.includes("Contacto directo"), "los módulos desactivados no aparecen en el sitio público");
  const directoryByOffering = await (await fetch(new URL(`/vecindario?q=${encodeURIComponent(`Consulta activa ${suffix}`)}`, baseUrl))).text();
  const directoryByProduct = await (await fetch(new URL("/vecindario?offering=product", baseUrl))).text();
  const directoryByModule = await (await fetch(new URL("/vecindario?module=products", baseUrl))).text();
  const directoryByModeAndArea = await (await fetch(new URL("/vecindario?serviceMode=hybrid&serviceArea=Bogot%C3%A1+y+alrededores", baseUrl))).text();
  const publicCardHref = `href=\"/vecindario/${profileSlug("public-a")}\"`;
  check(directoryByOffering.includes(publicCardHref) && directoryByOffering.includes(draftName), "el Vecindario permite encontrar el servicio publicado por su nombre");
  check(directoryByProduct.includes(publicCardHref) && directoryByProduct.includes(`Producto activo ${suffix}`) && !directoryByProduct.includes(`Servicio pausado ${suffix}`), "el filtro de productos usa solo ofertas activas del snapshot publicado");
  check(directoryByModule.includes(publicCardHref) && !directoryByModule.includes("MiniWeb legacy B"), "el filtro de sección solo incluye módulos renderizables en snapshots públicos");
  check(directoryByModeAndArea.includes(publicCardHref) && !directoryByModeAndArea.includes("MiniWeb legacy B"), "el Vecindario filtra por modalidad y área de servicio publicadas");

  const mediaInitialState = await (await ownerA.client.json(pathA, null, "GET")).json();
  const mediaCountBeforeStaleUpload = Number((await d1(`SELECT COUNT(*) AS count FROM business_media_asset WHERE organization_id = '${organizationA}';`))[0]?.count ?? 0);
  const staleMediaUpload = await uploadPng(ownerA, organizationA, "gallery", mediaInitialState.draftRevision - 1, `Carga obsoleta ${suffix}`);
  check(staleMediaUpload.status === 409, "una carga de medio con revisión obsoleta recibe 409");
  check(Number((await d1(`SELECT COUNT(*) AS count FROM business_media_asset WHERE organization_id = '${organizationA}';`))[0]?.count ?? 0) === mediaCountBeforeStaleUpload, "el 409 de carga obsoleta no deja metadatos de medio");

  const concurrentMediaRevision = (await (await ownerA.client.json(pathA, null, "GET")).json()).draftRevision;
  const competingUploads = await Promise.all([
    uploadPng(ownerA, organizationA, "gallery", concurrentMediaRevision, `Galería ganadora A ${suffix}`),
    uploadPng(ownerA, organizationA, "gallery", concurrentMediaRevision, `Galería ganadora B ${suffix}`),
  ]);
  check(competingUploads.map(({ status }) => status).sort((a, b) => a - b).join(",") === "201,409", "dos cargas simultáneas con la misma revisión dejan un único ganador");
  const winningGalleryResponse = competingUploads.find(({ status }) => status === 201);
  const winningGallery = await winningGalleryResponse.json();
  const coverRevision = (await (await ownerA.client.json(pathA, null, "GET")).json()).draftRevision;
  const coverUpload = await uploadPng(ownerA, organizationA, "cover", coverRevision, `Portada inicial ${suffix}`);
  check(coverUpload.status === 201, "owner puede subir una portada en el borrador");
  const initialCover = await coverUpload.json();
  const initialGallery = winningGallery.asset;
  check((await ownerA.client.fetch(mediaPathFor(organizationB, initialCover.asset.id))).status === 403, "la previsualización privada no permite leer un medio de otra organización");
  check((await memberA.client.fetch(mediaPathFor(organizationA, initialCover.asset.id))).status === 200, "member con permiso de lectura puede previsualizar medios privados del tenant");
  const memberRemovalAttempt = await memberA.client.fetch(mediaPathFor(organizationA, initialCover.asset.id), {
    method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ draftRevision: coverRevision + 1 }),
  });
  check(memberRemovalAttempt.status === 403, "member read-only no puede retirar medios del borrador");
  const beforeMediaPublish = await fetch(new URL(publicMediaPathFor(profileSlug("public-a"), initialCover.asset.id), baseUrl));
  check(beforeMediaPublish.status === 404, "un medio del borrador no es visible por HTTP anónimo antes de publicar");

  await ownerA.client.json(pathA, null, "GET");
  const publishInitialMedia = await ownerA.client.json(pathA, { intent: "publish" });
  check(publishInitialMedia.status === 200, "owner puede publicar el snapshot con medios");
  const publishedCoverResponse = await fetch(new URL(publicMediaPathFor(profileSlug("public-a"), initialCover.asset.id), baseUrl));
  const publishedGalleryResponse = await fetch(new URL(publicMediaPathFor(profileSlug("public-a"), initialGallery.id), baseUrl));
  check(publishedCoverResponse.status === 200 && publishedCoverResponse.headers.get("content-type") === "image/png", "la portada se entrega anónimamente tras publicar");
  check(publishedGalleryResponse.status === 200, "la galería se entrega anónimamente solo cuando está en el snapshot publicado");

  const beforeStaleRemoval = (await (await ownerA.client.json(pathA, null, "GET")).json()).draftRevision;
  const staleRemoval = await ownerA.client.fetch(mediaPathFor(organizationA, initialCover.asset.id), {
    method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ draftRevision: beforeStaleRemoval - 1 }),
  });
  check(staleRemoval.status === 409, "retirar un medio con revisión obsoleta devuelve 409");
  check(Number((await d1(`SELECT is_active FROM business_media_asset WHERE id = '${initialCover.asset.id}';`))[0]?.is_active) === 1, "el 409 de retirada no cambia el medio activo");

  const removalRevision = (await (await ownerA.client.json(pathA, null, "GET")).json()).draftRevision;
  const removeCover = await ownerA.client.fetch(mediaPathFor(organizationA, initialCover.asset.id), {
    method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ draftRevision: removalRevision }),
  });
  check(removeCover.status === 200, "owner puede retirar la portada del próximo borrador publicado");
  check((await fetch(new URL(publicMediaPathFor(profileSlug("public-a"), initialCover.asset.id), baseUrl))).status === 200, "retirar portada no rompe la versión pública vigente antes de republicar");
  const replacementRevision = (await (await ownerA.client.json(pathA, null, "GET")).json()).draftRevision;
  const replacementUpload = await uploadPng(ownerA, organizationA, "cover", replacementRevision, `Portada reemplazada ${suffix}`);
  check(replacementUpload.status === 201, "se puede subir una portada nueva después de retirar la anterior");
  const replacementCover = await replacementUpload.json();
  check((await fetch(new URL(publicMediaPathFor(profileSlug("public-a"), replacementCover.asset.id), baseUrl))).status === 404, "la portada de reemplazo permanece privada hasta republicar");
  await ownerA.client.json(pathA, null, "GET");
  const republishMedia = await ownerA.client.json(pathA, { intent: "publish" });
  check(republishMedia.status === 200, "la republicación incorpora el borrador de medios actualizado");
  check((await fetch(new URL(publicMediaPathFor(profileSlug("public-a"), initialCover.asset.id), baseUrl))).status === 404, "la portada retirada deja de servirse tras republicar");
  check((await fetch(new URL(publicMediaPathFor(profileSlug("public-a"), replacementCover.asset.id), baseUrl))).status === 200, "la portada de reemplazo se sirve tras republicar");

  await d1(`UPDATE business_profile_publication SET snapshot_json = 'not-json' WHERE organization_id = '${organizationA}';`);
  const corruptedSnapshotResponse = await ownerA.client.fetch(`/vecindario/${profileSlug("public-a")}`);
  check(corruptedSnapshotResponse.status === 404, "un snapshot publicado inválido falla cerrado sin mostrar datos inconsistentes");
  check((await ownerA.client.json(pathA, { intent: "publish" })).status === 200, "se puede restaurar explícitamente un snapshot válido desde el draft");
  check(publicB.includes(`MiniWeb legacy B ${suffix}`) && publicB.includes("Descripción B"), "un perfil publicado legacy sin miniweb_site se renderiza con defaults virtuales");
  check(new RegExp(`href=["']https://vecidya\\.com/vecindario/${profileSlug("legacy-b")}(["']|/)`).test(publicB), "el canonical actual de Vecindario se conserva");
  check(publicB.includes('name="description" content="Resumen B"') && publicB.includes('property="og:type" content="website"') && publicB.includes('name="robots" content="index, follow"'), "los metadatos SEO públicos actuales se conservan");

  const orgBConfigBeforeSwitch = await (await ownerB.client.json(pathB, null, "GET")).json();
  const orgBRevisionAdvance = await ownerB.client.json(pathB, { intent: "save", configuration: orgBConfigBeforeSwitch.draftConfiguration, draftRevision: orgBConfigBeforeSwitch.draftRevision });
  check(orgBRevisionAdvance.status === 200, "el fixture de organización B avanza su revisión para probar el cambio de organización en el editor");
  await setActive(ownerB, organizationD);
  const organizationDConfig = await (await ownerB.client.json(pathFor(organizationD), null, "GET")).json();
  await setActive(ownerB, organizationB);

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
  await d1(`UPDATE business_profile SET status = 'draft' WHERE organization_id = '${organizationA}';`);
  await page.goto(new URL("/app/business-profile", baseUrl).toString(), { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Publicar perfil" }).click();
  await page.getByText("Perfil publicado.").waitFor();
  const profileAfterUiPublish = await (await ownerA.client.json(profilePathA, null, "GET")).json();
  check(Number(await page.locator('form.business-profile-form input[name="draftRevision"]').inputValue()) === profileAfterUiPublish.draftRevision, "publicar el perfil devuelve la revisión posterior a guardar y publicar");
  await page.getByRole("button", { name: "Guardar horarios" }).click();
  await page.getByText("Horarios guardados.").waitFor();
  check((await ownerA.client.json(profilePathA, null, "GET")).status === 200, "guardar horarios inmediatamente después de publicar no recibe un 409 falso");
  const profileEditorRevision = Number(await page.locator('form.business-profile-form input[name="draftRevision"]').inputValue());
  const staleName = `Nombre obsoleto ${suffix}`;
  await page.getByLabel("Nombre visible").fill(staleName);
  const winningProfileState = await (await adminA.client.json(profilePathA, null, "GET")).json();
  const winnerPhone = "+573009990001";
  const winningProfileForm = makeProfileForm(winningProfileState.profile, winningProfileState.draftRevision, winningProfileState.profile.displayName);
  winningProfileForm.set("phone", winnerPhone);
  const winnerSave = await adminA.client.fetch(profilePathA, { method: "POST", body: winningProfileForm });
  check(winnerSave.status === 200, `el segundo editor guarda solo el teléfono mientras el primero conserva su formulario (${winnerSave.status})`);
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await page.locator(".alert").filter({ hasText: "borrador cambió" }).waitFor();
  check(await page.getByLabel("Nombre visible").inputValue() === staleName, "el conflicto conserva visiblemente los campos locales del editor obsoleto");
  check(Number(await page.locator('form.business-profile-form input[name="draftRevision"]').inputValue()) === profileEditorRevision, "la revisión original permanece unida a los valores locales tras revalidar el loader");
  check(await page.getByRole("button", { name: "Guardar", exact: true }).isDisabled(), "un 409 bloquea un segundo guardado de perfil con datos obsoletos");
  check(await page.getByRole("button", { name: "Guardar horarios" }).isDisabled(), "un 409 de perfil también bloquea horarios que comparten esa revisión");
  check(await page.getByRole("button", { name: "Recargar para continuar" }).count() === 1, "el conflicto ofrece recargar y descartar explícitamente el formulario obsoleto");
  const afterBlockedProfileSave = await (await adminA.client.json(profilePathA, null, "GET")).json();
  check(afterBlockedProfileSave.profile.phone === winnerPhone && afterBlockedProfileSave.draftRevision === profileEditorRevision + 1, "el segundo guardado queda bloqueado y conserva el teléfono ganador");

  await page.getByRole("button", { name: "Recargar para continuar" }).click();
  await page.waitForLoadState("networkidle");
  const hoursEditorRevision = Number(await page.locator('form.business-hours-form input[name="draftRevision"]').inputValue());
  await page.getByLabel("Abre").first().fill("08:30");
  const currentBeforeHoursConflict = await (await adminA.client.json(profilePathA, null, "GET")).json();
  const hoursConflictWinnerProfile = { ...currentBeforeHoursConflict.profile, description: `Descripción del segundo editor ${suffix}` };
  const hoursConflictForm = makeProfileForm(hoursConflictWinnerProfile, currentBeforeHoursConflict.draftRevision, currentBeforeHoursConflict.profile.displayName);
  const profileWinsHours = await adminA.client.fetch(profilePathA, { method: "POST", body: hoursConflictForm });
  check(profileWinsHours.status === 200, `el segundo editor avanza la revisión antes del guardado de horarios (${profileWinsHours.status})`);
  await page.getByRole("button", { name: "Guardar horarios" }).click();
  await page.locator(".alert").filter({ hasText: "borrador cambió" }).waitFor();
  check(Number(await page.locator('form.business-hours-form input[name="draftRevision"]').inputValue()) === hoursEditorRevision, "la revisión original de horarios permanece unida a sus valores tras revalidar el loader");
  check(await page.getByRole("button", { name: "Guardar horarios" }).isDisabled(), "un 409 bloquea un segundo guardado de horarios con la revisión obsoleta");
  const latestMiniwebAfterHoursConflict = await (await adminA.client.json(pathA, null, "GET")).json();
  check(latestMiniwebAfterHoursConflict.draftRevision === hoursEditorRevision + 1 && latestMiniwebAfterHoursConflict.profile.description === hoursConflictWinnerProfile.description, "el intento obsoleto de horarios no sobrescribe el cambio del segundo editor");
  await page.getByRole("button", { name: "Recargar para continuar" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Abre").first().fill("08:30");
  await page.getByLabel("Cierra").first().fill("16:30");
  await page.getByRole("button", { name: "Guardar horarios" }).click();
  await page.getByText("Horarios guardados.").waitFor();

  const platformContext = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const cookieDomain = new URL(baseUrl).hostname;
  await platformContext.addCookies(adminA.client.cookies().map(({ name, value, path, secure, httpOnly, sameSite }) => ({
    name,
    value,
    domain: cookieDomain,
    path: path ?? "/",
    ...(secure ? { secure: true } : {}),
    ...(httpOnly ? { httpOnly: true } : {}),
    ...(sameSite ? { sameSite } : {}),
  })));
  const platformPage = await platformContext.newPage();
  await platformPage.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle" });
  await platformPage.getByLabel("Correo electrónico").fill(adminA.email);
  await platformPage.getByLabel("Contraseña").fill(adminA.password);
  await platformPage.getByRole("button", { name: "Entrar a mi espacio" }).click();
  await platformPage.waitForURL((url) => url.pathname === "/app", { timeout: 15000 });
  const internalMiniwebResponse = await platformPage.goto(new URL(`/app/internal/organizations/${organizationA}/miniweb`, baseUrl).toString(), { waitUntil: "networkidle" });
  check(internalMiniwebResponse?.status() === 200, "la administración interna abre MiniWeb con sesión platform_admin activa");
  check(await platformPage.getByRole("button", { name: "Publicar MiniWeb" }).isEnabled(), "la pantalla interna permite publicar cambios de perfil/horarios aunque la configuración no cambie");
  check(await platformPage.getByText("Hay cambios de borrador pendientes de publicación.").count() === 1, "la pantalla interna compara el snapshot completo para indicar cambios pendientes");

  const editorResponse = await page.goto(new URL("/app/miniweb", baseUrl).toString(), { waitUntil: "networkidle" });
  check(editorResponse?.status() === 200, "el editor privado Mi MiniWeb responde para el owner");
  const editorSteps = page.locator(".miniweb-editor__steps button");
  const editorStepLabels = await editorSteps.allTextContents();
  check(editorStepLabels.length === 5 && editorStepLabels.every((label, index) =>
    label.includes(["Diseño", "Secciones", "Contenido", "Vista previa", "Publicar"][index])),
  "el editor organiza Diseño, Secciones, Contenido, Vista previa y Publicar como pasos accesibles");
  await page.getByRole("button", { name: "5 Publicar" }).click();
  const publishCard = page.locator("#miniweb-publish");
  check(await publishCard.isVisible() && await page.locator("#miniweb-step-title").innerText() === "Publicar",
    "el paso Publicar muestra solo el apartado correcto");
  check(await page.getByRole("button", { name: "5 Publicar" }).getAttribute("aria-pressed") === "true",
    "la navegación comunica el paso activo");
  await page.waitForFunction(() => {
    const guide = document.querySelector("#miniweb-step-guide");
    const header = document.querySelector(".app-header");
    return Boolean(guide && header && guide.getBoundingClientRect().top >= header.getBoundingClientRect().bottom);
  });
  check(await page.evaluate(() => {
    const guide = document.querySelector("#miniweb-step-guide");
    const header = document.querySelector(".app-header");
    return Boolean(guide && header && guide.getBoundingClientRect().top >= header.getBoundingClientRect().bottom);
  }), "la guía del paso activo queda visible bajo la cabecera fija");
  check(await page.getByRole("button", { name: "Retirar del borrador" }).count() === 5, "el editor permite retirar galería, logo, icono y portada del borrador");
  check(await page.locator(".miniweb-editor__publication-state").getByText("Hay cambios guardados que todavía no se han publicado.").count() === 1, "el estado de MiniWeb identifica cambios de perfil/horarios aunque el diseño siga igual");
  const ownerBContext = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const ownerBPage = await ownerBContext.newPage();
  await ownerBPage.goto(new URL("/login", baseUrl).toString(), { waitUntil: "networkidle" });
  await ownerBPage.getByLabel("Correo electrónico").fill(ownerB.email);
  await ownerBPage.getByLabel("Contraseña").fill(ownerB.password);
  await ownerBPage.getByRole("button", { name: "Entrar a mi espacio" }).click();
  await ownerBPage.waitForURL((url) => url.pathname === "/app", { timeout: 15000 });
  await ownerBPage.goto(new URL("/app/miniweb", baseUrl).toString(), { waitUntil: "networkidle" });
  await ownerBPage.locator("#organization-switcher").selectOption(organizationD);
  await ownerBPage.getByText(`Trabajando en MiniWeb org-d ${suffix}.`).waitFor();
  await ownerBPage.getByRole("button", { name: "2 Secciones" }).click();
  check(organizationDConfig.draftRevision !== (await orgBRevisionAdvance.json()).draftRevision, "las organizaciones B y D usan revisiones distintas para hacer determinista el cambio de contexto");
  const aboutToggle = ownerBPage.locator('.miniweb-module-list__item[data-module-type="about"] input[type="checkbox"]');
  await aboutToggle.setChecked(!(await aboutToggle.isChecked()));
  const switchedOrgSaveRequest = ownerBPage.waitForRequest((request) => request.url().includes(`/api/organizations/${organizationD}/miniweb-config`) && request.method() === "POST");
  await ownerBPage.getByRole("button", { name: "Guardar borrador" }).click();
  const switchedOrgRequest = await switchedOrgSaveRequest;
  const switchedOrgBody = switchedOrgRequest.postDataJSON();
  check(switchedOrgBody.draftRevision === organizationDConfig.draftRevision, "al cambiar de organización, MiniWeb asocia su configuración con la revisión de D");
  await ownerBPage.getByRole("status").filter({ hasText: "Borrador guardado." }).waitFor();
  await ownerBContext.close();
  const designBeforeDataOnlyPublish = await (await ownerA.client.json(pathA, null, "GET")).json();
  await page.getByRole("button", { name: "Publicar configuración" }).click();
  await page.getByRole("status").filter({ hasText: "La página completa quedó publicada." }).waitFor();
  const dataOnlyPublishedState = await (await ownerA.client.json(pathA, null, "GET")).json();
  const dataOnlySnapshotRow = (await d1(`SELECT snapshot_json FROM business_profile_publication WHERE organization_id = '${organizationA}';`))[0];
  const dataOnlySnapshot = JSON.parse(dataOnlySnapshotRow.snapshot_json);
  check(JSON.stringify(dataOnlyPublishedState.draftConfiguration) === JSON.stringify(designBeforeDataOnlyPublish.draftConfiguration), "publicar solo perfil/horarios conserva la configuración MiniWeb sin editar el diseño");
  check(dataOnlySnapshot.profile.phone === winnerPhone && dataOnlySnapshot.profile.description === hoursConflictWinnerProfile.description && dataOnlySnapshot.hours.some((entry) => entry.dayOfWeek === 1 && entry.opensAt === "08:30" && entry.closesAt === "16:30"), "la publicación de cambios solo de teléfono y horarios guarda el snapshot completo actualizado");
  await platformPage.goto(new URL(`/app/internal/organizations/${organizationA}/miniweb`, baseUrl).toString(), { waitUntil: "networkidle" });
  check(await platformPage.getByRole("button", { name: "Publicar MiniWeb" }).isDisabled(), "la pantalla interna deshabilita publicación cuando el snapshot completo ya coincide");
  check(await platformPage.getByText("El perfil, los horarios y la configuración coinciden con la versión publicada.").count() === 1, "la pantalla interna confirma el estado completo publicado");
  await platformContext.close();
  check(await page.getByRole("heading", { name: "Mi MiniWeb", level: 1 }).count() === 1, "el editor presenta el punto de entrada Mi MiniWeb");
  await page.getByRole("button", { name: "2 Secciones" }).click();
  check(await page.getByRole("checkbox", { name: "Desactivar Presentación" }).isDisabled(), "la sección hero requerida no se puede apagar");
  check(await page.locator('.miniweb-module-list__item[data-module-type="gallery"]').count() === 1 && await page.locator('.miniweb-module-list__item[data-module-type="products"]').count() === 1, "el editor ofrece Galería y Productos ya implementados");
  const renderedModuleOrder = await page.locator(".miniweb-module-list__item").evaluateAll((elements) => elements.map((element) => element.getAttribute("data-module-type")));
  const availableModuleOrder = published.draftConfiguration.modules.filter((module) => ["hero", "about", "contact", "hours", "services", "gallery", "location", "products", "faq"].includes(module.type)).map((module) => module.type);
  check(renderedModuleOrder.join(",") === availableModuleOrder.join(","), "la lista de secciones visualiza el orden de los módulos disponibles");
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
  await page.goto(new URL("/vecindario", baseUrl).toString(), { waitUntil: "networkidle" });
  const directoryViewportResults = [];
  for (const width of [1366, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    directoryViewportResults.push({ width, overflow: await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth) });
  }
  check(directoryViewportResults.every(({ overflow }) => !overflow), "el índice del Vecindario y sus filtros no desbordan a 1366/768/390/320");
  console.log(JSON.stringify({ directoryViewports: directoryViewportResults }, null, 2));
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
