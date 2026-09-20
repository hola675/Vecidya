import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const d1Database = process.env.D1_DATABASE_NAME ?? "DB";
const suffix = Date.now().toString();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-product-evolution-d1-"));
  const file = join(directory, "query.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute ${d1Database} --local --file ${file}`], { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  rmSync(directory, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(`D1 local falló: ${result.stderr || result.stdout}`);
  return result.stdout;
}

class SessionClient {
  #cookies = new Map();

  async fetch(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; "));
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

  json(path, body) {
    return this.fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  }

  form(path, values) {
    return this.fetch(path, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(values) });
  }
}

async function expectStatus(responsePromise, expected, label) {
  const response = await responsePromise;
  assert(response.status === expected, `${label} devolvió ${response.status}; se esperaba ${expected}`);
  return response;
}

async function createIdentity(key) {
  const client = new SessionClient();
  const email = `d1-gov-${key}-${suffix}@vecidya.test`;
  const signUp = await client.json("/api/auth/sign-up/email", { name: `D1 ${key} ${suffix}`, email, password: `test-only-password-${suffix}` });
  assert(signUp.status === 200, `${key} no pudo registrarse: ${signUp.status}`);
  const userId = (await signUp.json()).user.id;
  return { client, email, userId };
}

function cleanup() {
  executeD1(`
    DELETE FROM platform_audit_log WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'd1-gov-%-${suffix}');
    DELETE FROM business_profile_governance WHERE business_profile_id IN (SELECT id FROM business_profile WHERE slug LIKE 'd1-gov-%-${suffix}');
    DELETE FROM business_profile WHERE slug LIKE 'd1-gov-%-${suffix}';
    DELETE FROM member WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'd1-gov-%-${suffix}');
    DELETE FROM organization WHERE slug LIKE 'd1-gov-%-${suffix}';
    DELETE FROM platform_member WHERE user_id IN (SELECT id FROM user WHERE email LIKE 'd1-gov-%-${suffix}@vecidya.test');
    DELETE FROM session WHERE user_id IN (SELECT id FROM user WHERE email LIKE 'd1-gov-%-${suffix}@vecidya.test');
    DELETE FROM account WHERE user_id IN (SELECT id FROM user WHERE email LIKE 'd1-gov-%-${suffix}@vecidya.test');
    DELETE FROM verification WHERE identifier LIKE 'd1-gov-%-${suffix}@vecidya.test';
    DELETE FROM user WHERE email LIKE 'd1-gov-%-${suffix}@vecidya.test';
  `);
}

try {

const platformAdmin = await createIdentity("platform-admin");
const inactiveAdmin = await createIdentity("inactive-admin");
const owner = await createIdentity("owner");
const orgAdminUser = await createIdentity("org-admin");
const normal = await createIdentity("normal");

const orgResponse = await owner.client.json("/api/auth/organization/create", { name: `D1 Gov Org ${suffix}`, slug: `d1-gov-org-${suffix}` });
assert(orgResponse.status === 200, `No se pudo crear la organización: ${orgResponse.status}`);
const organizationId = (await orgResponse.json()).id;
const slug = `d1-gov-negocio-${suffix}`;

await expectStatus(owner.client.form("/app/business-profile", {
  displayName: `D1 Negocio ${suffix}`,
  slug,
  shortDescription: "Fixture local para validar Admin Governance.",
  category: "Servicios profesionales",
  city: "Medellín",
  country: "Colombia",
  intent: "publish",
}), 200, "Publicación del perfil real para D1");

const now = Date.now();
executeD1(`
  INSERT INTO platform_member (id, user_id, role, status, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${platformAdmin.userId}', 'platform_admin', 'active', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${inactiveAdmin.userId}', 'platform_admin', 'inactive', ${now}, ${now});
  INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES
    ('${crypto.randomUUID()}', '${organizationId}', '${orgAdminUser.userId}', 'admin', ${now});
`);

const ownProfile = await (await expectStatus(owner.client.fetch(`/api/organizations/${organizationId}/business-profile`), 200, "Lectura del perfil propio vía API")).json();
const businessProfileId = ownProfile.profile.id;
const detailPath = `/app/internal/businesses/${businessProfileId}`;

// --- 1-4. Authorization ---

const anonymous = new SessionClient();
await expectStatus(anonymous.fetch(detailPath), 302, "Sin sesión en el detalle administrativo");
await expectStatus(anonymous.form(detailPath, { action: "verify" }), 302, "Sin sesión ejecutando una acción de gobierno");

await expectStatus(owner.client.fetch(detailPath), 403, "Owner de organización sin autoridad de plataforma");
await expectStatus(owner.client.form(detailPath, { action: "verify" }), 403, "Owner intentando verificar sin autoridad de plataforma");

await expectStatus(orgAdminUser.client.fetch(detailPath), 403, "Admin de organización sin autoridad de plataforma");
await expectStatus(orgAdminUser.client.form(detailPath, { action: "suspend" }), 403, "Admin de organización intentando suspender sin autoridad de plataforma");

await expectStatus(inactiveAdmin.client.fetch(detailPath), 403, "platform_admin inactivo");
await expectStatus(normal.client.fetch(detailPath), 403, "Usuario normal sin ninguna relación con la organización");

await expectStatus(platformAdmin.client.fetch(detailPath), 200, "platform_admin activo");

console.log("PASS: autorización — sin sesión rechazada (302), owner/admin de organización sin autoridad de plataforma rechazados (403), platform_admin inactivo rechazado (403), platform_admin activo permitido (200).");

// --- 5-10. Verification ---

const beforeVerify = await (await expectStatus(platformAdmin.client.fetch(detailPath), 200, "Detalle antes de verificar")).text();
assert(beforeVerify.includes("No verificado"), "El detalle no mostró el estado inicial 'No verificado'.");

await expectStatus(platformAdmin.client.form(detailPath, { action: "verify" }), 200, "Verificar el perfil");

const publicVerified = await (await expectStatus(platformAdmin.client.fetch(`/vecindario/${slug}`), 200, "Perfil público tras verificar")).text();
assert(publicVerified.includes("Perfil verificado por Vecidya"), "El perfil público no mostró el badge de verificación tras verificar.");

const detailAfterVerify = await (await expectStatus(platformAdmin.client.fetch(detailPath), 200, "Detalle tras verificar")).text();
assert(detailAfterVerify.includes("Retirar verificación") && !detailAfterVerify.includes(">Verificar<"), "El detalle no ajustó las acciones disponibles tras verificar (no debe seguir ofreciendo 'Verificar').");
assert(detailAfterVerify.includes("Verificó el perfil"), "El detalle no registró la acción de verificación en la actividad administrativa.");

const auditAfterVerify = await (await expectStatus(platformAdmin.client.fetch("/app/internal/audit"), 200, "Auditoría global tras verificar")).text();
assert(auditAfterVerify.includes("Verificó el perfil") && auditAfterVerify.includes(`D1 Negocio ${suffix}`), "La auditoría global no registró la verificación.");

await expectStatus(platformAdmin.client.form(detailPath, { action: "unverify" }), 200, "Retirar la verificación");

const publicUnverified = await (await expectStatus(platformAdmin.client.fetch(`/vecindario/${slug}`), 200, "Perfil público tras retirar verificación")).text();
assert(!publicUnverified.includes("Perfil verificado por Vecidya"), "El badge de verificación no debe seguir apareciendo tras retirar la verificación.");

const auditAfterUnverify = await (await expectStatus(platformAdmin.client.fetch("/app/internal/audit"), 200, "Auditoría global tras retirar verificación")).text();
assert(auditAfterUnverify.includes("Retiró la verificación"), "La auditoría global no registró la reversión de verificación.");

console.log("PASS: verificación — Admin verifica, badge público aparece, auditoría registra la acción; Admin retira verificación, badge desaparece, auditoría registra la reversión.");

// --- 11-17. Suspension ---

await expectStatus(owner.client.fetch(`/vecindario/${slug}`), 200, "Perfil público publicado antes de suspender");
const directoryBefore = await (await expectStatus(owner.client.fetch("/vecindario"), 200, "Vecindario antes de suspender")).text();
assert(directoryBefore.includes(`D1 Negocio ${suffix}`), "El Vecindario no listaba el perfil publicado antes de suspender.");

await expectStatus(platformAdmin.client.form(detailPath, { action: "suspend" }), 200, "Suspender el perfil");

const directoryAfter = await (await expectStatus(owner.client.fetch("/vecindario"), 200, "Vecindario tras suspender")).text();
assert(!directoryAfter.includes(`D1 Negocio ${suffix}`), "El Vecindario siguió listando un perfil suspendido.");

await expectStatus(owner.client.fetch(`/vecindario/${slug}`), 404, "Perfil público tras suspender debe dejar de exponerse");

const tenantView = await (await expectStatus(owner.client.fetch("/app/business-profile"), 200, "Vista tenant tras suspender")).text();
assert(tenantView.includes(`D1 Negocio ${suffix}`), "El tenant perdió sus propios datos tras la suspensión.");
assert(tenantView.includes("Estado de plataforma: Suspendido"), "El tenant no vio la señal de suspensión en su editor.");

// El tenant intenta "resolver" la suspensión republicando; la restricción de plataforma debe permanecer.
await expectStatus(owner.client.form("/app/business-profile", {
  displayName: `D1 Negocio ${suffix}`,
  slug,
  shortDescription: "Fixture local para validar Admin Governance.",
  category: "Servicios profesionales",
  city: "Medellín",
  country: "Colombia",
  intent: "publish",
}), 200, "El tenant republica mientras está suspendido");
await expectStatus(owner.client.fetch(`/vecindario/${slug}`), 404, "La republicación del tenant no debe levantar la suspensión");

const auditAfterSuspend = await (await expectStatus(platformAdmin.client.fetch("/app/internal/audit"), 200, "Auditoría global tras suspender")).text();
assert(auditAfterSuspend.includes("Suspendió el perfil"), "La auditoría global no registró la suspensión.");

console.log("PASS: suspensión — perfil publicado deja de listarse y de exponerse públicamente (404), el tenant conserva sus datos y ve la señal de suspensión, republicar no revierte la suspensión, y la auditoría registra la acción.");

// --- 18-20. Reactivation ---

await expectStatus(platformAdmin.client.form(detailPath, { action: "reactivate" }), 200, "Reactivar el perfil");

await expectStatus(owner.client.fetch(`/vecindario/${slug}`), 200, "Perfil público tras reactivar");
const directoryReactivated = await (await expectStatus(owner.client.fetch("/vecindario"), 200, "Vecindario tras reactivar")).text();
assert(directoryReactivated.includes(`D1 Negocio ${suffix}`), "El Vecindario no volvió a listar el perfil reactivado.");

const auditAfterReactivate = await (await expectStatus(platformAdmin.client.fetch("/app/internal/audit"), 200, "Auditoría global tras reactivar")).text();
assert(auditAfterReactivate.includes("Reactivó el perfil"), "La auditoría global no registró la reactivación.");

console.log("PASS: reactivación — Admin reactiva, el perfil vuelve a estar accesible públicamente y listado, y la auditoría registra la acción.");

} finally {
  cleanup();
}
