import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { baseUrl, assertLocalBaseUrl } from "./test-safety.mjs";

// LICENSE-STRATEGY-001: autorización (solo platform_admin), asignar/cambiar/suspender/reactivar,
// transferencia de billing_account por operación autorizada, y que el portafolio de un
// billing_account nunca vea las organizaciones de otro. Mismo arnés que `authz`/`team-ui`.
setDefaultAutoSelectFamilyAttemptTimeout(5_000); // TEST-LOCALHOST-001
assertLocalBaseUrl();
const suffix = Date.now().toString();
const results = [];

class HarnessError extends Error {}
const harness = (condition, message) => { if (!condition) throw new HarnessError(`HARNESS: ${message}`); };
const check = (condition, label) => results.push({ ok: Boolean(condition), label });

function executeD1(sql) {
  const directory = mkdtempSync(join(tmpdir(), "vecidya-licensing-"));
  const file = join(directory, "step.sql");
  writeFileSync(file, sql, "utf8");
  const result = spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `pnpm.cmd wrangler d1 execute DB --local --json --file ${file}`], { cwd: process.cwd(), encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });
  harness(result.status === 0, `D1 local falló: ${result.stderr}`);
  return JSON.parse(result.stdout).flatMap((statement) => statement.results ?? []);
}

// TEST-D1-RESET-001: calentamiento tras cada uso de Wrangler; solo esta petición reintenta.
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
}

const email = (key) => `licensing-${key}-${suffix}@vecidya.test`;
const orgName = (key) => `Licensing Org ${key} ${suffix}`;
const post = (body) => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

async function signUp(key) {
  const client = new SessionClient();
  const response = await client.json("/api/auth/sign-up/email", { name: `Licensing ${key}`, email: email(key), password: `test-only-password-${suffix}` });
  harness(response.status === 200, `registro de ${key} devolvió ${response.status}`);
  const { user } = await response.json();
  return { key, client, userId: user.id };
}

async function createOrganization(identity, key) {
  const response = await identity.client.json("/api/auth/organization/create", { name: orgName(key), slug: `licensing-${key}-${suffix}` });
  harness(response.status === 200, `crear organización ${key} devolvió ${response.status}`);
  return (await response.json()).id;
}

async function jsonOf(response) {
  const text = await response.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function statusOf(client, path, options) {
  const response = await client.fetch(path, options);
  await response.arrayBuffer();
  return response.status;
}

const licensePath = (organizationId) => `/api/platform/organizations/${organizationId}/license`;

let harnessFailure = null;
try {
  // --- Preparación -------------------------------------------------------------------------
  const [platformAdmin, ownerA1, ownerA2, ownerA3, ownerB, bystander] = await Promise.all(
    ["platform-admin", "owner-a1", "owner-a2", "owner-a3", "owner-b", "bystander"].map(signUp),
  );
  const orgA1 = await createOrganization(ownerA1, "a1");
  const orgA2 = await createOrganization(ownerA2, "a2");
  const orgA3 = await createOrganization(ownerA3, "a3");
  const orgB = await createOrganization(ownerB, "b");
  await d1(`INSERT INTO platform_member (id, user_id, role, status, created_at, updated_at) VALUES ('${crypto.randomUUID()}', '${platformAdmin.userId}', 'platform_admin', 'active', ${Date.now()}, ${Date.now()});`);

  // --- 1. Autorización: solo platform_admin ------------------------------------------------
  check(await statusOf(bystander.client, licensePath(orgA1)) === 403, "GET licencia: usuario sin platform_admin → 403");
  check(await statusOf(ownerA1.client, licensePath(orgA1)) === 403, "GET licencia: owner de la propia organización sin platform_admin → 403");
  check(await statusOf(bystander.client, licensePath(orgA1), post({ operation: "assign", ownerUserId: bystander.userId, planCode: "cuadra" })) === 403, "Asignar sin platform_admin → 403");
  check(await statusOf(platformAdmin.client, licensePath(orgA1)) === 200, "GET licencia: platform_admin → 200");

  // --- 2. Asignar no activa automáticamente; billing_account se crea al primer uso ----------
  const orgWithoutLicense = await jsonOf(await platformAdmin.client.fetch(licensePath(orgA1)));
  check(orgWithoutLicense.license === null, "Organización nueva: sin licencia hasta una operación autorizada (§13)");
  const assignPending = await platformAdmin.client.json(licensePath(orgA1), { operation: "assign", ownerUserId: ownerA1.userId, planCode: "cuadra" });
  check(assignPending.status === 201, "Asignar sin activate: 201");
  const pendingBody = await assignPending.json();
  check(pendingBody.status === "pending", "Asignar sin activate: queda pending, no active");
  check(await statusOf(platformAdmin.client, licensePath(orgA1), post({ operation: "assign", ownerUserId: ownerA1.userId, planCode: "cuadra" })) === 400, "Asignar dos veces a la misma organización → 400");

  // --- 3. Portafolio: tres organizaciones del mismo billing_account (mismo owner) ------------
  const activateA1 = await platformAdmin.client.json(licensePath(orgA1), { operation: "assign", ownerUserId: ownerA1.userId, planCode: "cuadra" });
  // ya existe pending: forzar activación real vía D1 para simular "cliente paga → Admin activa"
  await d1(`UPDATE organization_license SET status = 'active', activated_at = ${Date.now()} WHERE organization_id = '${orgA1}';`);
  const soloPricing = (await jsonOf(await platformAdmin.client.fetch(licensePath(orgA1)))).pricing;
  check(soloPricing.eligibleOrganizationCount === 1 && soloPricing.totalCents === 3900, "1 organización en el billing_account: sin descuento, $39.00");

  // Segunda y tercera organización se transfieren al MISMO billing_account que orgA1 (owner-a1).
  await platformAdmin.client.json(licensePath(orgA2), { operation: "assign", ownerUserId: ownerA2.userId, planCode: "barrio", activate: true });
  await platformAdmin.client.json(licensePath(orgA3), { operation: "assign", ownerUserId: ownerA3.userId, planCode: "ciudad", activate: true });
  const transfer2 = await platformAdmin.client.json(licensePath(orgA2), { operation: "transfer-billing-account", newOwnerUserId: ownerA1.userId });
  check(transfer2.status === 200, "Transferir orgA2 al billing_account de owner-a1 → 200");
  const twoOrgPricing = (await jsonOf(await platformAdmin.client.fetch(licensePath(orgA1)))).pricing;
  check(twoOrgPricing.eligibleOrganizationCount === 2 && twoOrgPricing.subtotalCents === 9800 && twoOrgPricing.totalCents === 8820, "2 organizaciones (Cuadra+Barrio): $88.20 (10%)");

  await platformAdmin.client.json(licensePath(orgA3), { operation: "transfer-billing-account", newOwnerUserId: ownerA1.userId });
  const threeOrgPricing = (await jsonOf(await platformAdmin.client.fetch(licensePath(orgA1)))).pricing;
  check(threeOrgPricing.eligibleOrganizationCount === 3 && threeOrgPricing.subtotalCents === 18700 && threeOrgPricing.totalCents === 15895, "3 organizaciones (Cuadra+Barrio+Ciudad): $158.95 (15%)");
  check(new Set(threeOrgPricing.breakdown.map((line) => line.organizationId)).size === 3, "El desglose trae exactamente las 3 organizaciones, sin duplicados");

  // --- 4. Aislamiento entre billing_accounts distintos --------------------------------------
  await platformAdmin.client.json(licensePath(orgB), { operation: "assign", ownerUserId: ownerB.userId, planCode: "cuadra", activate: true });
  const orgBPricing = (await jsonOf(await platformAdmin.client.fetch(licensePath(orgB)))).pricing;
  check(orgBPricing.eligibleOrganizationCount === 1 && orgBPricing.totalCents === 3900, "Billing_account de B no ve las 3 organizaciones de A: sigue en 1, $39.00");
  const orgABillingAccount = (await jsonOf(await platformAdmin.client.fetch(licensePath(orgA1)))).billingAccountId;
  const orgBBillingAccount = (await jsonOf(await platformAdmin.client.fetch(licensePath(orgB)))).billingAccountId;
  check(orgABillingAccount !== orgBBillingAccount, "Dos billing_accounts distintos no se mezclan");

  // --- 5. Cambio de plan solo afecta a esa organización -------------------------------------
  const beforeChange = await jsonOf(await platformAdmin.client.fetch(licensePath(orgA2)));
  check(beforeChange.license.planCode === "barrio", "orgA2 empieza en Barrio");
  const changePlan = await platformAdmin.client.json(licensePath(orgA2), { operation: "change-plan", planCode: "ciudad" });
  check(changePlan.status === 200, "Cambiar de plan (Barrio → Ciudad) → 200");
  const afterChange = await jsonOf(await platformAdmin.client.fetch(licensePath(orgA2)));
  check(afterChange.license.planCode === "ciudad" && afterChange.license.status === "active", "orgA2 queda en Ciudad, activa");
  const oldRow = await d1(`SELECT status FROM organization_license WHERE organization_id = '${orgA2}' AND plan_code = 'barrio';`);
  check(oldRow[0]?.status === "cancelled", "La fila anterior (Barrio) queda cancelled, no se borra: conserva historial");
  const siblingUnaffected = await jsonOf(await platformAdmin.client.fetch(licensePath(orgA1)));
  check(siblingUnaffected.license.planCode === "cuadra" && siblingUnaffected.license.status === "active", "orgA1 (hermana en el mismo billing_account) no cambió");
  const afterChangeCount = (await jsonOf(await platformAdmin.client.fetch(licensePath(orgA1)))).pricing.eligibleOrganizationCount;
  check(afterChangeCount === 3, "El cambio de plan no altera cuántas organizaciones cuentan para el portafolio");

  // --- 6. Suspender / reactivar --------------------------------------------------------------
  const suspend = await platformAdmin.client.json(licensePath(orgA3), { operation: "suspend" });
  check(suspend.status === 200 && (await suspend.json()).status === "suspended", "Suspender orgA3 → 200, status suspended");
  const pricingAfterSuspend = (await jsonOf(await platformAdmin.client.fetch(licensePath(orgA1)))).pricing;
  check(pricingAfterSuspend.eligibleOrganizationCount === 2, "Una organización suspendida deja de contar para el portafolio de las demás");
  const reactivate = await platformAdmin.client.json(licensePath(orgA3), { operation: "reactivate" });
  check(reactivate.status === 200 && (await reactivate.json()).status === "active", "Reactivar orgA3 → 200, status active");
  const pricingAfterReactivate = (await jsonOf(await platformAdmin.client.fetch(licensePath(orgA1)))).pricing;
  check(pricingAfterReactivate.eligibleOrganizationCount === 3, "Al reactivar, vuelve a contar");

  // --- 7. Grandfathering: una licencia existente conserva su precio contratado --------------
  const priceRow = await d1(`SELECT id FROM license_price WHERE plan_code = 'cuadra' AND status = 'active';`);
  const oldPriceId = priceRow[0]?.id;
  harness(oldPriceId, "no se encontró el precio activo de cuadra");
  await d1(`
    UPDATE license_price SET status = 'retired', effective_to = ${Date.now()} WHERE id = '${oldPriceId}';
    INSERT INTO license_price (id, plan_code, currency, amount_cents, billing_interval, effective_from, status, created_at, updated_at)
      VALUES ('license-price-cuadra-v2-${suffix}', 'cuadra', 'USD', 4500, 'monthly', ${Date.now()}, 'active', ${Date.now()}, ${Date.now()});
  `);
  const grandfatheredPricing = (await jsonOf(await platformAdmin.client.fetch(licensePath(orgA1)))).pricing;
  check(grandfatheredPricing.breakdown.find((line) => line.organizationId === orgA1)?.amountCents === 3900, "orgA1 sigue pagando $39.00 (el precio con el que contrató), no el nuevo $45.00");
  await d1(`DELETE FROM license_price WHERE id = 'license-price-cuadra-v2-${suffix}'; UPDATE license_price SET status = 'active', effective_to = NULL WHERE id = '${oldPriceId}';`);

  // --- 8. No hay checkout ni cobro: nada de esto expone un endpoint público ------------------
  check(await statusOf(new SessionClient(), licensePath(orgA1)) === 302, "Sin sesión: 302 → /login (no 401, igual que el resto de la plataforma)");
} catch (error) {
  if (!(error instanceof HarnessError || (error instanceof TypeError && error.message === "fetch failed"))) throw error;
  harnessFailure = error;
} finally {
  try {
    // Orden obligatorio: platform_audit_log.organization_id/actor_user_id y
    // billing_account.owner_user_id no cascadan (se conservan a propósito si se borrara el usuario
    // o la organización en producción: preservan auditoría e historial de facturación), así que
    // deben limpiarse antes que sus padres. organization_license sí cascada desde organization.
    executeD1(`
      DELETE FROM platform_audit_log WHERE organization_id IN (SELECT id FROM organization WHERE slug LIKE 'licensing-%-${suffix}') OR actor_user_id IN (SELECT id FROM user WHERE email LIKE 'licensing-%-${suffix}@vecidya.test');
      DELETE FROM organization WHERE slug LIKE 'licensing-%-${suffix}';
      DELETE FROM billing_account WHERE owner_user_id IN (SELECT id FROM user WHERE email LIKE 'licensing-%-${suffix}@vecidya.test');
      DELETE FROM user WHERE email LIKE 'licensing-%-${suffix}@vecidya.test';
      DELETE FROM license_price WHERE id = 'license-price-cuadra-v2-${suffix}';
    `);
  } catch (error) {
    console.error(`Limpieza de fixtures incompleta: ${error.message}`);
  }
}

for (const result of results) console.log(`${result.ok ? "ok  " : "FAIL"} ${result.label}`);
if (harnessFailure) {
  console.error(`\nHARNESS FAILURE (no es un resultado de licenciamiento): ${harnessFailure.message} ${harnessFailure.cause?.code ?? ""}`);
  process.exit(2);
}
const failures = results.filter((result) => !result.ok);
if (failures.length) {
  console.error(`\nFAIL: ${failures.length}/${results.length} comprobaciones de licenciamiento fallaron.`);
  process.exit(1);
}
console.log(`\nPASS: LICENSE-STRATEGY-001 ${results.length} comprobaciones de autorización, asignación, portafolio, aislamiento, cambio de plan, suspensión y grandfathering.`);
