import { writeFileSync } from "node:fs";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const output = process.env.MEMBERS_FIXTURE_FILE;
if (!output) throw new Error("MEMBERS_FIXTURE_FILE es requerido");
const suffix = Date.now().toString();
function assert(condition, message) { if (!condition) throw new Error(message); }
class SessionClient {
  #cookies = new Map();
  serialize() { return Object.fromEntries(this.#cookies); }
  async json(path, body) {
    const headers = new Headers({ "content-type": "application/json", origin: baseUrl });
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies].map(([k, v]) => `${k}=${v}`).join("; "));
    const response = await fetch(new URL(path, baseUrl), { method: "POST", headers, body: JSON.stringify(body) });
    for (const value of response.headers.getSetCookie()) { const [pair] = value.split(";", 1); const [name, ...parts] = pair.split("="); this.#cookies.set(name, parts.join("=")); }
    return response;
  }
}
async function createIdentity(key) {
  const client = new SessionClient();
  const signUp = await client.json("/api/auth/sign-up/email", { name: `7B ${key} ${suffix}`, email: `7b-${key}-${suffix}@vecidya.test`, password: `test-only-password-${suffix}` });
  assert(signUp.status === 200, `No se pudo registrar ${key}: ${signUp.status}`);
  const user = (await signUp.json()).user;
  const organization = await client.json("/api/auth/organization/create", { name: `Organización ${key} ${suffix}`, slug: `org-${key}-${suffix}` });
  assert(organization.status === 200, `No se pudo crear la organización de ${key}: ${organization.status}`);
  const organizationId = (await organization.json()).id;
  const active = await client.json("/api/auth/organization/set-active", { organizationId });
  assert(active.status === 200, `No se pudo activar la organización de ${key}: ${active.status}`);
  return { organizationId, userId: user.id, cookies: client.serialize() };
}
const identities = {};
for (const key of ["owner-a", "owner-b", "admin-a", "member-a", "external"]) identities[key] = await createIdentity(key);
writeFileSync(output, JSON.stringify({ identities }, null, 2));
console.log(`SETUP PASS: fixture escrito en ${output}`);
