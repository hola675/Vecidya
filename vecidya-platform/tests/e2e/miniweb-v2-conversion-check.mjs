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
let worker; let output = ""; let orgId; let userId; let mediaFilePath;
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
  const billingAccountId = randomUUID(); const priceId = randomUUID(); const licenseId = randomUUID();
  query(`INSERT INTO billing_account (id,owner_user_id,kind,created_at,updated_at) VALUES (${literal(billingAccountId)},${literal(userId)},'individual',${now},${now}); INSERT INTO license_price (id,plan_code,currency,amount_cents,billing_interval,effective_from,status,created_at,updated_at) VALUES (${literal(priceId)},'cuadra','USD',3900,'monthly',${now},'active',${now},${now}); INSERT INTO organization_license (id,organization_id,billing_account_id,plan_code,price_id,status,started_at,activated_at,created_at,updated_at) VALUES (${literal(licenseId)},${literal(orgId)},${literal(billingAccountId)},'cuadra',${literal(priceId)},'active',${now},${now},${now},${now});`);

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
  const untouchedCreate = await owner.request(endpoint, "POST", { operation: "create", familyKey: "professional-profile", visualVariant: "base" });
  assert.equal(untouchedCreate.status, 201);
  const untouchedSiteId = (await untouchedCreate.json()).siteId;
  const untouchedDraft = await owner.request(`${endpoint}?site=${encodeURIComponent(untouchedSiteId)}`);
  assert.equal(untouchedDraft.status, 200);
  const untouchedDocument = JSON.stringify((await untouchedDraft.json()).state.draft.document);

  // Publicación, categorías y media se verifican también en el Worker real.
  const emptyDocument = JSON.parse(previousDocument);
  emptyDocument.sections = [];
  const emptySave = await owner.request(endpoint, "POST", { operation: "save", siteId: emptySiteId, expectedRevision: 1, document: emptyDocument });
  assert.equal(emptySave.status, 200);
  const emptyPublish = await owner.request(endpoint, "POST", { operation: "publish", siteId: emptySiteId, expectedRevision: 2 });
  assert.equal(emptyPublish.status, 400, "el Worker rechaza la publicación sin portada");

  const mediaId = randomUUID(); const foreignMediaId = randomUUID(); const videoMediaId = randomUUID(); const foreignOrganizationId = randomUUID();
  const objectKey = `organizations/${orgId}/${mediaId}`;
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jSh0AAAAASUVORK5CYII=", "base64");
  mediaFilePath = join(tmpdir(), `vecidya-miniweb-v2-${mediaId}.png`);
  writeFileSync(mediaFilePath, png);
  wrangler(["r2", "object", "put", `vecidya-business-media-prod/${objectKey}`, "--local", "--persist-to", persistenceName, "--file", mediaFilePath, "--content-type", "image/png", "--force"]);
  query(`INSERT INTO business_media_asset (id,organization_id,object_key,purpose,media_type,content_type,size_bytes,alt_text,created_at) VALUES (${literal(mediaId)},${literal(orgId)},${literal(objectKey)},'gallery','image','image/png',${png.length},'Imagen propia',${now}); INSERT INTO business_media_asset (id,organization_id,object_key,purpose,media_type,content_type,size_bytes,alt_text,created_at) VALUES (${literal(videoMediaId)},${literal(orgId)},${literal(`organizations/${orgId}/${videoMediaId}`)},'gallery','video','video/mp4',${png.length},'Video no aceptado',${now}); INSERT INTO organization (id,name,slug,created_at) VALUES (${literal(foreignOrganizationId)},'Organización aislada',${literal(`v2-isolated-${suffix}`)},${now}); INSERT INTO business_media_asset (id,organization_id,object_key,purpose,media_type,content_type,size_bytes,alt_text,created_at) VALUES (${literal(foreignMediaId)},${literal(foreignOrganizationId)},${literal(`organizations/${foreignOrganizationId}/${foreignMediaId}`)},'gallery','image','image/png',${png.length},'Medio ajeno',${now});`);

  const draftDocument = JSON.parse(previousDocument);
  const hero = draftDocument.sections.find((section) => section.type === "hero");
  assert.ok(hero, "el sitio nuevo contiene una portada editable");
  hero.content.title = "Negocio V2 de prueba";
  hero.content.image = { assetId: foreignMediaId, alt: "Medio ajeno" };
  const foreignSave = await owner.request(endpoint, "POST", { operation: "save", siteId: emptySiteId, expectedRevision: 2, document: draftDocument });
  assert.equal(foreignSave.status, 200);
  const foreignPublish = await owner.request(endpoint, "POST", { operation: "publish", siteId: emptySiteId, expectedRevision: 3 });
  assert.equal(foreignPublish.status, 409, "el Worker rechaza medios de otra organización");
  assert.equal((await foreignPublish.json()).code, "MEDIA_NOT_AVAILABLE");

  hero.content.image = { assetId: videoMediaId, alt: "Video no aceptado" };
  const videoSave = await owner.request(endpoint, "POST", { operation: "save", siteId: emptySiteId, expectedRevision: 3, document: draftDocument });
  assert.equal(videoSave.status, 200);
  const videoPublish = await owner.request(endpoint, "POST", { operation: "publish", siteId: emptySiteId, expectedRevision: 4 });
  assert.equal(videoPublish.status, 409, "el Worker no publica videos como imágenes");
  assert.equal((await videoPublish.json()).code, "MEDIA_NOT_AVAILABLE");

  hero.content.image = { assetId: mediaId, alt: "Imagen propia" };
  const validSave = await owner.request(endpoint, "POST", { operation: "save", siteId: emptySiteId, expectedRevision: 4, document: draftDocument });
  assert.equal(validSave.status, 200);
  const publish = await owner.request(endpoint, "POST", { operation: "publish", siteId: emptySiteId, expectedRevision: 5 });
  assert.equal(publish.status, 200, `publicación V2: ${await publish.clone().text()}`);
  const publicPage = await fetch(new URL(`/miniweb/${emptySiteId}`, base));
  assert.equal(publicPage.status, 200);
  const html = await publicPage.text();
  assert.ok(html.includes("Negocio V2 de prueba | Vecidya"), "el título SEO usa el nombre del negocio");
  assert.ok(html.includes(`https://vecidya.com/miniweb/${emptySiteId}`), "canonical usa la ruta pública V2");
  assert.ok((await (await fetch(new URL("/sitemap.xml", base))).text()).includes(`https://vecidya.com/miniweb/${emptySiteId}`), "sitemap incluye el sitio con publicación activa");

  const publicMediaPath = `/media/miniweb/${encodeURIComponent(emptySiteId)}/${encodeURIComponent(mediaId)}`;
  const publicMedia = await fetch(new URL(publicMediaPath, base));
  assert.equal(publicMedia.status, 200);
  assert.equal(publicMedia.headers.get("content-type"), "image/png");
  assert.equal(publicMedia.headers.get("cache-control"), "no-store");
  assert.deepEqual(Buffer.from(await publicMedia.arrayBuffer()), png);
  query(`UPDATE business_media_asset SET is_active=0 WHERE id=${literal(mediaId)};`);
  assert.equal((await fetch(new URL(publicMediaPath, base))).status, 404, "desactivar el medio revoca inmediatamente su entrega");
  query(`UPDATE business_media_asset SET is_active=1 WHERE id=${literal(mediaId)};`);
  assert.equal((await fetch(new URL(publicMediaPath, base))).status, 200, "reactivar el medio permite servir la publicación vigente");
  const unreferencedDocument = JSON.parse(JSON.stringify(draftDocument));
  unreferencedDocument.sections.find((section) => section.type === "hero").content.image = null;
  const unreferencedSave = await owner.request(endpoint, "POST", { operation: "save", siteId: emptySiteId, expectedRevision: 5, document: unreferencedDocument });
  assert.equal(unreferencedSave.status, 200);
  assert.equal((await fetch(new URL(publicMediaPath, base))).status, 200, "guardar un borrador no cambia la publicación activa");
  const unreferencedPublish = await owner.request(endpoint, "POST", { operation: "publish", siteId: emptySiteId, expectedRevision: 6 });
  assert.equal(unreferencedPublish.status, 200);
  assert.equal((await fetch(new URL(publicMediaPath, base))).status, 404, "media deja de servirse al dejar de estar referida");

  const conversion = await owner.request(endpoint, "POST", { operation: "create-from-published-v1", confirm: true, familyKey: "services-studio", visualVariant: "premium" });
  assert.equal(conversion.status, 201, `conversion: ${await conversion.clone().text()}`);
  const convertedBody = await conversion.json(); const convertedId = convertedBody.siteId;
  assert.notEqual(convertedId, emptySiteId);
  assert.equal(convertedBody.imported.hours, 0);
  const preservedDraftResponse = await owner.request(`${endpoint}?site=${encodeURIComponent(untouchedSiteId)}`);
  assert.equal(preservedDraftResponse.status, 200);
  assert.equal(JSON.stringify((await preservedDraftResponse.json()).state.draft.document), untouchedDocument, "conversion must not overwrite an existing V2 draft");
  assert.equal((await fetch(new URL(`/miniweb/${convertedId}`, base))).status, 404, "new draft is not public until explicit publication");
  const crossTenant = await owner.request(`/api/organizations/${randomUUID()}/miniweb-v2`, "POST", { operation: "create-from-published-v1", confirm: true, familyKey: "vecidya-default", visualVariant: "base" });
  assert.equal(crossTenant.status, 403);
  await stopWorker();

  assert.equal(Number(query(`SELECT count(*) AS total FROM miniweb_v2_site WHERE organization_id=${literal(orgId)};`)[0]?.total), 3, "refusal must not create extra sites");
  const converted = query(`SELECT s.*,d.document_json FROM miniweb_v2_site s JOIN miniweb_v2_draft d ON d.site_id=s.id WHERE s.id=${literal(convertedId)};`)[0];
  assert.equal(converted.family_key, "services-studio"); assert.equal(converted.visual_variant, "premium");
  assert.equal(converted.source_organization_id, orgId); assert.equal(Number(converted.source_publication_version), 7);
  assert.equal(Number(converted.conversion_migration_version), 1); assert.equal(converted.conversion_consented_by_user_id, userId);
  assert.ok(Number(converted.conversion_consented_at) > 0);
  const report = JSON.parse(converted.conversion_report_json); assert.equal(report.imported.hours, 0); assert.ok(report.omitted.includes("horario V1 (exclusión absoluta)"));
  const document = JSON.parse(converted.document_json); assert.equal(document.sections.some((section) => section.type === "hours"), false);
  assert.equal(document.sections.find((section) => section.type === "hero").content.title, "Negocio V1");
  assert.equal(Number(query(`SELECT revision FROM miniweb_v2_draft WHERE site_id=${literal(untouchedSiteId)};`)[0]?.revision), 1, "conversion must preserve the previous V2 revision");
  assert.equal(Number(query(`SELECT published_version FROM business_profile_publication WHERE organization_id=${literal(orgId)};`)[0]?.published_version), 7, "conversion must preserve V1 publication");
  console.log("MINIWEB_V2_CHECK_PASS: validación, publicación, media R2 tenant-scoped, metadata, sitemap y conversión V1.");
} finally {
  await stopWorker();
  rmSync(persistence, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 });
}
