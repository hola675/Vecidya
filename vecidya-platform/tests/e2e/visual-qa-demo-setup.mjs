import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { assertLocalBaseUrl, baseUrl } from "./test-safety.mjs";

setDefaultAutoSelectFamilyAttemptTimeout(5_000);
assertLocalBaseUrl();

const root = join(process.cwd(), ".wrangler", "visual-qa-demo");
const output = join(root, "demo-access.json");
const suffix = `visualqa20261025-${Date.now()}`;
const wrangler = fileURLToPath(import.meta.resolve("wrangler"));
mkdirSync(root, { recursive: true });
if (existsSync(output)) throw new Error("El demo ya está preparado. Consulta demo-access.json o crea un directorio visual-qa-demo nuevo y aplica allí las migraciones.");

function runD1(sql) {
  const sqlFile = join(root, "seed.sql");
  writeFileSync(sqlFile, sql, "utf8");
  const result = spawnSync(process.execPath, [wrangler, "d1", "execute", "DB", "--local", "--persist-to", root, "--json", "--file", sqlFile], { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  if (result.status !== 0) throw new Error(`D1 local error: ${result.stderr || result.stdout || result.error?.message}`);
  return JSON.parse(result.stdout).flatMap((statement) => statement.results ?? []);
}

async function d1(sql) {
  const result = runD1(sql);
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const health = await fetch(new URL("/api/auth/ok", baseUrl));
      if (health.ok) return result;
      lastError = new Error(`HTTP ${health.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`El Worker local no respondió tras preparar D1: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

class LocalSession {
  cookies = new Map();
  async request(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.cookies.size) headers.set("cookie", [...this.cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    let response;
    try {
      response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
    } catch (error) {
      throw new Error(`Solicitud local ${path} falló: ${error instanceof Error ? error.message : String(error)}`);
    }
    for (const raw of response.headers.getSetCookie()) {
      const [pair] = raw.split(";");
      const [name, ...value] = pair.split("=");
      this.cookies.set(name, value.join("="));
    }
    return response;
  }
  async json(path, body, method = "POST", extraHeaders = {}) {
    return this.request(path, {
      method,
      headers: { "content-type": "application/json", ...extraHeaders },
      body: method === "GET" ? undefined : JSON.stringify(body),
    });
  }
}

async function signUp(email, name, role = "member", targetOrganizationId = invitation.organizationId, inviterId = invitation.inviterId) {
  const invitationId = crypto.randomUUID();
  const now = Date.now();
  await d1(`INSERT INTO invitation (id, organization_id, email, role, status, expires_at, created_at, inviter_id) VALUES ('${invitationId}', '${targetOrganizationId}', '${email}', '${role}', 'pending', ${now + 86400000}, ${now}, '${inviterId}');`);
  const client = new LocalSession();
  const response = await client.json("/api/auth/sign-up/email", { name, email, password }, "POST", { "X-Vecidya-Invitation": invitationId });
  if (response.status !== 200) throw new Error(`El registro local devolvió ${response.status}: ${(await response.text()).slice(0, 250)}`);
  return { client, user: (await response.json()).user, email };
}

const password = `TEST-local-${crypto.randomUUID().slice(0, 12)}!aA`;
const invitation = { inviterId: crypto.randomUUID(), organizationId: crypto.randomUUID() };
const now = Date.now();
await d1(`INSERT INTO user (id, name, email, email_verified, created_at, updated_at) VALUES ('${invitation.inviterId}', 'TEST LOCAL — Invitador', 'visual-qa-inviter-${suffix}@vecidya.test', 1, ${now}, ${now}); INSERT INTO organization (id, name, slug, created_at) VALUES ('${invitation.organizationId}', 'TEST LOCAL — Invitaciones QA', 'visual-qa-invitations-${suffix}', ${now});`);

const owner = await signUp(`visual-qa-owner-${suffix}@vecidya.test`, "TEST LOCAL — Propietario demo");
console.log("Registro por invitación local completado.");
const first = await owner.client.json("/api/auth/organization/create", { name: "TEST LOCAL — Restaurante", slug: `visual-qa-restaurante-${suffix}` });
if (first.status !== 200) throw new Error(`Crear primera organización: ${first.status} ${(await first.text()).slice(0, 250)}`);
const firstOrg = (await first.json()).id;
console.log("Organización inicial creada por la ruta de autenticación.");

const billingId = crypto.randomUUID();
const priceId = crypto.randomUUID();
await d1(`INSERT INTO billing_account (id, owner_user_id, kind, created_at, updated_at) VALUES ('${billingId}', '${owner.user.id}', 'individual', ${now}, ${now}); INSERT INTO license_price (id, plan_code, currency, amount_cents, billing_interval, effective_from, status, created_at, updated_at) VALUES ('${priceId}', 'cuadra', 'USD', 0, 'monthly', ${now}, 'active', ${now}, ${now});`);
await d1(`INSERT INTO organization_license (id, organization_id, billing_account_id, plan_code, price_id, status, started_at, activated_at, created_at, updated_at) VALUES ('${crypto.randomUUID()}', '${firstOrg}', '${billingId}', 'cuadra', '${priceId}', 'active', ${now}, ${now}, ${now}, ${now});`);

const profiles = [
  { key: "restaurante", name: "TEST LOCAL — Restaurante La Esquina", category: "Restaurante", city: "Bogotá", description: "Una ficha sintética para revisar horarios, ubicación, servicios y galería.", media: true, status: "published" },
  { key: "barberia", name: "TEST LOCAL — Barbería Norte", category: "Barbería", city: "Medellín", description: "Perfil de demostración con servicios y contacto.", status: "draft" },
  { key: "tienda", name: "TEST LOCAL — Tienda de Barrio", category: "Comercio minorista", city: "Cali", description: "Productos sintéticos sin precios ni oferta comercial.", status: "draft" },
  { key: "consultoria", name: "TEST LOCAL — Consultoría Profesional", category: "Consultoría", city: "Bogotá", description: "Ficha de prueba para una actividad profesional.", status: "draft" },
  { key: "taller", name: "TEST LOCAL — Taller Mecánico", category: "Taller", city: "Pereira", description: "Servicios y contacto de ejemplo.", status: "draft" },
  { key: "academia", name: "TEST LOCAL — Academia de Aprendizaje", category: "Educación", city: "Bucaramanga", description: "Información educativa sintética con preguntas frecuentes.", status: "draft" },
  { key: "domicilio", name: "TEST LOCAL — Servicio a Domicilio", category: "Servicios", city: "Cartagena", description: "Prueba de áreas y modalidad de atención.", status: "draft" },
  { key: "comunidad", name: "TEST LOCAL — Organización Comunitaria", category: "Comunidad", city: "Manizales", description: "Información institucional de demostración.", status: "draft" },
  { key: "borrador", name: "TEST LOCAL — Perfil en Borrador", category: "Servicios", city: "Bogotá", description: "Borrador privado; no debe aparecer en la ruta pública.", status: "draft" },
  { key: "texto-largo", name: "TEST LOCAL — Perfil con textos de longitud extensa para revisar desbordamientos en móvil y escritorio", category: "Servicios profesionales", city: "Santa Marta", description: "Contenido local sintético. ".repeat(55), status: "draft" },
];

const organizations = [{ id: firstOrg, ...profiles[0] }];
const additionalOrganizations = profiles.slice(1).map((profile) => ({ id: crypto.randomUUID(), ...profile }));
await d1(additionalOrganizations.map((org) => `INSERT INTO organization (id, name, slug, created_at) VALUES ('${org.id}', '${org.name.replaceAll("'", "''")}', 'visual-qa-${org.key}-${suffix}', ${Date.now()}); INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES ('${crypto.randomUUID()}', '${org.id}', '${owner.user.id}', 'owner', ${Date.now()});`).join("\n"));
organizations.push(...additionalOrganizations);

const sqlStatements = [];
for (const [index, org] of organizations.entries()) {
  const timestamp = Date.now() + index;
  if (index > 0 && index < 8) sqlStatements.push(`INSERT INTO organization_license (id, organization_id, billing_account_id, plan_code, price_id, status, started_at, activated_at, created_at, updated_at) VALUES ('${crypto.randomUUID()}', '${org.id}', '${billingId}', 'cuadra', '${priceId}', 'active', ${timestamp}, ${timestamp}, ${timestamp}, ${timestamp});`);
  const profileId = crypto.randomUUID();
  sqlStatements.push(`INSERT INTO business_profile (id, organization_id, display_name, slug, short_description, description, category, city, country, phone, public_email, service_mode, service_area, status, created_at, updated_at) VALUES ('${profileId}', '${org.id}', '${org.name.replaceAll("'", "''")}', 'visual-qa-${org.key}-${suffix}', '${org.category}', '${org.description.replaceAll("'", "''")}', '${org.category}', '${org.city}', 'Colombia', NULL, NULL, 'hybrid', '${org.city} y alrededores', '${org.status}', ${timestamp}, ${timestamp});`);
  sqlStatements.push(`INSERT INTO business_profile_governance (id, business_profile_id, verification_status, platform_status, created_at, updated_at) VALUES ('${crypto.randomUUID()}', '${profileId}', 'unverified', '${org.key === "comunidad" ? "suspended" : "active"}', ${timestamp}, ${timestamp});`);
  if (index < 8) {
    for (let day = 0; day < 7; day += 1) sqlStatements.push(`INSERT INTO business_hours (id, organization_id, day_of_week, opens_at, closes_at, is_closed, created_at, updated_at) VALUES ('${crypto.randomUUID()}', '${org.id}', ${day}, ${day === 0 ? "NULL" : "'09:00'"}, ${day === 0 ? "NULL" : "'18:00'"}, ${day === 0 ? 1 : 0}, ${timestamp}, ${timestamp});`);
    for (let item = 0; item < 3; item += 1) sqlStatements.push(`INSERT INTO business_offering (id, organization_id, kind, title, description, price_label, sort_order, is_active, created_at, updated_at) VALUES ('${crypto.randomUUID()}', '${org.id}', '${item === 2 ? "product" : "service"}', 'TEST LOCAL — ${org.category} ${item + 1}', 'Descripción sintética para evaluación visual.', NULL, ${item}, 1, ${timestamp}, ${timestamp});`);
    sqlStatements.push(`INSERT INTO business_faq (id, organization_id, question, answer, sort_order, is_active, created_at, updated_at) VALUES ('${crypto.randomUUID()}', '${org.id}', 'TEST LOCAL — ¿Cómo funciona el servicio?', 'Esta respuesta solo existe en la base local de demostración.', 0, 1, ${timestamp}, ${timestamp});`);
  }
}
await d1(sqlStatements.join("\n"));
console.log("Perfiles sintéticos y membresías locales preparados.");

const firstConfigResponse = await owner.client.json(`/api/organizations/${firstOrg}/miniweb-config`, null, "GET");
if (firstConfigResponse.status !== 200) throw new Error(`Leer configuración MiniWeb: ${firstConfigResponse.status}`);
let revision = (await firstConfigResponse.json()).draftRevision;
const media = [];
for (const [fileName, purpose, altText] of [["cafe.webp", "cover", "TEST LOCAL — Portada panorámica"], ["cafe.jpg", "logo", "TEST LOCAL — Logotipo sintético"], ["transparent-mark.png", "icon", "TEST LOCAL — Símbolo transparente"], ["barber.webp", "gallery", "TEST LOCAL — Fotografía de galería horizontal"]]) {
  const bytes = readFileSync(join(process.cwd(), "tests", "fixtures", "visual-qa", fileName));
  const mime = fileName.endsWith(".webp") ? "image/webp" : fileName.endsWith(".jpg") ? "image/jpeg" : "image/png";
  const form = new FormData();
  form.set("file", new File([bytes], fileName, { type: mime }));
  form.set("purpose", purpose);
  form.set("altText", altText);
  form.set("draftRevision", String(revision));
  const upload = await owner.client.request(`/api/organizations/${firstOrg}/business-media`, { method: "POST", body: form });
  if (upload.status !== 201) throw new Error(`Subir ${fileName}: ${upload.status} ${(await upload.text()).slice(0, 250)}`);
  const result = await upload.json();
  revision = result.draftRevision;
  media.push(result.asset);
}
await d1(`UPDATE business_offering SET image_asset_id = '${media[3].id}' WHERE organization_id = '${firstOrg}' AND sort_order = 0;`);
const publish = await owner.client.json(`/api/organizations/${firstOrg}/miniweb-config`, { intent: "publish", draftRevision: revision });
if (publish.status !== 200) throw new Error(`Publicación explícita local: ${publish.status} ${(await publish.text()).slice(0, 250)}`);

const member = await signUp(`visual-qa-member-${suffix}@vecidya.test`, "TEST LOCAL — Miembro restringido", "member", firstOrg, owner.user.id);
const admin = await signUp(`visual-qa-admin-${suffix}@vecidya.test`, "TEST LOCAL — Administrador de plataforma", "member", firstOrg, owner.user.id);
await d1(`INSERT INTO platform_member (id, user_id, role, status, created_at, updated_at) VALUES ('${crypto.randomUUID()}', '${admin.user.id}', 'platform_admin', 'active', ${Date.now()}, ${Date.now()});`);
await d1(`DELETE FROM organization WHERE id = '${invitation.organizationId}'; DELETE FROM user WHERE id = '${invitation.inviterId}';`);

const access = {
  label: "TEST LOCAL — solo localhost",
  baseUrl,
  createdAt: new Date().toISOString(),
  owner: { email: owner.email, password, organizationCount: organizations.length },
  member: { email: member.email, password, organization: organizations[0].name, role: "member" },
  platformAdmin: { email: admin.email, password, membership: "platform_member active; synthetic local fixture" },
  organizations: organizations.map(({ id, key, name, status }) => ({ id, key, name, status, publicUrl: key === "restaurante" && status === "published" ? `${baseUrl}/vecindario/visual-qa-${key}-${suffix}` : null })),
  publishedMediaCount: media.length,
  restriction: "Datos sintéticos. No compartir ni publicar. Worker, D1 y R2 locales.",
};
writeFileSync(output, `${JSON.stringify(access, null, 2)}\n`, { mode: 0o600 });
console.log(JSON.stringify({ ready: true, baseUrl, owner: owner.email, member: member.email, platformAdmin: admin.email, organizationCount: organizations.length, publishedUrl: access.organizations[0].publicUrl, output }, null, 2));
