import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const suffix = Date.now().toString();

function executeD1(sql) {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "vecidya-4b-"));
  const sqlFile = join(temporaryDirectory, "setup.sql");
  writeFileSync(sqlFile, sql, "utf8");
  const result = spawnSync(
    process.env.ComSpec ?? "cmd.exe",
    ["/d", "/c", `pnpm.cmd wrangler d1 execute DB --local --file ${sqlFile}`],
    { cwd: process.cwd(), encoding: "utf8" },
  );
  rmSync(temporaryDirectory, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(`D1 local falló: ${result.stderr}`);
  const output = result.stdout;
  return JSON.parse(output.slice(output.indexOf("[")))[0].results;
}

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

  async json(path, body) {
    return this.fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }
}

async function createIdentity(key) {
  const client = new SessionClient();
  const email = `phase-4b-${key}-${suffix}@vecidya.test`;
  const slug = `phase-4b-${key}-${suffix}`;
  const signUp = await client.json("/api/auth/sign-up/email", {
    name: `4B ${key} ${suffix}`,
    email,
    password: `test-only-password-${suffix}`,
  });
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

async function assertStatus(client, path, expected, options) {
  const response = await client.fetch(path, options);
  assert(response.status === expected, `${path} devolvió ${response.status}; se esperaba ${expected}.`);
  return response;
}

const identities = {};
for (const key of ["platform", "inactive", "owner-a", "owner-b", "admin", "member", "normal"]) {
  identities[key] = await createIdentity(key);
}
const now = Date.now();
executeD1(`
  INSERT INTO platform_member (id, user_id, role, status, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${identities.platform.userId}', 'platform_admin', 'active', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${identities.inactive.userId}', 'platform_admin', 'inactive', ${now}, ${now});
  INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', '${identities.admin.userId}', 'admin', ${now}),
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', '${identities.member.userId}', 'member', ${now}),
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', '${identities.platform.userId}', 'owner', ${now}),
    ('${crypto.randomUUID()}', '${identities["owner-b"].organizationId}', '${identities.platform.userId}', 'owner', ${now});
  INSERT INTO business_profile (id, organization_id, display_name, slug, status, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', 'Portal A ${suffix}', 'portal-a-${suffix}', 'published', ${now}, ${now});
`);

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
assert(!ownerBServices.includes("CRM"), "El portal de la organización B mostró el CRM de A.");

const activatePlatformOrganization = async (organizationId) => {
  const response = await identities.platform.client.json("/api/auth/organization/set-active", { organizationId });
  assert(response.status === 200, `No se pudo cambiar la organización activa: ${response.status}.`);
};
await activatePlatformOrganization(identities["owner-a"].organizationId);
const dashboardA = await (await assertStatus(identities.platform.client, "/app", 200)).text();
assert(dashboardA.includes(`Portal A ${suffix}`) && dashboardA.includes("CRM") && dashboardA.includes("active"), "El dashboard no mostró los datos reales de la organización A.");
await activatePlatformOrganization(identities["owner-b"].organizationId);
const dashboardB = await (await assertStatus(identities.platform.client, "/app", 200)).text();
assert(!dashboardB.includes(`Portal A ${suffix}`) && !dashboardB.includes("CRM"), "El dashboard conservó datos de la organización A después del cambio.");

console.log("PASS: matriz 4B de autorización, aislamiento y cambio de organización del portal verificados contra el Worker local.");
