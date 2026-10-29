import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { randomBytes, randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { learnArticles } from "../../app/content/learn.ts";
import { getLearnEditorialIdentity } from "../../app/content/learn-publication.ts";
import { assertLocalBaseUrl } from "./test-safety.mjs";

const projectDirectory = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const wranglerCli = resolve(projectDirectory, "node_modules/wrangler/bin/wrangler.js");
const persistenceName = `.wrangler/aprende-entitlement-${process.pid}-${Date.now()}`;
const persistence = resolve(projectDirectory, persistenceName);
const persistenceRoot = resolve(projectDirectory, ".wrangler") + sep;
if (!persistence.startsWith(persistenceRoot)) throw new Error("La persistencia D1 debe quedar dentro de .wrangler.");
if (!existsSync(wranglerCli)) throw new Error("Falta Wrangler local.");

function runWrangler(args, timeout = 600_000) {
  const result = spawnSync(process.execPath, [wranglerCli, ...args], { cwd: projectDirectory, encoding: "utf8", timeout, maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`Wrangler terminó con ${result.status}. ${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function sqlLiteral(value) { return `'${String(value).replaceAll("'", "''")}'`; }
function stringLeaves(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringLeaves);
  if (value && typeof value === "object") return Object.values(value).flatMap(stringLeaves);
  return [];
}
function assertNoProtectedBody(html, fragments, label) {
  for (const fragment of fragments) assert.equal(html.includes(fragment), false, `${label} filtró: ${fragment.slice(0, 90)}`);
}
function query(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-learn-entitlement-"));
  const file = join(directory, "query.sql");
  writeFileSync(file, sql, "utf8");
  try {
    return JSON.parse(runWrangler(["d1", "execute", "DB", "--local", "--persist-to", persistenceName, "--json", "--file", file])).flatMap((result) => result.results ?? []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

async function getPort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await new Promise((resolveListening) => server.once("listening", resolveListening));
  const address = server.address();
  await new Promise((resolveClosed, reject) => server.close((error) => error ? reject(error) : resolveClosed()));
  if (!address || typeof address === "string") throw new Error("No se pudo reservar puerto local.");
  return address.port;
}

async function workerReady(url, worker) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (worker.exitCode !== null) throw new Error(`Worker terminó antes de iniciar: ${worker.output}`);
    try {
      const response = await fetch(`${url}/api/auth/ok`, { signal: AbortSignal.timeout(3000) });
      if (response.status === 200) return;
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }
  throw new Error(`Worker local no respondió: ${worker.output}`);
}

class Client {
  cookies = new Map();
  constructor(baseUrl) { this.baseUrl = baseUrl; }
  #headers(origin = this.baseUrl) {
    const headers = new Headers({ origin });
    if (this.cookies.size) headers.set("cookie", [...this.cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    return headers;
  }
  #saveCookies(response) {
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(";", 1);
      const [name, ...value] = pair.split("=");
      this.cookies.set(name, value.join("="));
    }
  }
  async signup(email, invitationId) {
    const response = await fetch(new URL("/api/auth/sign-up/email", this.baseUrl), {
      method: "POST",
      headers: { "content-type": "application/json", origin: this.baseUrl, "X-Vecidya-Invitation": invitationId },
      body: JSON.stringify({ name: email.split("@")[0], email, password: `cert-${randomUUID()}` }),
      redirect: "manual",
    });
    this.#saveCookies(response);
    const body = await response.text();
    assert.equal(response.status, 200, `Registro de fixture ${email}: ${response.status} ${body.slice(0, 250)}`);
    return JSON.parse(body).user;
  }
  request(path, method = "GET", origin = this.baseUrl, body) {
    const headers = this.#headers(origin);
    if (typeof body === "string") headers.set("content-type", "application/json");
    return fetch(new URL(path, this.baseUrl), { method, headers, body, redirect: "manual" });
  }
}

assertLocalBaseUrl("http://127.0.0.1");
const now = Date.now();
const suffix = randomUUID();
const actorId = randomUUID();
const orgA = randomUUID();
const orgB = randomUUID();
const orgExpired = randomUUID();
const orgSuspended = randomUUID();
const orgNoLifecycle = randomUUID();
const emails = Object.fromEntries(["owner-a", "owner-b", "collaborator", "admin-a", "billing-owner", "owner-expired", "owner-suspended", "owner-no-lifecycle"].map((label) => [label, `${label}-${suffix}@vecidya.test`]));
const invitations = Object.fromEntries(Object.keys(emails).map((label) => [label, randomUUID()]));
const organizations = { "owner-a": orgA, "owner-b": orgB, collaborator: orgA, "admin-a": orgA, "billing-owner": orgB, "owner-expired": orgExpired, "owner-suspended": orgSuspended, "owner-no-lifecycle": orgNoLifecycle };
const secret = randomBytes(32).toString("hex");
const port = await getPort();
const baseUrl = `http://127.0.0.1:${port}`;
let worker;
let workerOutput = "";

try {
  runWrangler(["d1", "migrations", "apply", "DB", "--local", "--persist-to", persistenceName]);
  assert.equal(Number(query("SELECT count(*) AS total FROM sqlite_master WHERE type='table' AND name='organization_learn_access_grant';")[0]?.total), 1, "La migración 0031 crea la tabla de grants en D1 local limpia.");
  assert.equal(Number(query("SELECT count(*) AS total FROM sqlite_master WHERE type='table' AND name IN ('learn_guide_progress','learn_section_progress','learn_favorite');")[0]?.total), 3, "La migración 0032 crea el progreso personal y favoritos.");
  assert.equal(Number(query("SELECT count(*) AS total FROM sqlite_master WHERE type='table' AND name IN ('learn_sync_device','learn_operation_receipt');")[0]?.total), 2, "La migración 0033 crea cursores por dispositivo y recibos idempotentes.");
  query(`
    INSERT INTO user (id,name,email,email_verified,created_at,updated_at)
      VALUES (${sqlLiteral(actorId)},'Learn fixture actor',${sqlLiteral(`learn-actor-${suffix}@vecidya.test`)},1,${now},${now});
    INSERT INTO organization (id,name,slug,created_at) VALUES
      (${sqlLiteral(orgA)},'Learn A',${sqlLiteral(`learn-a-${suffix}`)},${now}),
      (${sqlLiteral(orgB)},'Learn B',${sqlLiteral(`learn-b-${suffix}`)},${now}),
      (${sqlLiteral(orgExpired)},'Learn expired',${sqlLiteral(`learn-expired-${suffix}`)},${now}),
      (${sqlLiteral(orgSuspended)},'Learn suspended',${sqlLiteral(`learn-suspended-${suffix}`)},${now}),
      (${sqlLiteral(orgNoLifecycle)},'Learn missing lifecycle',${sqlLiteral(`learn-no-lifecycle-${suffix}`)},${now});
    INSERT INTO invitation (id,organization_id,email,role,status,expires_at,created_at,inviter_id) VALUES
      ${Object.entries(emails).map(([label, email]) => `(${sqlLiteral(invitations[label])},${sqlLiteral(organizations[label])},${sqlLiteral(email)},'member','pending',${now + 3_600_000},${now},${sqlLiteral(actorId)})`).join(",\n")};
  `);
  const guideId = randomUUID();
  const sectionId = randomUUID();
  query(`
    INSERT INTO learn_guide_progress (user_id,guide_id,content_revision,reset_epoch,version) VALUES (${sqlLiteral(actorId)},${sqlLiteral(guideId)},2,0,1);
    INSERT INTO learn_section_progress (user_id,guide_id,section_id,content_revision) VALUES (${sqlLiteral(actorId)},${sqlLiteral(guideId)},${sqlLiteral(sectionId)},2);
    INSERT INTO learn_favorite (user_id,guide_id) VALUES (${sqlLiteral(actorId)},${sqlLiteral(guideId)});
  `);
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_section_progress WHERE user_id=${sqlLiteral(actorId)};`)[0]?.total), 1, "La sección pertenece a la cuenta que la marcó.");
  query(`DELETE FROM learn_guide_progress WHERE user_id=${sqlLiteral(actorId)} AND guide_id=${sqlLiteral(guideId)};`);
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_section_progress WHERE user_id=${sqlLiteral(actorId)};`)[0]?.total), 0, "Al reiniciar la guía, sus checks se pueden retirar sin afectar favoritos.");
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_favorite WHERE user_id=${sqlLiteral(actorId)} AND guide_id=${sqlLiteral(guideId)};`)[0]?.total), 1, "El favorito persiste independientemente del progreso.");

  worker = spawn(process.execPath, [wranglerCli, "dev", "--local", "--persist-to", persistenceName, "--ip", "127.0.0.1", "--port", String(port), "--var", "APP_ENV:staging", "--var", "EMAIL_PROVIDER:fake", "--var", "LEARN_OPERATION_RECEIPT_PURGE_ENABLED:true", "--var", "LEARN_OPERATION_RECEIPT_PURGE_APPROVED:true", "--var", `APP_URL:${baseUrl}`, "--var", `BETTER_AUTH_URL:${baseUrl}`, "--show-interactive-dev-session=false", "--log-level", "error"], {
    cwd: projectDirectory,
    env: { ...process.env, BETTER_AUTH_SECRET: secret },
    stdio: ["ignore", "pipe", "pipe"],
  });
  worker.stdout.on("data", (chunk) => { workerOutput += chunk.toString(); });
  worker.stderr.on("data", (chunk) => { workerOutput += chunk.toString(); });
  await workerReady(baseUrl, worker);

  const clients = Object.fromEntries(Object.keys(emails).map((label) => [label, new Client(baseUrl)]));
  const identities = {};
  for (const label of Object.keys(emails)) identities[label] = await clients[label].signup(emails[label], invitations[label]);

  query(`
    INSERT INTO member (id,organization_id,user_id,role,created_at) VALUES
      (${sqlLiteral(randomUUID())},${sqlLiteral(orgA)},${sqlLiteral(identities["owner-a"].id)},'owner',${now}),
      (${sqlLiteral(randomUUID())},${sqlLiteral(orgB)},${sqlLiteral(identities["owner-b"].id)},'owner',${now}),
      (${sqlLiteral(randomUUID())},${sqlLiteral(orgA)},${sqlLiteral(identities.collaborator.id)},'admin',${now}),
      (${sqlLiteral(randomUUID())},${sqlLiteral(orgB)},${sqlLiteral(identities.collaborator.id)},'member',${now}),
      (${sqlLiteral(randomUUID())},${sqlLiteral(orgA)},${sqlLiteral(identities["admin-a"].id)},'admin',${now}),
      (${sqlLiteral(randomUUID())},${sqlLiteral(orgExpired)},${sqlLiteral(identities["owner-expired"].id)},'owner',${now}),
      (${sqlLiteral(randomUUID())},${sqlLiteral(orgSuspended)},${sqlLiteral(identities["owner-suspended"].id)},'owner',${now}),
      (${sqlLiteral(randomUUID())},${sqlLiteral(orgNoLifecycle)},${sqlLiteral(identities["owner-no-lifecycle"].id)},'owner',${now});
    UPDATE session SET active_organization_id=${sqlLiteral(orgA)} WHERE user_id=${sqlLiteral(identities.collaborator.id)};
    INSERT INTO platform_organization_lifecycle (organization_id,status,intended_owner_email,owner_user_id,created_by,updated_by,created_at,updated_at) VALUES
      (${sqlLiteral(orgA)},'active',${sqlLiteral(emails["owner-a"])},${sqlLiteral(identities["owner-a"].id)},${sqlLiteral(actorId)},${sqlLiteral(actorId)},${now},${now}),
      (${sqlLiteral(orgB)},'active',${sqlLiteral(emails["owner-b"])},${sqlLiteral(identities["owner-b"].id)},${sqlLiteral(actorId)},${sqlLiteral(actorId)},${now},${now}),
      (${sqlLiteral(orgExpired)},'active',${sqlLiteral(emails["owner-expired"])},${sqlLiteral(identities["owner-expired"].id)},${sqlLiteral(actorId)},${sqlLiteral(actorId)},${now},${now}),
      (${sqlLiteral(orgSuspended)},'suspended',${sqlLiteral(emails["owner-suspended"])},${sqlLiteral(identities["owner-suspended"].id)},${sqlLiteral(actorId)},${sqlLiteral(actorId)},${now},${now});
    INSERT INTO billing_account (id,owner_user_id,kind,name,created_at,updated_at) VALUES
      (${sqlLiteral(randomUUID())},${sqlLiteral(identities["owner-a"].id)},'individual','Learn A',${now},${now}),
      (${sqlLiteral(randomUUID())},${sqlLiteral(identities["billing-owner"].id)},'individual','Billed by nonmember',${now},${now}),
      (${sqlLiteral(randomUUID())},${sqlLiteral(identities["owner-expired"].id)},'individual','Expired',${now},${now}),
      (${sqlLiteral(randomUUID())},${sqlLiteral(identities["owner-suspended"].id)},'individual','Suspended',${now},${now});
    INSERT INTO organization_license (id,organization_id,billing_account_id,plan_code,price_id,status,started_at,activated_at,ends_at,created_at,updated_at) VALUES
      (${sqlLiteral(randomUUID())},${sqlLiteral(orgA)},(SELECT id FROM billing_account WHERE owner_user_id=${sqlLiteral(identities["owner-a"].id)}),'cuadra','license-price-cuadra-v1','active',${now - 1_000},${now - 1_000},NULL,${now},${now}),
      (${sqlLiteral(randomUUID())},${sqlLiteral(orgB)},(SELECT id FROM billing_account WHERE owner_user_id=${sqlLiteral(identities["billing-owner"].id)}),'barrio','license-price-barrio-v1','active',${now - 1_000},${now - 1_000},NULL,${now},${now}),
      (${sqlLiteral(randomUUID())},${sqlLiteral(orgExpired)},(SELECT id FROM billing_account WHERE owner_user_id=${sqlLiteral(identities["owner-expired"].id)}),'ciudad','license-price-ciudad-v1','active',${now - 86_400_000},${now - 86_400_000},${now - 1_000},${now},${now}),
      (${sqlLiteral(randomUUID())},${sqlLiteral(orgSuspended)},(SELECT id FROM billing_account WHERE owner_user_id=${sqlLiteral(identities["owner-suspended"].id)}),'cuadra','license-price-cuadra-v1','active',${now - 1_000},${now - 1_000},NULL,${now},${now});
  `);

  const protectedSlug = "como-probar-un-asistente-de-ia-con-supervision-humana";
  const protectedText = "Un asistente de IA no necesita empezar atendiendo todo.";
  const protectedArticle = learnArticles.find((article) => article.slug === protectedSlug);
  assert.ok(protectedArticle, "La guía protegida existe en el catálogo fuente.");
  const previewText = new Set([protectedArticle.title, protectedArticle.category, protectedArticle.excerpt, protectedArticle.image, protectedArticle.imageAlt]);
  const protectedFragments = [...new Set(stringLeaves(protectedArticle.sections))]
    .filter((fragment) => fragment.trim().length >= 24 && !previewText.has(fragment));
  const licensedUrl = `/aprende/${protectedSlug}`;
  const unauthenticated = await fetch(new URL(licensedUrl, baseUrl), { redirect: "manual" });
  const unauthenticatedBody = await unauthenticated.text();
  assert.equal(unauthenticated.status, 200, `La vista previa protegida debe responder sin cuerpo completo: ${unauthenticated.status} ${unauthenticated.url}; body=${unauthenticatedBody.slice(0, 700)}`);
  assert.equal(unauthenticated.headers.get("cache-control"), "private, no-store", `Respuesta anónima: headers=${JSON.stringify([...unauthenticated.headers])}; body=${unauthenticatedBody.slice(0, 500)}`);
  assertNoProtectedBody(unauthenticatedBody, protectedFragments, "Preview anónima");

  const free = await fetch(new URL("/aprende/dominio-hosting-sitio-web-como-funcionan", baseUrl), { redirect: "manual" });
  assert.equal(free.status, 200, "Las guías always_free siguen disponibles sin sesión.");

  const deniedAdmin = await clients["admin-a"].request(licensedUrl);
  assert.equal(deniedAdmin.status, 200, "admin sin grant recibe vista previa, no cuerpo completo.");
  assert.equal(deniedAdmin.headers.get("cache-control"), "private, no-store");
  assertNoProtectedBody(await deniedAdmin.text(), protectedFragments, "Preview admin sin grant");

  const ownerBBody = await clients["owner-b"].request(licensedUrl);
  assert.equal(ownerBBody.status, 200, "Owner con licencia activa accede sin grant.");
  assert.equal((await ownerBBody.text()).includes(protectedText), true);
  const guideArticle = learnArticles.find((article) => article.slug === protectedSlug);
  const guideIdentity = getLearnEditorialIdentity(guideArticle);
  const progressForm = new FormData();
  progressForm.set("guideId", guideIdentity.guideId);
  progressForm.set("sectionId", guideIdentity.sections[0].sectionId);
  progressForm.set("intent", "check");
  assert.equal((await clients["owner-b"].request(licensedUrl, "POST", baseUrl, progressForm)).status, 200, "El progreso propio acepta el check de una sección con entitlement.");
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_section_progress WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND guide_id=${sqlLiteral(guideIdentity.guideId)};`)[0]?.total), 1);
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_section_progress WHERE user_id=${sqlLiteral(identities.collaborator.id)} AND guide_id=${sqlLiteral(guideIdentity.guideId)};`)[0]?.total), 0, "Otra cuenta no recibe el progreso ajeno.");
  const personalLibrary = await clients["owner-b"].request("/app/aprende");
  assert.equal(personalLibrary.status, 200, "La biblioteca personal funciona sin depender de una organización activa.");
  const personalHtml = await personalLibrary.text();
  assert.match(personalHtml, /Mi aprendizaje/);
  assert.match(personalHtml, /Tus nueve itinerarios/, "La biblioteca presenta el avance compartido entre itinerarios.");
  assert.match(personalHtml, /SIGUIENTE PASO SUGERIDO/, "La biblioteca muestra una recomendación editorial sin bloquear alternativas.");
  const hideForm = new FormData();
  hideForm.set("guideId", guideIdentity.guideId);
  hideForm.set("intent", "hide");
  assert.equal((await clients["owner-b"].request("/app/aprende", "POST", baseUrl, hideForm)).status, 200);
  const hiddenProgress = query(`SELECT hidden_recent_at, version FROM learn_guide_progress WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND guide_id=${sqlLiteral(guideIdentity.guideId)};`)[0];
  assert.ok(Number(hiddenProgress.hidden_recent_at) > 0, "Ocultar aparta la guía de recientes.");
  const restoreForm = new FormData();
  restoreForm.set("guideId", guideIdentity.guideId);
  restoreForm.set("intent", "restore");
  assert.equal((await clients["owner-b"].request("/app/aprende", "POST", baseUrl, restoreForm)).status, 200);
  const restoredProgress = query(`SELECT hidden_recent_at, version FROM learn_guide_progress WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND guide_id=${sqlLiteral(guideIdentity.guideId)};`)[0];
  assert.equal(restoredProgress.hidden_recent_at, null, "Restaurar devuelve la guía a recientes sin borrar checks.");
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_section_progress WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND guide_id=${sqlLiteral(guideIdentity.guideId)} AND is_checked=1;`)[0]?.total), 1, "El check guardado permanece después de restaurar la guía.");
  assert.equal(Number(restoredProgress.version), Number(hiddenProgress.version) + 1, "Cambiar visibilidad incrementa la versión y protege el orden de sync.");
  const uncheckForm = new FormData();
  uncheckForm.set("guideId", guideIdentity.guideId);
  uncheckForm.set("sectionId", guideIdentity.sections[0].sectionId);
  uncheckForm.set("intent", "uncheck");
  assert.equal((await clients["owner-b"].request(licensedUrl, "POST", baseUrl, uncheckForm)).status, 200);
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_section_progress WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND guide_id=${sqlLiteral(guideIdentity.guideId)} AND is_checked=1;`)[0]?.total), 0, "Desmarcar registra el estado unchecked sin marcarlo completado.");
  const resetForm = new FormData();
  resetForm.set("guideId", guideIdentity.guideId);
  resetForm.set("intent", "reset");
  assert.equal((await clients["owner-b"].request(licensedUrl, "POST", baseUrl, resetForm)).status, 200);
  assert.equal(Number(query(`SELECT reset_epoch AS value FROM learn_guide_progress WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND guide_id=${sqlLiteral(guideIdentity.guideId)};`)[0]?.value), 1, "Reiniciar incrementa reset_epoch para invalidar operaciones anteriores.");
  const syncPath = "/api/learn/sync";
  const syncState = query(`SELECT version, reset_epoch FROM learn_guide_progress WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND guide_id=${sqlLiteral(guideIdentity.guideId)};`)[0];
  const syncOperation = { operationId: randomUUID(), deviceId: randomUUID(), clientSequence: 1, guideId: guideIdentity.guideId, type: "check-section", sectionId: guideIdentity.sections[1].sectionId, baseVersion: Number(syncState.version), baseResetEpoch: Number(syncState.reset_epoch), createdAt: Date.now() };
  const syncRequest = () => clients["owner-b"].request(syncPath, "POST", baseUrl, JSON.stringify({ operations: [syncOperation] }));
  const syncResponse = await syncRequest();
  assert.equal(syncResponse.status, 200, `Sync autenticado aplica operación: ${await syncResponse.clone().text()}`);
  assert.equal((await (await syncResponse.json()).results)[0].status, "applied");
  const replayResponse = await syncRequest();
  assert.equal(replayResponse.status, 200);
  assert.equal((await replayResponse.json()).results[0].status, "duplicate", "Repetir operation_id reproduce el recibo sin aplicar el cambio dos veces.");
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_operation_receipt WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND operation_id=${sqlLiteral(syncOperation.operationId)};`)[0]?.total), 1);
  const secondDeviceOperation = { ...syncOperation, operationId: randomUUID(), deviceId: randomUUID(), sectionId: guideIdentity.sections[2].sectionId };
  const secondDeviceResponse = await clients["owner-b"].request(syncPath, "POST", baseUrl, JSON.stringify({ operations: [secondDeviceOperation] }));
  assert.equal(secondDeviceResponse.status, 200);
  assert.equal((await secondDeviceResponse.json()).results[0].status, "applied", "Un check independiente de otro dispositivo converge aunque su baseVersion sea anterior.");
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_section_progress WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND guide_id=${sqlLiteral(guideIdentity.guideId)} AND is_checked=1;`)[0]?.total), 2);
  const staleEpoch = { ...syncOperation, operationId: randomUUID(), clientSequence: 2, baseVersion: Number(syncState.version) + 1, baseResetEpoch: 0, createdAt: Date.now(), sectionId: guideIdentity.sections[3].sectionId };
  const staleResponse = await clients["owner-b"].request(syncPath, "POST", baseUrl, JSON.stringify({ operations: [staleEpoch] }));
  assert.equal(staleResponse.status, 200);
  assert.equal((await staleResponse.json()).results[0].status, "conflict", "Una operación de época anterior al reset no resucita progreso.");
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_section_progress WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND guide_id=${sqlLiteral(guideIdentity.guideId)} AND section_id=${sqlLiteral(guideIdentity.sections[3].sectionId)};`)[0]?.total), 0);
  const expiredOperation = { ...staleEpoch, operationId: randomUUID(), clientSequence: 2, createdAt: Date.now() - 31 * 24 * 60 * 60 * 1000 };
  const expiredResponse = await clients["owner-b"].request(syncPath, "POST", baseUrl, JSON.stringify({ operations: [expiredOperation] }));
  assert.equal((await expiredResponse.json()).results[0].status, "expired", "El servidor descarta reintentos fuera de la ventana de 30 días.");
  const freshAfterGap = { ...staleEpoch, operationId: randomUUID(), clientSequence: 3, baseVersion: Number(query(`SELECT version FROM learn_guide_progress WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND guide_id=${sqlLiteral(guideIdentity.guideId)};`)[0].version), baseResetEpoch: 1, createdAt: Date.now(), sectionId: guideIdentity.sections[4].sectionId };
  const gapResponse = await clients["owner-b"].request(syncPath, "POST", baseUrl, JSON.stringify({ operations: [freshAfterGap] }));
  assert.equal((await gapResponse.json()).results[0].status, "applied", "Descartar una operación vencida no bloquea la siguiente secuencia fresca.");
  const outOfOrder = { ...freshAfterGap, operationId: randomUUID(), clientSequence: 2, createdAt: Date.now(), sectionId: guideIdentity.sections[0].sectionId };
  const outOfOrderResponse = await clients["owner-b"].request(syncPath, "POST", baseUrl, JSON.stringify({ operations: [outOfOrder] }));
  assert.equal((await outOfOrderResponse.json()).results[0].status, "conflict", "La secuencia sigue rechazando operaciones atrasadas.");

  const purgeDeviceId = randomUUID();
  const staleReceiptId = randomUUID();
  const currentReceiptId = randomUUID();
  const receiptCutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  query(`
    INSERT INTO learn_sync_device (user_id,device_id,last_sequence,last_operation_id,last_seen_at)
      VALUES (${sqlLiteral(identities["owner-b"].id)},${sqlLiteral(purgeDeviceId)},2,${sqlLiteral(currentReceiptId)},${Date.now()});
    INSERT INTO learn_operation_receipt (user_id,operation_id,device_id,client_sequence,guide_id,operation_type,base_version,base_reset_epoch,result_version,result_reset_epoch,outcome,created_at) VALUES
      (${sqlLiteral(identities["owner-b"].id)},${sqlLiteral(staleReceiptId)},${sqlLiteral(purgeDeviceId)},1,${sqlLiteral(guideIdentity.guideId)},'check-section',0,0,1,0,'applied',${receiptCutoff - 1000}),
      (${sqlLiteral(identities["owner-b"].id)},${sqlLiteral(currentReceiptId)},${sqlLiteral(purgeDeviceId)},2,${sqlLiteral(guideIdentity.guideId)},'check-section',1,0,2,0,'applied',${Date.now()});
  `);
  const scheduledResponse = await fetch(new URL("/cdn-cgi/local/scheduled", baseUrl));
  assert.equal(scheduledResponse.status, 200, "Wrangler ejecuta la purga real del Worker en local.");
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_operation_receipt WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND operation_id=${sqlLiteral(staleReceiptId)};`)[0]?.total), 0, "La purga elimina recibos más antiguos que 90 días.");
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_operation_receipt WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND operation_id=${sqlLiteral(currentReceiptId)};`)[0]?.total), 1, "La purga conserva recibos dentro de retención.");
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_sync_device WHERE user_id=${sqlLiteral(identities["owner-b"].id)} AND device_id=${sqlLiteral(purgeDeviceId)} AND last_sequence=2;`)[0]?.total), 1, "La purga conserva el cursor del dispositivo.");
  const billingOwnerBody = await clients["billing-owner"].request(licensedUrl);
  assert.equal(billingOwnerBody.status, 200, "Ser billing_account.owner sin membresía solo recibe vista previa.");
  assertNoProtectedBody(await billingOwnerBody.text(), protectedFragments, "Preview billing owner sin membresía");

  const grantsPath = `/api/organizations/${orgB}/learn-access`;
  const grantPath = `${grantsPath}/grants/${(query(`SELECT id FROM member WHERE organization_id=${sqlLiteral(orgB)} AND user_id=${sqlLiteral(identities.collaborator.id)};`)[0]).id}`;
  const anonymousManagement = await fetch(new URL(grantsPath, baseUrl), { redirect: "manual" });
  assert.equal(anonymousManagement.status, 401, "La API de grants requiere sesión.");
  assert.equal(anonymousManagement.headers.get("cache-control"), "private, no-store");
  const previewFavorite = new FormData();
  previewFavorite.set("guideId", guideIdentity.guideId);
  previewFavorite.set("intent", "favorite");
  assert.equal((await clients.collaborator.request(licensedUrl, "POST", baseUrl, previewFavorite)).status, 200, "Se puede guardar como favorito una guía protegida sin desbloquear el cuerpo.");
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_favorite WHERE user_id=${sqlLiteral(identities.collaborator.id)} AND guide_id=${sqlLiteral(guideIdentity.guideId)};`)[0]?.total), 1);
  const adminGrant = await clients["admin-a"].request(grantPath, "PUT");
  assert.equal(adminGrant.status, 403, "admin no puede conceder grants.");
  const ownerMemberId = (query(`SELECT id FROM member WHERE organization_id=${sqlLiteral(orgB)} AND user_id=${sqlLiteral(identities["owner-b"].id)};`)[0]).id;
  assert.equal((await clients["owner-b"].request(`${grantsPath}/grants/${ownerMemberId}`, "PUT")).status, 403, "El owner no necesita ni puede concederse grant propio.");
  const crossOrganizationGrant = await clients["owner-b"].request(`${grantsPath}/grants/${(query(`SELECT id FROM member WHERE organization_id=${sqlLiteral(orgA)} AND user_id=${sqlLiteral(identities["admin-a"].id)};`)[0]).id}`, "PUT");
  assert.equal(crossOrganizationGrant.status, 403, "El owner no concede permisos a miembros de otra organización.");
  const crossOriginGrant = await clients["owner-b"].request(grantPath, "PUT", "https://attacker.invalid");
  assert.equal(crossOriginGrant.status, 403, "Las mutaciones requieren Origin same-site.");

  const grant = await clients["owner-b"].request(grantPath, "PUT");
  assert.equal(grant.status, 204);
  const duplicateGrant = await clients["owner-b"].request(grantPath, "PUT");
  assert.equal(duplicateGrant.status, 204);
  assert.equal(Number(query(`SELECT count(*) AS total FROM platform_audit_log WHERE organization_id=${sqlLiteral(orgB)} AND action='learn_access.granted' AND entity_id=${sqlLiteral((query(`SELECT id FROM member WHERE organization_id=${sqlLiteral(orgB)} AND user_id=${sqlLiteral(identities.collaborator.id)};`)[0]).id)};`)[0]?.total), 1, "Un grant idempotente genera solo una auditoría.");
  const listed = await clients["owner-b"].request(grantsPath);
  assert.equal(listed.status, 200);
  assert.deepEqual((await listed.json()).grants.map((item) => item.memberId), [(query(`SELECT id FROM member WHERE organization_id=${sqlLiteral(orgB)} AND user_id=${sqlLiteral(identities.collaborator.id)};`)[0]).id]);
  const multiOrganizationMember = await clients.collaborator.request(licensedUrl);
  assert.equal(multiOrganizationMember.status, 200, "Grant B funciona aunque la sesión activa siga en A.");
  assert.equal((await multiOrganizationMember.text()).includes(protectedText), true);

  const revoked = await clients["owner-b"].request(grantPath, "DELETE");
  assert.equal(revoked.status, 204);
  assert.equal(Number(query(`SELECT count(*) AS total FROM platform_audit_log WHERE organization_id=${sqlLiteral(orgB)} AND action='learn_access.revoked';`)[0]?.total), 1);
  const afterRevoke = await clients.collaborator.request(licensedUrl);
  assert.equal(afterRevoke.status, 200, "La siguiente solicitud ofrece preview tras revocar el grant.");
  assertNoProtectedBody(await afterRevoke.text(), protectedFragments, "Preview después de revocar grant");
  assert.equal(Number(query(`SELECT count(*) AS total FROM learn_favorite WHERE user_id=${sqlLiteral(identities.collaborator.id)} AND guide_id=${sqlLiteral(guideIdentity.guideId)};`)[0]?.total), 1, "La pérdida de entitlement conserva el favorito personal.");
  const regrant = await clients["owner-b"].request(grantPath, "PUT");
  assert.equal(regrant.status, 204);
  query(`DELETE FROM member WHERE organization_id=${sqlLiteral(orgB)} AND user_id=${sqlLiteral(identities.collaborator.id)};`);
  assert.equal(Number(query(`SELECT count(*) AS total FROM organization_learn_access_grant WHERE member_id=${sqlLiteral((query(`SELECT id FROM member WHERE organization_id=${sqlLiteral(orgA)} AND user_id=${sqlLiteral(identities.collaborator.id)};`)[0]).id)};`)[0]?.total), 0, "El grant ligado a la membresía retirada se elimina por cascada.");
  assert.equal(query("PRAGMA foreign_key_check;").length, 0, "D1 local no contiene violaciones de claves foráneas.");
  const afterMembershipDelete = await clients.collaborator.request(licensedUrl);
  assert.equal(afterMembershipDelete.status, 200);
  assertNoProtectedBody(await afterMembershipDelete.text(), protectedFragments, "Preview después de quitar membresía");

  for (const label of ["owner-expired", "owner-suspended", "owner-no-lifecycle"]) {
    const preview = await clients[label].request(licensedUrl);
    assert.equal(preview.status, 200, `${label} recibe vista previa sin entitlement.`);
    assertNoProtectedBody(await preview.text(), protectedFragments, `${label} sin entitlement`);
  }

  console.log("PASS Aprende entitlement/sync/retención: guards, grants, CSRF, replay/reset, reintento 30d, secuencias con huecos y purga 90d con Worker/D1 locales.");
} catch (error) {
  await new Promise((resolveWait) => setTimeout(resolveWait, 200));
  throw new Error(`${error instanceof Error ? error.message : String(error)}\nSalida Worker local:\n${workerOutput}`, { cause: error });
} finally {
  if (worker && worker.exitCode === null) {
    const exited = new Promise((resolveExit) => worker.once("exit", resolveExit));
    worker.kill("SIGINT");
    await Promise.race([exited, new Promise((resolveWait) => setTimeout(resolveWait, 5000))]);
  }
  if (existsSync(persistence)) {
    rmSync(persistence, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
    assert.equal(existsSync(persistence), false, "Se eliminó y verificó la D1 local aislada.");
  }
}
