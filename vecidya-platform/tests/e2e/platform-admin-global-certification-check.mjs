import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { once } from "node:events";

import { assertLocalBaseUrl } from "./test-safety.mjs";

const projectDirectory = resolve(new URL("../..", import.meta.url).pathname.replace(/^\//, "").replace(/\//g, "\\"));
const wranglerCli = resolve(projectDirectory, "node_modules/wrangler/bin/wrangler.js");
const persistenceName = `.wrangler/platform-admin-global-cert-${process.pid}-${Date.now()}`;
const persistence = resolve(projectDirectory, persistenceName);
if (!existsSync(resolve(projectDirectory, ".wrangler")) || !existsSync(wranglerCli)) throw new Error("Falta Wrangler local o su carpeta de persistencia aislada.");

function runWrangler(args, timeout = 600_000) {
  const result = spawnSync(process.execPath, [wranglerCli, ...args], { cwd: projectDirectory, encoding: "utf8", timeout, maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`Wrangler terminó con ${result.status}. ${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function sqlLiteral(value) { return `'${String(value).replaceAll("'", "''")}'`; }
function query(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-platform-admin-"));
  const file = join(directory, "query.sql");
  writeFileSync(file, sql, "utf8");
  try { return JSON.parse(runWrangler(["d1", "execute", "DB", "--local", "--persist-to", persistenceName, "--json", "--file", file])).flatMap((result) => result.results ?? []); }
  finally { rmSync(directory, { recursive: true, force: true }); }
}

async function port() {
  const server = createServer(); server.listen(0, "127.0.0.1"); await once(server, "listening");
  const address = server.address(); await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
  if (!address || typeof address === "string") throw new Error("No se pudo reservar el puerto local.");
  return address.port;
}

async function workerReady(url) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try { if ((await fetch(`${url}/api/auth/ok`, { signal: AbortSignal.timeout(3000) })).status === 200) return; }
    catch { await new Promise((resolveWait) => setTimeout(resolveWait, 250)); }
  }
  throw new Error("El Worker local no respondió tras consultar la D1 aislada.");
}

async function getPublic(url) {
  try { return await fetch(url, { headers: { connection: "close" } }); }
  catch (error) {
    if (error?.cause?.code !== "ECONNRESET") throw error;
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
    return fetch(url, { headers: { connection: "close" } });
  }
}

async function getPublicHtml(url) {
  let response = await getPublic(url);
  try { return { response, html: await response.text() }; }
  catch (error) {
    if (!(["ECONNRESET", "UND_ERR_SOCKET"].includes(error?.cause?.code) || error?.message === "fetch failed")) throw error;
    response = await getPublic(url);
    return { response, html: await response.text() };
  }
}

class Client {
  #cookies = new Map();
  constructor(baseUrl) { this.baseUrl = baseUrl; }
  async request(path, body) {
    const headers = new Headers({ "content-type": "application/x-www-form-urlencoded", origin: this.baseUrl });
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    const response = await fetch(new URL(path, this.baseUrl), { method: body ? "POST" : "GET", headers, ...(body ? { body: new URLSearchParams(body) } : {}), redirect: "manual" });
    for (const cookie of response.headers.getSetCookie()) { const [pair] = cookie.split(";", 1); const [name, ...value] = pair.split("="); this.#cookies.set(name, value.join("=")); }
    return response;
  }
  async json(path, value) {
    const headers = new Headers({ "content-type": "application/json", origin: this.baseUrl });
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies].map(([name, item]) => `${name}=${item}`).join("; "));
    const response = await fetch(new URL(path, this.baseUrl), { method: "POST", headers, body: JSON.stringify(value), redirect: "manual" });
    for (const cookie of response.headers.getSetCookie()) { const [pair] = cookie.split(";", 1); const [name, ...item] = pair.split("="); this.#cookies.set(name, item.join("=")); }
    return response;
  }
  async jsonGet(path) {
    const headers = new Headers({ origin: this.baseUrl });
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    return fetch(new URL(path, this.baseUrl), { headers });
  }
  async signup(label, baseUrl, invitationId, invitedEmail = `${label}-${randomUUID()}@vecidya.test`) {
    const email = invitedEmail;
    const response = await fetch(new URL("/api/auth/sign-up/email", baseUrl), { method: "POST", headers: { "content-type": "application/json", origin: baseUrl, "X-Vecidya-Invitation": invitationId }, body: JSON.stringify({ name: label, email, password: `cert-${randomUUID()}` }) });
    for (const cookie of response.headers.getSetCookie()) { const [pair] = cookie.split(";", 1); const [name, ...value] = pair.split("="); this.#cookies.set(name, value.join("=")); }
    if (response.status !== 200) throw new Error(`Registro local ${label}: HTTP ${response.status}; ${(await response.text()).slice(0, 300)}`);
    const user = (await response.json()).user;
    return { email, user };
  }
}

assertLocalBaseUrl(process.env.BASE_URL ?? "http://127.0.0.1");
const portNumber = await port();
const baseUrl = `http://127.0.0.1:${portNumber}`;
const suffix = randomUUID();
const ownerToken = randomBytes(32).toString("hex");
const digest = createHash("sha256").update(ownerToken).digest("hex");
const orgId = randomUUID();
const invitationId = randomUUID();
const resendOrgId = randomUUID();
const resendInvitationId = randomUUID();
const now = Date.now();
const secret = randomBytes(32).toString("hex");
const bootstrapUserId = randomUUID();
const bootstrapOrgId = randomUUID();
const bootstrapInvitationId = randomUUID();
const wrongInvitationId = randomUUID();
const memberInvitationId = randomUUID();
const staffInvitationId = randomUUID();
const adminEmail = `platform-admin-${randomUUID()}@vecidya.test`;
const resendEmail = `resend-owner-${randomUUID()}@vecidya.test`;
const staffEmail = `platform-staff-${randomUUID()}@vecidya.test`;
let worker;

try {
  runWrangler(["d1", "migrations", "apply", "DB", "--local", "--persist-to", persistenceName]);
  query(`INSERT INTO platform_meta (key, value, updated_at) VALUES ('platform_name', 'Vecidya', ${now});`);
  query(`INSERT INTO user (id,name,email,email_verified,created_at,updated_at) VALUES (${sqlLiteral(bootstrapUserId)},'Cert bootstrap',${sqlLiteral(`bootstrap-${suffix}@vecidya.test`)},1,${now},${now});
INSERT INTO organization (id,name,slug,created_at) VALUES (${sqlLiteral(bootstrapOrgId)},'Cert bootstrap','bootstrap-${suffix}',${now});
INSERT INTO invitation (id,organization_id,email,role,status,expires_at,created_at,inviter_id) VALUES (${sqlLiteral(bootstrapInvitationId)},${sqlLiteral(bootstrapOrgId)},${sqlLiteral(adminEmail)},'admin','pending',${now + 3_600_000},${now},${sqlLiteral(bootstrapUserId)});`);
  worker = spawn(process.execPath, [wranglerCli, "dev", "--local", "--persist-to", persistenceName, "--ip", "127.0.0.1", "--port", String(portNumber), "--var", "APP_ENV:staging", "--var", "EMAIL_PROVIDER:fake", "--var", `APP_URL:${baseUrl}`, "--var", `BETTER_AUTH_URL:${baseUrl}`, "--show-interactive-dev-session=false", "--log-level", "info"], { cwd: projectDirectory, env: { ...process.env, BETTER_AUTH_SECRET: secret }, stdio: ["ignore", "pipe", "pipe"] });
  worker.output = ""; worker.stdout.on("data", (chunk) => { worker.output += chunk.toString(); }); worker.stderr.on("data", (chunk) => { worker.output += chunk.toString(); });
  const readyBy = Date.now() + 60_000;
  while (Date.now() < readyBy) { try { if ((await fetch(`${baseUrl}/api/auth/ok`)).status === 200) break; } catch {} await new Promise((resolveWait) => setTimeout(resolveWait, 200)); }
  if (worker.exitCode !== null) throw new Error(`Worker local terminó pronto: ${worker.output}`);

  const admin = new Client(baseUrl); const adminIdentity = await admin.signup("platform-admin", baseUrl, bootstrapInvitationId, adminEmail);
  const intendedEmail = `invited-owner-${randomUUID()}@vecidya.test`;
  const wrongEmail = `wrong-account-${randomUUID()}@vecidya.test`;
  const memberEmail = `role-target-${randomUUID()}@vecidya.test`;
  const sqlNow = Date.now();
  query(`UPDATE user SET email_verified = 1 WHERE id=${sqlLiteral(adminIdentity.user.id)};
INSERT INTO platform_member (id,user_id,role,status,created_at,updated_at) VALUES (${sqlLiteral(randomUUID())},${sqlLiteral(adminIdentity.user.id)},'platform_admin','active',${sqlNow},${sqlNow});
INSERT INTO organization (id,name,slug,created_at) VALUES (${sqlLiteral(orgId)},'Certificación control plane','cert-${suffix}',${sqlNow});
INSERT INTO organization (id,name,slug,created_at) VALUES (${sqlLiteral(resendOrgId)},'Reenvío y revocación','resend-${suffix}',${sqlNow});
INSERT INTO platform_organization_lifecycle (organization_id,status,intended_owner_email,owner_user_id,created_by,updated_by,created_at,updated_at) VALUES (${sqlLiteral(orgId)},'owner_invited',${sqlLiteral(intendedEmail)},NULL,${sqlLiteral(adminIdentity.user.id)},${sqlLiteral(adminIdentity.user.id)},${sqlNow},${sqlNow});
INSERT INTO platform_organization_lifecycle (organization_id,status,intended_owner_email,owner_user_id,created_by,updated_by,created_at,updated_at) VALUES (${sqlLiteral(resendOrgId)},'owner_invited',${sqlLiteral(resendEmail)},NULL,${sqlLiteral(adminIdentity.user.id)},${sqlLiteral(adminIdentity.user.id)},${sqlNow},${sqlNow});
INSERT INTO platform_owner_invitation (id,organization_id,email,token_digest,status,expires_at,created_by,created_at) VALUES (${sqlLiteral(invitationId)},${sqlLiteral(orgId)},${sqlLiteral(intendedEmail)},${sqlLiteral(digest)},'pending',${sqlNow + 3_600_000},${sqlLiteral(adminIdentity.user.id)},${sqlNow});
INSERT INTO platform_owner_invitation (id,organization_id,email,token_digest,status,expires_at,created_by,created_at) VALUES (${sqlLiteral(resendInvitationId)},${sqlLiteral(resendOrgId)},${sqlLiteral(resendEmail)},${sqlLiteral(createHash("sha256").update(randomBytes(32)).digest("hex"))},'pending',${sqlNow + 3_600_000},${sqlLiteral(adminIdentity.user.id)},${sqlNow});
INSERT INTO invitation (id,organization_id,email,role,status,expires_at,created_at,inviter_id) VALUES (${sqlLiteral(wrongInvitationId)},${sqlLiteral(bootstrapOrgId)},${sqlLiteral(wrongEmail)},'member','pending',${sqlNow + 3_600_000},${sqlNow},${sqlLiteral(adminIdentity.user.id)}),(${sqlLiteral(memberInvitationId)},${sqlLiteral(bootstrapOrgId)},${sqlLiteral(memberEmail)},'member','pending',${sqlNow + 3_600_000},${sqlNow},${sqlLiteral(adminIdentity.user.id)}),(${sqlLiteral(staffInvitationId)},${sqlLiteral(bootstrapOrgId)},${sqlLiteral(staffEmail)},'member','pending',${sqlNow + 3_600_000},${sqlNow},${sqlLiteral(adminIdentity.user.id)});`);
  await workerReady(baseUrl);
  const intendedOwner = new Client(baseUrl); const intendedIdentity = await intendedOwner.signup("invited-owner", baseUrl, invitationId, intendedEmail);
  const wrongAccount = new Client(baseUrl); const wrongIdentity = await wrongAccount.signup("wrong-account", baseUrl, wrongInvitationId, wrongEmail);
  const targetMember = new Client(baseUrl); const memberIdentity = await targetMember.signup("role-target", baseUrl, memberInvitationId, memberEmail);
  const staff = new Client(baseUrl); const staffIdentity = await staff.signup("platform-staff", baseUrl, staffInvitationId, staffEmail);
  query(`UPDATE user SET email_verified = 1 WHERE id IN (${[intendedIdentity, wrongIdentity, memberIdentity, staffIdentity].map(({ user }) => sqlLiteral(user.id)).join(",")}); INSERT INTO member (id,organization_id,user_id,role,created_at) VALUES (${sqlLiteral(randomUUID())},${sqlLiteral(orgId)},${sqlLiteral(memberIdentity.user.id)},'member',${sqlNow}); INSERT INTO platform_member (id,user_id,role,status,created_at,updated_at) VALUES (${sqlLiteral(randomUUID())},${sqlLiteral(staffIdentity.user.id)},'staff','active',${sqlNow},${sqlNow});`);
  await workerReady(baseUrl);

  const wrong = await wrongAccount.request(`/app/owner-invitations/${invitationId}?token=${ownerToken}`, { token: ownerToken, intent: "accept" });
  if (wrong.status !== 403) throw new Error(`Correo incorrecto debía rechazarse con 403; obtuvo ${wrong.status}.`);

  const [accept, resend] = await Promise.all([
    intendedOwner.request(`/app/owner-invitations/${invitationId}?token=${ownerToken}`, { token: ownerToken, intent: "accept" }),
    admin.request(`/app/internal/organizations/${orgId}`, { intent: "resend" }),
  ]);
  if (![302, 303, 409].includes(resend.status)) throw new Error(`Reenvío local produjo HTTP inesperado ${resend.status}.`);

  const invitationState = query(`SELECT status, acceptance_id FROM platform_owner_invitation WHERE id=${sqlLiteral(invitationId)};`)[0];
  const lifecycleState = query(`SELECT status, owner_user_id FROM platform_organization_lifecycle WHERE organization_id=${sqlLiteral(orgId)};`)[0];
  const ownerCount = query(`SELECT count(*) AS count FROM member WHERE organization_id=${sqlLiteral(orgId)} AND role='owner';`)[0]?.count;
  const pendingCount = query(`SELECT count(*) AS count FROM platform_owner_invitation WHERE organization_id=${sqlLiteral(orgId)} AND status='pending';`)[0]?.count;
  await workerReady(baseUrl);
  if (![302, 303, 404, 409].includes(accept.status)) throw new Error(`Aceptación produjo HTTP inesperado ${accept.status}.`);
  if (lifecycleState.status === "active" && (invitationState.status !== "accepted" || Number(ownerCount) !== 1 || Number(pendingCount) !== 0)) throw new Error("La aceptación dejó invitation, lifecycle y membership inconsistentes.");
  if (lifecycleState.status === "owner_invited" && (invitationState.status !== "revoked" || Number(ownerCount) !== 0 || Number(pendingCount) !== 1)) throw new Error("El reenvío dejó invitation, lifecycle y membership inconsistentes.");
  if (!(["active", "owner_invited"].includes(lifecycleState.status))) throw new Error(`Estado de ciclo inesperado tras la carrera: ${lifecycleState.status}`);
  if (invitationState.status === "accepted" && invitationState.acceptance_id === null) throw new Error("La invitación aceptada no tiene acceptance_id.");
  const reusedInvitation = await intendedOwner.request(`/app/owner-invitations/${invitationId}?token=${ownerToken}`, { token: ownerToken, intent: "accept" });
  if (reusedInvitation.status !== 404) throw new Error(`La invitación reutilizada debe responder 404; obtuvo ${reusedInvitation.status}.`);

  const expiredOrg = randomUUID(); const revokedOrg = randomUUID();
  const expiredInvitation = randomUUID(); const revokedInvitation = randomUUID();
  const expiredToken = randomBytes(32).toString("hex"); const revokedToken = randomBytes(32).toString("hex");
  const expiredDigest = createHash("sha256").update(expiredToken).digest("hex"); const revokedDigest = createHash("sha256").update(revokedToken).digest("hex");
  query(`INSERT INTO organization (id,name,slug,created_at) VALUES (${sqlLiteral(expiredOrg)},'Expirada','expired-${suffix}',${sqlNow}),(${sqlLiteral(revokedOrg)},'Revocada','revoked-${suffix}',${sqlNow});
INSERT INTO platform_organization_lifecycle (organization_id,status,intended_owner_email,created_by,updated_by,created_at,updated_at) VALUES (${sqlLiteral(expiredOrg)},'owner_invited',${sqlLiteral(intendedIdentity.email)},${sqlLiteral(adminIdentity.user.id)},${sqlLiteral(adminIdentity.user.id)},${sqlNow},${sqlNow}),(${sqlLiteral(revokedOrg)},'owner_invited',${sqlLiteral(intendedIdentity.email)},${sqlLiteral(adminIdentity.user.id)},${sqlLiteral(adminIdentity.user.id)},${sqlNow},${sqlNow});
INSERT INTO platform_owner_invitation (id,organization_id,email,token_digest,status,expires_at,created_by,created_at) VALUES (${sqlLiteral(expiredInvitation)},${sqlLiteral(expiredOrg)},${sqlLiteral(intendedIdentity.email)},${sqlLiteral(expiredDigest)},'pending',${sqlNow - 1_000},${sqlLiteral(adminIdentity.user.id)},${sqlNow}),(${sqlLiteral(revokedInvitation)},${sqlLiteral(revokedOrg)},${sqlLiteral(intendedIdentity.email)},${sqlLiteral(revokedDigest)},'revoked',${sqlNow + 3_600_000},${sqlLiteral(adminIdentity.user.id)},${sqlNow});`);
  await workerReady(baseUrl);
  const expiredResponse = await intendedOwner.request(`/app/owner-invitations/${expiredInvitation}?token=${expiredToken}`, { token: expiredToken, intent: "accept" });
  const revokedResponse = await intendedOwner.request(`/app/owner-invitations/${revokedInvitation}?token=${revokedToken}`, { token: revokedToken, intent: "accept" });
  if (expiredResponse.status !== 404 || revokedResponse.status !== 404) throw new Error(`Invitación expirada/revocada debe responder 404; obtuvo ${expiredResponse.status}/${revokedResponse.status}.`);

  const resendResponse = await admin.request(`/app/internal/organizations/${resendOrgId}`, { intent: "resend" });
  const replacedInvitation = query(`SELECT status FROM platform_owner_invitation WHERE id=${sqlLiteral(resendInvitationId)};`)[0]?.status;
  const resendState = query(`SELECT l.status,(SELECT count(*) FROM platform_owner_invitation i WHERE i.organization_id=l.organization_id AND i.status='pending') AS pending_count,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=l.organization_id AND a.action='organization.owner_invitation.replace') AS audit_count FROM platform_organization_lifecycle l WHERE l.organization_id=${sqlLiteral(resendOrgId)};`)[0];
  await workerReady(baseUrl);
  if (![302, 303].includes(resendResponse.status) || replacedInvitation !== "revoked" || resendState.status !== "owner_invited" || Number(resendState.pending_count) !== 1 || Number(resendState.audit_count) !== 1) throw new Error("El reenvío no rotó el token ni auditó una sola vez.");
  const revokeResponse = await admin.request(`/app/internal/organizations/${resendOrgId}`, { intent: "revoke" });
  const revokeState = query(`SELECT l.status,(SELECT count(*) FROM platform_owner_invitation i WHERE i.organization_id=l.organization_id AND i.status='pending') AS pending_count,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=l.organization_id AND a.action='organization.owner_invitation.revoke') AS audit_count FROM platform_organization_lifecycle l WHERE l.organization_id=${sqlLiteral(resendOrgId)};`)[0];
  await workerReady(baseUrl);
  if (![302, 303].includes(revokeResponse.status) || revokeState.status !== "pending_owner" || Number(revokeState.pending_count) !== 0 || Number(revokeState.audit_count) !== 1) throw new Error("La revocación no consumió la invitación ni actualizó lifecycle/auditoría.");

  const stateOrg = randomUUID();
  query(`INSERT INTO organization (id,name,slug,created_at) VALUES (${sqlLiteral(stateOrg)},'Estado concurrente','state-${suffix}',${sqlNow}); INSERT INTO platform_organization_lifecycle (organization_id,status,intended_owner_email,owner_user_id,created_by,updated_by,created_at,updated_at) VALUES (${sqlLiteral(stateOrg)},'active',${sqlLiteral(intendedIdentity.email)},${sqlLiteral(memberIdentity.user.id)},${sqlLiteral(adminIdentity.user.id)},${sqlLiteral(adminIdentity.user.id)},${sqlNow},${sqlNow}); INSERT INTO member (id,organization_id,user_id,role,created_at) VALUES (${sqlLiteral(randomUUID())},${sqlLiteral(stateOrg)},${sqlLiteral(memberIdentity.user.id)},'owner',${sqlNow});`);
  await workerReady(baseUrl);
  const activeOrganization = await targetMember.json("/api/auth/organization/set-active", { organizationId: stateOrg });
  if (activeOrganization.status !== 200) throw new Error(`No se pudo activar la organización de la prueba: HTTP ${activeOrganization.status}.`);
  const [suspendA, suspendB] = await Promise.all([
    admin.request(`/app/internal/organizations/${stateOrg}`, { intent: "suspend" }),
    admin.request(`/app/internal/organizations/${stateOrg}`, { intent: "suspend" }),
  ]);
  const suspended = query(`SELECT status FROM platform_organization_lifecycle WHERE organization_id=${sqlLiteral(stateOrg)};`)[0]?.status;
  const auditCount = query(`SELECT count(*) AS count FROM platform_audit_log WHERE organization_id=${sqlLiteral(stateOrg)} AND action='organization.suspended';`)[0]?.count;
  await workerReady(baseUrl);
  if (suspended !== "suspended" || Number(auditCount) !== 1 || [suspendA, suspendB].some((response) => ![302, 303].includes(response.status))) throw new Error(`La suspensión concurrente debe dejar estado suspendido y una auditoría; estado=${suspended}, audit=${auditCount}, HTTP=${suspendA.status}/${suspendB.status}.`);

  const staffRead = await staff.request(`/app/internal/organizations/${stateOrg}`);
  const staffWrite = await staff.request(`/app/internal/organizations/${stateOrg}`, { intent: "activate" });
  const ownerRead = await intendedOwner.request(`/app/internal/organizations/${stateOrg}`);
  const memberRead = await targetMember.request(`/app/internal/organizations/${stateOrg}`);
  if (staffRead.status !== 200 || staffWrite.status !== 403 || ownerRead.status !== 403 || memberRead.status !== 403) throw new Error(`La matriz platform_admin/staff/owner/member no coincide: staff=${staffRead.status}/${staffWrite.status}, owner=${ownerRead.status}, member=${memberRead.status}.`);
  const suspendedOrganizationApi = await targetMember.jsonGet(`/api/organizations/${stateOrg}/training`);
  if (activeOrganization.status !== 200 || suspendedOrganizationApi.status !== 403) throw new Error(`La API cliente debe rechazar una organización suspendida; set-active=${activeOrganization.status}, GET=${suspendedOrganizationApi.status}.`);
  const reactivate = await admin.request(`/app/internal/organizations/${stateOrg}`, { intent: "activate" });
  const reactivatedOrganizationApi = await targetMember.jsonGet(`/api/organizations/${stateOrg}/training`);
  const lifecycleAudit = query(`SELECT action,count(*) AS count FROM platform_audit_log WHERE organization_id=${sqlLiteral(stateOrg)} AND action IN ('organization.suspended','organization.active') GROUP BY action;`);
  await workerReady(baseUrl);
  if (![302, 303].includes(reactivate.status) || reactivatedOrganizationApi.status !== 200 || lifecycleAudit.length !== 2 || lifecycleAudit.some((entry) => Number(entry.count) !== 1)) throw new Error(`La reactivación no restauró el acceso/API y su auditoría; HTTP=${reactivate.status}/${reactivatedOrganizationApi.status}, audit=${JSON.stringify(lifecycleAudit)}.`);

  const licensesPage = await admin.request("/app/internal/licenses");
  const licensesHtml = await licensesPage.text();
  if (licensesPage.status !== 200 || !licensesHtml.includes("Un cliente puede tener uno o varios negocios") || !licensesHtml.includes('aria-label="Buscar cliente o negocio"') || !licensesHtml.includes("Asignar licencia a este negocio")) throw new Error(`La pantalla de licencias no explica la relación cliente/negocio o no presenta una acción clara: HTTP=${licensesPage.status}.`);
  const assignedLicense = await admin.request("/app/internal/licenses", { organizationId: stateOrg, intent: "assign", planCode: "cuadra", initialStatus: "pending" });
  const assignedLicenseState = query(`SELECT l.status,l.plan_code,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=${sqlLiteral(stateOrg)} AND a.action='organization_license.assign') AS audit_count FROM organization_license l WHERE l.organization_id=${sqlLiteral(stateOrg)} ORDER BY l.created_at DESC LIMIT 1;`)[0];
  if (![302, 303].includes(assignedLicense.status) || assignedLicenseState?.status !== "pending" || assignedLicenseState.plan_code !== "cuadra" || Number(assignedLicenseState.audit_count) !== 1) throw new Error(`La pantalla no asignó una licencia pendiente auditada: HTTP=${assignedLicense.status}, state=${JSON.stringify(assignedLicenseState)}.`);
  await workerReady(baseUrl);
  const activateLicense = await admin.request("/app/internal/licenses", { organizationId: stateOrg, intent: "reactivate" });
  const activeLicenseState = query(`SELECT status,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=${sqlLiteral(stateOrg)} AND a.action='organization_license.active') AS audit_count FROM organization_license WHERE organization_id=${sqlLiteral(stateOrg)} ORDER BY created_at DESC LIMIT 1;`)[0];
  if (![302, 303].includes(activateLicense.status) || activeLicenseState?.status !== "active" || Number(activeLicenseState.audit_count) !== 1) throw new Error(`La activación de licencia no quedó auditada: HTTP=${activateLicense.status}, state=${JSON.stringify(activeLicenseState)}.`);

  const publicOrgA = randomUUID();
  const publicOrgB = randomUUID();
  const draftOrg = randomUUID();
  const governanceOrg = randomUUID();
  const noLicenseOrg = randomUUID();
  const inactiveLicenseOrg = randomUUID();
  const publicOwnerId = memberIdentity.user.id;
  const publicOwnerEmail = memberIdentity.email;
  const publicKeys = ["a", "b", "draft", "governance", "no-license", "inactive-license"];
  const profileIds = Object.fromEntries(publicKeys.map((key) => [key, randomUUID()]));
  const publicSlugs = Object.fromEntries(publicKeys.map((key) => [key, `cert-${suffix}-${key}`]));
  const publicMiniWebJson = JSON.stringify({ templateKey: "vecidya-default", templateVersion: 1, layoutVariant: "standard", modules: [{ type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null }] });
  query(`INSERT INTO organization (id,name,slug,created_at) VALUES
(${sqlLiteral(publicOrgA)},'Public certification A','public-a-${suffix}',${sqlNow}),(${sqlLiteral(publicOrgB)},'Public certification B','public-b-${suffix}',${sqlNow}),(${sqlLiteral(draftOrg)},'Draft certification','draft-${suffix}',${sqlNow}),(${sqlLiteral(governanceOrg)},'Governance certification','governance-${suffix}',${sqlNow}),(${sqlLiteral(noLicenseOrg)},'No license certification','no-license-${suffix}',${sqlNow}),(${sqlLiteral(inactiveLicenseOrg)},'Inactive license certification','inactive-license-${suffix}',${sqlNow});
INSERT INTO member (id,organization_id,user_id,role,created_at) VALUES
${[publicOrgA, publicOrgB, draftOrg, governanceOrg, noLicenseOrg, inactiveLicenseOrg].map((organizationId) => `(${sqlLiteral(randomUUID())},${sqlLiteral(organizationId)},${sqlLiteral(publicOwnerId)},'owner',${sqlNow})`).join(",")};
INSERT INTO platform_organization_lifecycle (organization_id,status,intended_owner_email,owner_user_id,created_by,updated_by,created_at,updated_at) VALUES
${[publicOrgA, publicOrgB, draftOrg, governanceOrg, noLicenseOrg, inactiveLicenseOrg].map((organizationId) => `(${sqlLiteral(organizationId)},'active',${sqlLiteral(publicOwnerEmail)},${sqlLiteral(publicOwnerId)},${sqlLiteral(adminIdentity.user.id)},${sqlLiteral(adminIdentity.user.id)},${sqlNow},${sqlNow})`).join(",")};
INSERT INTO business_profile (id,organization_id,display_name,slug,short_description,description,category,city,country,status,created_at,updated_at) VALUES
(${sqlLiteral(profileIds.a)},${sqlLiteral(publicOrgA)},'Public certification A',${sqlLiteral(publicSlugs.a)},'Published content','Description','Certification category','City A','Test country','published',${sqlNow},${sqlNow}),
(${sqlLiteral(profileIds.b)},${sqlLiteral(publicOrgB)},'Public certification B',${sqlLiteral(publicSlugs.b)},'Isolation control','Description','Control category','City B','Test country','published',${sqlNow},${sqlNow}),
(${sqlLiteral(profileIds.draft)},${sqlLiteral(draftOrg)},'Draft certification',${sqlLiteral(publicSlugs.draft)},'Hidden draft','Description','Draft category','Draft city','Test country','draft',${sqlNow},${sqlNow}),
(${sqlLiteral(profileIds.governance)},${sqlLiteral(governanceOrg)},'Governance certification',${sqlLiteral(publicSlugs.governance)},'Hidden governance','Description','Governance category','Governance city','Test country','published',${sqlNow},${sqlNow}),
(${sqlLiteral(profileIds.noLicense)},${sqlLiteral(noLicenseOrg)},'No license certification',${sqlLiteral(publicSlugs['no-license'])},'Hidden license','Description','No license category','No license city','Test country','published',${sqlNow},${sqlNow}),
(${sqlLiteral(profileIds['inactive-license'])},${sqlLiteral(inactiveLicenseOrg)},'Inactive license certification',${sqlLiteral(publicSlugs['inactive-license'])},'Hidden license','Description','Inactive license category','Inactive license city','Test country','published',${sqlNow},${sqlNow});
INSERT INTO business_profile_governance (id,business_profile_id,platform_status,created_at,updated_at) VALUES (${sqlLiteral(randomUUID())},${sqlLiteral(profileIds.governance)},'suspended',${sqlNow},${sqlNow});
INSERT INTO billing_account (id,owner_user_id,kind,name,created_at,updated_at) VALUES (${sqlLiteral(randomUUID())},${sqlLiteral(publicOwnerId)},'individual','Synthetic certification account',${sqlNow},${sqlNow}) ON CONFLICT(owner_user_id) DO NOTHING;
INSERT INTO organization_license (id,organization_id,billing_account_id,plan_code,price_id,status,started_at,activated_at,ends_at,created_at,updated_at) VALUES
${[publicOrgA, publicOrgB, draftOrg, governanceOrg].map((organizationId) => `(${sqlLiteral(randomUUID())},${sqlLiteral(organizationId)},(SELECT id FROM billing_account WHERE owner_user_id=${sqlLiteral(publicOwnerId)}),'cuadra','license-price-cuadra-v1','active',${sqlNow},${sqlNow},NULL,${sqlNow},${sqlNow})`).join(",")};
INSERT INTO organization_license (id,organization_id,billing_account_id,plan_code,price_id,status,started_at,activated_at,ends_at,created_at,updated_at)
SELECT ${sqlLiteral(randomUUID())},org.id,billing.id,'cuadra','license-price-cuadra-v1','suspended',${sqlNow},${sqlNow},NULL,${sqlNow},${sqlNow} FROM organization org CROSS JOIN billing_account billing WHERE org.id=${sqlLiteral(inactiveLicenseOrg)} AND billing.owner_user_id=${sqlLiteral(publicOwnerId)};
INSERT INTO miniweb_site (id,organization_id,template_key,template_version,layout_variant,published_configuration_json,created_at,updated_at) VALUES
(${sqlLiteral(randomUUID())},${sqlLiteral(publicOrgA)},'vecidya-default',1,'standard',${sqlLiteral(publicMiniWebJson)},${sqlNow},${sqlNow}),(${sqlLiteral(randomUUID())},${sqlLiteral(publicOrgB)},'vecidya-default',1,'standard',${sqlLiteral(publicMiniWebJson)},${sqlNow},${sqlNow});`);
  await workerReady(baseUrl);
  const initialProfile = await getPublic(new URL(`/vecindario/${publicSlugs.a}`, baseUrl));
  const initialDirectory = await getPublicHtml(new URL("/vecindario", baseUrl));
  const initialCategory = await getPublicHtml(new URL("/vecindario?category=Certification%20category", baseUrl));
  const initialCity = await getPublicHtml(new URL("/vecindario?city=City%20A", baseUrl));
  const initialDirectoryHtml = initialDirectory.html;
  const initialCategoryHtml = initialCategory.html;
  const initialCityHtml = initialCity.html;
  if (initialProfile.status !== 200 || !initialDirectoryHtml.includes("Public certification A") || !initialDirectoryHtml.includes("Public certification B") || !initialCategoryHtml.includes("Public certification A") || !initialCityHtml.includes("Public certification A")) throw new Error("Published profile with active owner license was not visible through HTTP profile/directory/filter routes.");
  const publicSnapshot = query(`SELECT bp.display_name,bp.short_description,bp.description,bp.status,ol.status AS license_status,m.published_configuration_json,(SELECT count(*) FROM member WHERE organization_id=bp.organization_id) AS membership_count,(SELECT count(*) FROM member WHERE organization_id=bp.organization_id AND role='owner') AS owner_count FROM business_profile bp JOIN organization_license ol ON ol.organization_id=bp.organization_id JOIN miniweb_site m ON m.organization_id=bp.organization_id WHERE bp.id=${sqlLiteral(profileIds.a)};`)[0];
  const hiddenBefore = [];
  for (const key of ["draft", "governance", "no-license", "inactive-license"]) hiddenBefore.push({ key, status: (await getPublic(new URL(`/vecindario/${publicSlugs[key]}`, baseUrl))).status });
  if (hiddenBefore.some(({ status }) => status !== 404)) throw new Error(`Draft/governance/no-license profiles should return 404: ${JSON.stringify(hiddenBefore)}.`);

  const setPublicOrgActive = await targetMember.json("/api/auth/organization/set-active", { organizationId: publicOrgA });
  if (setPublicOrgActive.status !== 200) throw new Error(`Could not activate tenant session for public certification: ${setPublicOrgActive.status}.`);
  const publicSuspend = await admin.request(`/app/internal/organizations/${publicOrgA}`, { intent: "suspend" });
  const suspendedProfile = await getPublic(new URL(`/vecindario/${publicSlugs.a}`, baseUrl));
  const suspendedDirectory = await getPublicHtml(new URL("/vecindario", baseUrl));
  const suspendedCategory = await getPublicHtml(new URL("/vecindario?category=Certification%20category", baseUrl));
  const suspendedCity = await getPublicHtml(new URL("/vecindario?city=City%20A", baseUrl));
  const suspendedTenantApi = await targetMember.jsonGet(`/api/organizations/${publicOrgA}/training`);
  const suspendedDirectoryHtml = suspendedDirectory.html;
  const suspendedCategoryHtml = suspendedCategory.html;
  const suspendedCityHtml = suspendedCity.html;
  if (![302, 303].includes(publicSuspend.status) || suspendedProfile.status !== 404 || suspendedDirectoryHtml.includes("Public certification A") || suspendedCategoryHtml.includes("Public certification A") || suspendedCityHtml.includes("Public certification A") || suspendedDirectoryHtml.includes('value="Certification category"') || suspendedDirectoryHtml.includes('value="City A"') || !suspendedDirectoryHtml.includes("Public certification B") || suspendedTenantApi.status !== 403) throw new Error(`Suspension did not hide A from public HTTP surfaces/filters or block tenant API: action=${publicSuspend.status}, profile=${suspendedProfile.status}, api=${suspendedTenantApi.status}.`);
  const suspendedState = query(`SELECT l.status,bp.status AS profile_status,ol.status AS license_status,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=${sqlLiteral(publicOrgA)} AND a.action='organization.suspended') AS audit_count FROM platform_organization_lifecycle l JOIN business_profile bp ON bp.organization_id=l.organization_id JOIN organization_license ol ON ol.organization_id=l.organization_id WHERE l.organization_id=${sqlLiteral(publicOrgA)};`)[0];
  if (suspendedState.status !== "suspended" || suspendedState.profile_status !== "published" || suspendedState.license_status !== "active" || Number(suspendedState.audit_count) !== 1) throw new Error(`Suspension changed persisted publication/license state or audit: ${JSON.stringify(suspendedState)}.`);

  const publicActivate = await admin.request(`/app/internal/organizations/${publicOrgA}`, { intent: "activate" });
  const reactivatedProfile = await getPublic(new URL(`/vecindario/${publicSlugs.a}`, baseUrl));
  const reactivatedDirectory = await getPublicHtml(new URL("/vecindario", baseUrl));
  const reactivatedCategory = await getPublicHtml(new URL("/vecindario?category=Certification%20category", baseUrl));
  const reactivatedCity = await getPublicHtml(new URL("/vecindario?city=City%20A", baseUrl));
  const reactivatedDirectoryHtml = reactivatedDirectory.html;
  const reactivatedCategoryHtml = reactivatedCategory.html;
  const reactivatedCityHtml = reactivatedCity.html;
  if (![302, 303].includes(publicActivate.status) || reactivatedProfile.status !== 200 || !reactivatedDirectoryHtml.includes("Public certification A") || !reactivatedCategoryHtml.includes("Public certification A") || !reactivatedCityHtml.includes("Public certification A") || !reactivatedDirectoryHtml.includes("Public certification B")) throw new Error("Reactivation did not restore A's public profile/directory filters while preserving B visibility.");
  const reactivatedState = query(`SELECT l.status AS lifecycle_status,bp.display_name,bp.short_description,bp.description,bp.status AS profile_status,ol.status AS license_status,m.published_configuration_json,(SELECT count(*) FROM member WHERE organization_id=l.organization_id) AS membership_count,(SELECT count(*) FROM member WHERE organization_id=l.organization_id AND role='owner') AS owner_count,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=${sqlLiteral(publicOrgA)} AND a.action='organization.active') AS audit_count FROM platform_organization_lifecycle l JOIN business_profile bp ON bp.organization_id=l.organization_id JOIN organization_license ol ON ol.organization_id=l.organization_id JOIN miniweb_site m ON m.organization_id=l.organization_id WHERE l.organization_id=${sqlLiteral(publicOrgA)};`)[0];
  const reactivatedTenantApi = await targetMember.jsonGet(`/api/organizations/${publicOrgA}/training`);
  if (reactivatedState.lifecycle_status !== "active" || reactivatedState.display_name !== publicSnapshot.display_name || reactivatedState.short_description !== publicSnapshot.short_description || reactivatedState.description !== publicSnapshot.description || reactivatedState.profile_status !== publicSnapshot.status || reactivatedState.license_status !== publicSnapshot.license_status || reactivatedState.published_configuration_json !== publicSnapshot.published_configuration_json || reactivatedState.membership_count !== publicSnapshot.membership_count || reactivatedState.owner_count !== publicSnapshot.owner_count || reactivatedTenantApi.status !== 200 || Number(reactivatedState.audit_count) !== 1) throw new Error(`Reactivation changed profile/MiniWeb/license/membership, failed tenant access restore, or missed its audit: ${JSON.stringify(reactivatedState)}, API=${reactivatedTenantApi.status}.`);

  query(`UPDATE organization_license SET status='suspended',updated_at=${Date.now()} WHERE organization_id=${sqlLiteral(publicOrgA)} AND status='active';`);
  const suspendWithoutLicense = await admin.request(`/app/internal/organizations/${publicOrgA}`, { intent: "suspend" });
  const activateWithoutLicense = await admin.request(`/app/internal/organizations/${publicOrgA}`, { intent: "activate" });
  const withoutLicenseProfile = await getPublic(new URL(`/vecindario/${publicSlugs.a}`, baseUrl));
  const withoutLicenseDirectory = await getPublicHtml(new URL("/vecindario", baseUrl));
  const withoutLicenseDirectoryHtml = withoutLicenseDirectory.html;
  const inactiveState = query(`SELECT l.status,ol.status AS license_status,bp.status AS profile_status,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=${sqlLiteral(publicOrgA)} AND a.action IN ('organization.suspended','organization.active')) AS audit_count FROM platform_organization_lifecycle l JOIN organization_license ol ON ol.organization_id=l.organization_id JOIN business_profile bp ON bp.organization_id=l.organization_id WHERE l.organization_id=${sqlLiteral(publicOrgA)};`)[0];
  if (![302, 303].includes(suspendWithoutLicense.status) || ![302, 303].includes(activateWithoutLicense.status) || withoutLicenseProfile.status !== 404 || withoutLicenseDirectoryHtml.includes("Public certification A") || !withoutLicenseDirectoryHtml.includes("Public certification B") || inactiveState.status !== "active" || inactiveState.license_status !== "suspended" || inactiveState.profile_status !== "published" || Number(inactiveState.audit_count) !== 4) throw new Error(`Inactive license bypassed public visibility or isolation: profile=${withoutLicenseProfile.status}, state=${JSON.stringify(inactiveState)}.`);
  console.log(JSON.stringify({ publicProfile: { initialHttp: initialProfile.status, directory: initialDirectory.response.status, categoryFilter: initialCategory.response.status, cityFilter: initialCity.response.status, hiddenGuards: hiddenBefore, suspended: { action: publicSuspend.status, profileHttp: suspendedProfile.status, tenantApi: suspendedTenantApi.status }, reactivated: { action: publicActivate.status, profileHttp: reactivatedProfile.status, tenantApi: reactivatedTenantApi.status, membershipsPreserved: reactivatedState.membership_count === publicSnapshot.membership_count, ownerMembershipsPreserved: reactivatedState.owner_count === publicSnapshot.owner_count }, inactiveLicenseAfterReactivation: { suspend: suspendWithoutLicense.status, activate: activateWithoutLicense.status, profileHttp: withoutLicenseProfile.status, lifecycleAuditCount: Number(inactiveState.audit_count) }, organizationB: publicSlugs.b } }, null, 2));

  const trainingPath = `/api/platform/organizations/${orgId}/training`;
  const assignmentResponse = await admin.json(trainingPath, { action: "assign", trainingSlug: "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo" });
  const duplicateAssignmentResponse = await admin.json(trainingPath, { action: "assign", trainingSlug: "que-es-un-crm-y-por-que-un-negocio-pequeno-puede-necesitarlo" });
  const trainingDataResponse = await admin.jsonGet(trainingPath);
  const trainingData = await trainingDataResponse.json();
  const assignment = trainingData.assignments?.[0];
  if (assignmentResponse.status !== 201 || duplicateAssignmentResponse.status !== 201 || trainingDataResponse.status !== 200 || trainingData.assignments?.length !== 1 || !assignment?.id) throw new Error("La asignación de capacitación no fue idempotente o no se pudo leer.");
  const progressId = randomUUID();
  query(`INSERT INTO organization_training_progress (id,assignment_id,user_id,status,updated_at) VALUES (${sqlLiteral(progressId)},${sqlLiteral(assignment.id)},${sqlLiteral(memberIdentity.user.id)},'in_progress',${sqlNow}); INSERT INTO organization_training_progress_history (id,progress_id,actor_user_id,previous_status,new_status,reason,created_at) VALUES (${sqlLiteral(randomUUID())},${sqlLiteral(progressId)},${sqlLiteral(memberIdentity.user.id)},'not_started','in_progress',NULL,${sqlNow});`);
  await workerReady(baseUrl);
  const correction = await admin.json(trainingPath, { action: "correct_progress", assignmentId: assignment.id, userId: memberIdentity.user.id, status: "completed", reason: "Corrección verificada en certificación" });
  const crossTenantCorrection = await admin.json(trainingPath, { action: "correct_progress", assignmentId: assignment.id, userId: staffIdentity.user.id, status: "completed", reason: "Debe rechazarse por tenant" });
  const trainingState = query(`SELECT p.status,h.previous_status,h.new_status,h.reason,(SELECT count(*) FROM platform_audit_log a WHERE a.organization_id=${sqlLiteral(orgId)} AND a.action='training.progress.correct') AS audit_count FROM organization_training_progress p JOIN organization_training_progress_history h ON h.progress_id=p.id WHERE p.id=${sqlLiteral(progressId)} ORDER BY h.created_at DESC LIMIT 1;`)[0];
  await workerReady(baseUrl);
  if (correction.status !== 200 || crossTenantCorrection.status !== 404 || trainingState.status !== "completed" || trainingState.previous_status !== "in_progress" || trainingState.new_status !== "completed" || trainingState.reason !== "Corrección verificada en certificación" || Number(trainingState.audit_count) !== 1) throw new Error("La corrección de capacitación no conservó pertenencia, historial y auditoría.");

  const miniwebProfileId = randomUUID();
  const miniwebBillingAccountId = randomUUID();
  query(`INSERT INTO billing_account (id,owner_user_id,kind,name,created_at,updated_at) VALUES (${sqlLiteral(miniwebBillingAccountId)},${sqlLiteral(intendedIdentity.user.id)},'individual','Synthetic MiniWeb certification',${sqlNow},${sqlNow}) ON CONFLICT(owner_user_id) DO NOTHING;
INSERT INTO organization_license (id,organization_id,billing_account_id,plan_code,price_id,status,started_at,activated_at,ends_at,created_at,updated_at) VALUES (${sqlLiteral(randomUUID())},${sqlLiteral(orgId)},(SELECT id FROM billing_account WHERE owner_user_id=${sqlLiteral(intendedIdentity.user.id)}),'cuadra','license-price-cuadra-v1','active',${sqlNow},${sqlNow},NULL,${sqlNow},${sqlNow});
INSERT INTO business_profile (id,organization_id,display_name,slug,short_description,description,category,city,country,status,created_at,updated_at) VALUES (${sqlLiteral(miniwebProfileId)},${sqlLiteral(orgId)},'MiniWeb certification ${suffix}', 'miniweb-cert-${suffix}','Synthetic profile','Synthetic description','Certification category','Test city','Test country','draft',${sqlNow},${sqlNow});`);
  await workerReady(baseUrl);
  const miniwebPath = `/app/internal/organizations/${orgId}/miniweb`;
  const configuration = { templateKey: "vecidya-default", templateVersion: 1, layoutVariant: "standard", modules: [{ type: "hero", moduleVersion: 1, enabled: true, sortOrder: 0, layoutVariant: "standard", settings: null }] };
  const savedMiniWeb = await admin.request(miniwebPath, { intent: "save", configuration: JSON.stringify(configuration) });
  const miniwebDraftRevision = query(`SELECT draft_revision FROM business_profile_publication WHERE organization_id=${sqlLiteral(orgId)};`)[0]?.draft_revision;
  const publishedMiniWeb = await admin.request(miniwebPath, { intent: "publish", draftRevision: String(miniwebDraftRevision) });
  const staffMiniWeb = await staff.request(miniwebPath, { intent: "save", configuration: JSON.stringify(configuration) });
  const miniwebState = query(`SELECT snapshot_json,snapshot_schema_version FROM business_profile_publication WHERE organization_id=${sqlLiteral(orgId)};`)[0];
  const publishedSnapshot = miniwebState?.snapshot_schema_version === 3 && miniwebState.snapshot_json ? JSON.parse(miniwebState.snapshot_json) : null;
  const miniwebAudit = query(`SELECT action FROM platform_audit_log WHERE organization_id=${sqlLiteral(orgId)} AND action IN ('organization.miniweb.save','organization.miniweb.publish') ORDER BY created_at,rowid;`);
  await workerReady(baseUrl);
  if (savedMiniWeb.status !== 303 || publishedMiniWeb.status !== 303 || staffMiniWeb.status !== 403 || publishedSnapshot?.configuration?.templateKey !== configuration.templateKey || miniwebAudit.length !== 2 || miniwebAudit[0].action !== "organization.miniweb.save" || miniwebAudit[1].action !== "organization.miniweb.publish") throw new Error(`MiniWeb no pasó autorización/publicación/auditoría: save=${savedMiniWeb.status}, publish=${publishedMiniWeb.status}, staff=${staffMiniWeb.status}, snapshot=${publishedSnapshot?.configuration?.templateKey ?? "ausente"}, audit=${miniwebAudit.map(({ action }) => action).join(",")}.`);

  query(`UPDATE member SET role='admin' WHERE organization_id=${sqlLiteral(orgId)} AND user_id=${sqlLiteral(memberIdentity.user.id)};`);
  await workerReady(baseUrl);
  const memberId = query(`SELECT id FROM member WHERE organization_id=${sqlLiteral(orgId)} AND user_id=${sqlLiteral(memberIdentity.user.id)};`)[0]?.id;
  await workerReady(baseUrl);
  const [setMember, setAdmin] = await Promise.all([
    admin.request(`/app/internal/organizations/${orgId}`, { intent: "team-role", memberId, role: "member" }),
    admin.request(`/app/internal/organizations/${orgId}`, { intent: "team-role", memberId, role: "admin" }),
  ]);
  const finalRole = query(`SELECT role FROM member WHERE organization_id=${sqlLiteral(orgId)} AND user_id=${sqlLiteral(memberIdentity.user.id)};`)[0]?.role;
  const roleAudit = query(`SELECT previous_value,new_value FROM platform_audit_log WHERE organization_id=${sqlLiteral(orgId)} AND action='organization.team_role.update' ORDER BY created_at,rowid;`);
  const roleAuditConsistent = roleAudit.length >= 1 && roleAudit.length <= 2 && roleAudit[0].previous_value === "admin"
    && roleAudit.every((entry, index) => entry.previous_value !== entry.new_value && (index === 0 || roleAudit[index - 1].new_value === entry.previous_value))
    && roleAudit.at(-1).new_value === finalRole;
  if (!["admin", "member"].includes(finalRole) || !roleAuditConsistent || [setMember, setAdmin].some((response) => ![302, 303, 409].includes(response.status))) throw new Error(`El cambio concurrente de rol dejó auditoría inconsistente; rol=${finalRole}, audits=${JSON.stringify(roleAudit)}.`);

  console.log(JSON.stringify({ wrongEmailStatus: wrong.status, concurrentAcceptanceStatus: accept.status, concurrentResendStatus: resend.status, successfulResend: { response: resendResponse.status, replacedInvitation, lifecycle: resendState.status, pending: Number(resendState.pending_count), audit: Number(resendState.audit_count) }, successfulRevoke: { response: revokeResponse.status, lifecycle: revokeState.status, pending: Number(revokeState.pending_count), audit: Number(revokeState.audit_count) }, reusedInvitationStatus: reusedInvitation.status, expiredInvitationStatus: expiredResponse.status, revokedInvitationStatus: revokedResponse.status, invitation: invitationState.status, lifecycle: lifecycleState.status, ownerMemberships: ownerCount, pendingInvitations: Number(pendingCount), concurrentSuspendStatuses: [suspendA.status, suspendB.status], suspendAuditRows: Number(auditCount), accessMatrix: { staffRead: staffRead.status, staffWrite: staffWrite.status, ownerRead: ownerRead.status, memberRead: memberRead.status }, suspendedOrganizationApi: { activeOrganization: activeOrganization.status, readTraining: suspendedOrganizationApi.status }, reactivation: { response: reactivate.status, readTraining: reactivatedOrganizationApi.status, audit: lifecycleAudit }, training: { assignment: assignmentResponse.status, correction: correction.status, crossTenantCorrection: crossTenantCorrection.status, auditCount: Number(trainingState.audit_count) }, miniweb: { save: savedMiniWeb.status, publish: publishedMiniWeb.status, staffSave: staffMiniWeb.status, auditActions: miniwebAudit.map(({ action }) => action) }, concurrentRoleStatuses: [setMember.status, setAdmin.status], finalRole, roleAudit }, null, 2));
  console.log("PASS: casos locales focales de invitación, concurrencia de aceptación/reenvío y auditoría CAS.");
} catch (error) {
  await new Promise((resolveWait) => setTimeout(resolveWait, 300));
  throw new Error(`${error instanceof Error ? error.message : String(error)}\nCausa: ${error instanceof Error ? String(error.cause ?? "") : ""}\nWorker exit: ${worker?.exitCode ?? "activo"}\nSalida Worker local:\n${worker?.output ?? "(no iniciado)"}`, { cause: error });
} finally {
  if (worker && worker.exitCode === null) { const exited = once(worker, "exit"); worker.kill("SIGINT"); await Promise.race([exited, new Promise((resolveWait) => setTimeout(resolveWait, 5000))]); }
  try {
    rmSync(persistence, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
    if (existsSync(persistence)) throw new Error(`La D1 aislada sigue presente: ${persistenceName}`);
    console.log("PASS: D1 aislada eliminada y ausencia verificada.");
  } catch (error) {
    throw new Error(`No se pudo verificar la limpieza de ${persistenceName}: ${String(error)}`, { cause: error });
  }
}
