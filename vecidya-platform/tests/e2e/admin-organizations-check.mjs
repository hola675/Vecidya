import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const suffix = Date.now().toString();

function assert(condition, message) { if (!condition) throw new Error(message); }

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-8b-"));
  const file = join(directory, "setup.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute DB --local --file ${file}`], { cwd: process.cwd(), encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(`D1 local falló: ${result.stderr}`);
}

class SessionClient {
  #cookies = new Map();
  async fetch(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; "));
    let response;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try { response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" }); break; }
      catch (error) { if (attempt === 2) throw error; await new Promise((resolve) => setTimeout(resolve, 250)); }
    }
    for (const setCookie of response.headers.getSetCookie()) {
      const [pair] = setCookie.split(";", 1);
      const [name, ...value] = pair.split("=");
      this.#cookies.set(name, value.join("="));
    }
    return response;
  }
  json(path, body) { return this.fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
}

async function createIdentity(key) {
  const client = new SessionClient();
  const signUp = await client.json("/api/auth/sign-up/email", { name: `8B ${key}`, email: `8b-${key}-${suffix}@vecidya.test`, password: `test-only-password-${suffix}` });
  assert(signUp.status === 200, `${key} no pudo registrarse: ${signUp.status}`);
  const userId = (await signUp.json()).user.id;
  const organization = await client.json("/api/auth/organization/create", { name: `Organización ${key} ${suffix}`, slug: `org-${key}-${suffix}` });
  assert(organization.status === 200, `${key} no pudo crear organización: ${organization.status}`);
  return { client, organizationId: (await organization.json()).id, userId, email: `8b-${key}-${suffix}@vecidya.test` };
}

async function expectStatus(client, path, expected) {
  const response = await client.fetch(path);
  assert(response.status === expected, `${path} devolvió ${response.status}; se esperaba ${expected}`);
  return response;
}

const identities = {};
for (const key of ["platform", "inactive", "owner-a", "owner-b", "admin", "member", "normal"]) identities[key] = await createIdentity(key);
const now = Date.now();
executeD1(`
  INSERT INTO platform_member (id, user_id, role, status, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${identities.platform.userId}', 'platform_admin', 'active', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${identities.inactive.userId}', 'platform_admin', 'inactive', ${now}, ${now});
  INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', '${identities.admin.userId}', 'admin', ${now}),
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', '${identities.member.userId}', 'member', ${now});
  INSERT INTO business_profile (id, organization_id, display_name, slug, short_description, status, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', 'Perfil A ${suffix}', 'perfil-a-${suffix}', 'Perfil administrativo A', 'published', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${identities["owner-b"].organizationId}', 'Perfil B ${suffix}', 'perfil-b-${suffix}', 'Perfil administrativo B', 'draft', ${now}, ${now});
  INSERT INTO organization_service (id, organization_id, service_id, status, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', 'service-presence', 'active', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${identities["owner-b"].organizationId}', 'service-marketing', 'pending', ${now}, ${now});
  INSERT INTO integration_connection (id, organization_id, provider, external_id, status, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', 'provider-a', 'external-a-${suffix}', 'active', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${identities["owner-b"].organizationId}', 'provider-b', 'external-b-${suffix}', 'pending', ${now}, ${now});
`);

const listing = await expectStatus(identities.platform.client, "/app/internal/organizations", 200);
const listingHtml = await listing.text();
assert(listingHtml.includes(`Organización owner-a ${suffix}`) && listingHtml.includes(`Organización owner-b ${suffix}`), "El listado global no mostró las organizaciones reales.");

const detailA = await (await expectStatus(identities.platform.client, `/app/internal/organizations/${identities["owner-a"].organizationId}`, 200)).text();
assert(detailA.includes(`Perfil A ${suffix}`) && detailA.includes("provider-a") && detailA.includes("Presencia digital"), "El detalle A no mostró sus datos reales.");
assert(!detailA.includes(`Perfil B ${suffix}`) && !detailA.includes("provider-b") && !detailA.includes("Marketing"), "El detalle A mezcló datos de B.");

const detailB = await (await expectStatus(identities.platform.client, `/app/internal/organizations/${identities["owner-b"].organizationId}`, 200)).text();
assert(detailB.includes(`Perfil B ${suffix}`) && detailB.includes("provider-b") && detailB.includes("Marketing"), "El detalle B no mostró sus datos reales.");
assert(!detailB.includes(`Perfil A ${suffix}`) && !detailB.includes("provider-a"), "El detalle B mezcló datos de A.");

for (const key of ["inactive", "owner-a", "admin", "member", "normal"]) await expectStatus(identities[key].client, "/app/internal/organizations", 403);

console.log("PASS: listado y detalle global read-only, autorización platform_admin y aislamiento de miembros, perfiles, servicios e integraciones verificados.");
