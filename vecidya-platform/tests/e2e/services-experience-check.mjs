import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const d1Database = process.env.D1_DATABASE_NAME ?? "DB";
const suffix = Date.now().toString();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-7d-"));
  const file = join(directory, "setup.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute ${d1Database} --local --file ${file}`], { cwd: process.cwd(), encoding: "utf8" });
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
}

async function createIdentity() {
  const client = new SessionClient();
  const signUp = await client.json("/api/auth/sign-up/email", {
    name: `7D Owner ${suffix}`,
    email: `7d-owner-${suffix}@vecidya.test`,
    password: `test-only-password-${suffix}`,
  });
  assert(signUp.status === 200, `No se pudo registrar el propietario: ${signUp.status}`);
  return client;
}

async function createOrganization(client, key) {
  const response = await client.json("/api/auth/organization/create", {
    name: `Organización ${key} ${suffix}`,
    slug: `org-${key}-${suffix}`,
  });
  assert(response.status === 200, `No se pudo crear la organización ${key}: ${response.status}`);
  return (await response.json()).id;
}

async function servicesPage(client, organizationId) {
  const active = await client.json("/api/auth/organization/set-active", { organizationId });
  assert(active.status === 200, `No se pudo activar la organización ${organizationId}: ${active.status}`);
  const response = await client.fetch("/app/services");
  assert(response.status === 200, `/app/services devolvió ${response.status}`);
  return response.text();
}

const client = await createIdentity();
const organizationA = await createOrganization(client, "A");
const organizationB = await createOrganization(client, "B");
const organizationEmpty = await createOrganization(client, "empty");
const now = Date.now();

executeD1(`
  INSERT INTO organization_service (id, organization_id, service_id, status, created_at, updated_at) VALUES
    ('${crypto.randomUUID()}', '${organizationA}', 'service-presence', 'active', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${organizationA}', 'service-crm', 'active', ${now}, ${now}),
    ('${crypto.randomUUID()}', '${organizationB}', 'service-marketing', 'pending', ${now}, ${now});
`);

const pageA = await servicesPage(client, organizationA);
assert(pageA.includes("Presencia digital") && pageA.includes("CRM") && pageA.includes("Activo"), "A no mostró sus servicios activos.");
assert(!pageA.includes("Marketing"), "A mostró el servicio de B.");
assert(!pageA.includes("Abrir CRM") && !pageA.includes("pipeline") && !pageA.includes("oportunidades"), "A mostró capacidades CRM fuera de alcance.");

const pageB = await servicesPage(client, organizationB);
assert(pageB.includes("Marketing") && pageB.includes("Pendiente"), "B no mostró Marketing pendiente.");
assert(!pageB.includes("Presencia digital") && !pageB.includes("CRM"), "B conservó servicios de A después del cambio de organización.");

const emptyPage = await servicesPage(client, organizationEmpty);
assert(emptyPage.includes("Aún no hay servicios asociados"), "La organización sin servicios no mostró empty state.");

console.log("PASS: servicios reales, estados humanizados, aislamiento A/B, cambio de tenant, CRM sin herramienta y empty state verificados.");
