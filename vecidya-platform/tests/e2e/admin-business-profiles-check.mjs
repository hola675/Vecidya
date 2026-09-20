import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const suffix = Date.now().toString();
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-8c-"));
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
  const email = `8c-${key}-${suffix}@vecidya.test`;
  const signUp = await client.json("/api/auth/sign-up/email", { name: `8C ${key}`, email, password: `test-only-password-${suffix}` });
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
const profileAId = crypto.randomUUID();
const profileBId = crypto.randomUUID();
executeD1(`
  INSERT INTO platform_member (id, user_id, role, status, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${identities.platform.userId}', 'platform_admin', 'active', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${identities.inactive.userId}', 'platform_admin', 'inactive', ${now}, ${now});
  INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', '${identities.admin.userId}', 'admin', ${now}),
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', '${identities.member.userId}', 'member', ${now});
  INSERT INTO business_profile (id, organization_id, display_name, slug, short_description, category, city, country, status, created_at, updated_at) VALUES
    ('${profileAId}', '${identities["owner-a"].organizationId}', 'Perfil A ${suffix}', 'perfil-a-${suffix}', 'Descripción A', 'Presencia digital', 'Madrid', 'España', 'published', ${now}, ${now}),
    ('${profileBId}', '${identities["owner-b"].organizationId}', 'Perfil B ${suffix}', 'perfil-b-${suffix}', NULL, NULL, NULL, NULL, 'draft', ${now}, ${now});
  INSERT INTO organization_service (id, organization_id, service_id, status, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${identities["owner-a"].organizationId}', 'service-presence', 'active', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${identities["owner-b"].organizationId}', 'service-marketing', 'pending', ${now}, ${now});
`);

const listing = await expectStatus(identities.platform.client, "/app/internal/businesses", 200);
const listingHtml = await listing.text();
assert(listingHtml.includes(`Perfil A ${suffix}`) && listingHtml.includes(`Perfil B ${suffix}`), "El listado no mostró los perfiles reales.");
assert(listingHtml.includes("Publicado") && listingHtml.includes("Borrador") && listingHtml.includes("100"), `El listado no mostró estado/completitud reales: ${listingHtml.match(/Publicado|Borrador|100/g)?.join(",") ?? "sin coincidencias"}`);
assert(listingHtml.includes(`/vecindario/perfil-a-${suffix}`) && !listingHtml.includes(`/vecindario/perfil-b-${suffix}`), "El listado mostró enlace público para un borrador.");

const detailA = await (await expectStatus(identities.platform.client, `/app/internal/businesses/${profileAId}`, 200)).text();
assert(detailA.includes(`Perfil A ${suffix}`) && detailA.includes("Organización owner-a") && detailA.includes("Presencia digital") && detailA.includes(`/vecindario/perfil-a-${suffix}`), "El detalle A no mostró sus datos reales.");
assert(!detailA.includes(`Perfil B ${suffix}`) && !detailA.includes("Marketing"), "El detalle A mezcló datos de B.");

const detailB = await (await expectStatus(identities.platform.client, `/app/internal/businesses/${profileBId}`, 200)).text();
assert(detailB.includes(`Perfil B ${suffix}`) && detailB.includes("Descripción corta") && detailB.includes("Categoría"), "El detalle B no mostró el estado incompleto.");
assert(!detailB.includes(`/vecindario/perfil-b-${suffix}`) && !detailB.includes(`Perfil A ${suffix}`), "El detalle B mostró enlace público o datos de A.");

for (const key of ["inactive", "owner-a", "admin", "member", "normal"]) {
  await expectStatus(identities[key].client, "/app/internal/businesses", 403);
  await expectStatus(identities[key].client, "/app/internal/businesses/no-access", 403);
}

console.log("PASS: administración global read-only de Business Profiles, autorización, aislamiento A/B, completitud y enlaces públicos verificados.");
