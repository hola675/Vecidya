import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";
import { createDiagnostics, describeSqlOperation, diagnosticProcessSummary, redactDiagnosticText, sqlInList } from "./authorization-harness-diagnostics.mjs";

// El servidor de desarrollo escucha solo en ::1. Con la ventana por defecto de 250 ms, un connect
// lento a ::1 cae a 127.0.0.1 (rechazado) y fetch falla con ETIMEDOUT sin llegar al Worker.
setDefaultAutoSelectFamilyAttemptTimeout(5_000);

// AUTHZ-BA-001: sesión → organización objetivo → membresía → rol → recurso de la organización.
// Las comprobaciones se acumulan para que una ejecución en rojo liste todos los huecos a la vez.
// Un fallo de preparación (registro, D1 local, red) aborta como HARNESS: nunca cuenta como
// resultado de autorización. Las peticiones que se evalúan no se reintentan.
class HarnessError extends Error {}
const harness = (condition, message) => { if (!condition) throw new HarnessError(`HARNESS: ${message}`); };

const requestedRunId = process.env.AUTHZ_RUN_ID;
const validRunId = !requestedRunId || /^[A-Za-z0-9-]{8,80}$/.test(requestedRunId);
const runId = validRunId ? requestedRunId ?? crypto.randomUUID() : crypto.randomUUID();
const persistTo = process.env.AUTHZ_D1_PERSIST_TO;
const suffix = runId;
const results = [];
const expectedChecks = 173;
const D1_TIMEOUT_MS = 45_000;
const HTTP_TIMEOUT_MS = 20_000;
const WARMUP_TIMEOUT_MS = 22_000;
const diagnostics = createDiagnostics({ runId, totalChecks: expectedChecks });
let stageNumber = 0;
let d1OperationNumber = 0;
const enterStage = (name) => diagnostics.startStage(`${++stageNumber}.${name}`);

const check = (condition, label) => {
  const ok = Boolean(condition);
  results.push({ ok, label });
  diagnostics.recordCheck(ok, label);
};

function safePath(path) {
  const pathname = new URL(path, baseUrl).pathname;
  return pathname
    .replaceAll(runId, "<run>")
    .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, "<id>");
}

async function trackedFetch(url, options = {}, timeoutMs = HTTP_TIMEOUT_MS) {
  const method = options.method ?? "GET";
  const operation = diagnostics.startOperation("HTTP", `${method} ${safePath(url)}`, timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal ?? AbortSignal.timeout(timeoutMs),
    });
    await response.clone().arrayBuffer();
    operation({ outcome: "response", status: response.status });
    return response;
  } catch (error) {
    operation({ outcome: "error", error: error?.name ?? "unknown", timedOut: error?.name === "TimeoutError" });
    throw new HarnessError(`HARNESS: HTTP ${method} ${safePath(url)} ${error?.name === "TimeoutError" ? `superó ${timeoutMs} ms` : "falló antes de completar"}.`);
  }
}

function executeD1(sql) {
  d1OperationNumber += 1;
  const operation = diagnostics.startOperation("D1", `wrangler-${d1OperationNumber} ${describeSqlOperation(sql)}`, D1_TIMEOUT_MS);
  let operationEnded = false;
  let directory;
  try {
    directory = mkdtempSync(join(tmpdir(), "vecidya-authz-"));
    const file = join(directory, "step.sql");
    writeFileSync(file, sql, "utf8");
    const wranglerCli = fileURLToPath(import.meta.resolve("wrangler"));
    const result = spawnSync(process.execPath, [wranglerCli, "d1", "execute", "DB", "--local", "--persist-to", persistTo, "--json", "--file", file], {
      cwd: process.cwd(),
      encoding: "utf8",
      windowsHide: true,
      timeout: D1_TIMEOUT_MS,
      killSignal: "SIGTERM",
      maxBuffer: 4 * 1024 * 1024,
    });
    let externalState = "not-checked";
    if (result.error || result.signal) {
      try {
        process.kill(result.pid, 0);
        externalState = "still-running";
      } catch (error) {
        externalState = error?.code === "EPERM" ? "still-running" : "not-running-or-unavailable";
      }
    }
    const timedOut = result.error?.code === "ETIMEDOUT";
    operation({ outcome: result.status === 0 ? "ok" : "failed", status: result.status, signal: result.signal, error: result.error?.code, external: externalState, timedOut });
    operationEnded = true;
    if (result.status !== 0) {
      throw new HarnessError(`HARNESS: Wrangler D1 falló ${diagnosticProcessSummary({ ...result, stderr: result.stderr, externalState, timedOut })}`);
    }
    return JSON.parse(result.stdout).flatMap((statement) => statement.results ?? []);
  } catch (error) {
    if (!operationEnded) {
      operation({ outcome: "error", error: error?.code ?? error?.name ?? "unknown" });
      operationEnded = true;
    }
    if (error instanceof HarnessError) throw error;
    throw new HarnessError(`HARNESS: D1 setup/parse error (${error?.name ?? "Error"}): ${redactDiagnosticText(error?.message ?? "sin detalle")}`);
  } finally {
    if (directory) rmSync(directory, { recursive: true, force: true });
  }
}

// TEST-D1-RESET-001: tras usar Wrangler sobre la D1 local, la primera petición al Worker recibe
// ECONNRESET. Se absorbe con una petición de calentamiento que no evalúa nada; solo ella reintenta.
async function d1(sql) {
  const rows = executeD1(sql);
  let lastWarmupError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await trackedFetch(new URL("/api/auth/ok", baseUrl), {}, WARMUP_TIMEOUT_MS);
      harness(response.status === 200, `el endpoint de calentamiento devolvió ${response.status}`);
      return rows;
    } catch (error) {
      lastWarmupError = error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new HarnessError(`HARNESS: el Worker local no respondió tras usar D1 (TEST-D1-RESET-001): ${redactDiagnosticText(lastWarmupError?.message ?? "sin detalle")}`);
}

class SessionClient {
  #cookies = new Map();
  async fetch(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("origin", baseUrl);
    if (this.#cookies.size) headers.set("cookie", [...this.#cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; "));
    const response = await trackedFetch(new URL(path, baseUrl), { ...options, headers, redirect: "manual" });
    for (const setCookie of response.headers.getSetCookie()) {
      const [pair] = setCookie.split(";", 1);
      const [name, ...value] = pair.split("=");
      this.#cookies.set(name, value.join("="));
    }
    return response;
  }
  json(path, body, extraHeaders = {}) { return this.fetch(path, { method: "POST", headers: { "content-type": "application/json", ...extraHeaders }, body: JSON.stringify(body) }); }
  form(path, values) { return this.fetch(path, { method: "POST", body: new URLSearchParams(values) }); }
}

const email = (key) => `authz-${key}-${suffix}@vecidya.test`;
const slug = (key) => `authz-${key}-${suffix}`;
const orgName = (key) => `AUTHZ Org ${key} ${suffix}`;
const signupKeys = ["owner-a", "owner-b", "intruder", "admin-a", "member-a", "bystander", "promotable", "removable", "leaver", "revoked", "stale", "invitee", "unverified", "stranger", "no-org", "platform-admin"];
const signupInvitations = Object.fromEntries(signupKeys.map((key) => [key, crypto.randomUUID()]));
const fixtureInviterId = crypto.randomUUID();
const fixtureOrganizationId = crypto.randomUUID();
const billingAccountId = crypto.randomUUID();
const licensePriceId = crypto.randomUUID();
const organizationLicenseId = crypto.randomUUID();
const fixtureUserIds = new Set([fixtureInviterId]);
const fixtureEmailAddresses = new Set([`authz-inviter-${suffix}@vecidya.test`]);
const fixtureOrganizationIds = new Set([fixtureOrganizationId]);
const fixtureInvitationIds = new Set(Object.values(signupInvitations));
const fixtureMemberIds = new Set();
const fixturePlatformMemberIds = new Set();
const fixtureProfileIds = new Set();
const fixtureOrganizationServiceIds = new Set();
const fixtureSessionIds = new Set();
const fixtureAccountIds = new Set();
const memberIdsByUserAndOrganization = new Map();
const membershipKey = (userId, organizationId) => `${userId}:${organizationId}`;

async function signUp(key) {
  const client = new SessionClient();
  const response = await client.json("/api/auth/sign-up/email", { name: `AUTHZ ${key} ${suffix}`, email: email(key), password: `test-only-password-${suffix}` }, { "X-Vecidya-Invitation": signupInvitations[key] });
  harness(response.status === 200, `registro de ${key} devolvió ${response.status}`);
  const { user } = await response.json();
  fixtureUserIds.add(user.id);
  fixtureEmailAddresses.add(user.email);
  return { key, client, userId: user.id, email: user.email };
}

async function createOrganization(identity, key) {
  const response = await identity.client.json("/api/auth/organization/create", { name: orgName(key), slug: slug(key) });
  harness(response.status === 200, `crear organización ${key} devolvió ${response.status}`);
  const organizationId = (await response.json()).id;
  fixtureOrganizationIds.add(organizationId);
  return organizationId;
}

async function setActive(identity, organizationId) {
  const response = await identity.client.json("/api/auth/organization/set-active", { organizationId });
  harness(response.status === 200, `activar ${organizationId} para ${identity.key} devolvió ${response.status}`);
}

async function statusOf(client, path, options) {
  const response = await client.fetch(path, options);
  await response.arrayBuffer();
  return response.status;
}

async function activeOrganizationOf(identity) {
  const response = await identity.client.fetch("/api/auth/get-session");
  harness(response.status === 200, `get-session de ${identity.key} devolvió ${response.status}`);
  return (await response.json())?.session?.activeOrganizationId ?? null;
}

const post = (body) => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const formPost = (values) => ({ method: "POST", body: new URLSearchParams(values) });
const memberIdOf = (userId, organizationId) => memberIdsByUserAndOrganization.get(membershipKey(userId, organizationId)) ?? null;

async function seedInvitationFixture() {
  const now = Date.now();
  const expiresAt = now + 86_400_000;
  const inviteValues = signupKeys.map((key) => `('${signupInvitations[key]}', '${fixtureOrganizationId}', '${email(key)}', 'member', 'pending', ${expiresAt}, ${now}, '${fixtureInviterId}')`).join(",\n");
  await d1(`
    INSERT INTO user (id, name, email, email_verified, created_at, updated_at)
      VALUES ('${fixtureInviterId}', 'AUTHZ test inviter', 'authz-inviter-${suffix}@vecidya.test', 1, ${now}, ${now});
    INSERT INTO organization (id, name, slug, created_at)
      VALUES ('${fixtureOrganizationId}', 'AUTHZ invitation fixture', '${slug("fixture")}', ${now});
    INSERT INTO invitation (id, organization_id, email, role, status, expires_at, created_at, inviter_id)
      VALUES ${inviteValues};
  `);
}

function ownerALicenseSeedSql(ownerUserId, organizationId) {
  const now = Date.now();
  return `
    INSERT INTO billing_account (id, owner_user_id, kind, created_at, updated_at)
      VALUES ('${billingAccountId}', '${ownerUserId}', 'individual', ${now}, ${now});
    INSERT INTO license_price (id, plan_code, currency, amount_cents, billing_interval, effective_from, status, created_at, updated_at)
      VALUES ('${licensePriceId}', 'cuadra', 'USD', 3900, 'monthly', ${now}, 'active', ${now}, ${now});
    INSERT INTO organization_license (id, organization_id, billing_account_id, plan_code, price_id, status, started_at, activated_at, created_at, updated_at)
      VALUES ('${organizationLicenseId}', '${organizationId}', '${billingAccountId}', 'cuadra', '${licensePriceId}', 'active', ${now}, ${now}, ${now}, ${now});
  `;
}

function cleanupFixtures() {
  const userIds = sqlInList([...fixtureUserIds]);
  const organizationIds = sqlInList([...fixtureOrganizationIds]);
  const invitationIds = sqlInList([...fixtureInvitationIds]);
  const memberIds = sqlInList([...fixtureMemberIds]);
  const platformMemberIds = sqlInList([...fixturePlatformMemberIds]);
  const profileIds = sqlInList([...fixtureProfileIds]);
  const organizationServiceIds = sqlInList([...fixtureOrganizationServiceIds]);
  const sessionIds = sqlInList([...fixtureSessionIds]);
  const accountIds = sqlInList([...fixtureAccountIds]);
  const emailAddresses = sqlInList([...fixtureEmailAddresses]);
  const rows = executeD1(`
    SELECT
      (SELECT COUNT(*) FROM user WHERE id IN (${userIds})) AS users,
      (SELECT COUNT(*) FROM organization WHERE id IN (${organizationIds})) AS organizations,
      (SELECT COUNT(*) FROM invitation WHERE id IN (${invitationIds}) OR organization_id IN (${organizationIds})) AS invitations,
      (SELECT COUNT(*) FROM member WHERE id IN (${memberIds}) OR user_id IN (${userIds}) OR organization_id IN (${organizationIds})) AS memberships,
      (SELECT COUNT(*) FROM platform_member WHERE id IN (${platformMemberIds}) OR user_id IN (${userIds})) AS platform_members,
      (SELECT COUNT(*) FROM platform_audit_log WHERE actor_user_id IN (${userIds}) OR organization_id IN (${organizationIds})) AS audit_logs,
      (SELECT COUNT(*) FROM business_profile WHERE id IN (${profileIds}) OR organization_id IN (${organizationIds})) AS profiles,
      (SELECT COUNT(*) FROM business_hours WHERE organization_id IN (${organizationIds})) AS business_hours,
      (SELECT COUNT(*) FROM organization_service WHERE id IN (${organizationServiceIds}) OR organization_id IN (${organizationIds})) AS services,
      (SELECT COUNT(*) FROM integration_connection WHERE organization_id IN (${organizationIds})) AS integrations,
      (SELECT COUNT(*) FROM miniweb_site WHERE organization_id IN (${organizationIds})) AS miniweb_sites,
      (SELECT COUNT(*) FROM billing_account WHERE id = '${billingAccountId}') AS billing_accounts,
      (SELECT COUNT(*) FROM organization_license WHERE id = '${organizationLicenseId}' OR organization_id IN (${organizationIds})) AS licenses,
      (SELECT COUNT(*) FROM session WHERE id IN (${sessionIds}) OR user_id IN (${userIds})) AS sessions,
      (SELECT COUNT(*) FROM account WHERE id IN (${accountIds}) OR user_id IN (${userIds})) AS accounts,
      (SELECT COUNT(*) FROM verification WHERE identifier IN (${emailAddresses})) AS verifications,
      (SELECT COUNT(*) FROM license_price WHERE id = '${licensePriceId}') AS prices;
    DELETE FROM platform_audit_log WHERE actor_user_id IN (${userIds}) OR organization_id IN (${organizationIds});
    DELETE FROM organization_service WHERE id IN (${organizationServiceIds}) OR organization_id IN (${organizationIds});
    DELETE FROM business_hours WHERE organization_id IN (${organizationIds});
    DELETE FROM integration_connection WHERE organization_id IN (${organizationIds});
    DELETE FROM miniweb_site WHERE organization_id IN (${organizationIds});
    DELETE FROM organization_license WHERE id = '${organizationLicenseId}' OR organization_id IN (${organizationIds});
    DELETE FROM business_profile WHERE id IN (${profileIds}) OR organization_id IN (${organizationIds});
    DELETE FROM billing_account WHERE id = '${billingAccountId}';
    DELETE FROM license_price WHERE id = '${licensePriceId}';
    DELETE FROM platform_member WHERE id IN (${platformMemberIds}) OR user_id IN (${userIds});
    DELETE FROM invitation WHERE id IN (${invitationIds}) OR organization_id IN (${organizationIds});
    DELETE FROM member WHERE id IN (${memberIds}) OR user_id IN (${userIds}) OR organization_id IN (${organizationIds});
    DELETE FROM organization WHERE id IN (${organizationIds});
    DELETE FROM session WHERE id IN (${sessionIds}) OR user_id IN (${userIds});
    DELETE FROM account WHERE id IN (${accountIds}) OR user_id IN (${userIds});
    DELETE FROM verification WHERE identifier IN (${emailAddresses});
    DELETE FROM user WHERE id IN (${userIds});
    SELECT
      (SELECT COUNT(*) FROM user WHERE id IN (${userIds})) AS users,
      (SELECT COUNT(*) FROM organization WHERE id IN (${organizationIds})) AS organizations,
      (SELECT COUNT(*) FROM invitation WHERE id IN (${invitationIds}) OR organization_id IN (${organizationIds})) AS invitations,
      (SELECT COUNT(*) FROM member WHERE id IN (${memberIds}) OR user_id IN (${userIds}) OR organization_id IN (${organizationIds})) AS memberships,
      (SELECT COUNT(*) FROM platform_member WHERE id IN (${platformMemberIds}) OR user_id IN (${userIds})) AS platform_members,
      (SELECT COUNT(*) FROM platform_audit_log WHERE actor_user_id IN (${userIds}) OR organization_id IN (${organizationIds})) AS audit_logs,
      (SELECT COUNT(*) FROM business_profile WHERE id IN (${profileIds}) OR organization_id IN (${organizationIds})) AS profiles,
      (SELECT COUNT(*) FROM business_hours WHERE organization_id IN (${organizationIds})) AS business_hours,
      (SELECT COUNT(*) FROM organization_service WHERE id IN (${organizationServiceIds}) OR organization_id IN (${organizationIds})) AS services,
      (SELECT COUNT(*) FROM integration_connection WHERE organization_id IN (${organizationIds})) AS integrations,
      (SELECT COUNT(*) FROM miniweb_site WHERE organization_id IN (${organizationIds})) AS miniweb_sites,
      (SELECT COUNT(*) FROM billing_account WHERE id = '${billingAccountId}') AS billing_accounts,
      (SELECT COUNT(*) FROM organization_license WHERE id = '${organizationLicenseId}' OR organization_id IN (${organizationIds})) AS licenses,
      (SELECT COUNT(*) FROM license_price WHERE id = '${licensePriceId}') AS prices,
      (SELECT COUNT(*) FROM session WHERE id IN (${sessionIds}) OR user_id IN (${userIds})) AS sessions,
      (SELECT COUNT(*) FROM account WHERE id IN (${accountIds}) OR user_id IN (${userIds})) AS accounts,
      (SELECT COUNT(*) FROM verification WHERE identifier IN (${emailAddresses})) AS verifications;
  `);
  const before = rows[0];
  const remaining = rows.at(-1);
  console.log(`[authz run=${runId}] CLEANUP scope=${JSON.stringify({ users: fixtureUserIds.size, organizations: fixtureOrganizationIds.size, invitations: fixtureInvitationIds.size, memberships: fixtureMemberIds.size, platformMembers: fixturePlatformMemberIds.size, profiles: fixtureProfileIds.size, organizationServices: fixtureOrganizationServiceIds.size, sessions: fixtureSessionIds.size, accounts: fixtureAccountIds.size })} before=${JSON.stringify(before)} after=${JSON.stringify(remaining)}`);
  harness(before && Object.values(before).every((value) => Number.isSafeInteger(Number(value)) && Number(value) >= 0), "no se pudo obtener el inventario previo a la limpieza.");
  harness(remaining && Object.values(remaining).every((value) => Number(value) === 0), "quedaron fixtures locales AUTHZ tras el teardown verificado.");
}

let harnessFailure = null;
let cleanupFailure = null;
let fixturesMayExist = false;
try {
  harness(validRunId, "AUTHZ_RUN_ID debe ser un identificador alfanumérico único.");
  assertLocalBaseUrl();
  harness(isAbsolute(persistTo ?? ""), "AUTHZ_D1_PERSIST_TO debe apuntar a una ruta local absoluta, exclusiva de esta ejecución.");
  const isolatedRoot = resolve(tmpdir(), "kilo", "vecidya-app-client-00a", "authz-runs");
  const relativePersistPath = relative(isolatedRoot, resolve(persistTo));
  harness(relativePersistPath && !relativePersistPath.startsWith("..") && !isAbsolute(relativePersistPath), "la D1 efímera debe vivir bajo el directorio temporal aislado de APP-CLIENTE-00A.");
  harness(basename(resolve(persistTo)) === runId, "el último segmento de la D1 debe coincidir con AUTHZ_RUN_ID para impedir reutilización accidental.");

  enterStage("preflight-new-local-d1");
  const [baseline] = await d1(`
    SELECT
      (SELECT COUNT(*) FROM d1_migrations) AS migrations,
      (SELECT COUNT(*) FROM user) AS users,
      (SELECT COUNT(*) FROM organization) AS organizations,
      (SELECT COUNT(*) FROM member) AS members,
      (SELECT COUNT(*) FROM invitation) AS invitations,
      (SELECT COUNT(*) FROM business_profile) AS profiles,
      (SELECT COUNT(*) FROM platform_member) AS platform_members,
      (SELECT COUNT(*) FROM platform_audit_log) AS audit_logs,
      (SELECT COUNT(*) FROM organization_service) AS services,
      (SELECT COUNT(*) FROM billing_account) AS billing_accounts,
      (SELECT COUNT(*) FROM organization_license) AS licenses;
  `);
  harness(Number(baseline?.migrations) === 20, `se esperaban 20 migraciones aplicadas, se encontraron ${baseline?.migrations ?? "ninguna"}.`);
  harness(Object.entries(baseline ?? {}).filter(([key]) => key !== "migrations").every(([, count]) => Number(count) === 0), "D1 no está vacía de fixtures antes de iniciar la ejecución.");

  // --- Preparación -------------------------------------------------------------------------
  enterStage("fixture-preparation-and-registration");
  fixturesMayExist = true;
  await seedInvitationFixture();
  const ownerA = await signUp("owner-a");
  const orgA = await createOrganization(ownerA, "org-a");
  enterStage("seed-first-organization-license");
  await d1(ownerALicenseSeedSql(ownerA.userId, orgA));
  enterStage("create-additional-organizations-and-users");
  const orgC = await createOrganization(ownerA, "org-c");
  const orgDisposable = await createOrganization(ownerA, "org-d");
  await setActive(ownerA, orgA);
  const ownerB = await signUp("owner-b");
  const orgB = await createOrganization(ownerB, "org-b");
  await setActive(ownerB, orgB);
  const intruder = await signUp("intruder");
  await setActive(intruder, await createOrganization(intruder, "org-x"));
  const [adminA, memberA, bystander, promotable, removable, leaver, revoked, stale, invitee, unverified, stranger, noOrg, platformAdmin] = await Promise.all(
    ["admin-a", "member-a", "bystander", "promotable", "removable", "leaver", "revoked", "stale", "invitee", "unverified", "stranger", "no-org", "platform-admin"].map(signUp),
  );

  const now = Date.now();
  const expiresAt = now + 86_400_000;
  const invitations = Object.fromEntries(["a1", "a2", "a3", "b", "c", "invitee", "unverified", "canceled"].map((key) => [key, crypto.randomUUID()]));
  for (const invitationId of Object.values(invitations)) fixtureInvitationIds.add(invitationId);
  const joinA = (identity, role) => {
    const memberId = crypto.randomUUID();
    fixtureMemberIds.add(memberId);
    memberIdsByUserAndOrganization.set(membershipKey(identity.userId, orgA), memberId);
    return `('${memberId}', '${orgA}', '${identity.userId}', '${role}', ${now})`;
  };
  const invite = (id, organizationId, to, inviterId, status = "pending") => `('${id}', '${organizationId}', '${to}', 'member', '${status}', ${expiresAt}, ${now}, '${inviterId}')`;
  const platformMemberId = crypto.randomUUID();
  fixturePlatformMemberIds.add(platformMemberId);
  const seedRows = await d1(`
    INSERT INTO member (id, organization_id, user_id, role, created_at) VALUES
      ${[joinA(adminA, "admin"), ...[memberA, bystander, promotable, removable, leaver, revoked, stale].map((identity) => joinA(identity, "member"))].join(",\n      ")};
    INSERT INTO invitation (id, organization_id, email, role, status, expires_at, created_at, inviter_id) VALUES
      ${[
        invite(invitations.a1, orgA, email("pending-1"), ownerA.userId),
        invite(invitations.a2, orgA, email("pending-2"), ownerA.userId),
        invite(invitations.a3, orgA, email("pending-3"), ownerA.userId),
        invite(invitations.b, orgB, email("pending-b"), ownerB.userId),
        invite(invitations.c, orgC, email("pending-c"), ownerA.userId),
        invite(invitations.invitee, orgA, invitee.email, ownerA.userId),
        invite(invitations.unverified, orgA, unverified.email, ownerA.userId),
        invite(invitations.canceled, orgA, stranger.email, ownerA.userId, "canceled"),
      ].join(",\n      ")};
    UPDATE user SET email_verified = 1 WHERE id IN ('${invitee.userId}', '${stranger.userId}');
    DELETE FROM member WHERE user_id = '${noOrg.userId}' AND organization_id = '${fixtureOrganizationId}';
    UPDATE session SET active_organization_id = NULL WHERE user_id = '${noOrg.userId}';
    INSERT INTO platform_member (id, user_id, role, status, created_at, updated_at) VALUES ('${platformMemberId}', '${platformAdmin.userId}', 'platform_admin', 'active', ${now}, ${now});
    SELECT 'service' AS kind, id, NULL AS user_id, NULL AS organization_id, NULL AS role FROM service_catalog WHERE status = 'active' LIMIT 1;
    SELECT 'member' AS kind, id, user_id, organization_id, role FROM member WHERE organization_id IN ('${orgA}', '${orgB}');
  `);
  const serviceRow = seedRows.find((candidate) => candidate.kind === "service");
  harness(serviceRow?.kind === "service" && serviceRow.id, "service_catalog local no tiene servicios activos.");
  for (const row of seedRows.filter((candidate) => candidate.kind === "member")) {
    memberIdsByUserAndOrganization.set(membershipKey(row.user_id, row.organization_id), row.id);
  }
  for (const identity of [adminA, memberA, bystander, promotable, removable, leaver, revoked, stale]) await setActive(identity, orgA);

  const api = (organizationId, resource = "") => `/api/organizations/${organizationId}${resource}`;
  const members = {
    bystander: memberIdsByUserAndOrganization.get(membershipKey(bystander.userId, orgA)),
    promotable: memberIdsByUserAndOrganization.get(membershipKey(promotable.userId, orgA)),
    removable: memberIdsByUserAndOrganization.get(membershipKey(removable.userId, orgA)),
    ownerB: memberIdsByUserAndOrganization.get(membershipKey(ownerB.userId, orgB)),
  };
  harness(Object.values(members).every(Boolean), "No se pudieron identificar todos los IDs de membresía del fixture.");
  const anonymous = new SessionClient();

  // --- 1. Superficie HTTP del plugin Organization de Better Auth ---------------------------
  enterStage("better-auth-http-surface");
  check(await statusOf(anonymous, "/app") === 302, "Sesión anónima: `/app` redirige al login");
  const anonymousSession = await anonymous.fetch("/api/auth/get-session");
  check(anonymousSession.status === 200 && (await anonymousSession.json()) === null, "Sesión anónima: Better Auth no devuelve una sesión");
  check(await statusOf(anonymous, "/api/auth/organization/list") === 401, "Sesión anónima: Better Auth bloquea la lista de organizaciones");
  check(await statusOf(anonymous, api(orgA, "/members")) === 302, "Sesión anónima: API tenant redirige al login");
  check(await statusOf(anonymous, `/api/platform/organizations/${orgA}/services`) === 302, "Sesión anónima: API de plataforma redirige al login");
  check(await statusOf(ownerA.client, "/api/auth/organization/list") === 200, "BA list (usado por el navegador) sigue disponible");
  check(await statusOf(ownerA.client, "/api/auth/organization/set-active", post({ organizationId: orgA })) === 200, "BA set-active propio sigue disponible");
  check(await statusOf(memberA.client, `/api/auth/organization/list-invitations?organizationId=${orgA}`) === 404, "BA list-invitations directo bloqueado (un member no lee invitaciones)");
  check(await statusOf(memberA.client, `/api/auth/organization/get-full-organization?organizationId=${orgA}`) === 404, "BA get-full-organization directo bloqueado (incluye invitaciones)");
  check(await statusOf(memberA.client, `/api/auth/organization/list-members?organizationId=${orgA}`) === 404, "BA list-members directo bloqueado");
  check(await statusOf(ownerA.client, "/api/auth/organization/update", post({ organizationId: orgDisposable, data: { name: `Renombrada ${suffix}` } })) === 404, "BA update directo bloqueado para owner");
  check(await statusOf(ownerA.client, "/api/auth/organization/delete", post({ organizationId: orgDisposable })) === 404, "BA delete directo bloqueado para owner");
  check(await statusOf(ownerA.client, "/api/auth/organization/delete/", post({ organizationId: orgDisposable })) === 404, "BA delete con barra final bloqueado");
  check(await statusOf(ownerA.client, "/api/auth/organization%2Fdelete", post({ organizationId: orgDisposable })) === 404, "BA delete con ruta codificada bloqueado");
  check(await statusOf(leaver.client, "/api/auth/organization/leave", post({ organizationId: orgA })) === 404, "BA leave directo bloqueado");
  check(await statusOf(ownerA.client, "/api/auth/organization/invite-member", post({ organizationId: orgA, email: email("direct-invite"), role: "member" })) === 404, "BA invite-member directo bloqueado");
  check(await statusOf(ownerA.client, "/api/auth/organization/cancel-invitation", post({ invitationId: invitations.a3 })) === 404, "BA cancel-invitation directo bloqueado");
  check(await statusOf(ownerA.client, "/api/auth/organization/update-member-role", post({ organizationId: orgA, memberId: members.bystander, role: "admin" })) === 404, "BA update-member-role directo bloqueado");
  check(await statusOf(ownerA.client, "/api/auth/organization/remove-member", post({ organizationId: orgA, memberIdOrEmail: members.bystander })) === 404, "BA remove-member directo bloqueado");
  check(await statusOf(ownerA.client, "/api/auth/update-session", post({ activeOrganizationId: orgB })) === 400, "update-session no permite fijar activeOrganizationId");
  check(await activeOrganizationOf(ownerA) === orgA, "La organización activa de owner-a no cambió por update-session");
  const onBehalf = await ownerA.client.json("/api/auth/organization/create", { name: orgName("on-behalf"), slug: slug("on-behalf"), userId: ownerB.userId });
  const onBehalfId = onBehalf.status === 200 ? (await onBehalf.json()).id : null;
  if (onBehalfId) fixtureOrganizationIds.add(onBehalfId);
  const [ownerAOrganizations, ownerBOrganizations] = await Promise.all([
    ownerA.client.fetch("/api/auth/organization/list").then((response) => response.json()),
    ownerB.client.fetch("/api/auth/organization/list").then((response) => response.json()),
  ]);
  check(onBehalfId && ownerAOrganizations.some((organization) => organization.id === onBehalfId) && !ownerBOrganizations.some((organization) => organization.id === onBehalfId), "BA create ignora un userId ajeno: el owner es la sesión");
  await setActive(ownerA, orgA);
  const betterAuthRows = await d1(`
    SELECT
      (SELECT name FROM organization WHERE id = '${orgDisposable}') AS disposable_name,
      (SELECT COUNT(*) FROM organization WHERE id = '${orgDisposable}') AS disposable_count,
      (SELECT COUNT(*) FROM member WHERE user_id = '${leaver.userId}' AND organization_id = '${orgA}') AS leaver_memberships,
      (SELECT status FROM invitation WHERE id = '${invitations.a3}') AS direct_invitation_status,
      (SELECT role FROM member WHERE id = '${members.bystander}') AS bystander_role,
      (SELECT COUNT(*) FROM invitation WHERE email = '${email("direct-invite")}') AS direct_invites;
    SELECT 'member' AS kind, id, user_id, organization_id FROM member WHERE organization_id IN (${sqlInList([...fixtureOrganizationIds])}) OR user_id IN (${sqlInList([...fixtureUserIds])});
    SELECT 'session' AS kind, id, NULL AS user_id, NULL AS organization_id FROM session WHERE user_id IN (${sqlInList([...fixtureUserIds])});
    SELECT 'account' AS kind, id, NULL AS user_id, NULL AS organization_id FROM account WHERE user_id IN (${sqlInList([...fixtureUserIds])});
  `);
  const betterAuthReadback = betterAuthRows.find((row) => row.disposable_name !== undefined);
  for (const row of betterAuthRows.filter((candidate) => candidate.kind === "member")) {
    fixtureMemberIds.add(row.id);
    memberIdsByUserAndOrganization.set(membershipKey(row.user_id, row.organization_id), row.id);
  }
  for (const row of betterAuthRows.filter((candidate) => candidate.kind === "session")) fixtureSessionIds.add(row.id);
  for (const row of betterAuthRows.filter((candidate) => candidate.kind === "account")) fixtureAccountIds.add(row.id);
  check(betterAuthReadback?.disposable_name === orgName("org-d"), "El nombre de la organización no cambió por BA update");
  check(Number(betterAuthReadback?.disposable_count) === 1, "La organización sigue existiendo tras los tres intentos de borrado");
  check(Number(betterAuthReadback?.leaver_memberships) === 1, "La membresía de leaver sigue intacta");
  check(betterAuthReadback?.direct_invitation_status === "pending", "La invitación sigue pendiente tras BA cancel-invitation directo");
  check(betterAuthReadback?.bystander_role === "member", "bystander sigue como member tras BA update/remove directos");
  check(Number(betterAuthReadback?.direct_invites) === 0, "BA invite-member directo bloqueado no crea invitación");

  // --- 2. Organización activa --------------------------------------------------------------
  enterStage("active-organization");
  check(await statusOf(noOrg.client, "/app") === 200, "Sin organización: /app muestra el estado vacío");
  for (const path of ["/app/business-profile", "/app/organization", "/app/services"]) {
    check(await statusOf(noOrg.client, path) === 403, `Sin organización: ${path} → 403`);
  }
  check((await (await memberA.client.fetch("/app")).text()).includes(orgName("org-a")), "Organización activa válida: /app muestra A");
  check(await statusOf(memberA.client, "/app/services") === 200, "Organización activa válida: /app/services → 200");
  await setActive(ownerA, orgC);
  check((await (await ownerA.client.fetch("/app")).text()).includes(orgName("org-c")), "Cambio A → C: /app muestra C");
  await setActive(ownerA, orgA);
  check(await statusOf(ownerA.client, "/api/auth/organization/set-active", post({ organizationId: orgB })) === 403, "set-active a una organización ajena → 403");
  check(await activeOrganizationOf(ownerA) !== orgB, "set-active ajeno no deja B como activa");
  check(await statusOf(ownerA.client, "/api/auth/organization/set-active", post({ organizationId: `org-inexistente-${suffix}` })) === 403, "set-active a una organización inexistente → 403 (sin oráculo de existencia)");
  check(await activeOrganizationOf(ownerA) === null, "Better Auth limpia el contexto activo al rechazar una organización inexistente");
  await setActive(ownerA, orgA);
  const [intruderSession] = await d1(`UPDATE session SET active_organization_id = '${orgB}' WHERE user_id = '${intruder.userId}'; SELECT active_organization_id AS id FROM session WHERE user_id = '${intruder.userId}';`);
  check(intruderSession?.id === orgB, "El fixture realmente simula una organización activa ajena");
  for (const path of ["/app", "/app/business-profile", "/app/organization", "/app/services", "/app/account"]) {
    const response = await intruder.client.fetch(path);
    const html = await response.text();
    check(response.status === 403 && !html.includes(orgName("org-b")), `Organización activa ajena inyectada: ${path} → 403 sin datos de B`);
  }

  // --- 3. Sesión stale ---------------------------------------------------------------------
  enterStage("stale-session-and-membership");
  check(await statusOf(ownerA.client, api(orgA, "/members"), post({ operation: "remove", memberId: memberIdOf(revoked.userId, orgA) })) === 200, "owner-a retira a revoked por la ruta propia");
  check(await activeOrganizationOf(revoked) === null, "La sesión de revoked pierde la organización activa (afterRemoveMember)");
  const [staleSession] = await d1(`DELETE FROM member WHERE user_id = '${stale.userId}' AND organization_id = '${orgA}'; SELECT active_organization_id AS id FROM session WHERE user_id = '${stale.userId}';`);
  check(staleSession?.id === orgA, "Escenario stale real: la sesión de stale sigue apuntando a A sin membresía");
  for (const identity of [revoked, stale]) {
    for (const path of ["/app/business-profile", "/app/organization", "/app/services"]) {
      check(await statusOf(identity.client, path) === 403, `${identity.key}: ${path} → 403`);
    }
    for (const resource of ["", "/authorization", "/business-profile", "/members", "/invitations", "/integrations"]) {
      check(await statusOf(identity.client, api(orgA, resource)) === 403, `${identity.key}: GET /api/organizations/A${resource} → 403`);
    }
    check(await statusOf(identity.client, api(orgA, "/business-profile"), formPost({ displayName: "Stale", slug: slug(`perfil-${identity.key}`) })) === 403, `${identity.key}: POST perfil de A → 403`);
  }
  check(await statusOf(stale.client, "/app") === 403, "stale: /app con organización activa sin membresía → 403");

  // --- 4. Matriz de roles ------------------------------------------------------------------
  enterStage("role-permission-and-license-matrix");
  const matrix = {
    "organization:read": ["owner", "admin", "member"],
    "organization:update": ["owner", "admin"],
    "organization:delete": ["owner"],
    "member:read": ["owner", "admin", "member"],
    "member:invite": ["owner", "admin"],
    "member:remove": ["owner", "admin"],
    "member:role:update": ["owner", "admin"],
    "business-profile:read": ["owner", "admin", "member"],
    "business-profile:update": ["owner", "admin"],
    "business-profile:publish": ["owner", "admin"],
  };
  for (const [role, identity] of [["owner", ownerA], ["admin", adminA], ["member", memberA]]) {
    for (const [permission, roles] of Object.entries(matrix)) {
      const expected = roles.includes(role) ? 200 : 403;
      check(await statusOf(identity.client, api(orgA, "/authorization"), post({ permission })) === expected, `Matriz: ${role} ${permission} → ${expected}`);
    }
  }
  const profile = { displayName: `AUTHZ Perfil ${suffix}`, slug: slug("perfil-a") };
  check(await statusOf(memberA.client, api(orgA, "/business-profile"), formPost(profile)) === 403, "Perfil (API): member → 403");
  check(await statusOf(memberA.client, "/app/business-profile", formPost({ ...profile, intent: "publish" })) === 403, "Publicar perfil: member → 403");
  for (const [role, identity] of [["owner", ownerA], ["admin", adminA], ["member", memberA]]) {
    check(await statusOf(identity.client, `/api/platform/organizations/${orgA}/services`, post({ serviceId: serviceRow.id, status: "active" })) === 403, `Servicios: ${role} de la organización → 403 (solo platform_admin)`);
  }
  check(await statusOf(memberA.client, api(orgA, "/members"), post({ operation: "update-role", memberId: members.promotable, role: "admin" })) === 403, "Cambiar rol: member → 403");
  check(await statusOf(memberA.client, api(orgA, "/members"), post({ operation: "remove", memberId: members.removable })) === 403, "Quitar miembro: member → 403");
  const [deniedMutationReadback] = await d1(`
    SELECT
      (SELECT COUNT(*) FROM business_profile WHERE organization_id = '${orgA}') AS profiles_a,
      (SELECT COUNT(*) FROM organization_service WHERE organization_id = '${orgA}') AS services_a,
      (SELECT role FROM member WHERE id = '${members.promotable}') AS promotable_role,
      (SELECT COUNT(*) FROM member WHERE id = '${members.removable}') AS removable_memberships;
  `);
  check(Number(deniedMutationReadback?.profiles_a) === 0, "El 403 de member no crea ni cambia perfil de A");
  check(Number(deniedMutationReadback?.services_a) === 0, "Los 403 de servicios no crean asignación para A");
  check(deniedMutationReadback?.promotable_role === "member" && Number(deniedMutationReadback?.removable_memberships) === 1, "Los 403 de member preservan rol y membresía en D1");

  await setActive(ownerA, orgC);
  const publishedC = await ownerA.client.form("/app/business-profile", {
    displayName: `AUTHZ Perfil C ${suffix}`,
    slug: slug("perfil-c"),
    shortDescription: "Publicación de otra organización del mismo billing account.",
    description: "La licencia activa del billing account permite publicar más de una organización.",
    category: "Servicios",
    city: "Medellín",
    country: "Colombia",
    intent: "publish",
  });
  check(publishedC.status === 200 && (await publishedC.text()).includes("Perfil publicado."), "La licencia activa del billing account permite publicar otra organización propia");
  const noLicensePublish = await ownerB.client.form("/app/business-profile", {
    displayName: `Sin licencia ${suffix}`,
    slug: slug("sin-licencia"),
    shortDescription: "Sin publicación por ausencia de licencia.",
    description: "El billing account de esta organización no tiene una licencia activa.",
    category: "Servicios",
    city: "Medellín",
    country: "Colombia",
    intent: "publish",
  });
  check(noLicensePublish.status === 200 && (await noLicensePublish.text()).includes("Necesitas una licencia Vecidya activa para publicar en Vecindario."), "Un owner sin licencia activa no publica su perfil");
  await setActive(ownerA, orgA);

  check(await statusOf(adminA.client, api(orgA, "/business-profile"), formPost(profile)) === 200, "Perfil (API): admin → 200");
  const published = await adminA.client.form("/app/business-profile", { ...profile, shortDescription: "Perfil de prueba de autorización.", description: "Descripción de prueba para AUTHZ-BA-001.", category: "Servicios", city: "Medellín", country: "Colombia", intent: "publish" });
  check(published.status === 200 && (await published.text()).includes("Perfil publicado."), "Publicar perfil: admin → publicado");
  check([200, 201].includes(await statusOf(platformAdmin.client, `/api/platform/organizations/${orgA}/services`, post({ serviceId: serviceRow.id, status: "pending" }))), "Servicios: platform_admin → permitido");
  const authorizedMutationRows = await d1(`
    SELECT
      (SELECT status FROM business_profile WHERE organization_id = '${orgA}') AS profile_status,
      (SELECT status FROM business_profile WHERE organization_id = '${orgC}') AS profile_status_c,
      (SELECT COUNT(*) FROM business_profile WHERE organization_id = '${orgB}') AS profiles_b,
      (SELECT status FROM organization_service WHERE organization_id = '${orgA}' AND service_id = '${serviceRow.id}') AS service_status;
    SELECT 'profile' AS kind, id FROM business_profile WHERE organization_id IN (${sqlInList([...fixtureOrganizationIds])});
    SELECT 'organization-service' AS kind, id FROM organization_service WHERE organization_id IN (${sqlInList([...fixtureOrganizationIds])});
  `);
  const authorizedMutationReadback = authorizedMutationRows.find((row) => row.profile_status !== undefined);
  for (const row of authorizedMutationRows.filter((candidate) => candidate.kind === "profile")) fixtureProfileIds.add(row.id);
  for (const row of authorizedMutationRows.filter((candidate) => candidate.kind === "organization-service")) fixtureOrganizationServiceIds.add(row.id);
  check(authorizedMutationReadback?.profile_status === "published", "La publicación autorizada deja el perfil de A publicado en D1");
  check(authorizedMutationReadback?.profile_status_c === "published", "La licencia activa del billing account autoriza el perfil de C");
  check(Number(authorizedMutationReadback?.profiles_b) === 0, "El rechazo por falta de licencia no crea ni publica el perfil de B");
  check(authorizedMutationReadback?.service_status === "pending", "El servicio autorizado de platform_admin queda en estado pendiente");

  check(await statusOf(adminA.client, api(orgA, "/members"), post({ operation: "update-role", memberId: members.promotable, role: "admin" })) === 200, "Cambiar rol: admin → 200");
  check(await statusOf(adminA.client, api(orgA, "/members"), post({ operation: "update-role", memberId: members.promotable, role: "owner" })) === 403, "Cambiar rol: admin no puede conceder owner");
  check(await statusOf(memberA.client, api(orgA, "/members"), post({ operation: "remove", memberId: members.removable })) === 403, "Quitar miembro: member → 403");
  const [rolePromotionReadback] = await d1(`
    SELECT
      (SELECT role FROM member WHERE id = '${members.promotable}') AS promotable_role,
      (SELECT COUNT(*) FROM member WHERE id = '${members.removable}') AS removable_memberships;
  `);
  check(rolePromotionReadback?.promotable_role === "admin", "El 403 al conceder owner preserva el rol admin");
  check(Number(rolePromotionReadback?.removable_memberships) === 1, "El 403 de member preserva al miembro antes del remove autorizado");
  check(await statusOf(adminA.client, api(orgA, "/members"), post({ operation: "remove", memberId: members.removable })) === 200, "Quitar miembro: admin → 200");
  const [removedMembershipReadback] = await d1(`SELECT COUNT(*) AS memberships FROM member WHERE id = '${members.removable}';`);
  check(Number(removedMembershipReadback?.memberships) === 0, "La operación admin elimina la membresía permitida");

  // --- 5. Cross-tenant: owner-a contra la organización B ------------------------------------
  enterStage("cross-organization-isolation");
  for (const resource of ["", "/authorization", "/business-profile", "/members", "/invitations", "/integrations"]) {
    check(await statusOf(ownerA.client, api(orgB, resource)) === 403, `Cross-tenant: GET /api/organizations/B${resource} → 403`);
  }
  check(await statusOf(ownerA.client, api(orgB, "/business-profile"), formPost({ displayName: "Intrusa", slug: slug("perfil-b") })) === 403, "Cross-tenant: POST perfil de B → 403");
  check(await statusOf(ownerA.client, `/api/platform/organizations/${orgB}/services`, post({ serviceId: serviceRow.id, status: "active" })) === 403, "Cross-tenant: servicios de B → 403");
  check(await statusOf(ownerA.client, api(orgB, "/members"), post({ operation: "update-role", memberId: members.ownerB, role: "member" })) === 403, "Cross-tenant: rol en B por la ruta de B → 403");
  check(await statusOf(ownerA.client, api(orgA, "/members"), post({ operation: "update-role", memberId: members.ownerB, role: "member" })) === 403, "Cross-tenant: ID de miembro de B por la ruta de A → 403");
  check(await statusOf(ownerA.client, api(orgA, "/members"), post({ operation: "remove", memberId: members.ownerB })) === 403, "Cross-tenant: quitar miembro de B por la ruta de A → 403");
  check(await statusOf(ownerA.client, "/app/organization", formPost({ operation: "update-role", memberId: members.ownerB, role: "member" })) === 403, "Cross-tenant (página): cambiar rol con ID de miembro de B → 403");
  check(await statusOf(ownerA.client, "/app/organization", formPost({ operation: "remove", memberId: members.ownerB })) === 403, "Cross-tenant (página): quitar miembro de B → 403");
  const [crossTenantReadback] = await d1(`
    SELECT
      (SELECT role FROM member WHERE id = '${members.ownerB}') AS owner_b_role,
      (SELECT COUNT(*) FROM business_profile WHERE organization_id = '${orgB}') AS profiles_b,
      (SELECT COUNT(*) FROM organization_service WHERE organization_id = '${orgB}') AS services_b;
  `);
  check(crossTenantReadback?.owner_b_role === "owner", "owner-b sigue siendo owner de B");
  check(Number(crossTenantReadback?.profiles_b) === 0, "El 403 cross-tenant no crea ni altera el perfil de B");
  check(Number(crossTenantReadback?.services_b) === 0, "El 403 cross-tenant no asigna servicios a B");

  // --- 6. Invitaciones: frontera de autorización --------------------------------------------
  enterStage("invitation-lifecycle");
  check(await statusOf(ownerA.client, api(orgA, "/invitations")) === 200, "Listar invitaciones: owner → 200");
  check(await statusOf(adminA.client, api(orgA, "/invitations")) === 200, "Listar invitaciones: admin → 200");
  check(await statusOf(memberA.client, api(orgA, "/invitations")) === 403, "Listar invitaciones: member → 403");
  check(await statusOf(ownerA.client, api(orgA, "/invitations"), post({ operation: "invite", email: email("new-1"), role: "member" })) === 503, "Crear invitación: owner autorizado (503: entrega no configurada en local)");
  check(await statusOf(adminA.client, api(orgA, "/invitations"), post({ operation: "invite", email: email("new-2"), role: "member" })) === 503, "Crear invitación: admin autorizado (503: entrega no configurada en local)");
  check(await statusOf(memberA.client, api(orgA, "/invitations"), post({ operation: "invite", email: email("new-3"), role: "member" })) === 403, "Crear invitación: member → 403");
  check(await statusOf(ownerA.client, api(orgB, "/invitations"), post({ operation: "invite", email: email("new-4"), role: "member" })) === 403, "Crear invitación en B: owner-a → 403");
  check(await statusOf(memberA.client, api(orgA, "/invitations"), post({ operation: "cancel", invitationId: invitations.a1 })) === 403, "Cancelar invitación: member → 403");
  check(await statusOf(ownerA.client, api(orgB, "/invitations"), post({ operation: "cancel", invitationId: invitations.b })) === 403, "Cancelar invitación de B por la ruta de B: owner-a → 403");
  check(await statusOf(ownerA.client, api(orgA, "/invitations"), post({ operation: "cancel", invitationId: invitations.b })) === 403, "Cancelar invitación de B por la ruta de A → 403");
  check(await statusOf(ownerA.client, api(orgA, "/invitations"), post({ operation: "cancel", invitationId: invitations.c })) === 403, "Cancelar invitación de C (también de owner-a) por la ruta de A → 403");
  check(await statusOf(ownerA.client, "/app/organization", formPost({ operation: "cancel-invitation", invitationId: invitations.b })) === 403, "Cancelar invitación de B desde la página de A → 403");
  check(await statusOf(ownerA.client, "/app/organization", formPost({ operation: "cancel-invitation", invitationId: invitations.c })) === 403, "Cancelar invitación de C desde la página de A → 403");
  const [deniedInvitationReadback] = await d1(`
    SELECT
      (SELECT status FROM invitation WHERE id = '${invitations.a1}') AS a1_status,
      (SELECT status FROM invitation WHERE id = '${invitations.b}') AS b_status,
      (SELECT status FROM invitation WHERE id = '${invitations.c}') AS c_status,
      (SELECT COUNT(*) FROM invitation WHERE email IN ('${email("new-1")}', '${email("new-2")}', '${email("new-3")}', '${email("new-4")}')) AS attempted_invites;
  `);
  check(deniedInvitationReadback?.a1_status === "pending", "El 403 de member no cancela la invitación");
  check(deniedInvitationReadback?.b_status === "pending" && deniedInvitationReadback?.c_status === "pending", "Los 403 cross-tenant preservan invitaciones B y C");
  check(Number(deniedInvitationReadback?.attempted_invites) === 0, "Los intentos de crear invitaciones no autorizados o con correo no configurado no escriben filas");
  check(await statusOf(adminA.client, api(orgA, "/invitations"), post({ operation: "cancel", invitationId: invitations.a1 })) === 200, "Cancelar invitación: admin → 200");
  check(await statusOf(ownerA.client, "/app/organization", formPost({ operation: "cancel-invitation", invitationId: invitations.a2 })) === 200, "Cancelar invitación propia desde la página → 200");
  const strangerView = await stranger.client.fetch(`/app/invitations/${invitations.invitee}`);
  check(strangerView.status !== 200 && !(await strangerView.text()).includes(orgName("org-a")), "Otra cuenta no puede ver una invitación ajena");
  check(await statusOf(stranger.client, "/api/auth/organization/accept-invitation", post({ invitationId: invitations.invitee })) === 403, "Aceptar: otra cuenta verificada → 403");
  check(await statusOf(stranger.client, "/api/auth/organization/accept-invitation", post({ invitationId: invitations.canceled })) === 400, "Aceptar: invitación cancelada → 400");
  check(await statusOf(unverified.client, "/api/auth/organization/accept-invitation", post({ invitationId: invitations.unverified })) === 403, "Aceptar: correo sin verificar → 403");
  const [preAcceptanceReadback] = await d1(`
    SELECT
      (SELECT status FROM invitation WHERE id = '${invitations.a1}') AS a1_status,
      (SELECT status FROM invitation WHERE id = '${invitations.a2}') AS a2_status,
      (SELECT status FROM invitation WHERE id = '${invitations.b}') AS b_status,
      (SELECT status FROM invitation WHERE id = '${invitations.c}') AS c_status,
      (SELECT status FROM invitation WHERE id = '${invitations.invitee}') AS invitee_status,
      (SELECT status FROM invitation WHERE id = '${invitations.canceled}') AS canceled_status,
      (SELECT status FROM invitation WHERE id = '${invitations.unverified}') AS unverified_status,
      (SELECT COUNT(*) FROM member WHERE user_id = '${invitee.userId}') AS invitee_memberships;
  `);
  check(preAcceptanceReadback?.a1_status === "canceled" && preAcceptanceReadback?.a2_status === "canceled", "Las cancelaciones autorizadas persisten");
  check(preAcceptanceReadback?.b_status === "pending" && preAcceptanceReadback?.c_status === "pending", "Las invitaciones de B y C siguen pendientes tras los intentos cruzados");
  check(preAcceptanceReadback?.invitee_status === "pending" && Number(preAcceptanceReadback?.invitee_memberships) === 0, "Los intentos de aceptación ajena no cambian estado ni crean membresías");
  check(preAcceptanceReadback?.canceled_status === "canceled" && preAcceptanceReadback?.unverified_status === "pending", "Las restricciones por cancelación e identidad preservan el estado esperado");
  check(await statusOf(invitee.client, "/api/auth/organization/accept-invitation", post({ invitationId: invitations.invitee })) === 200, "Aceptar: destinatario verificado → 200");
  check(await activeOrganizationOf(invitee) === orgA, "La aceptación fija como activa la organización de la invitación");
  check(await statusOf(invitee.client, "/api/auth/organization/accept-invitation", post({ invitationId: invitations.invitee })) === 400, "Aceptar dos veces → 400");
  check(await statusOf(invitee.client, "/api/auth/organization/accept-invitation", post({ invitationId: invitations.b })) === 403, "Aceptar una invitación de B dirigida a otro correo → 403");
  const acceptedInvitationRows = await d1(`
    SELECT
      (SELECT role FROM member WHERE user_id = '${invitee.userId}' AND organization_id = '${orgA}') AS invitee_role_a,
      (SELECT COUNT(*) FROM member WHERE user_id = '${invitee.userId}' AND organization_id = '${orgB}') AS invitee_memberships_b,
      (SELECT status FROM invitation WHERE id = '${invitations.invitee}') AS invitee_status;
    SELECT 'member' AS kind, id, user_id, organization_id FROM member WHERE user_id = '${invitee.userId}';
  `);
  const acceptedInvitationReadback = acceptedInvitationRows.find((row) => row.invitee_role_a !== undefined);
  for (const row of acceptedInvitationRows.filter((candidate) => candidate.kind === "member")) {
    fixtureMemberIds.add(row.id);
    memberIdsByUserAndOrganization.set(membershipKey(row.user_id, row.organization_id), row.id);
  }
  check(acceptedInvitationReadback?.invitee_role_a === "member" && Number(acceptedInvitationReadback?.invitee_memberships_b) === 0, "La aceptación crea membresía solo en la organización de la invitación");
  check(acceptedInvitationReadback?.invitee_status === "accepted", "La aceptación válida cambia la invitación a accepted");
} catch (error) {
  harnessFailure = error instanceof HarnessError
    ? error
    : new HarnessError(`HARNESS: error no clasificado del test (${error?.name ?? "Error"}): ${redactDiagnosticText(error?.message ?? "sin detalle")}`);
} finally {
  enterStage("fixture-teardown-and-verification");
  if (fixturesMayExist) {
    try {
      cleanupFixtures();
    } catch (error) {
      cleanupFailure = error;
      console.error(`Limpieza de fixtures incompleta: ${error?.name ?? "Error"}: ${redactDiagnosticText(error?.message ?? "sin detalle")}; D1 aislada conservada en AUTHZ_D1_PERSIST_TO.`);
    }
  } else {
    console.log(`[authz run=${runId}] CLEANUP verified no fixture creation started.`);
  }
}

for (const result of results) console.log(`${result.ok ? "ok  " : "FAIL"} ${result.label}`);
if (!harnessFailure && !cleanupFailure && results.length !== expectedChecks) {
  harnessFailure = new HarnessError(`HARNESS: se ejecutaron ${results.length} checks; el contrato del test espera ${expectedChecks}.`);
}
const failures = results.filter((result) => !result.ok);
const classification = harnessFailure || cleanupFailure
  ? "HARNESS FAIL"
  : failures.length
    ? "AUTHORIZATION FAIL"
    : "PASS";
diagnostics.finish(classification);
if (harnessFailure) {
  console.error(`\nHARNESS FAILURE (no es un resultado de autorización): ${harnessFailure.message}`);
  process.exit(2);
}
if (cleanupFailure) process.exit(2);
if (failures.length) {
  console.error(`\nFAIL: ${failures.length}/${results.length} comprobaciones de autorización fallaron.`);
  process.exit(1);
}
console.log(`\nPASS: AUTHZ-BA-001 ${results.length} comprobaciones de membresía, organización activa, sesión stale, roles, cross-tenant e invitaciones.`);
