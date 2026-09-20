import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const suffix = Date.now().toString();
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-8e-"));
  const file = join(directory, "setup.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute DB --local --file ${file}`], { cwd: process.cwd(), encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(`D1 local falló: ${result.stderr}`);
}

class SessionClient {
  #cookies = new Map();
  async fetch(path, options = {}) {
    const headers = new Headers(options.headers); headers.set("origin", baseUrl);
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; "));
    let response;
    for (let attempt = 0; attempt < 3; attempt += 1) { try { response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" }); break; } catch (error) { if (attempt === 2) throw error; await new Promise((resolve) => setTimeout(resolve, 250)); } }
    for (const setCookie of response.headers.getSetCookie()) { const [pair] = setCookie.split(";", 1); const [name, ...value] = pair.split("="); this.#cookies.set(name, value.join("=")); }
    return response;
  }
  json(path, body) { return this.fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
}

async function createIdentity(key) {
  const client = new SessionClient();
  const email = `8e-${key}-${suffix}@vecidya.test`;
  const signUp = await client.json("/api/auth/sign-up/email", { name: `8E ${key}`, email, password: `test-only-password-${suffix}` });
  assert(signUp.status === 200, `${key} no pudo registrarse: ${signUp.status}`);
  const userId = (await signUp.json()).user.id;
  const organization = await client.json("/api/auth/organization/create", { name: `Organización ${key} ${suffix}`, slug: `org-${key}-${suffix}` });
  assert(organization.status === 200, `${key} no pudo crear organización: ${organization.status}`);
  return { client, organizationId: (await organization.json()).id, userId };
}

async function expectStatus(client, path, expected) { const response = await client.fetch(path); assert(response.status === expected, `${path} devolvió ${response.status}; se esperaba ${expected}`); return response; }

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
  INSERT INTO integration_connection (id, organization_id, provider, external_id, status, metadata, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', 'external-provider', 'external-a-${suffix}', 'active', '{"region":"local-a"}', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${identities["owner-b"].organizationId}', 'external-provider', 'external-b-${suffix}', 'pending', '{"region":"local-b"}', ${now}, ${now});
`);

const listing = await (await expectStatus(identities.platform.client, "/app/internal/integrations", 200)).text();
assert(listing.includes(`Organización owner-a ${suffix}`) && listing.includes(`external-a-${suffix}`) && listing.includes("Activa"), "El listado no mostró la integración A correctamente.");
assert(listing.includes(`Organización owner-b ${suffix}`) && listing.includes(`external-b-${suffix}`) && listing.includes("Pendiente"), "El listado no mostró la integración B correctamente.");
assert(!listing.includes("local-a") && !listing.includes("local-b"), "El overview expuso metadata sin necesidad.");

const selectedA = await (await expectStatus(identities.platform.client, `/app/internal/integrations?organizationId=${identities["owner-a"].organizationId}`, 200)).text();
assert(selectedA.includes("Organización seleccionada") && selectedA.includes(`Organización owner-a ${suffix}`), "El contexto de organización no se mostró.");
const detailA = await (await expectStatus(identities.platform.client, `/app/internal/organizations/${identities["owner-a"].organizationId}`, 200)).text();
assert(detailA.includes(`/app/internal/integrations?organizationId=${identities["owner-a"].organizationId}`) && detailA.includes(`external-a-${suffix}`), "El detalle A no enlazó o mostró su integración.");
assert(!detailA.includes(`external-b-${suffix}`), "El detalle A mezcló la integración B.");

for (const key of ["inactive", "owner-a", "admin", "member", "normal"]) {
  await expectStatus(identities[key].client, "/app/internal/integrations", 403);
  await expectStatus(identities[key].client, `/app/internal/integrations?organizationId=${identities["owner-a"].organizationId}`, 403);
}

console.log("PASS: overview global read-only de integraciones, autorización platform_admin, asociación A/B y metadata no expuesta verificados.");
