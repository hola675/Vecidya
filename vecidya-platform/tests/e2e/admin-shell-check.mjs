import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const suffix = Date.now().toString();

function assert(condition, message) { if (!condition) throw new Error(message); }

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-8a-"));
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
  const signUp = await client.json("/api/auth/sign-up/email", { name: `8A ${key}`, email: `8a-${key}-${suffix}@vecidya.test`, password: `test-only-password-${suffix}` });
  assert(signUp.status === 200, `${key} no pudo registrarse: ${signUp.status}`);
  const organization = await client.json("/api/auth/organization/create", { name: `Organización ${key} ${suffix}`, slug: `org-${key}-${suffix}` });
  assert(organization.status === 200, `${key} no pudo crear organización: ${organization.status}`);
  return { client, organizationId: (await organization.json()).id, userId: (await signUp.clone().json()).user.id };
}

async function expectStatus(client, path, expected) {
  const response = await client.fetch(path);
  assert(response.status === expected, `${path} devolvió ${response.status}; se esperaba ${expected}`);
  return response;
}

const identities = {};
for (const key of ["platform", "inactive", "owner", "admin", "member", "normal"]) identities[key] = await createIdentity(key);
const now = Date.now();
executeD1(`
  INSERT INTO platform_member (id, user_id, role, status, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${identities.platform.userId}', 'platform_admin', 'active', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${identities.inactive.userId}', 'platform_admin', 'inactive', ${now}, ${now});
  INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES
    ('${crypto.randomUUID()}', '${identities.owner.organizationId}', '${identities.admin.userId}', 'admin', ${now}),
    ('${crypto.randomUUID()}', '${identities.owner.organizationId}', '${identities.member.userId}', 'member', ${now});
`);

const shell = await expectStatus(identities.platform.client, "/app/internal", 200);
const shellHtml = await shell.text();
assert(shellHtml.includes("Administración de Vecidya") && shellHtml.includes("Operaciones de plataforma"), "El shell administrativo no mostró su identidad.");
await expectStatus(identities.platform.client, "/app/internal/services", 200);

for (const key of ["inactive", "owner", "admin", "member", "normal"]) {
  await expectStatus(identities[key].client, "/app/internal", 403);
  await expectStatus(identities[key].client, "/app/internal/services", 403);
}

console.log("PASS: shell 8A y administración de servicios protegidos para platform_admin activo; usuarios tenant, normal e inactivo reciben 403.");
