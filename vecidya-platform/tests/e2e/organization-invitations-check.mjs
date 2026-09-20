import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
assertLocalBaseUrl();
const suffix = Date.now().toString();
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-7b2-"));
  const file = join(directory, "setup.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute DB --local --file ${file}`], { cwd: process.cwd(), encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });
  if (result.status !== 0) throw new Error(`D1 local falló: ${result.stderr}`);
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
      const [pair] = setCookie.split(";", 1); const [name, ...value] = pair.split("="); this.#cookies.set(name, value.join("="));
    }
    return response;
  }
  json(path, body) { return this.fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
}

async function identity(key) {
  const client = new SessionClient();
  const signUp = await client.json("/api/auth/sign-up/email", { name: `7B2 ${key} ${suffix}`, email: `7b2-${key}-${suffix}@vecidya.test`, password: `test-only-password-${suffix}` });
  assert(signUp.status === 200, `Registro falló para ${key}: ${signUp.status}`);
  const user = (await signUp.json()).user;
  const organization = await client.json("/api/auth/organization/create", { name: `Invitaciones ${key} ${suffix}`, slug: `inv-${key}-${suffix}` });
  assert(organization.status === 200, `Organización falló para ${key}: ${organization.status}`);
  const organizationId = (await organization.json()).id;
  await client.json("/api/auth/organization/set-active", { organizationId });
  return { client, organizationId, userId: user.id, email: user.email };
}

async function status(client, path, expected, options) {
  const response = await client.fetch(path, options);
  assert(response.status === expected, `${path} devolvió ${response.status}; se esperaba ${expected}`);
  return response;
}

const ownerA = await identity("owner-a");
const ownerB = await identity("owner-b");
const memberA = await identity("member-a");
const invitee = await identity("invitee");
const external = await identity("external");
const apiA = `/api/organizations/${ownerA.organizationId}/invitations`;
const apiB = `/api/organizations/${ownerB.organizationId}/invitations`;
const post = (body) => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

executeD1(`INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES ('${crypto.randomUUID()}', '${ownerA.organizationId}', '${memberA.userId}', 'member', ${Date.now()});`);
await status(ownerA.client, apiA, 200);
await status(memberA.client, apiA, 403);
await status(external.client, apiA, 403);
await status(ownerA.client, apiB, 403);
await status(ownerA.client, apiA, 400, post({ operation: "invite", email: `payload-${suffix}@vecidya.test`, role: "owner" }));
await status(ownerA.client, apiA, 503, post({ operation: "invite", email: `delivery-${suffix}@vecidya.test`, role: "member" }));

const invitationId = crypto.randomUUID();
const expiresAt = Date.now() + 86_400_000;
executeD1(`UPDATE user SET email_verified = 1 WHERE id = '${invitee.userId}'; INSERT INTO invitation (id, organization_id, email, role, status, expires_at, created_at, inviter_id) VALUES ('${invitationId}', '${ownerA.organizationId}', '${invitee.email}', 'admin', 'pending', ${expiresAt}, ${Date.now()}, '${ownerA.userId}');`);
await status(invitee.client, `/app/invitations/${invitationId}`, 200);
await status(invitee.client, "/api/auth/organization/accept-invitation", 200, post({ invitationId }));
const members = await (await status(invitee.client, `/api/organizations/${ownerA.organizationId}/members`, 200)).json();
const accepted = members.members.find((member) => member.user.id === invitee.userId);
assert(accepted?.role === "admin", "El rol aceptado no coincide con la invitación");
const platformRows = executeD1(`SELECT id FROM platform_member WHERE user_id = '${invitee.userId}';`);
assert(!platformRows.includes(invitee.userId), "Aceptar una invitación creó autoridad platform_member");

const expiredId = crypto.randomUUID();
executeD1(`INSERT INTO invitation (id, organization_id, email, role, status, expires_at, created_at, inviter_id) VALUES ('${expiredId}', '${ownerB.organizationId}', '${invitee.email}', 'member', 'pending', ${Date.now() - 1000}, ${Date.now()}, '${ownerB.userId}');`);
await status(invitee.client, "/api/auth/organization/accept-invitation", 400, post({ invitationId: expiredId }));

console.log("PASS PARCIAL: autorización, cross-tenant, payload, aceptación, expiración y rol resultante verificados; delivery real bloquea PASS TÉCNICO.");
