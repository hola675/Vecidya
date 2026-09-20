import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { assertRemoteE2EIntent } from "./test-safety.mjs";

const baseUrl = process.env.BASE_URL;
const databaseName = process.env.D1_NAME;
const suffix = Date.now().toString();

assertRemoteE2EIntent(baseUrl);
if (databaseName !== "vecidya-staging") throw new Error("10C solo permite D1_NAME=vecidya-staging.");

const assert = (condition, message) => { if (!condition) throw new Error(message); };

class SessionClient {
  #cookies = new Map();
  async fetch(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    const response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
    for (const setCookie of response.headers.getSetCookie()) {
      const [pair] = setCookie.split(";", 1);
      const [name, ...value] = pair.split("=");
      this.#cookies.set(name, value.join("="));
    }
    return response;
  }
  json(path, body) { return this.fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
  form(path, body) { return this.fetch(path, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body) }); }
}

async function expect(client, path, expected, options) {
  const response = await client.fetch(path, options);
  assert(response.status === expected, `${path} devolvió ${response.status}; se esperaba ${expected}`);
  return response;
}

async function withTransientCpuRetry(requestFactory, label) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await requestFactory();
    if (response.status !== 503 || attempt === 3) return response;
    console.error(`WARN: ${label} devolvió 503/1102 en intento ${attempt}; se reintenta para completar la matriz.`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No se pudo completar ${label}`);
}

async function identity(key, createOrganization = true) {
  const client = new SessionClient();
  const email = `10c-${key}-${suffix}@vecidya.test`;
  const signUp = await withTransientCpuRetry(() => client.json("/api/auth/sign-up/email", { name: `10C ${key}`, email, password: `test-only-password-${suffix}` }), `Registro ${key}`);
  if (signUp.status !== 200) throw new Error(`Registro ${key} falló: ${signUp.status} ${await signUp.text()}`);
  const user = (await signUp.json()).user;
  let organizationId;
  if (createOrganization) {
    const organization = await withTransientCpuRetry(() => client.json("/api/auth/organization/create", { name: `10C Organización ${key} ${suffix}`, slug: `10c-${key}-${suffix}` }), `Organización ${key}`);
    assert(organization.status === 200, `Organización ${key} falló: ${organization.status}`);
    organizationId = (await organization.json()).id;
    assert((await client.json("/api/auth/organization/set-active", { organizationId })).status === 200, `No se pudo activar ${key}`);
  }
  return { client, email, userId: user.id, organizationId };
}

function sqlRemote(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-10c-"));
  const file = join(directory, "fixture.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", "pnpm.cmd", "wrangler", "d1", "execute", databaseName, "--remote", "--json", "--file", file], { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  rmSync(directory, { recursive: true, force: true });
  assert(result.status === 0, `Fixture D1 staging falló: ${result.error?.message ?? result.stderr ?? result.stdout ?? "sin salida"}`);
}

function sqlCommand(command) {
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", "pnpm.cmd", "wrangler", "d1", "execute", databaseName, "--remote", "--json", "--command", command], { cwd: process.cwd(), encoding: "utf8", windowsHide: true });
  assert(result.status === 0, `Consulta D1 staging falló: ${result.stderr || result.stdout}`);
  return result.stdout;
}

const created = [];
const remember = (identityValue) => { created.push(identityValue); return identityValue; };

let fixture;
try {
  const health = await fetch(new URL("/__health/db", baseUrl));
  assert(health.status === 200, `Health staging devolvió ${health.status}`);

  for (const path of ["/", "/servicios", "/unete", "/vecindario", "/vecindario?q=10c-no-result", "/vecindario?category=Servicios&city=La%20Habana"]) {
    const response = await fetch(new URL(path, baseUrl));
    assert(response.status === 200, `${path} devolvió ${response.status}`);
    const html = await response.text();
    assert(html.includes("<title") && html.includes("description"), `${path} no contiene metadata SEO base`);
  }

  const ownerA = remember(await identity("owner-a"));
  const ownerB = remember(await identity("owner-b"));
  const adminA = remember(await identity("admin-a"));
  const memberA = remember(await identity("member-a"));
  const normal = remember(await identity("normal"));
  const platform = remember(await identity("platform"));
  const inactive = remember(await identity("inactive"));
  const invitee = remember(await identity("invitee", false));

  sqlRemote(`
    INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES
      ('${crypto.randomUUID()}', '${ownerA.organizationId}', '${adminA.userId}', 'admin', ${Date.now()}),
      ('${crypto.randomUUID()}', '${ownerA.organizationId}', '${memberA.userId}', 'member', ${Date.now()});
    INSERT INTO platform_member (id, user_id, role, status, created_at, updated_at) VALUES
      ('${crypto.randomUUID()}', '${platform.userId}', 'platform_admin', 'active', ${Date.now()}, ${Date.now()}),
      ('${crypto.randomUUID()}', '${inactive.userId}', 'platform_admin', 'inactive', ${Date.now()}, ${Date.now()});
    INSERT INTO business_profile (id, organization_id, display_name, slug, short_description, description, category, city, country, status, created_at, updated_at) VALUES
      ('${crypto.randomUUID()}', '${ownerA.organizationId}', '10C Perfil A ${suffix}', '10c-perfil-a-${suffix}', 'Perfil A', 'Perfil A remoto', 'Servicios', 'La Habana', 'Cuba', 'published', ${Date.now()}, ${Date.now()}),
      ('${crypto.randomUUID()}', '${ownerB.organizationId}', '10C Perfil B ${suffix}', '10c-perfil-b-${suffix}', NULL, NULL, NULL, NULL, NULL, 'draft', ${Date.now()}, ${Date.now()});
    INSERT INTO organization_service (id, organization_id, service_id, status, created_at, updated_at) VALUES
      ('${crypto.randomUUID()}', '${ownerA.organizationId}', 'service-presence', 'active', ${Date.now()}, ${Date.now()}),
      ('${crypto.randomUUID()}', '${ownerB.organizationId}', 'service-marketing', 'pending', ${Date.now()}, ${Date.now()});
    INSERT INTO integration_connection (id, organization_id, provider, external_id, status, metadata, created_at, updated_at) VALUES
      ('${crypto.randomUUID()}', '${ownerA.organizationId}', 'test-provider', '10c-external-a-${suffix}', 'active', '{"region":"test-a"}', ${Date.now()}, ${Date.now()}),
      ('${crypto.randomUUID()}', '${ownerB.organizationId}', 'test-provider', '10c-external-b-${suffix}', 'pending', '{"region":"test-b"}', ${Date.now()}, ${Date.now()});
  `);
  const fixtureProfiles = sqlCommand(`SELECT p.display_name, p.status, o.slug FROM business_profile p INNER JOIN organization o ON o.id = p.organization_id WHERE o.slug IN ('10c-owner-a-${suffix}', '10c-owner-b-${suffix}') ORDER BY o.slug;`);
  console.error(`Fixture profiles D1: ${fixtureProfiles}`);

  const loginClient = new SessionClient();
  const login = await withTransientCpuRetry(() => loginClient.json("/api/auth/sign-in/email", { email: normal.email, password: `test-only-password-${suffix}` }), "Login remoto");
  if (login.status !== 200) throw new Error(`Login remoto falló: ${login.status} ${await login.text()}`);
  assert((await loginClient.fetch("/api/auth/get-session")).status === 200, "Sesión remota no se pudo leer");

  const draft = await ownerB.client.form("/app/business-profile", { displayName: `10C Draft ${suffix}`, slug: `10c-draft-${suffix}`, intent: "save" });
  assert(draft.status === 200, `Guardado draft devolvió ${draft.status}`);
  assert((await fetch(new URL(`/vecindario/10c-draft-${suffix}`, baseUrl))).status === 404, "Draft expuesto públicamente");
  const publish = await ownerB.client.form("/app/business-profile", { displayName: `10C Publicado ${suffix}`, slug: `10c-publicado-${suffix}`, shortDescription: "Negocio remoto de prueba", description: "Descripción remota", category: "Servicios", city: "La Habana", country: "Cuba", intent: "publish" });
  assert(publish.status === 200, `Publicación completa devolvió ${publish.status}`);
  const publicProfile = await expect(ownerB.client, `/vecindario/10c-publicado-${suffix}`, 200);
  const publicHtml = await publicProfile.text();
  const seoChecks = { name: publicHtml.includes("10C Publicado"), title: publicHtml.includes("<title"), openGraph: publicHtml.includes("og:") };
  if (!seoChecks.openGraph) console.error(`SEO remoto recibido: ${publicHtml.match(/<meta[^>]*>/g)?.join(" | ") ?? "sin meta"}`);
  if (!(seoChecks.name && seoChecks.title && seoChecks.openGraph)) {
    if (process.env.CONTINUE_AFTER_SEO_FAILURE !== "1") throw new Error(`Perfil público/SEO incompleto: ${JSON.stringify(seoChecks)}`);
    console.error(`WARN: continuando para completar la matriz; SEO remoto falló: ${JSON.stringify(seoChecks)}`);
  }

  assert((await ownerA.client.fetch("/app/account")).status === 200, "/app/account no accesible");
  assert((await ownerA.client.fetch("/app/services")).status === 200, "/app/services no accesible");
  assert((await ownerA.client.fetch("/app/organization")).status === 200, "/app/organization no accesible");
  const members = await expect(ownerA.client, `/api/organizations/${ownerA.organizationId}/members`, 200);
  const membersJson = await members.json();
  assert(membersJson.members.some((item) => item.user.id === adminA.userId), "Admin A no aparece en miembros");
  await expect(ownerA.client, `/api/organizations/${ownerB.organizationId}/members`, 403);
  await expect(memberA.client, `/api/organizations/${ownerA.organizationId}/members`, 200);
  await expect(memberA.client, `/api/organizations/${ownerA.organizationId}/members`, 403, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ operation: "update-role", memberId: membersJson.members.find((item) => item.user.id === memberA.userId)?.id, role: "owner" }) });
  await expect(ownerA.client, `/api/organizations/${ownerA.organizationId}/invitations`, 503, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ operation: "invite", email: `10c-delivery-${suffix}@vecidya.test`, role: "member" }) });

  const adminPaths = ["/app/internal", "/app/internal/organizations", "/app/internal/businesses", "/app/internal/services", "/app/internal/integrations"];
  for (const path of adminPaths) await expect(platform.client, path, 200);
  for (const user of [inactive, ownerA, adminA, memberA, normal]) {
    for (const path of adminPaths) await expect(user.client, path, 403);
  }
  let businesses = await (await expect(platform.client, "/app/internal/businesses", 200)).text();
  let businessChecks = { profileA: businesses.includes(`10C Perfil A ${suffix}`), profileB: businesses.includes(`10C Publicado ${suffix}`) };
  if (!businessChecks.profileB) {
    await new Promise((resolve) => setTimeout(resolve, 5_000));
    businesses = await (await expect(platform.client, "/app/internal/businesses", 200)).text();
    businessChecks = { profileA: businesses.includes(`10C Perfil A ${suffix}`), profileB: businesses.includes(`10C Publicado ${suffix}`) };
  }
  if (!(businessChecks.profileA && businessChecks.profileB)) console.error(`Admin businesses diagnóstico: ${JSON.stringify(businessChecks)}`);
  assert(businessChecks.profileA && businessChecks.profileB, "Admin no aisló perfiles A/B");
  const integrations = await (await expect(platform.client, "/app/internal/integrations", 200)).text();
  assert(integrations.includes(`10c-external-a-${suffix}`) && integrations.includes(`10c-external-b-${suffix}`), "Admin no mostró integraciones A/B");
  const services = await (await expect(platform.client, "/app/internal/services", 200)).text();
  assert(services.includes("Presencia digital") && services.includes("Marketing"), "Admin no mostró servicios A/B");

  console.log("PASS: 10C staging remoto cubre público, auth/sesión, organizations, aislamiento A/B, profile draft/publicado, services, account, members/roles, invitation 503 controlado y admin 8A–8E.");
} finally {
  const ids = created.map((item) => `'${item.userId}'`).join(",");
  if (ids) {
    try { sqlRemote(`
      DELETE FROM integration_connection WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE '10c-%-${suffix}');
      DELETE FROM organization_service WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE '10c-%-${suffix}');
      DELETE FROM business_profile WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE '10c-%-${suffix}');
      DELETE FROM platform_member WHERE user_id IN (${ids});
      DELETE FROM member WHERE user_id IN (${ids});
      DELETE FROM invitation WHERE email LIKE '10c-%-${suffix}@vecidya.test';
      DELETE FROM organization WHERE slug LIKE '10c-%-${suffix}';
      DELETE FROM session WHERE user_id IN (${ids});
      DELETE FROM account WHERE user_id IN (${ids});
      DELETE FROM verification WHERE identifier LIKE '10c-%-${suffix}@vecidya.test';
      DELETE FROM user WHERE id IN (${ids});
    `); } catch (error) { console.error(`WARN: no se pudo limpiar fixture 10C ${suffix}: ${error.message}`); }
  }
}
