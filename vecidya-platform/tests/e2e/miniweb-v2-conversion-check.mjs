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
  const noLicensePublish = await owner.request(endpoint, "POST", { operation: "publish", siteId: publishableSites[0], expectedRevision: 2 });
  assert.equal(noLicensePublish.status, 409, `publication without an effective license must fail closed: ${await noLicensePublish.clone().text()} ${output}`);
  assert.equal((await fetch(new URL(`/miniweb/${publishableSites[0]}`, base))).status, 404, "a blocked draft must remain private");
  console.log("MINIWEB_V2_QA_STAGE: blocked publication without license");

  const billingAccountId = randomUUID();
  query(`INSERT INTO billing_account (id,owner_user_id,kind,created_at,updated_at) VALUES (${literal(billingAccountId)},${literal(userId)},'individual',${now},${now}); INSERT INTO organization_license (id,organization_id,billing_account_id,plan_code,price_id,status,started_at,activated_at,created_at,updated_at) SELECT ${literal(randomUUID())},${literal(orgId)},${literal(billingAccountId)},'cuadra',id,'active',${now},${now},${now},${now} FROM license_price WHERE plan_code='cuadra' AND status='active' LIMIT 1;`);
  for (let index = 2; index <= 4; index += 1) publishableSites.push(await createPublishableDraft("Matriz QA <script>window.__miniwebXss=1</script>"));
  const competingPublishes = await Promise.all(publishableSites.map((siteId) => owner.request(endpoint, "POST", { operation: "publish", siteId, expectedRevision: 2 })));
  assert.equal(competingPublishes.filter((response) => response.status === 200).length, 3, "only three concurrent publications may consume the base owner capacity");
  assert.equal(competingPublishes.filter((response) => response.status === 409).length, 1, "the fourth concurrent publication must be rejected at the final slot");
  console.log("MINIWEB_V2_QA_STAGE: atomic owner capacity under concurrent publication");
  const rejectedIndex = competingPublishes.findIndex((response) => response.status === 409);
  const rejectedSiteId = publishableSites[rejectedIndex];
  const publishedPage = await fetch(new URL(`/miniweb/${publishableSites.find((_, index) => competingPublishes[index].status === 200)}`, base));
  assert.equal(publishedPage.status, 200);
  const publishedHtml = await publishedPage.text();
  assert.match(publishedHtml, /Matriz QA &lt;script&gt;window\.__miniwebXss=1&lt;\/script&gt;/, "user content must be escaped in the public renderer");
  assert.doesNotMatch(publishedHtml, /<script>window\.__miniwebXss=1<\/script>/, "content must not inject executable HTML");

  const extensionId = randomUUID();
  query(`INSERT INTO billing_miniweb_capacity_extension (id,organization_id,billing_account_id,kind,status,starts_at,ends_at,reason,granted_by_user_id,idempotency_key,created_at,updated_at) VALUES (${literal(extensionId)},${literal(orgId)},${literal(billingAccountId)},'cuadra_extra','active',${now},NULL,'QA fixture authorized extension',${literal(userId)},${literal(`qa-${suffix}`)},${now},${now});`);
  const extensionPublish = await owner.request(endpoint, "POST", { operation: "publish", siteId: rejectedSiteId, expectedRevision: 2 });
  assert.equal(extensionPublish.status, 200, "one explicit Cuadra extension must add three publication slots");
  console.log("MINIWEB_V2_QA_STAGE: explicit Cuadra extension and escaped renderer content");

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
    visualSites.push({ family, variant, siteId });
    const exercisesHiddenContact = family === families[0] && variant === variants[0];
    const document = JSON.stringify(visualDocument(family, variant, exercisesHiddenContact)).replaceAll("'", "''");
    visualSql.push(`INSERT INTO miniweb_v2_site (id,organization_id,owner_user_id,family_key,visual_variant,draft_revision,published_revision,active_publication_id,created_at,updated_at) VALUES (${literal(siteId)},${literal(orgId)},${literal(userId)},${literal(family)},${literal(variant)},1,1,${literal(publicationId)},${now},${now}); INSERT INTO miniweb_v2_publication (id,site_id,revision,schema_version,document_json,published_by_user_id,created_at) VALUES (${literal(publicationId)},${literal(siteId)},1,1,'${document}',${literal(userId)},${now});`);
  }
  query(visualSql.join("\n"));

  const captureDirectory = resolve(projectDirectory, `../.playwright-mcp/miniweb-v2-vis01-${suffix}`);
  mkdirSync(captureDirectory, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
  const visualResults = [];
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    for (const site of visualSites) {
      for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
        await page.setViewportSize(viewport);
        const response = await page.goto(new URL(`/miniweb/${site.siteId}`, base).toString(), { waitUntil: "networkidle" });
        assert.equal(response?.status(), 200, `visual matrix route ${site.family}/${site.variant}`);
        await page.locator(".miniweb-v2 > header h1").waitFor();
        const inspection = await page.evaluate(() => {
          const siteRoot = document.querySelector(".miniweb-v2");
          const heading = siteRoot?.querySelector("h1");
          const card = siteRoot?.querySelector(":scope > header");
          const links = [...(siteRoot?.querySelectorAll("a") ?? [])];
          const rgb = (value) => value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
          const luminance = (value) => rgb(value).map((v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
          const contrast = (a, b) => { const values = [luminance(a), luminance(b)].sort((x, y) => y - x); return (values[0] + 0.05) / (values[1] + 0.05); };
          const rootStyle = siteRoot ? getComputedStyle(siteRoot) : null;
          const headingStyle = heading ? getComputedStyle(heading) : null;
          const linkStyle = links[0] ? getComputedStyle(links[0]) : null;
          const background = card ? getComputedStyle(card).backgroundColor : "rgb(255,255,255)";
          return {
            width: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            sectionCount: siteRoot?.querySelectorAll(":scope > section").length ?? 0,
            headingCount: siteRoot?.querySelectorAll("h1").length ?? 0,
            contactAnchorCount: document.querySelectorAll("#contacto").length,
            contactAnchorHeading: siteRoot?.querySelector("#contacto h2")?.textContent ?? null,
            imageAltValid: [...document.querySelectorAll("img")].every((image) => image.hasAttribute("alt")),
            linkTargetsValid: links.every((link) => { const href = link.getAttribute("href") ?? ""; return href.startsWith("#") || (href.startsWith("/") && !href.startsWith("//")) || /^(https?:|mailto:|tel:)/.test(href); }),
            textContrast: rootStyle && headingStyle ? contrast(headingStyle.color, background) : 0,
            linkContrast: linkStyle ? contrast(linkStyle.color, background) : 0,
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
        assert.equal(inspection.motion.animation, "0s", "reduced motion disables animations");
        assert.equal(inspection.motion.transition, "0s", "reduced motion disables transitions");
        const filename = `${site.family}-${site.variant}-${viewport.width}.png`;
        await page.screenshot({ path: join(captureDirectory, filename), fullPage: true });
        visualResults.push({ family: site.family, variant: site.variant, viewport, file: filename, inspection });
      }
    }
    const keyboardPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await keyboardPage.goto(new URL(`/miniweb/${visualSites[0].siteId}`, base).toString(), { waitUntil: "networkidle" });
    let reachedMiniWebLink = false;
    for (let tab = 0; tab < 12 && !reachedMiniWebLink; tab += 1) {
      await keyboardPage.keyboard.press("Tab");
      reachedMiniWebLink = await keyboardPage.evaluate(() => document.querySelector(".miniweb-v2")?.contains(document.activeElement) && document.activeElement?.tagName === "A");
    }
    assert.equal(reachedMiniWebLink, true, "keyboard navigation reaches public MiniWeb links");
    writeFileSync(join(captureDirectory, "manifest.json"), JSON.stringify({ capturedAt: new Date().toISOString(), familyCount: families.length, variantCount: variants.length, viewportCount: 3, captureCount: visualResults.length, keyboard: "PASS", results: visualResults }, null, 2));
  } finally {
    await browser.close();
  }
  console.log(`MINIWEB_V2_VISUAL_MATRIX: ${visualResults.length} captures in ${captureDirectory}`);
  await stopWorker();

  assert.equal(Number(query(`SELECT count(*) AS total FROM miniweb_v2_site WHERE organization_id=${literal(orgId)};`)[0]?.total), 2 + publishableSites.length + visualSites.length, "refusal must not create extra sites beyond the explicitly seeded visual matrix");
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
  rmSync(persistence, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
}
