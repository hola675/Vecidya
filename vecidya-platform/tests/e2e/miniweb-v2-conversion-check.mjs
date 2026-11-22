import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { assertLocalBaseUrl } from "./test-safety.mjs";
import { chromium } from "playwright";

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
async function query(sql) {
  const restartWorker = Boolean(worker && worker.exitCode === null);
  // The local D1 CLI and dev Worker share persistence; never access it concurrently.
  if (restartWorker) await stopWorker();
  const dir = mkdtempSync(join(tmpdir(), "vecidya-miniweb-v2-"));
  const file = join(dir, "query.sql");
  writeFileSync(file, sql, "utf8");
  let result;
  try { result = JSON.parse(wrangler(["d1", "execute", "DB", "--local", "--persist-to", persistenceName, "--json", "--file", file])).flatMap((part) => part.results ?? []); }
  finally { rmSync(dir, { recursive: true, force: true }); }
  if (restartWorker) {
    worker = startWorker(base, secret);
    await waitForWorker(base);
  }
  return result;
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
  if (worker) {
    const child = worker;
    if (child.exitCode === null) {
      if (process.platform === "win32") {
        spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { encoding: "utf8", windowsHide: true });
      } else {
        child.kill("SIGINT");
      }
      await Promise.race([new Promise((resolveExit) => child.once("exit", resolveExit)), new Promise((resolveTimeout) => setTimeout(resolveTimeout, 5_000))]);
      if (child.exitCode === null) throw new Error("El Worker local no se detuvo; no se ejecutará Wrangler D1 en paralelo.");
    }
    worker = undefined;
  }
}
function startWorker(base, secret) {
  const child = spawn(process.execPath, [wranglerCli, "dev", "--local", "--persist-to", persistenceName, "--ip", "127.0.0.1", "--port", new URL(base).port, "--var", "APP_ENV:staging", "--var", "EMAIL_PROVIDER:fake", "--var", `APP_URL:${base}`, "--var", `BETTER_AUTH_URL:${base}`, "--show-interactive-dev-session=false", "--log-level", "error"], { cwd: projectDirectory, env: { ...process.env, BETTER_AUTH_SECRET: secret }, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.on("data", (chunk) => { output += chunk.toString(); });
  child.stderr.on("data", (chunk) => { output += chunk.toString(); });
  return child;
}
async function waitForWorker(base) {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (worker.exitCode !== null) throw new Error(`Worker terminó antes de iniciar: ${output}`);
    try { if ((await fetch(`${base}/api/auth/ok`, { signal: AbortSignal.timeout(2000) })).status === 200) { ready = true; break; } } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }
  assert.equal(ready, true, `Worker no inició: ${output}`);
}

assertLocalBaseUrl("http://127.0.0.1");
const suffix = randomUUID(); const now = Date.now(); const inviterId = randomUUID(); const inviteOrgId = randomUUID(); const invitationId = randomUUID();
const email = `miniweb-v2-owner-${suffix}@vecidya.test`; const password = `local-${randomUUID()}`;
const secret = randomBytes(32).toString("hex"); const base = `http://127.0.0.1:${await port()}`;
let worker; let output = ""; let orgId; let userId; let mediaFilePath;
let primaryError;
try {
  wrangler(["d1", "migrations", "apply", "DB", "--local", "--persist-to", persistenceName]);
  await query(`INSERT INTO user (id,name,email,email_verified,created_at,updated_at) VALUES (${literal(inviterId)},'V2 conversion inviter',${literal(`inviter-${suffix}@vecidya.test`)},1,${now},${now}); INSERT INTO organization (id,name,slug,created_at) VALUES (${literal(inviteOrgId)},'V2 conversion fixture',${literal(`v2-fixture-${suffix}`)},${now}); INSERT INTO invitation (id,organization_id,email,role,status,expires_at,created_at,inviter_id) VALUES (${literal(invitationId)},${literal(inviteOrgId)},${literal(email)},'member','pending',${now + 3_600_000},${now},${literal(inviterId)});`);
   worker = startWorker(base, secret);
   await waitForWorker(base);
  const owner = new Client(base);
  const signup = await owner.request("/api/auth/sign-up/email", "POST", { name: "MiniWeb V2 owner", email, password }, { "X-Vecidya-Invitation": invitationId });
  assert.equal(signup.status, 200, `signup: ${await signup.clone().text()}`);
  userId = (await signup.json()).user.id;
  const createdOrg = await owner.request("/api/auth/organization/create", "POST", { name: "V2 Conversion Business", slug: `v2-conversion-${suffix}` });
  assert.equal(createdOrg.status, 200, `organization create: ${await createdOrg.clone().text()}`);
  orgId = (await createdOrg.json()).id;
  assert.equal((await owner.request("/api/auth/organization/set-active", "POST", { organizationId: orgId })).status, 200);
  const billingAccountId = randomUUID(); const priceId = randomUUID(); const licenseId = randomUUID();
  await query(`INSERT INTO billing_account (id,owner_user_id,kind,created_at,updated_at) VALUES (${literal(billingAccountId)},${literal(userId)},'individual',${now},${now}); INSERT INTO license_price (id,plan_code,currency,amount_cents,billing_interval,effective_from,status,created_at,updated_at) VALUES (${literal(priceId)},'cuadra','USD',3900,'monthly',${now},'active',${now},${now}); INSERT INTO organization_license (id,organization_id,billing_account_id,plan_code,price_id,status,started_at,activated_at,created_at,updated_at) VALUES (${literal(licenseId)},${literal(orgId)},${literal(billingAccountId)},'cuadra',${literal(priceId)},'active',${now},${now},${now},${now});`);

   const v1Slug = `v1-${suffix}`;
   const v1Snapshot = { schemaVersion: 1, profile: { slug: v1Slug, displayName: "Negocio V1", shortDescription: "Perfil publicado", description: "Contenido permitido", phone: "+1 555 0100", publicEmail: "contact@example.test", websiteUrl: "https://example.test", city: "Queens", serviceArea: "Queens" }, hours: [], configuration: { version: 1, templateKey: "vecidya-default", templateVersion: 1, layoutVariant: "standard", modules: [{ type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null }] } };
   const snapshotJson = JSON.stringify(v1Snapshot).replaceAll("'", "''");
   await query(`INSERT INTO business_profile (id,organization_id,display_name,slug,status,created_at,updated_at) VALUES (${literal(randomUUID())},${literal(orgId)},'Negocio V1',${literal(v1Slug)},'published',${now},${now}); INSERT INTO business_profile_publication (organization_id,draft_revision,published_version,published_slug,snapshot_schema_version,snapshot_json,updated_at) VALUES (${literal(orgId)},1,7,${literal(v1Slug)},1,'${snapshotJson}',${now});`);
   const v1BeforeConversion = await fetch(new URL(`/vecindario/${v1Slug}`, base));
   assert.equal(v1BeforeConversion.status, 200, "la URL V1 existente debe seguir resolviendo antes del cutover");
   const v1Html = await v1BeforeConversion.text();
   assert.ok(v1Html.includes("Negocio V1"));
   assert.ok(v1Html.includes("© 2026 Vecidya") && v1Html.includes("Versión pública"), "V1 fallback keeps the shared public version footer");
  const endpoint = `/api/organizations/${orgId}/miniweb-v2`;
  const anonymous = await fetch(new URL(endpoint, base), { method: "POST", headers: { origin: base, "content-type": "application/json" }, body: JSON.stringify({ operation: "create-from-published-v1", confirm: true, familyKey: "vecidya-default", visualVariant: "base" }) });
  assert.notEqual(anonymous.status, 201, "anonymous conversion must be rejected");
  const unconfirmed = await owner.request(endpoint, "POST", { operation: "create-from-published-v1", confirm: false, familyKey: "vecidya-default", visualVariant: "base" });
  assert.equal(unconfirmed.status, 400);

  const design = { palette: "bosque", accentColor: "#226354", backgroundColor: "#f1f6ef", textColor: "#19392f",
    font: "editorial", layout: "split", align: "center", imagePosition: "left",
    titleSize: 52, bodySize: 16, spacing: 30, radius: 24, heroHeight: 360 };
  const invalidStyle = await owner.request(endpoint, "POST", { operation: "create", familyKey: "catalog-store", visualVariant: "pro",
    design: { ...design, accentColor: "#ffffff" } });
  assert.equal(invalidStyle.status, 400, "no se puede crear MiniWeb con CTA de contraste insuficiente");
  const empty = await owner.request(endpoint, "POST", { operation: "create", familyKey: "catalog-store", visualVariant: "pro", design });
  assert.equal(empty.status, 201);
   const emptySite = await empty.json(); const emptySiteId = emptySite.siteId; const emptySlug = emptySite.publicSlug;
   assert.match(emptySlug, /^v2-conversion-[a-f0-9-]+-site-[a-f0-9]{8}$/);
  const previousDraft = await owner.request(`${endpoint}?site=${encodeURIComponent(emptySiteId)}`);
  assert.equal(previousDraft.status, 200);
  const previousParsed = (await previousDraft.json()).state.draft.document;
  assert.deepEqual(previousParsed.design, design, "la creación conserva la configuración visual de la organización");
  const previousDocument = JSON.stringify(previousParsed);
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
  const savedDesign = await owner.request(`${endpoint}?site=${encodeURIComponent(emptySiteId)}`);
  assert.equal(savedDesign.status, 200);
  assert.deepEqual((await savedDesign.json()).state.draft.document.design, design,
    "guardar y recargar mantiene el diseño en la misma revisión");
  const emptyPublish = await owner.request(endpoint, "POST", { operation: "publish", siteId: emptySiteId, expectedRevision: 2 });
  assert.equal(emptyPublish.status, 400, "el Worker rechaza la publicación sin portada");

  const mediaId = randomUUID(); const foreignMediaId = randomUUID(); const videoMediaId = randomUUID(); const foreignOrganizationId = randomUUID();
  const objectKey = `organizations/${orgId}/${mediaId}`;
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jSh0AAAAASUVORK5CYII=", "base64");
  mediaFilePath = join(tmpdir(), `vecidya-miniweb-v2-${mediaId}.png`);
  writeFileSync(mediaFilePath, png);
  wrangler(["r2", "object", "put", `vecidya-business-media-prod/${objectKey}`, "--local", "--persist-to", persistenceName, "--file", mediaFilePath, "--content-type", "image/png", "--force"]);
  await query(`INSERT INTO business_media_asset (id,organization_id,object_key,purpose,media_type,content_type,size_bytes,alt_text,created_at) VALUES (${literal(mediaId)},${literal(orgId)},${literal(objectKey)},'gallery','image','image/png',${png.length},'Imagen propia',${now}); INSERT INTO business_media_asset (id,organization_id,object_key,purpose,media_type,content_type,size_bytes,alt_text,created_at) VALUES (${literal(videoMediaId)},${literal(orgId)},${literal(`organizations/${orgId}/${videoMediaId}`)},'gallery','video','video/mp4',${png.length},'Video no aceptado',${now}); INSERT INTO organization (id,name,slug,created_at) VALUES (${literal(foreignOrganizationId)},'Organización aislada',${literal(`v2-isolated-${suffix}`)},${now}); INSERT INTO business_media_asset (id,organization_id,object_key,purpose,media_type,content_type,size_bytes,alt_text,created_at) VALUES (${literal(foreignMediaId)},${literal(foreignOrganizationId)},${literal(`organizations/${foreignOrganizationId}/${foreignMediaId}`)},'gallery','image','image/png',${png.length},'Medio ajeno',${now});`);

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
  const activePublication = (await query(`SELECT active_publication_id FROM miniweb_v2_site WHERE id=${literal(emptySiteId)};`))[0]?.active_publication_id;
  const repeatedPublish = await owner.request(endpoint, "POST", { operation: "publish", siteId: emptySiteId, expectedRevision: 5 });
  assert.equal(repeatedPublish.status, 409, "a repeated publish request for the active revision must conflict");
  assert.equal((await repeatedPublish.json()).code, "REVISION_CONFLICT");
  assert.equal((await query(`SELECT active_publication_id FROM miniweb_v2_site WHERE id=${literal(emptySiteId)};`))[0]?.active_publication_id, activePublication, "a repeated request must preserve the active publication pointer");
   const publicPage = await fetch(new URL(`/vecindario/${emptySlug}`, base));
   assert.equal(publicPage.status, 200);
   const html = await publicPage.text();
   assert.ok(html.includes("Negocio V2 de prueba | Vecidya"), "el título SEO usa el nombre del negocio");
   assert.ok(html.includes(`https://vecidya.com/vecindario/${emptySlug}`), "canonical usa la URL pública V2 de Vecindario");
   assert.ok((await (await fetch(new URL("/sitemap.xml", base))).text()).includes(`https://vecidya.com/vecindario/${emptySlug}`), "sitemap incluye el sitio publicado por slug");
   const idAlias = await fetch(new URL(`/miniweb/${emptySiteId}`, base), { redirect: "manual" });
   assert.equal(idAlias.status, 308, "la URL V2 por ID anterior conserva un alias permanente");
   assert.equal(idAlias.headers.get("location"), `/vecindario/${emptySlug}`);

  const publicMediaPath = `/media/miniweb/${encodeURIComponent(emptySiteId)}/${encodeURIComponent(mediaId)}`;
  const publicMedia = await fetch(new URL(publicMediaPath, base));
  assert.equal(publicMedia.status, 200);
  assert.equal(publicMedia.headers.get("content-type"), "image/png");
  assert.equal(publicMedia.headers.get("cache-control"), "no-store");
  assert.deepEqual(Buffer.from(await publicMedia.arrayBuffer()), png);
  await query(`UPDATE business_media_asset SET is_active=0 WHERE id=${literal(mediaId)};`);
  assert.equal((await fetch(new URL(publicMediaPath, base))).status, 404, "desactivar el medio revoca inmediatamente su entrega");
  await query(`UPDATE business_media_asset SET is_active=1 WHERE id=${literal(mediaId)};`);
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
   assert.equal(convertedBody.publicSlug, v1Slug, "la conversión conserva la URL pública V1 como slug V2");
  assert.notEqual(convertedId, emptySiteId);
  assert.equal(convertedBody.imported.hours, 0);
  const preservedDraftResponse = await owner.request(`${endpoint}?site=${encodeURIComponent(untouchedSiteId)}`);
  assert.equal(preservedDraftResponse.status, 200);
  assert.equal(JSON.stringify((await preservedDraftResponse.json()).state.draft.document), untouchedDocument, "conversion must not overwrite an existing V2 draft");
   assert.equal((await fetch(new URL(`/vecindario/${v1Slug}`, base))).status, 200, "la URL V1 sigue mostrando el perfil legacy mientras V2 sea borrador");
   const crossTenant = await owner.request(`/api/organizations/${randomUUID()}/miniweb-v2`, "POST", { operation: "create-from-published-v1", confirm: true, familyKey: "vecidya-default", visualVariant: "base" });
  assert.equal(crossTenant.status, 403);

  async function createPublishableDraft(title) {
    const response = await owner.request(endpoint, "POST", { operation: "create", familyKey: "professional-profile", visualVariant: "base" });
    assert.equal(response.status, 201, `create publishable draft: ${await response.clone().text()}`);
    const siteId = (await response.json()).siteId;
    const editorResponse = await owner.request(`${endpoint}?site=${encodeURIComponent(siteId)}`);
    assert.equal(editorResponse.status, 200);
    const document = (await editorResponse.json()).state.draft.document;
    document.sections.find((section) => section.type === "hero").content.title = title;
    const saved = await owner.request(endpoint, "POST", { operation: "save", siteId, expectedRevision: 1, document });
    assert.equal(saved.status, 200, `save publishable draft: ${await saved.clone().text()}`);
    return siteId;
  }

  const publishableSites = [await createPublishableDraft("Matriz QA <script>window.__miniwebXss=1</script>")];
  await query(`UPDATE organization_license SET status='suspended' WHERE id=${literal(licenseId)};`);
  const noLicensePublish = await owner.request(endpoint, "POST", { operation: "publish", siteId: publishableSites[0], expectedRevision: 2 });
  assert.equal(noLicensePublish.status, 409, `publication without an effective license must fail closed: ${await noLicensePublish.clone().text()} ${output}`);
  assert.equal((await fetch(new URL(`/miniweb/${publishableSites[0]}`, base))).status, 404, "a blocked draft must remain private");
  await query(`UPDATE organization_license SET status='active' WHERE id=${literal(licenseId)};`);
  console.log("MINIWEB_V2_QA_STAGE: blocked publication without license");

  for (let index = 2; index <= 4; index += 1) publishableSites.push(await createPublishableDraft("Matriz QA <script>window.__miniwebXss=1</script>"));
  const competingPublishes = await Promise.all(publishableSites.map((siteId) => owner.request(endpoint, "POST", { operation: "publish", siteId, expectedRevision: 2 })));
  assert.equal(competingPublishes.filter((response) => response.status === 200).length, 2, "two remaining base slots must be reserved atomically under concurrent publication");
  assert.equal(competingPublishes.filter((response) => response.status === 409).length, 2, "the concurrent publications beyond the two remaining slots must be rejected");
  console.log("MINIWEB_V2_QA_STAGE: atomic owner capacity under concurrent publication");
  const rejectedIndex = competingPublishes.findIndex((response) => response.status === 409);
  const rejectedSiteId = publishableSites[rejectedIndex];
  const publishedPage = await fetch(new URL(`/miniweb/${publishableSites.find((_, index) => competingPublishes[index].status === 200)}`, base));
  assert.equal(publishedPage.status, 200);
  const publishedHtml = await publishedPage.text();
  assert.match(publishedHtml, /Matriz QA &lt;script&gt;window\.__miniwebXss=1&lt;\/script&gt;/, "user content must be escaped in the public renderer");
  assert.doesNotMatch(publishedHtml, /<script>window\.__miniwebXss=1<\/script>/, "content must not inject executable HTML");

  const extensionId = randomUUID();
  await query(`INSERT INTO billing_miniweb_capacity_extension (id,organization_id,billing_account_id,kind,status,starts_at,ends_at,reason,granted_by_user_id,idempotency_key,created_at,updated_at) VALUES (${literal(extensionId)},${literal(orgId)},${literal(billingAccountId)},'cuadra_extra','active',${now},NULL,'QA fixture authorized extension',${literal(userId)},${literal(`qa-${suffix}`)},${now},${now});`);
   const extensionPublish = await owner.request(endpoint, "POST", { operation: "publish", siteId: rejectedSiteId, expectedRevision: 2 });
   assert.equal(extensionPublish.status, 200, "one explicit Cuadra extension must add three publication slots");
   console.log("MINIWEB_V2_QA_STAGE: explicit Cuadra extension and escaped renderer content");

   const convertedDraftResponse = await owner.request(`${endpoint}?site=${encodeURIComponent(convertedId)}`);
   assert.equal(convertedDraftResponse.status, 200);
    const convertedDraft = (await convertedDraftResponse.json()).state.draft;
    const convertedDocument = convertedDraft.document;
    assert.equal(convertedDocument.sections.find((section) => section.type === "hero").content.title, "Negocio V1", "conversion imports the existing V1 title before edits");
    convertedDocument.sections.find((section) => section.type === "hero").content.title = "Negocio V2 convertido";
    const convertedContact = convertedDocument.sections.find((section) => section.type === "contact");
    convertedContact.visible = true;
    convertedContact.content.whatsapp = { phone: "+1555010100", message: "Quiero información" };
    convertedContact.content.form = { title: "Formulario de prueba", introduction: "Cuéntanos qué necesitas.", submitLabel: "Preparar correo" };
    const convertedProducts = convertedDocument.sections.find((section) => section.type === "products");
    convertedProducts.visible = true;
    convertedProducts.content.promotions = [
      { id: "promotion-active", title: "Promoción vigente de prueba", description: "Fixture sintético de contenido con fecha final.", startsOn: null, endsOn: "2099-12-31", terms: "Válida en el fixture de prueba.", cta: null },
      { id: "promotion-expired", title: "Promoción expirada de prueba", description: "No debe mostrarse fuera de vigencia.", startsOn: null, endsOn: "2020-01-01", terms: null, cta: null },
    ];
    convertedDocument.sections.push({ id: randomUUID(), type: "testimonials", schemaVersion: 1, order: convertedDocument.sections.length, visible: true, content: { items: [
      { id: "review-consented", author: "Persona de prueba", quote: "Reseña sintética autorizada para QA.", context: "Fixture", consented: true, sourceLabel: "Fuente de QA", sourceUrl: "https://example.test/review", reviewedOn: "2026-11-19" },
      { id: "review-not-consented", author: "No publicar", quote: "Fixture sin consentimiento.", context: null, consented: false, sourceLabel: null, sourceUrl: null, reviewedOn: null },
    ] } });
    convertedDocument.sections.push({ id: randomUUID(), type: "contact", schemaVersion: 1, order: convertedDocument.sections.length, visible: false, content: { phone: null, email: "hidden-only@example.test", links: [], cta: null, whatsapp: null, form: null } });
    assert.equal((await owner.request(endpoint, "POST", { operation: "save", siteId: convertedId, expectedRevision: convertedDraft.revision, document: convertedDocument })).status, 200);
   assert.equal((await owner.request(endpoint, "POST", { operation: "publish", siteId: convertedId, expectedRevision: convertedDraft.revision + 1 })).status, 200, "la V2 convertida requiere publicación explícita");
    const convertedPublic = await fetch(new URL(`/vecindario/${v1Slug}`, base));
    assert.equal(convertedPublic.status, 200);
    const convertedPublicHtml = await convertedPublic.text();
    assert.ok(convertedPublicHtml.includes("Negocio V2 convertido"), "la URL estable sirve V2 tras el cutover explícito");
    assert.ok(convertedPublicHtml.includes("Promoción vigente de prueba"));
    assert.ok(!convertedPublicHtml.includes("Promoción expirada de prueba"), "promotions outside the UTC validity window stay hidden");
    assert.ok(convertedPublicHtml.includes("https://wa.me/1555010100?text="), "configured WhatsApp opens the intended external channel");
    assert.ok(convertedPublicHtml.includes("Reseña sintética autorizada para QA."));
    assert.ok(!convertedPublicHtml.includes("Fixture sin consentimiento"), "non-consented testimonials remain private");
    assert.ok(!convertedPublicHtml.includes("hidden-only@example.test"), "hidden section content is not serialized to public loader data");
    assert.ok(convertedPublicHtml.includes("Formulario de prueba"));
   const convertedAlias = await fetch(new URL(`/miniweb/${convertedId}`, base), { redirect: "manual" });
   assert.equal(convertedAlias.status, 308);
   assert.equal(convertedAlias.headers.get("location"), `/vecindario/${v1Slug}`);

  const families = ["vecidya-default", "services-studio", "catalog-store", "gastronomy-table", "professional-profile"];
  const variants = ["base", "pro", "premium"];
  const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  function visualDocument(family, variant, exerciseHiddenContact = false) {
    const longText = `${family} ${variant}: experiencia profesional con información clara sobre los servicios, el proceso de atención y las opciones disponibles para cada persona. `.repeat(8).trim();
    const content = {
      hero: { title: `Negocio de ejemplo · ${family} · ${variant}`, subtitle: "Atención local, información transparente y opciones de contacto accesibles.", cta: { label: "Contactar", href: "#contacto" }, image: null },
      about: { headline: "Acerca del negocio", description: longText, blocks: [{ id: "about-1", title: "Nuestra forma de trabajar", body: longText, image: null }] },
      services: { items: Array.from({ length: 4 }, (_, i) => ({ id: `service-${i}`, title: `Servicio ${i + 1}`, description: longText, image: null, cta: null })) },
      products: { items: Array.from({ length: 4 }, (_, i) => ({ id: `product-${i}`, title: `Producto ${i + 1}`, category: "Catálogo", description: longText, image: null, cta: null })) },
      gallery: { images: Array.from({ length: 6 }, (_, i) => ({ assetId: `image-${i}`, alt: `Imagen de ejemplo ${i + 1}`, caption: "Material ilustrativo para revisión visual." })) },
      contact: { phone: "+1 555 0100", email: "hola@example.test", links: [{ label: "Sitio de ejemplo", href: "https://example.test" }], cta: { label: "Enviar correo", href: "mailto:hola@example.test" } },
      location: { address: "Calle de ejemplo 10", city: "Queens", area: "Queens County", mapUrl: "https://maps.example.test/" },
      faq: { items: Array.from({ length: 4 }, (_, i) => ({ id: `faq-${i}`, question: `Pregunta frecuente ${i + 1}`, answer: longText })) },
      team: { people: [{ id: "person-1", name: "Persona de ejemplo", role: "Atención", bio: longText, image: null, consented: true }] },
      certifications: { items: [{ id: "cert-1", issuer: "Entidad de ejemplo", title: "Certificación demostrativa", date: "2026", document: null }] },
      testimonials: { items: [{ id: "quote-1", quote: "Texto de muestra, no es una reseña de cliente.", author: "Persona de prueba", context: null, consented: true }] },
      hours: { schemaVersion: 2, title: "Horario", timezone: "America/New_York", days: weekdays.map((day, i) => ({ day, closed: i === 6, ranges: i === 6 ? [] : [{ start: "09:00", end: "17:00" }] })), note: "Horario de prueba con zona horaria explícita.", exceptions: [{ date: "2026-12-25", closed: true, ranges: [], note: "Cerrado por festivo de ejemplo." }] },
    };
    const sections = Object.entries(content).map(([type, sectionContent], order) => ({ id: `${family}-${variant}-${type}`, type, schemaVersion: 1, order, visible: true, content: sectionContent }));
    if (exerciseHiddenContact) {
      const hiddenContact = sections.find((section) => section.type === "contact");
      hiddenContact.visible = false;
      sections.push({ ...hiddenContact, id: `${family}-${variant}-contact-visible`, order: sections.length, visible: true });
    }
    return { schemaVersion: 1, sections };
  }
  const visualSql = [];
  const visualSites = [];
  for (let extra = 1; extra < 4; extra += 1) {
    visualSql.push(`INSERT INTO billing_miniweb_capacity_extension (id,organization_id,billing_account_id,kind,status,starts_at,ends_at,reason,granted_by_user_id,idempotency_key,created_at,updated_at) VALUES (${literal(randomUUID())},${literal(orgId)},${literal(billingAccountId)},'cuadra_extra','active',${now},NULL,'QA visual matrix capacity fixture',${literal(userId)},${literal(`qa-visual-${suffix}-${extra}`)},${now},${now});`);
  }
  for (const family of families) for (const variant of variants) {
    const siteId = randomUUID(); const publicationId = randomUUID();
     const exercisesHiddenContact = family === families[0] && variant === variants[0];
    const document = JSON.stringify(visualDocument(family, variant, exercisesHiddenContact)).replaceAll("'", "''");
     const publicSlug = `visual-${family}-${variant}-${suffix}`;
     visualSites.push({ family, variant, siteId, publicSlug });
     visualSql.push(`INSERT INTO miniweb_v2_site (id,organization_id,public_slug,owner_user_id,family_key,visual_variant,draft_revision,published_revision,active_publication_id,created_at,updated_at) VALUES (${literal(siteId)},${literal(orgId)},${literal(publicSlug)},${literal(userId)},${literal(family)},${literal(variant)},1,1,${literal(publicationId)},${now},${now}); INSERT INTO miniweb_v2_publication (id,site_id,revision,schema_version,document_json,published_by_user_id,created_at) VALUES (${literal(publicationId)},${literal(siteId)},1,1,'${document}',${literal(userId)},${now});`);
  }
  await query(visualSql.join("\n"));

  const captureDirectory = resolve(projectDirectory, `../.playwright-mcp/miniweb-v2-vis01-${suffix}`);
  mkdirSync(captureDirectory, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
  const visualResults = [];
  try {
    const ownerContext = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await ownerContext.addCookies([...owner.cookies].map(([name, value]) => ({ name, value, url: base, httpOnly: true, sameSite: "Lax" })));
    const editorPage = await ownerContext.newPage();
    const editorResponse = await editorPage.goto(new URL(`/app/miniweb-v2?site=${encodeURIComponent(convertedId)}`, base).toString(), { waitUntil: "networkidle" });
    assert.equal(editorResponse?.status(), 200, "owner can open the V2 editor for the converted site");
    assert.ok((await editorPage.locator("body").innerText()).includes("Secciones de tu sitio"), "the route rendered the authenticated editor, not the login page");
    const sectionSteps = editorPage.getByRole("navigation", { name: "Pasos de edición del sitio" });
    assert.ok((await sectionSteps.innerText()).includes("Productos") && (await sectionSteps.innerText()).includes("Contacto"));
    await sectionSteps.getByRole("button", { name: /Productos/ }).click();
    assert.ok((await editorPage.locator("body").innerText()).includes("Promociones"));
    await sectionSteps.getByRole("button", { name: /Contacto/ }).first().click();
    assert.ok((await editorPage.locator("body").innerText()).includes("WhatsApp"));
    assert.ok((await editorPage.locator("body").innerText()).includes("Formulario de contacto"));
    await sectionSteps.getByRole("button", { name: /Reseñas autorizadas/ }).click();
    assert.ok((await editorPage.locator("body").innerText()).includes("Reseñas autorizadas"));
    await sectionSteps.getByRole("button", { name: /Productos/ }).click();
    const autoSaveResponse = editorPage.waitForResponse((response) => {
      const request = response.request();
      return response.url().includes("/api/organizations/") && request.method() === "POST" && request.postDataJSON()?.operation === "save";
    });
    await editorPage.getByLabel("Título de la promoción").first().fill("Promoción editada desde el editor");
    assert.equal((await autoSaveResponse).status(), 200, "debounced autosave persists the latest nested content to the V2 draft");
    await editorPage.getByText(/Autoguardado completado · revisión/).waitFor();
    await sectionSteps.getByRole("button", { name: /Contacto/ }).first().click();
    const contactAutoSaveResponse = editorPage.waitForResponse((response) => response.url().includes("/api/organizations/") && response.request().method() === "POST" && response.request().postDataJSON()?.operation === "save");
    await editorPage.getByLabel("Instrucción breve").fill("Editado desde el editor en navegador.");
    assert.equal((await contactAutoSaveResponse).status(), 200, "autosave in another step uses the latest document snapshot");
    await editorPage.getByLabel("Título del formulario").fill("Formulario guardado por el botón");
    const explicitSaveResponse = editorPage.waitForResponse((response) => {
      const request = response.request();
      return response.url().includes("/api/organizations/") && request.method() === "POST" && request.postDataJSON()?.operation === "save";
    });
    await editorPage.getByRole("button", { name: "Guardar cambios" }).first().click();
    assert.equal((await explicitSaveResponse).status(), 200, "Guardar changes uses the same CAS write path as autosave");
    const editorStateResponse = await owner.request(`${endpoint}?site=${encodeURIComponent(convertedId)}`);
    const editorState = (await editorStateResponse.json()).state;
    assert.equal(editorState.draft.document.sections.find((section) => section.type === "products").content.promotions[0].title, "Promoción editada desde el editor");
    assert.equal(editorState.draft.document.sections.find((section) => section.type === "contact").content.form.introduction, "Editado desde el editor en navegador.");
    assert.equal(editorState.draft.document.sections.find((section) => section.type === "contact").content.form.title, "Formulario guardado por el botón");
    const stillPublished = await fetch(new URL(`/vecindario/${v1Slug}`, base));
    const stillPublishedHtml = await stillPublished.text();
    assert.ok(stillPublishedHtml.includes("Promoción vigente de prueba"), "editing nested content does not alter the active publication");
    assert.ok(!stillPublishedHtml.includes("Promoción editada desde el editor"));
    assert.ok(stillPublishedHtml.includes("Formulario de prueba"), "autosaved draft content does not leak into the active publication");

    await editorPage.getByRole("button", { name: /Revisar y publicar revisión/ }).click();
    const reviewHeading = editorPage.getByRole("heading", { name: /Revisión previa · revisión/ });
    await reviewHeading.waitFor();
    const reviewPublishButton = editorPage.getByRole("button", { name: /Confirmar revisión y publicar revisión/ });
    assert.equal(await reviewPublishButton.isDisabled(), true, "the self-review confirmation is required before publishing");
    await editorPage.getByLabel(/Revisé la vista previa guardada/).check();
    let publishRequestCount = 0;
    editorPage.on("request", (request) => {
      if (request.method() === "POST" && request.url().includes("/api/organizations/") && request.postDataJSON()?.operation === "publish") publishRequestCount += 1;
    });
    editorPage.once("dialog", (dialog) => { assert.equal(dialog.type(), "confirm"); void dialog.dismiss(); });
    await reviewPublishButton.click();
    assert.equal(publishRequestCount, 0, "canceling publication does not send a publish request");
    const publishResponse = editorPage.waitForResponse((response) => response.url().includes("/api/organizations/") && response.request().method() === "POST" && response.request().postDataJSON()?.operation === "publish");
    editorPage.once("dialog", (dialog) => { assert.equal(dialog.type(), "confirm"); void dialog.accept(); });
    await reviewPublishButton.click();
    assert.equal((await publishResponse).status(), 200, "an acknowledged review explicitly publishes the current CAS revision");
    assert.equal(publishRequestCount, 1);
    const reviewedPublication = await fetch(new URL(`/vecindario/${v1Slug}`, base));
    const reviewedPublicationHtml = await reviewedPublication.text();
    assert.ok(reviewedPublicationHtml.includes("Promoción editada desde el editor"), "the explicitly reviewed publication becomes public");
    assert.ok(reviewedPublicationHtml.includes("Formulario guardado por el botón"));

    const routePattern = "**/api/organizations/**/miniweb-v2";
    let abortNextSave = true;
    let networkSaveAttemptCount = 0;
    const abortOneSave = async (route) => {
      const request = route.request();
      if (request.method() === "POST" && request.postDataJSON()?.operation === "save") networkSaveAttemptCount += 1;
      if (abortNextSave && request.method() === "POST" && request.postDataJSON()?.operation === "save") {
        abortNextSave = false;
        await route.abort("failed");
        return;
      }
      await route.continue();
    };
    await editorPage.route(routePattern, abortOneSave);
    await editorPage.getByLabel("Instrucción breve").fill("Edición que conserva el valor local ante error de red.");
    await editorPage.getByText(/No se pudo confirmar el guardado/).waitFor();
    assert.equal(await editorPage.getByLabel("Instrucción breve").inputValue(), "Edición que conserva el valor local ante error de red.");
    await assert.rejects(
      editorPage.waitForRequest((request) => request.method() === "POST" && request.url().includes("/api/organizations/") && request.postDataJSON()?.operation === "save", { timeout: 1200 }),
      (error) => error.name === "TimeoutError",
      "autosave must not silently retry a failed network operation",
    );
    assert.equal(networkSaveAttemptCount, 1);
    await editorPage.unroute(routePattern, abortOneSave);
    const retrySave = editorPage.waitForResponse((response) => response.url().includes("/api/organizations/") && response.request().method() === "POST" && response.request().postDataJSON()?.operation === "save");
    await editorPage.getByRole("button", { name: "Guardar cambios" }).first().click();
    assert.equal((await retrySave).status(), 200, "an explicit retry saves the retained local value after the simulated network failure");

    let releaseHeldSave;
    let captureHeldSave;
    const heldSaveReached = new Promise((resolve) => { captureHeldSave = resolve; });
    const heldSaveGate = new Promise((resolve) => { releaseHeldSave = resolve; });
    let hasHeldSave = false;
    const holdFirstSave = async (route) => {
      const request = route.request();
      if (!hasHeldSave && request.method() === "POST" && request.postDataJSON()?.operation === "save") {
        hasHeldSave = true;
        captureHeldSave(request.postDataJSON());
        await heldSaveGate;
      }
      await route.continue();
    };
    await editorPage.route(routePattern, holdFirstSave);
    await editorPage.getByLabel("Instrucción breve").fill("Primer snapshot antes de seguir escribiendo.");
    const heldSnapshot = await heldSaveReached;
    assert.equal(heldSnapshot.document.sections.find((section) => section.type === "contact").content.form.introduction, "Primer snapshot antes de seguir escribiendo.");
    await editorPage.getByLabel("Título del formulario").fill("Título añadido durante el primer save");
    const firstSnapshotResponsePromise = editorPage.waitForResponse((response) => response.request().method() === "POST" && response.request().postDataJSON()?.operation === "save" && response.request().postDataJSON()?.document.sections.find((section) => section.type === "contact")?.content.form.introduction === "Primer snapshot antes de seguir escribiendo.");
    releaseHeldSave();
    const firstSnapshotResponse = await firstSnapshotResponsePromise;
    assert.equal(firstSnapshotResponse.status(), 200);
    const firstSnapshotPayload = await firstSnapshotResponse.json();
    const secondSnapshotResponse = await editorPage.waitForResponse((response) => response.request().method() === "POST" && response.request().postDataJSON()?.operation === "save" && response.request().postDataJSON()?.document.sections.find((section) => section.type === "contact")?.content.form.title === "Título añadido durante el primer save");
    assert.equal(secondSnapshotResponse.status(), 200, "edits typed while a CAS write is in flight are saved by a later serialized request");
    const secondSnapshotRequest = secondSnapshotResponse.request().postDataJSON();
    assert.equal(secondSnapshotRequest.expectedRevision, firstSnapshotPayload.revision, "the follow-up save uses the revision returned by the preceding save");
    await editorPage.unroute(routePattern, holdFirstSave);
    const concurrentEditState = (await (await owner.request(`${endpoint}?site=${encodeURIComponent(convertedId)}`)).json()).state;
    assert.equal(concurrentEditState.draft.document.sections.find((section) => section.type === "contact").content.form.introduction, "Primer snapshot antes de seguir escribiendo.");
    assert.equal(concurrentEditState.draft.document.sections.find((section) => section.type === "contact").content.form.title, "Título añadido durante el primer save");

    let releaseConflictRequest;
    let signalConflictRequest;
    const conflictRequestReached = new Promise((resolve) => { signalConflictRequest = resolve; });
    const conflictRequestGate = new Promise((resolve) => { releaseConflictRequest = resolve; });
    let holdNextSave = true;
    const holdOneSave = async (route) => {
      const request = route.request();
      if (holdNextSave && request.method() === "POST" && request.postDataJSON()?.operation === "save") {
        holdNextSave = false;
        signalConflictRequest(request.postDataJSON());
        await conflictRequestGate;
      }
      await route.continue();
    };
    await editorPage.route(routePattern, holdOneSave);
    await editorPage.getByLabel("Instrucción breve").fill("Edición local que entrará en conflicto.");
    const staleBrowserSave = await conflictRequestReached;
    const latestStateResponse = await owner.request(`${endpoint}?site=${encodeURIComponent(convertedId)}`);
    const latestState = (await latestStateResponse.json()).state;
    const externalDocument = structuredClone(latestState.draft.document);
    externalDocument.sections.find((section) => section.type === "contact").content.form.introduction = "Edición remota de otro cliente.";
    const externalSave = await owner.request(endpoint, "POST", { operation: "save", siteId: convertedId, expectedRevision: latestState.draft.revision, document: externalDocument });
    assert.equal(externalSave.status, 200, `external revision fixture: ${await externalSave.clone().text()}`);
    assert.equal(staleBrowserSave.expectedRevision, latestState.draft.revision, "the browser save is holding the revision the other client will advance");
    releaseConflictRequest();
    await editorPage.getByText(/El borrador cambió en otra sesión/).waitFor();
    assert.equal(await editorPage.getByLabel("Instrucción breve").inputValue(), "Edición local que entrará en conflicto.", "a CAS conflict preserves the local text");
    const conflictReload = editorPage.getByRole("button", { name: /Cargar la revisión más reciente/ });
    editorPage.once("dialog", (dialog) => { assert.equal(dialog.type(), "confirm"); void dialog.accept(); });
    await conflictReload.click();
    await editorPage.waitForFunction((expected) => {
      const label = [...document.querySelectorAll("label")].find((element) => element.textContent?.includes("Instrucción breve"));
      return label?.querySelector("textarea")?.value === expected;
    }, "Edición remota de otro cliente.");
    const conflictStateResponse = await owner.request(`${endpoint}?site=${encodeURIComponent(convertedId)}`);
    assert.equal((await conflictStateResponse.json()).state.draft.document.sections.find((section) => section.type === "contact").content.form.introduction, "Edición remota de otro cliente.");
    await editorPage.unroute(routePattern, holdOneSave);
    await ownerContext.close();

    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    for (const site of visualSites) {
       for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1366, height: 900 }, { width: 1920, height: 1080 }]) {
        await page.setViewportSize(viewport);
        let response;
        try {
           response = await page.goto(new URL(`/vecindario/${site.publicSlug}`, base).toString(), { waitUntil: "load", timeout: 15_000 });
        } catch (error) {
          throw new Error(`No se pudo cargar ${site.family}/${site.variant}/${viewport.width}; Worker exit=${worker.exitCode}; ${output}`, { cause: error });
         }
         assert.equal(response?.status(), 200, `visual matrix route ${site.family}/${site.variant}`);
         assert.equal(await page.locator("main").count(), 1, "public MiniWeb must have exactly one main landmark");
         const platformFooter = await page.locator(".platform-footer").textContent();
         assert.ok(platformFooter?.includes("© 2026 Vecidya") && platformFooter.includes("Versión pública"), "public MiniWeb renders the shared version footer");
         await page.locator(".miniweb-v2 > header h1").waitFor();
        const inspection = await page.evaluate(() => {
          const siteRoot = document.querySelector(".miniweb-v2");
          const heading = siteRoot?.querySelector("h1");
          const card = siteRoot?.querySelector(":scope > header");
          const links = [...(siteRoot?.querySelectorAll("a") ?? [])];
          const rgb = (value) => {
            const hex = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
            if (hex) {
              const expanded = hex.length === 3 ? [...hex].map((digit) => `${digit}${digit}`).join("") : hex;
              return [0, 2, 4].map((offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16));
            }
            return value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
          };
          const luminance = (value) => rgb(value).map((v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
          const contrast = (a, b) => { const values = [luminance(a), luminance(b)].sort((x, y) => y - x); return (values[0] + 0.05) / (values[1] + 0.05); };
          const rootStyle = siteRoot ? getComputedStyle(siteRoot) : null;
          const headingStyle = heading ? getComputedStyle(heading) : null;
          const linkStyle = links[0] ? getComputedStyle(links[0]) : null;
          // The hero uses layered gradients, so backgroundColor is transparent.
          // Compare against the declared opaque card color rather than treating
          // transparency as black (which creates a false contrast failure).
          const background = rootStyle?.getPropertyValue("--mw2-card").trim() || "#fff";
          const linkBackground = linkStyle?.backgroundColor && linkStyle.backgroundColor !== "rgba(0, 0, 0, 0)"
            ? linkStyle.backgroundColor
            : background;
          return {
            width: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            sectionCount: siteRoot?.querySelectorAll(":scope > section").length ?? 0,
            headingCount: siteRoot?.querySelectorAll("h1").length ?? 0,
            contactAnchorCount: document.querySelectorAll("#contacto").length,
            contactAnchorHeading: siteRoot?.querySelector("#contacto h2")?.textContent ?? null,
            imageAltValid: [...document.querySelectorAll("img")].every((image) => image.hasAttribute("alt")),
            linkTargetsValid: links.every((link) => { const href = link.getAttribute("href") ?? ""; return href.startsWith("#") || (href.startsWith("/") && !href.startsWith("//")) || /^(https?:|mailto:|tel:)/.test(href); }),
            headingColor: headingStyle?.color,
            contrastBackground: background,
            linkContrastBackground: linkBackground,
            textContrast: rootStyle && headingStyle ? contrast(headingStyle.color, background) : 0,
            linkContrast: linkStyle ? contrast(linkStyle.color, linkBackground) : 0,
            motion: headingStyle ? { animation: headingStyle.animationDuration, transition: headingStyle.transitionDuration } : null,
          };
        });
        assert.ok(inspection.scrollWidth <= viewport.width, `horizontal overflow ${site.family}/${site.variant}/${viewport.width}: ${JSON.stringify(inspection)}`);
        assert.equal(inspection.sectionCount, 11, "the renderer must preserve visible sections (hero is header)");
        assert.equal(inspection.headingCount, 1, "each public page has one h1");
        assert.equal(inspection.contactAnchorCount, 1, "the contact CTA has exactly one rendered target");
        assert.equal(inspection.contactAnchorHeading, "Contacto", "the contact anchor belongs to a visible contact section");
        assert.equal(inspection.imageAltValid, true);
        assert.equal(inspection.linkTargetsValid, true);
        assert.ok(inspection.textContrast >= 4.5, `text contrast below AA: ${JSON.stringify(inspection)}`);
        assert.ok(inspection.linkContrast >= 4.5, `link contrast below AA: ${JSON.stringify(inspection)}`);
         assert.ok(parseFloat(inspection.motion.animation) <= 0.0001, `reduced motion leaves no meaningful animation: ${JSON.stringify(inspection.motion)}`);
        assert.ok(parseFloat(inspection.motion.transition) <= 0.01, "reduced motion disables transitions");
        const filename = `${site.family}-${site.variant}-${viewport.width}.png`;
        await page.screenshot({ path: join(captureDirectory, filename), fullPage: true });
        visualResults.push({ family: site.family, variant: site.variant, viewport, file: filename, inspection });
      }
    }
    const keyboardPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
     await keyboardPage.goto(new URL(`/vecindario/${visualSites[0].publicSlug}`, base).toString(), { waitUntil: "networkidle" });
    let reachedMiniWebLink = false;
    for (let tab = 0; tab < 12 && !reachedMiniWebLink; tab += 1) {
      await keyboardPage.keyboard.press("Tab");
      reachedMiniWebLink = await keyboardPage.evaluate(() => document.querySelector(".miniweb-v2")?.contains(document.activeElement) && document.activeElement?.tagName === "A");
    }
    assert.equal(reachedMiniWebLink, true, "keyboard navigation reaches public MiniWeb links");
    const contactFormResponse = await page.goto(new URL(`/vecindario/${v1Slug}`, base).toString(), { waitUntil: "networkidle" });
    assert.equal(contactFormResponse?.status(), 200);
    assert.equal(await page.locator(".miniweb-v2__contact-form").count(), 1, "the contact form renders on the stable public URL");
    let formPostRequests = 0;
    page.on("request", (request) => {
      if (request.method() === "POST" && new URL(request.url()).origin === new URL(base).origin) formPostRequests += 1;
    });
    await page.getByLabel("Nombre", { exact: true }).fill("Visitante QA");
    await page.getByLabel("Correo electrónico", { exact: true }).fill("visitor@example.test");
    await page.getByLabel("Mensaje", { exact: true }).fill("Consulta de prueba desde el navegador");
    await page.getByRole("button", { name: "Preparar correo" }).click();
    assert.equal(await page.locator('.miniweb-v2__contact-form a[href^="mailto:"]').count(), 0, "form consent is required before preparing a mail draft");
    await page.getByLabel(/Acepto enviar este mensaje/).check();
    await page.getByRole("button", { name: "Preparar correo" }).click();
    const preparedEmail = page.locator('.miniweb-v2__contact-form a[href^="mailto:"]');
    await preparedEmail.waitFor();
    const preparedHref = await preparedEmail.getAttribute("href");
    assert.ok(preparedHref?.startsWith("mailto:contact@example.test?"));
    assert.ok(preparedHref?.includes(encodeURIComponent("Consulta de prueba desde el navegador")));
    assert.equal(formPostRequests, 0, "the message is prepared for the visitor's email client; no CRM/server submission occurs");
    writeFileSync(join(captureDirectory, "manifest.json"), JSON.stringify({ capturedAt: new Date().toISOString(), familyCount: families.length, variantCount: variants.length, viewportCount: 5, captureCount: visualResults.length, keyboard: "PASS", results: visualResults }, null, 2));
  } finally {
    await browser.close();
  }
  console.log(`MINIWEB_V2_VISUAL_MATRIX: ${visualResults.length} captures in ${captureDirectory}`);
  await stopWorker();

  assert.equal(Number((await query(`SELECT count(*) AS total FROM miniweb_v2_site WHERE organization_id=${literal(orgId)};`))[0]?.total), 3 + publishableSites.length + visualSites.length, "refusal must not create extra sites beyond the explicitly seeded visual matrix");
  const converted = (await query(`SELECT s.*,d.document_json FROM miniweb_v2_site s JOIN miniweb_v2_draft d ON d.site_id=s.id WHERE s.id=${literal(convertedId)};`))[0];
  assert.equal(converted.family_key, "services-studio"); assert.equal(converted.visual_variant, "premium");
  assert.equal(converted.source_organization_id, orgId); assert.equal(Number(converted.source_publication_version), 7);
  assert.equal(Number(converted.conversion_migration_version), 1); assert.equal(converted.conversion_consented_by_user_id, userId);
  assert.ok(Number(converted.conversion_consented_at) > 0);
  const report = JSON.parse(converted.conversion_report_json); assert.equal(report.imported.hours, 0); assert.ok(report.omitted.includes("horario V1 (exclusión absoluta)"));
  const document = JSON.parse(converted.document_json); assert.equal(document.sections.some((section) => section.type === "hours"), false);
   assert.equal(document.sections.find((section) => section.type === "hero").content.title, "Negocio V2 convertido", "editing the converted V2 draft preserves its latest title");
  assert.equal(Number((await query(`SELECT revision FROM miniweb_v2_draft WHERE site_id=${literal(untouchedSiteId)};`))[0]?.revision), 1, "conversion must preserve the previous V2 revision");
  assert.equal(Number((await query(`SELECT published_version FROM business_profile_publication WHERE organization_id=${literal(orgId)};`))[0]?.published_version), 7, "conversion must preserve V1 publication");
  console.log("MINIWEB_V2_CHECK_PASS: validación, publicación, media R2 tenant-scoped, metadata, sitemap y conversión V1.");
} catch (error) {
  primaryError = error;
  throw error;
} finally {
  let workerStopped = !worker;
  try { await stopWorker(); }
  catch (cleanupError) {
    if (primaryError) console.error("MINIWEB_V2_WORKER_CLEANUP_FAILED", cleanupError);
    else throw cleanupError;
  }
  workerStopped = !worker;
  if (workerStopped) rmSync(persistence, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 });
  else console.error(`MINIWEB_V2_PERSISTENCE_RETAINED ${persistence}`);
}
