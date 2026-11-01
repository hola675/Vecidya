import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { assertLocalBaseUrl } from "./test-safety.mjs";

const projectDirectory = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const wranglerCli = resolve(projectDirectory, "node_modules/wrangler/bin/wrangler.js");
const persistenceName = `.wrangler/miniweb-v2-conversion-${process.pid}-${Date.now()}`;
const persistence = resolve(projectDirectory, persistenceName);
if (!persistence.startsWith(resolve(projectDirectory, ".wrangler") + sep)) throw new Error("La persistencia debe quedar dentro de .wrangler.");
function wrangler(args, timeout = 600_000) {
  const result = spawnSync(process.execPath, [wranglerCli, ...args], { cwd: projectDirectory, encoding: "utf8", timeout, maxBuffer: 8 * 1024 * 1024, windowsHide: true });
  if (result.status !== 0) throw new Error(`Wrangler terminó con ${result.status}: ${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
function literal(value) { return `'${String(value).replaceAll("'", "''")}'`; }
function query(sql) {
  const dir = mkdtempSync(join(tmpdir(), "vecidya-miniweb-v2-"));
  const file = join(dir, "query.sql");
  writeFileSync(file, sql, "utf8");
  try { return JSON.parse(wrangler(["d1", "execute", "DB", "--local", "--persist-to", persistenceName, "--json", "--file", file])).flatMap((part) => part.results ?? []); }
  finally { rmSync(dir, { recursive: true, force: true }); }
}
async function port() {
  const server = createServer(); server.listen(0, "127.0.0.1");
  await new Promise((resolveListen) => server.once("listening", resolveListen));
  const address = server.address();
  await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
  if (!address || typeof address === "string") throw new Error("No se pudo reservar puerto.");
  return address.port;
}
class Client {
  cookies = new Map();
  constructor(base) { this.base = base; }
  async request(path, method = "GET", body, extra = {}) {
    const headers = new Headers({ origin: this.base, ...extra });
    if (this.cookies.size) headers.set("cookie", [...this.cookies].map(([key, value]) => `${key}=${value}`).join("; "));
    if (body !== undefined) headers.set("content-type", "application/json");
    const response = await fetch(new URL(path, this.base), { method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: "manual" });
    for (const line of response.headers.getSetCookie()) {
      const [pair] = line.split(";", 1); const [name, ...value] = pair.split("="); this.cookies.set(name, value.join("="));
    }
    return response;
  }
}
async function stopWorker() {
  if (worker?.exitCode === null) {
    worker.kill();
    await Promise.race([new Promise((resolveExit) => worker.once("exit", resolveExit)), new Promise((resolveTimeout) => setTimeout(resolveTimeout, 5_000))]);
  }
}

assertLocalBaseUrl("http://127.0.0.1");
const suffix = randomUUID(); const now = Date.now(); const inviterId = randomUUID(); const inviteOrgId = randomUUID(); const invitationId = randomUUID();
const email = `miniweb-v2-owner-${suffix}@vecidya.test`; const password = `local-${randomUUID()}`;
const secret = randomBytes(32).toString("hex"); const base = `http://127.0.0.1:${await port()}`;
let worker; let output = ""; let orgId; let userId;
try {
  wrangler(["d1", "migrations", "apply", "DB", "--local", "--persist-to", persistenceName]);
  query(`INSERT INTO user (id,name,email,email_verified,created_at,updated_at) VALUES (${literal(inviterId)},'V2 conversion inviter',${literal(`inviter-${suffix}@vecidya.test`)},1,${now},${now}); INSERT INTO organization (id,name,slug,created_at) VALUES (${literal(inviteOrgId)},'V2 conversion fixture',${literal(`v2-fixture-${suffix}`)},${now}); INSERT INTO invitation (id,organization_id,email,role,status,expires_at,created_at,inviter_id) VALUES (${literal(invitationId)},${literal(inviteOrgId)},${literal(email)},'member','pending',${now + 3_600_000},${now},${literal(inviterId)});`);
  worker = spawn(process.execPath, [wranglerCli, "dev", "--local", "--persist-to", persistenceName, "--ip", "127.0.0.1", "--port", new URL(base).port, "--var", "APP_ENV:staging", "--var", "EMAIL_PROVIDER:fake", "--var", `APP_URL:${base}`, "--var", `BETTER_AUTH_URL:${base}`, "--show-interactive-dev-session=false", "--log-level", "error"], { cwd: projectDirectory, env: { ...process.env, BETTER_AUTH_SECRET: secret }, stdio: ["ignore", "pipe", "pipe"] });
  worker.stdout.on("data", (chunk) => { output += chunk.toString(); }); worker.stderr.on("data", (chunk) => { output += chunk.toString(); });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (worker.exitCode !== null) throw new Error(`Worker terminó antes de iniciar: ${output}`);
    try { if ((await fetch(`${base}/api/auth/ok`, { signal: AbortSignal.timeout(2000) })).status === 200) { ready = true; break; } } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }
  assert.equal(ready, true, `Worker no inició: ${output}`);
  const owner = new Client(base);
  const signup = await owner.request("/api/auth/sign-up/email", "POST", { name: "MiniWeb V2 owner", email, password }, { "X-Vecidya-Invitation": invitationId });
  assert.equal(signup.status, 200, `signup: ${await signup.clone().text()}`);
  userId = (await signup.json()).user.id;
  const createdOrg = await owner.request("/api/auth/organization/create", "POST", { name: "V2 Conversion Business", slug: `v2-conversion-${suffix}` });
  assert.equal(createdOrg.status, 200, `organization create: ${await createdOrg.clone().text()}`);
  orgId = (await createdOrg.json()).id;
  assert.equal((await owner.request("/api/auth/organization/set-active", "POST", { organizationId: orgId })).status, 200);

  const v1Snapshot = { schemaVersion: 1, profile: { displayName: "Negocio V1", shortDescription: "Perfil publicado", description: "Contenido permitido", phone: "+1 555 0100", publicEmail: "contact@example.test", websiteUrl: "https://example.test", city: "Queens", serviceArea: "Queens" }, hours: [], configuration: { version: 1, templateKey: "vecidya-default", templateVersion: 1, layoutVariant: "standard", modules: [{ type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null }] } };
  const snapshotJson = JSON.stringify(v1Snapshot).replaceAll("'", "''");
  query(`INSERT INTO business_profile_publication (organization_id,draft_revision,published_version,published_slug,snapshot_schema_version,snapshot_json,updated_at) VALUES (${literal(orgId)},1,7,${literal(`v1-${suffix}`)},1,'${snapshotJson}',${now});`);
  const endpoint = `/api/organizations/${orgId}/miniweb-v2`;
  const anonymous = await fetch(new URL(endpoint, base), { method: "POST", headers: { origin: base, "content-type": "application/json" }, body: JSON.stringify({ operation: "create-from-published-v1", confirm: true, familyKey: "vecidya-default", visualVariant: "base" }) });
  assert.notEqual(anonymous.status, 201, "anonymous conversion must be rejected");
  const unconfirmed = await owner.request(endpoint, "POST", { operation: "create-from-published-v1", confirm: false, familyKey: "vecidya-default", visualVariant: "base" });
  assert.equal(unconfirmed.status, 400);

  const empty = await owner.request(endpoint, "POST", { operation: "create", familyKey: "catalog-store", visualVariant: "pro" });
  assert.equal(empty.status, 201);
  const emptySiteId = (await empty.json()).siteId;
  const previousDraft = await owner.request(`${endpoint}?site=${encodeURIComponent(emptySiteId)}`);
  assert.equal(previousDraft.status, 200);
  const previousDocument = JSON.stringify((await previousDraft.json()).state.draft.document);
  const conversion = await owner.request(endpoint, "POST", { operation: "create-from-published-v1", confirm: true, familyKey: "services-studio", visualVariant: "premium" });
  assert.equal(conversion.status, 201, `conversion: ${await conversion.clone().text()}`);
  const convertedBody = await conversion.json(); const convertedId = convertedBody.siteId;
  assert.notEqual(convertedId, emptySiteId);
  assert.equal(convertedBody.imported.hours, 0);
  const preservedDraftResponse = await owner.request(`${endpoint}?site=${encodeURIComponent(emptySiteId)}`);
  assert.equal(preservedDraftResponse.status, 200);
  assert.equal(JSON.stringify((await preservedDraftResponse.json()).state.draft.document), previousDocument, "conversion must not overwrite an existing V2 draft");
  assert.equal((await fetch(new URL(`/miniweb/${convertedId}`, base))).status, 404, "new draft is not public until explicit publication");
  const crossTenant = await owner.request(`/api/organizations/${randomUUID()}/miniweb-v2`, "POST", { operation: "create-from-published-v1", confirm: true, familyKey: "vecidya-default", visualVariant: "base" });
  assert.equal(crossTenant.status, 403);
  await stopWorker();

  assert.equal(Number(query(`SELECT count(*) AS total FROM miniweb_v2_site WHERE organization_id=${literal(orgId)};`)[0]?.total), 2, "refusal must not create extra sites");
  const converted = query(`SELECT s.*,d.document_json FROM miniweb_v2_site s JOIN miniweb_v2_draft d ON d.site_id=s.id WHERE s.id=${literal(convertedId)};`)[0];
  assert.equal(converted.family_key, "services-studio"); assert.equal(converted.visual_variant, "premium");
  assert.equal(converted.source_organization_id, orgId); assert.equal(Number(converted.source_publication_version), 7);
  assert.equal(Number(converted.conversion_migration_version), 1); assert.equal(converted.conversion_consented_by_user_id, userId);
  assert.ok(Number(converted.conversion_consented_at) > 0);
  const report = JSON.parse(converted.conversion_report_json); assert.equal(report.imported.hours, 0); assert.ok(report.omitted.includes("horario V1 (exclusión absoluta)"));
  const document = JSON.parse(converted.document_json); assert.equal(document.sections.some((section) => section.type === "hours"), false);
  assert.equal(document.sections.find((section) => section.type === "hero").content.title, "Negocio V1");
  assert.equal(Number(query(`SELECT revision FROM miniweb_v2_draft WHERE site_id=${literal(emptySiteId)};`)[0]?.revision), 1, "conversion must preserve the previous V2 revision");
  assert.equal(Number(query(`SELECT published_version FROM business_profile_publication WHERE organization_id=${literal(orgId)};`)[0]?.published_version), 7, "conversion must preserve V1 publication");
  console.log("MINIWEB_V2_CONVERSION_PASS: consentimiento, aislamiento, provenance, exclusión de horario y V1/drafts intactos.");
} finally {
  await stopWorker();
  rmSync(persistence, { recursive: true, force: true });
}
