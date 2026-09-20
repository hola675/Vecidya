import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const suffix = Date.now().toString();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-7b1-"));
  const file = join(directory, "setup.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute DB --local --file ${file}`], { cwd: process.cwd(), encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(`D1 local falló: ${result.stderr}`);
}

class SessionClient {
  #cookies = new Map();
  constructor(cookies = {}) { for (const [name, value] of Object.entries(cookies)) this.#cookies.set(name, value); }
  serialize() { return Object.fromEntries(this.#cookies); }
  async fetch(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; "));
    const response = await fetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
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
  const signUp = await client.json("/api/auth/sign-up/email", { name: `7B ${key} ${suffix}`, email: `7b-${key}-${suffix}@vecidya.test`, password: `test-only-password-${suffix}` });
  assert(signUp.status === 200, `No se pudo registrar ${key}: ${signUp.status}`);
  const user = (await signUp.json()).user;
  const organization = await client.json("/api/auth/organization/create", { name: `Organización ${key} ${suffix}`, slug: `org-${key}-${suffix}` });
  assert(organization.status === 200, `No se pudo crear la organización de ${key}: ${organization.status}`);
  const organizationId = (await organization.json()).id;
  assert(organizationId && user?.id, `No se resolvieron IDs de ${key}`);
  const active = await client.json("/api/auth/organization/set-active", { organizationId });
  assert(active.status === 200, `No se pudo activar la organización de ${key}: ${active.status}`);
  return { client, organizationId, userId: user.id };
}

async function status(client, path, expected, options) {
  const response = await client.fetch(path, options);
  assert(response.status === expected, `${path} devolvió ${response.status}; se esperaba ${expected}`);
  return response;
}

const fixtureFile = process.env.MEMBERS_FIXTURE_FILE;
const fixture = fixtureFile ? JSON.parse(readFileSync(fixtureFile, "utf8")) : null;
const identities = fixture
  ? Object.fromEntries(Object.entries(fixture.identities).map(([key, value]) => [key, { ...value, client: new SessionClient(value.cookies) }]))
  : {
      "owner-a": await createIdentity("owner-a"),
      "owner-b": await createIdentity("owner-b"),
      "admin-a": await createIdentity("admin-a"),
      "member-a": await createIdentity("member-a"),
      external: await createIdentity("external"),
    };

const ownerA = identities["owner-a"];
const ownerB = identities["owner-b"];
const adminA = identities["admin-a"];
const memberA = identities["member-a"];
const external = identities.external;

if (!fixtureFile) {
  const now = Date.now();
  executeD1(`
    INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES
      ('${crypto.randomUUID()}', '${ownerA.organizationId}', '${adminA.userId}', 'admin', ${now}),
      ('${crypto.randomUUID()}', '${ownerA.organizationId}', '${memberA.userId}', 'member', ${now});
  `);
}

const apiA = `/api/organizations/${ownerA.organizationId}/members`;
const apiB = `/api/organizations/${ownerB.organizationId}/members`;
const post = (body) => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const listA = await status(ownerA.client, apiA, 200);
const listData = await listA.json();
assert(listData.members.some((member) => member.user.id === adminA.userId && member.user.email.includes("admin-a")), "La lista no incluye nombre/correo real del admin");
await status(ownerA.client, apiB, 403);
await status(external.client, apiA, 403);
await status(memberA.client, apiA, 200);
await status(memberA.client, apiA, 403, post({ operation: "update-role", memberId: listData.members.find((member) => member.user.id === memberA.userId).id, role: "owner" }));
await status(memberA.client, apiA, 403, post({ operation: "remove", memberId: listData.members.find((member) => member.user.id === adminA.userId).id }));

const adminMember = listData.members.find((member) => member.user.id === adminA.userId);
const memberMember = listData.members.find((member) => member.user.id === memberA.userId);
const ownerBMember = (await (await status(ownerB.client, apiB, 200)).json()).members.find((member) => member.user.id === ownerB.userId);
await status(adminA.client, apiA, 200);
await status(adminA.client, apiA, 200, post({ operation: "update-role", memberId: memberMember.id, role: "admin" }));
await status(adminA.client, apiA, 200, post({ operation: "remove", memberId: memberMember.id }));
await status(ownerA.client, apiA, 403, post({ operation: "update-role", memberId: ownerBMember.id, role: "member" }));
await status(ownerA.client, apiA, 403, post({ operation: "remove", memberId: ownerBMember.id }));
await status(ownerA.client, apiA, 400, post({ operation: "update-role", memberId: adminMember.id, role: "platform_member" }));
await status(ownerA.client, "/app/organization", 200);

console.log("PASS: 7B.1 members matrix, aislamiento cross-tenant, escalamiento de rol y frontera tenant/platform verificados.");
