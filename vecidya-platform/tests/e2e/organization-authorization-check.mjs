import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";

// El servidor de desarrollo escucha solo en ::1. Con la ventana por defecto de 250 ms, un connect
// lento a ::1 cae a 127.0.0.1 (rechazado) y fetch falla con ETIMEDOUT sin llegar al Worker.
setDefaultAutoSelectFamilyAttemptTimeout(5_000);

// AUTHZ-BA-001: sesión → organización objetivo → membresía → rol → recurso de la organización.
// Las comprobaciones se acumulan para que una ejecución en rojo liste todos los huecos a la vez.
// Un fallo de preparación (registro, D1 local, red) aborta como HARNESS: nunca cuenta como
// resultado de autorización. Las peticiones que se evalúan no se reintentan.
assertLocalBaseUrl();
const suffix = Date.now().toString();
const results = [];

class HarnessError extends Error {}
const harness = (condition, message) => { if (!condition) throw new HarnessError(`HARNESS: ${message}`); };
const check = (condition, label) => results.push({ ok: Boolean(condition), label });

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-authz-"));
  const file = join(directory, "step.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute DB --local --json --file ${file}`], { cwd: process.cwd(), encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });
  harness(result.status === 0, `D1 local falló: ${result.stderr}`);
  return JSON.parse(result.stdout).flatMap((statement) => statement.results ?? []);
}

// TEST-D1-RESET-001: tras usar Wrangler sobre la D1 local, la primera petición al Worker recibe
// ECONNRESET. Se absorbe con una petición de calentamiento que no evalúa nada; solo ella reintenta.
async function d1(sql) {
  const rows = executeD1(sql);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await (await fetch(new URL("/api/auth/ok", baseUrl))).arrayBuffer();
      return rows;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new HarnessError("HARNESS: el Worker local no respondió tras usar D1 (TEST-D1-RESET-001).");
}

class SessionClient {
  #cookies = new Map();
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
  form(path, values) { return this.fetch(path, { method: "POST", body: new URLSearchParams(values) }); }
}

const email = (key) => `authz-${key}-${suffix}@vecidya.test`;
const slug = (key) => `authz-${key}-${suffix}`;
const orgName = (key) => `AUTHZ Org ${key} ${suffix}`;

async function signUp(key) {
  const client = new SessionClient();
  const response = await client.json("/api/auth/sign-up/email", { name: `AUTHZ ${key} ${suffix}`, email: email(key), password: `test-only-password-${suffix}` });
  harness(response.status === 200, `registro de ${key} devolvió ${response.status}`);
  const { user } = await response.json();
  return { key, client, userId: user.id, email: user.email };
}

async function createOrganization(identity, key) {
  const response = await identity.client.json("/api/auth/organization/create", { name: orgName(key), slug: slug(key) });
  harness(response.status === 200, `crear organización ${key} devolvió ${response.status}`);
  return (await response.json()).id;
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
const memberIdOf = async (userId, organizationId) => (await d1(`SELECT id FROM member WHERE user_id = '${userId}' AND organization_id = '${organizationId}';`))[0]?.id ?? null;
const memberRole = async (memberId) => (await d1(`SELECT role FROM member WHERE id = '${memberId}';`))[0]?.role ?? null;
const invitationStatus = async (invitationId) => (await d1(`SELECT status FROM invitation WHERE id = '${invitationId}';`))[0]?.status ?? null;
const organizationRow = async (organizationId) => (await d1(`SELECT name FROM organization WHERE id = '${organizationId}';`))[0] ?? null;

let harnessFailure = null;
try {
  // --- Preparación -------------------------------------------------------------------------
  const ownerA = await signUp("owner-a");
  const orgA = await createOrganization(ownerA, "org-a");
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
  const joinA = (identity, role) => `('${crypto.randomUUID()}', '${orgA}', '${identity.userId}', '${role}', ${now})`;
  const invite = (id, organizationId, to, inviterId, status = "pending") => `('${id}', '${organizationId}', '${to}', 'member', '${status}', ${expiresAt}, ${now}, '${inviterId}')`;
  const [serviceRow] = await d1(`
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
    INSERT INTO platform_member (id, user_id, role, status, created_at, updated_at) VALUES ('${crypto.randomUUID()}', '${platformAdmin.userId}', 'platform_admin', 'active', ${now}, ${now});
    SELECT id FROM service_catalog WHERE status = 'active' LIMIT 1;
  `);
  harness(serviceRow?.id, "service_catalog local no tiene servicios activos.");
  for (const identity of [adminA, memberA, bystander, promotable, removable, leaver, revoked, stale]) await setActive(identity, orgA);

  const api = (organizationId, resource = "") => `/api/organizations/${organizationId}${resource}`;
  const members = {
    bystander: await memberIdOf(bystander.userId, orgA),
    promotable: await memberIdOf(promotable.userId, orgA),
    removable: await memberIdOf(removable.userId, orgA),
    ownerB: await memberIdOf(ownerB.userId, orgB),
  };

  // --- 1. Superficie HTTP del plugin Organization de Better Auth ---------------------------
  check(await statusOf(ownerA.client, "/api/auth/organization/list") === 200, "BA list (usado por el navegador) sigue disponible");
  check(await statusOf(ownerA.client, "/api/auth/organization/set-active", post({ organizationId: orgA })) === 200, "BA set-active propio sigue disponible");
  check(await statusOf(memberA.client, `/api/auth/organization/list-invitations?organizationId=${orgA}`) === 404, "BA list-invitations directo bloqueado (un member no lee invitaciones)");
  check(await statusOf(memberA.client, `/api/auth/organization/get-full-organization?organizationId=${orgA}`) === 404, "BA get-full-organization directo bloqueado (incluye invitaciones)");
  check(await statusOf(memberA.client, `/api/auth/organization/list-members?organizationId=${orgA}`) === 404, "BA list-members directo bloqueado");
  check(await statusOf(ownerA.client, "/api/auth/organization/update", post({ organizationId: orgDisposable, data: { name: `Renombrada ${suffix}` } })) === 404, "BA update directo bloqueado para owner");
  check((await organizationRow(orgDisposable))?.name === orgName("org-d"), "El nombre de la organización no cambió por BA update");
  check(await statusOf(ownerA.client, "/api/auth/organization/delete", post({ organizationId: orgDisposable })) === 404, "BA delete directo bloqueado para owner");
  check(await statusOf(ownerA.client, "/api/auth/organization/delete/", post({ organizationId: orgDisposable })) === 404, "BA delete con barra final bloqueado");
  check(await statusOf(ownerA.client, "/api/auth/organization%2Fdelete", post({ organizationId: orgDisposable })) === 404, "BA delete con ruta codificada bloqueado");
  check(await organizationRow(orgDisposable) !== null, "La organización sigue existiendo tras los tres intentos de borrado");
  check(await statusOf(leaver.client, "/api/auth/organization/leave", post({ organizationId: orgA })) === 404, "BA leave directo bloqueado");
  check(await memberIdOf(leaver.userId, orgA) !== null, "La membresía de leaver sigue intacta");
  check(await statusOf(ownerA.client, "/api/auth/organization/invite-member", post({ organizationId: orgA, email: email("direct-invite"), role: "member" })) === 404, "BA invite-member directo bloqueado");
  check(await statusOf(ownerA.client, "/api/auth/organization/cancel-invitation", post({ invitationId: invitations.a3 })) === 404, "BA cancel-invitation directo bloqueado");
  check(await invitationStatus(invitations.a3) === "pending", "La invitación sigue pendiente tras BA cancel-invitation directo");
  check(await statusOf(ownerA.client, "/api/auth/organization/update-member-role", post({ organizationId: orgA, memberId: members.bystander, role: "admin" })) === 404, "BA update-member-role directo bloqueado");
  check(await statusOf(ownerA.client, "/api/auth/organization/remove-member", post({ organizationId: orgA, memberIdOrEmail: members.bystander })) === 404, "BA remove-member directo bloqueado");
  check(await memberRole(members.bystander) === "member", "bystander sigue como member tras BA update/remove directos");
  check(await statusOf(ownerA.client, "/api/auth/update-session", post({ activeOrganizationId: orgB })) === 400, "update-session no permite fijar activeOrganizationId");
  check(await activeOrganizationOf(ownerA) === orgA, "La organización activa de owner-a no cambió por update-session");
  const onBehalf = await ownerA.client.json("/api/auth/organization/create", { name: orgName("on-behalf"), slug: slug("on-behalf"), userId: ownerB.userId });
  const onBehalfId = onBehalf.status === 200 ? (await onBehalf.json()).id : null;
  check(onBehalfId && await memberIdOf(ownerB.userId, onBehalfId) === null && await memberIdOf(ownerA.userId, onBehalfId) !== null, "BA create ignora un userId ajeno: el owner es la sesión");
  await setActive(ownerA, orgA);

  // --- 2. Organización activa --------------------------------------------------------------
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
  await setActive(ownerA, orgA);
  await d1(`UPDATE session SET active_organization_id = '${orgB}' WHERE user_id = '${intruder.userId}';`);
  for (const path of ["/app", "/app/business-profile", "/app/organization", "/app/services", "/app/account"]) {
    const response = await intruder.client.fetch(path);
    const html = await response.text();
    check(response.status === 403 && !html.includes(orgName("org-b")), `Organización activa ajena inyectada: ${path} → 403 sin datos de B`);
  }

  // --- 3. Sesión stale ---------------------------------------------------------------------
  check(await statusOf(ownerA.client, api(orgA, "/members"), post({ operation: "remove", memberId: await memberIdOf(revoked.userId, orgA) })) === 200, "owner-a retira a revoked por la ruta propia");
  check(await activeOrganizationOf(revoked) === null, "La sesión de revoked pierde la organización activa (afterRemoveMember)");
  await d1(`DELETE FROM member WHERE user_id = '${stale.userId}' AND organization_id = '${orgA}';`);
  check((await d1(`SELECT active_organization_id AS id FROM session WHERE user_id = '${stale.userId}';`))[0]?.id === orgA, "Escenario stale real: la sesión de stale sigue apuntando a A sin membresía");
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
  check(await statusOf(adminA.client, api(orgA, "/business-profile"), formPost(profile)) === 200, "Perfil (API): admin → 200");
  check(await statusOf(memberA.client, "/app/business-profile", formPost({ ...profile, intent: "publish" })) === 403, "Publicar perfil: member → 403");
  const published = await adminA.client.form("/app/business-profile", { ...profile, shortDescription: "Perfil de prueba de autorización.", description: "Descripción de prueba para AUTHZ-BA-001.", category: "Servicios", city: "Medellín", country: "Colombia", intent: "publish" });
  check(published.status === 200 && (await published.text()).includes("Perfil publicado."), "Publicar perfil: admin → publicado");
  for (const [role, identity] of [["owner", ownerA], ["admin", adminA], ["member", memberA]]) {
    check(await statusOf(identity.client, `/api/platform/organizations/${orgA}/services`, post({ serviceId: serviceRow.id, status: "active" })) === 403, `Servicios: ${role} de la organización → 403 (solo platform_admin)`);
  }
  check([200, 201].includes(await statusOf(platformAdmin.client, `/api/platform/organizations/${orgA}/services`, post({ serviceId: serviceRow.id, status: "pending" }))), "Servicios: platform_admin → permitido");
  check(await statusOf(memberA.client, api(orgA, "/members"), post({ operation: "update-role", memberId: members.promotable, role: "admin" })) === 403, "Cambiar rol: member → 403");
  check(await statusOf(adminA.client, api(orgA, "/members"), post({ operation: "update-role", memberId: members.promotable, role: "admin" })) === 200 && await memberRole(members.promotable) === "admin", "Cambiar rol: admin → 200");
  check(await statusOf(adminA.client, api(orgA, "/members"), post({ operation: "update-role", memberId: members.promotable, role: "owner" })) === 403 && await memberRole(members.promotable) === "admin", "Cambiar rol: admin no puede conceder owner");
  check(await statusOf(memberA.client, api(orgA, "/members"), post({ operation: "remove", memberId: members.removable })) === 403, "Quitar miembro: member → 403");
  check(await statusOf(adminA.client, api(orgA, "/members"), post({ operation: "remove", memberId: members.removable })) === 200 && await memberRole(members.removable) === null, "Quitar miembro: admin → 200");

  // --- 5. Cross-tenant: owner-a contra la organización B ------------------------------------
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
  check(await memberRole(members.ownerB) === "owner", "owner-b sigue siendo owner de B");

  // --- 6. Invitaciones: frontera de autorización --------------------------------------------
  check(await statusOf(ownerA.client, api(orgA, "/invitations")) === 200, "Listar invitaciones: owner → 200");
  check(await statusOf(adminA.client, api(orgA, "/invitations")) === 200, "Listar invitaciones: admin → 200");
  check(await statusOf(memberA.client, api(orgA, "/invitations")) === 403, "Listar invitaciones: member → 403");
  check(await statusOf(ownerA.client, api(orgA, "/invitations"), post({ operation: "invite", email: email("new-1"), role: "member" })) === 503, "Crear invitación: owner autorizado (503: entrega no configurada en local)");
  check(await statusOf(adminA.client, api(orgA, "/invitations"), post({ operation: "invite", email: email("new-2"), role: "member" })) === 503, "Crear invitación: admin autorizado (503: entrega no configurada en local)");
  check(await statusOf(memberA.client, api(orgA, "/invitations"), post({ operation: "invite", email: email("new-3"), role: "member" })) === 403, "Crear invitación: member → 403");
  check(await statusOf(ownerA.client, api(orgB, "/invitations"), post({ operation: "invite", email: email("new-4"), role: "member" })) === 403, "Crear invitación en B: owner-a → 403");
  check(await statusOf(memberA.client, api(orgA, "/invitations"), post({ operation: "cancel", invitationId: invitations.a1 })) === 403 && await invitationStatus(invitations.a1) === "pending", "Cancelar invitación: member → 403");
  check(await statusOf(adminA.client, api(orgA, "/invitations"), post({ operation: "cancel", invitationId: invitations.a1 })) === 200 && await invitationStatus(invitations.a1) === "canceled", "Cancelar invitación: admin → 200");
  check(await statusOf(ownerA.client, api(orgB, "/invitations"), post({ operation: "cancel", invitationId: invitations.b })) === 403, "Cancelar invitación de B por la ruta de B: owner-a → 403");
  check(await statusOf(ownerA.client, api(orgA, "/invitations"), post({ operation: "cancel", invitationId: invitations.b })) === 403, "Cancelar invitación de B por la ruta de A → 403");
  check(await statusOf(ownerA.client, api(orgA, "/invitations"), post({ operation: "cancel", invitationId: invitations.c })) === 403, "Cancelar invitación de C (también de owner-a) por la ruta de A → 403");
  check(await statusOf(ownerA.client, "/app/organization", formPost({ operation: "cancel-invitation", invitationId: invitations.b })) === 403, "Cancelar invitación de B desde la página de A → 403");
  check(await statusOf(ownerA.client, "/app/organization", formPost({ operation: "cancel-invitation", invitationId: invitations.c })) === 403, "Cancelar invitación de C desde la página de A → 403");
  check(await invitationStatus(invitations.b) === "pending" && await invitationStatus(invitations.c) === "pending", "Las invitaciones de B y C siguen pendientes");
  check(await statusOf(ownerA.client, "/app/organization", formPost({ operation: "cancel-invitation", invitationId: invitations.a2 })) === 200 && await invitationStatus(invitations.a2) === "canceled", "Cancelar invitación propia desde la página → cancelada");
  const strangerView = await stranger.client.fetch(`/app/invitations/${invitations.invitee}`);
  check(strangerView.status !== 200 && !(await strangerView.text()).includes(orgName("org-a")), "Otra cuenta no puede ver una invitación ajena");
  check(await statusOf(stranger.client, "/api/auth/organization/accept-invitation", post({ invitationId: invitations.invitee })) === 403, "Aceptar: otra cuenta verificada → 403");
  check(await statusOf(stranger.client, "/api/auth/organization/accept-invitation", post({ invitationId: invitations.canceled })) === 400, "Aceptar: invitación cancelada → 400");
  check(await statusOf(unverified.client, "/api/auth/organization/accept-invitation", post({ invitationId: invitations.unverified })) === 403, "Aceptar: correo sin verificar → 403");
  check(await statusOf(invitee.client, "/api/auth/organization/accept-invitation", post({ invitationId: invitations.invitee })) === 200, "Aceptar: destinatario verificado → 200");
  check(await memberRole(await memberIdOf(invitee.userId, orgA)) === "member" && await memberIdOf(invitee.userId, orgB) === null, "La aceptación crea membresía solo en la organización de la invitación");
  check(await activeOrganizationOf(invitee) === orgA, "La aceptación fija como activa la organización de la invitación");
  check(await statusOf(invitee.client, "/api/auth/organization/accept-invitation", post({ invitationId: invitations.invitee })) === 400, "Aceptar dos veces → 400");
  check(await statusOf(invitee.client, "/api/auth/organization/accept-invitation", post({ invitationId: invitations.b })) === 403, "Aceptar una invitación de B dirigida a otro correo → 403");
} catch (error) {
  if (!(error instanceof HarnessError || (error instanceof TypeError && error.message === "fetch failed"))) throw error;
  harnessFailure = error;
} finally {
  try {
    executeD1(`DELETE FROM organization WHERE slug LIKE 'authz-%-${suffix}'; DELETE FROM user WHERE email LIKE 'authz-%-${suffix}@vecidya.test';`);
  } catch (error) {
    console.error(`Limpieza de fixtures incompleta: ${error.message}`);
  }
}

for (const result of results) console.log(`${result.ok ? "ok  " : "FAIL"} ${result.label}`);
if (harnessFailure) {
  console.error(`\nHARNESS FAILURE (no es un resultado de autorización): ${harnessFailure.message} ${harnessFailure.cause?.code ?? ""}`);
  process.exit(2);
}
const failures = results.filter((result) => !result.ok);
if (failures.length) {
  console.error(`\nFAIL: ${failures.length}/${results.length} comprobaciones de autorización fallaron.`);
  process.exit(1);
}
console.log(`\nPASS: AUTHZ-BA-001 ${results.length} comprobaciones de membresía, organización activa, sesión stale, roles, cross-tenant e invitaciones.`);
