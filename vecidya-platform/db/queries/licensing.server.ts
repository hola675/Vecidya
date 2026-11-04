import { and, asc, desc, eq, gt, isNull, lte, like, ne, or } from "drizzle-orm";

import type { Database } from "../client.server";
import { billingAccount, billingMiniwebCapacityExtension, licensePrice, organization, organizationLicense, platformAuditLog, portfolioPricingTier, user } from "../schema";
import { calculateLicensePricing, type LicenseLine, type PlanCode, type PortfolioTier } from "../pricing/calculator";

export const planCodes = ["cuadra", "barrio", "ciudad"] as const;
export const organizationLicenseStatuses = ["pending", "active", "suspended", "cancelled"] as const;
export type OrganizationLicenseStatus = (typeof organizationLicenseStatuses)[number];

export function isPlanCode(value: unknown): value is PlanCode {
  return typeof value === "string" && (planCodes as readonly string[]).includes(value);
}

export class LicensingError extends Error {}
export class LicensingConflictError extends LicensingError {}
export class LicensingNotFoundError extends LicensingError {}

export async function grantMiniWebCapacityExtension(database: Database, input: {
  organizationId: string; billingAccountId: string; actorUserId: string; reason: string; idempotencyKey: string; startsAt?: Date; endsAt?: Date | null; now?: Date;
}) {
  const reason = input.reason.trim();
  if (reason.length < 8 || reason.length > 500) throw new LicensingError("Indica un motivo de entre 8 y 500 caracteres.");
  const previous = await database.query.billingMiniwebCapacityExtension.findFirst({ where: eq(billingMiniwebCapacityExtension.idempotencyKey, input.idempotencyKey) });
  if (previous) {
    if (previous.organizationId !== input.organizationId || previous.billingAccountId !== input.billingAccountId || previous.reason !== reason) throw new LicensingConflictError("La clave de idempotencia ya se usó para otra ampliación.");
    return previous;
  }
  const now = input.now ?? new Date();
  const startsAt = input.startsAt ?? now;
  if (input.endsAt && input.endsAt <= startsAt) throw new LicensingError("La fecha de fin debe ser posterior a la fecha de inicio.");
  const account = await database.query.billingAccount.findFirst({ where: eq(billingAccount.id, input.billingAccountId) });
  if (!account) throw new LicensingNotFoundError("No se encontró el titular de facturación.");
  const activeLicense = await database.query.organizationLicense.findFirst({ where: and(
    eq(organizationLicense.organizationId, input.organizationId), eq(organizationLicense.billingAccountId, input.billingAccountId), eq(organizationLicense.status, "active"),
    lte(organizationLicense.startedAt, startsAt), or(isNull(organizationLicense.endsAt), gt(organizationLicense.endsAt, startsAt)),
  ) });
  if (!activeLicense) throw new LicensingError("Se requiere una licencia activa del titular para conceder una ampliación Cuadra.");
  const id = crypto.randomUUID();
  try {
    await database.batch([
      database.insert(billingMiniwebCapacityExtension).values({ id, organizationId: input.organizationId, billingAccountId: input.billingAccountId, kind: "cuadra_extra", status: "active", startsAt, endsAt: input.endsAt ?? null, reason, grantedByUserId: input.actorUserId, idempotencyKey: input.idempotencyKey, createdAt: now, updatedAt: now }),
      database.insert(platformAuditLog).values({ id: crypto.randomUUID(), actorUserId: input.actorUserId, action: "billing_miniweb_capacity_extension.grant", entityType: "billing_miniweb_capacity_extension", entityId: id, organizationId: input.organizationId, previousValue: null, newValue: "active:+3", metadata: JSON.stringify({ billingAccountId: input.billingAccountId, reason, startsAt: startsAt.toISOString(), endsAt: input.endsAt?.toISOString() ?? null }), createdAt: now }),
    ]);
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;
    const winner = await database.query.billingMiniwebCapacityExtension.findFirst({ where: eq(billingMiniwebCapacityExtension.idempotencyKey, input.idempotencyKey) });
    if (winner) return winner;
    throw error;
  }
  return database.query.billingMiniwebCapacityExtension.findFirst({ where: eq(billingMiniwebCapacityExtension.id, id) });
}

export async function changeMiniWebCapacityExtensionStatus(database: Database, input: {
  organizationId: string; extensionId: string; expectedStatus: "active" | "suspended"; status: "active" | "suspended" | "cancelled"; actorUserId: string; reason: string; now?: Date;
}) {
  const reason = input.reason.trim();
  if (reason.length < 8 || reason.length > 500) throw new LicensingError("Indica un motivo de entre 8 y 500 caracteres.");
  if (input.expectedStatus === input.status) throw new LicensingError("El estado solicitado no cambia la ampliación.");
  const current = await database.query.billingMiniwebCapacityExtension.findFirst({ where: and(eq(billingMiniwebCapacityExtension.id, input.extensionId), eq(billingMiniwebCapacityExtension.organizationId, input.organizationId)) });
  if (!current) throw new LicensingNotFoundError("No se encontró la ampliación para esta organización.");
  if (current.status !== input.expectedStatus) throw new LicensingConflictError("La ampliación cambió en otra operación; recarga e inténtalo de nuevo.");
  if (input.status === "active") {
    const activeLicense = await database.query.organizationLicense.findFirst({ where: and(eq(organizationLicense.organizationId, input.organizationId), eq(organizationLicense.billingAccountId, current.billingAccountId), eq(organizationLicense.status, "active")) });
    if (!activeLicense) throw new LicensingError("No se puede reactivar la ampliación sin una licencia activa del mismo titular.");
  }
  const now = input.now ?? new Date();
  const result = await database.$client.batch([
    database.$client.prepare("UPDATE billing_miniweb_capacity_extension SET status = ?, updated_at = ? WHERE id = ? AND organization_id = ? AND status = ?")
      .bind(input.status, now.getTime(), input.extensionId, input.organizationId, input.expectedStatus),
    database.$client.prepare("INSERT INTO platform_audit_log (id, actor_user_id, action, entity_type, entity_id, organization_id, previous_value, new_value, metadata, created_at) SELECT ?, ?, ?, 'billing_miniweb_capacity_extension', ?, ?, ?, ?, ?, ? WHERE changes() = 1")
      .bind(crypto.randomUUID(), input.actorUserId, `billing_miniweb_capacity_extension.${input.status}`, input.extensionId, input.organizationId, input.expectedStatus, input.status, JSON.stringify({ reason, billingAccountId: current.billingAccountId }), now.getTime()),
  ]);
  if (result[0]?.meta.changes !== 1) throw new LicensingConflictError("La ampliación cambió en otra operación; recarga e inténtalo de nuevo.");
  return { id: input.extensionId, status: input.status };
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Error && /unique constraint failed|constraint failed: organization_license/i.test(error.message);
}

// Un billing_account nunca se deriva de `member`; en V1 cada persona controla como máximo uno,
// creado en el primer uso. No se audita: no es una acción de gobierno, es infraestructura implícita.
export async function getOrCreateBillingAccountForUser(database: Database, ownerUserId: string) {
  const existing = await database.query.billingAccount.findFirst({ where: eq(billingAccount.ownerUserId, ownerUserId) });
  if (existing) return existing;

  const now = new Date();
  try {
    const [created] = await database
      .insert(billingAccount)
      .values({ id: crypto.randomUUID(), ownerUserId, kind: "individual", createdAt: now, updatedAt: now })
      .returning();
    return created;
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;
    const winner = await database.query.billingAccount.findFirst({ where: eq(billingAccount.ownerUserId, ownerUserId) });
    if (winner) return winner;
    throw error;
  }
}

export async function getCurrentLicensePrice(database: Database, planCode: PlanCode, now: Date) {
  const nowMs = now;
  const rows = await database
    .select()
    .from(licensePrice)
    .where(and(
      eq(licensePrice.planCode, planCode),
      eq(licensePrice.status, "active"),
      lte(licensePrice.effectiveFrom, nowMs),
      or(isNull(licensePrice.effectiveTo), gt(licensePrice.effectiveTo, nowMs)),
    ));
  // Varias filas vigentes a la vez sería un error de datos, no de código: se toma la más reciente.
  return rows.sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())[0] ?? null;
}

export async function getActivePortfolioTiers(database: Database, now: Date): Promise<PortfolioTier[]> {
  const rows = await database
    .select()
    .from(portfolioPricingTier)
    .where(and(
      eq(portfolioPricingTier.active, true),
      lte(portfolioPricingTier.effectiveFrom, now),
      or(isNull(portfolioPricingTier.effectiveTo), gt(portfolioPricingTier.effectiveTo, now)),
    ));
  return rows
    .sort((a, b) => a.minOrganizations - b.minOrganizations)
    .map((row) => ({ minOrganizations: row.minOrganizations, maxOrganizations: row.maxOrganizations, discountBps: row.discountBps }));
}

// Frontera de facturación: solo cuentan las organizaciones cuya licencia pertenece a este
// billing_account. Ser `member` (incluida una invitación aceptada) de una organización con licencia
// de OTRO billing_account nunca aparece aquí. El estado (pending/suspended/cancelled) se conserva
// tal cual; `calculateLicensePricing` decide cuáles cuentan como elegibles.
export async function getLicenseLinesForBillingAccount(database: Database, billingAccountId: string): Promise<LicenseLine[]> {
  const rows = await database
    .select({
      organizationId: organizationLicense.organizationId,
      planCode: organizationLicense.planCode,
      amountCents: licensePrice.amountCents,
      status: organizationLicense.status,
    })
    .from(organizationLicense)
    .innerJoin(licensePrice, eq(organizationLicense.priceId, licensePrice.id))
    .where(eq(organizationLicense.billingAccountId, billingAccountId));
  return rows;
}

export async function getOrganizationLicense(database: Database, organizationId: string) {
  const current = await database.query.organizationLicense.findFirst({
    where: and(eq(organizationLicense.organizationId, organizationId), ne(organizationLicense.status, "cancelled")),
    orderBy: (table) => [desc(table.createdAt), desc(table.updatedAt), desc(table.id)],
  });
  if (current) return current;
  return database.query.organizationLicense.findFirst({
    where: and(eq(organizationLicense.organizationId, organizationId), eq(organizationLicense.status, "cancelled")),
    orderBy: (table) => [desc(table.createdAt), desc(table.updatedAt), desc(table.id)],
  });
}

export async function getOrganizationLicenseAuditHistory(database: Database, organizationId: string) {
  return database.select({
    id: platformAuditLog.id,
    action: platformAuditLog.action,
    entityId: platformAuditLog.entityId,
    previousValue: platformAuditLog.previousValue,
    newValue: platformAuditLog.newValue,
    createdAt: platformAuditLog.createdAt,
    actorName: user.name,
    actorEmail: user.email,
  }).from(platformAuditLog)
    .innerJoin(user, eq(platformAuditLog.actorUserId, user.id))
    .where(and(eq(platformAuditLog.organizationId, organizationId), or(eq(platformAuditLog.entityType, "organization_license"), eq(platformAuditLog.entityType, "billing_miniweb_capacity_extension"))))
    .orderBy(asc(platformAuditLog.createdAt), asc(platformAuditLog.id));
}

function auditEntry(actorUserId: string, action: string, entityId: string, organizationId: string, previousValue: string | null, newValue: string | null) {
  return { id: crypto.randomUUID(), actorUserId, action, entityType: "organization_license", entityId, organizationId, previousValue, newValue, metadata: null, createdAt: new Date() };
}

async function assertLicenseAssignmentTargetsExist(database: Database, organizationId: string, ownerUserId: string) {
  const [targetOrganization, billingOwner] = await Promise.all([
    database.query.organization.findFirst({ where: eq(organization.id, organizationId) }),
    database.query.user.findFirst({ where: eq(user.id, ownerUserId) }),
  ]);
  if (!targetOrganization) throw new LicensingError("Organization does not exist");
  if (!billingOwner) throw new LicensingError("Billing account owner does not exist");
}

// Crear una organización NO activa una licencia pagada por sí sola (§13): esta función es la única
// vía, y solo la usa una operación autorizada (hoy, la ruta platform_admin). `activate` decide si
// la fila nace `active` o `pending`.
export async function assignOrganizationLicense(database: Database, input: {
  organizationId: string;
  ownerUserId: string;
  planCode: PlanCode;
  actorUserId: string;
  activate: boolean;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  await assertLicenseAssignmentTargetsExist(database, input.organizationId, input.ownerUserId);
  const existing = await getOrganizationLicense(database, input.organizationId);
  if (existing && existing.status !== "cancelled") {
    throw new LicensingConflictError("Organization already has a license; use change-plan instead");
  }

  const price = await getCurrentLicensePrice(database, input.planCode, now);
  if (!price) throw new LicensingError(`No active price for plan ${input.planCode}`);

  const account = await getOrCreateBillingAccountForUser(database, input.ownerUserId);
  const id = crypto.randomUUID();
  const status: OrganizationLicenseStatus = input.activate ? "active" : "pending";

  try {
    await database.batch([
      database.insert(organizationLicense).values({
        id,
        organizationId: input.organizationId,
        billingAccountId: account.id,
        planCode: input.planCode,
        priceId: price.id,
        status,
        startedAt: now,
        activatedAt: input.activate ? now : null,
        createdAt: now,
        updatedAt: now,
      }),
      database.insert(platformAuditLog).values(auditEntry(input.actorUserId, "organization_license.assign", id, input.organizationId, null, input.planCode)),
    ]);
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new LicensingConflictError("Organization already has a license; use change-plan instead");
    throw error;
  }

  return { id, billingAccountId: account.id, planCode: input.planCode, status };
}

// Un cambio de plan cancela la fila vigente y crea una nueva (§14): conserva historial y
// grandfathering, y nunca toca otras organizaciones del mismo billing_account.
export async function changeOrganizationLicensePlan(database: Database, input: {
  organizationId: string;
  expectedLicenseId: string;
  newPlanCode: PlanCode;
  actorUserId: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const current = await getOrganizationLicense(database, input.organizationId);
  if (!current) throw new LicensingError("Organization has no license to change");
  if (current.status !== "active") throw new LicensingConflictError("Organization license changed concurrently; reload and retry");
  if (current.id !== input.expectedLicenseId) {
    throw new LicensingConflictError("Organization license changed concurrently; reload and retry");
  }
  if (current.planCode === input.newPlanCode) {
    throw new LicensingError("Organization already has this plan");
  }

  const price = await getCurrentLicensePrice(database, input.newPlanCode, now);
  if (!price) throw new LicensingError(`No active price for plan ${input.newPlanCode}`);

  const newId = crypto.randomUUID();
  let results;
  try {
    results = await database.$client.batch([
      database.$client.prepare("UPDATE organization_license SET status = 'cancelled', ends_at = ?, updated_at = ? WHERE id = ? AND organization_id = ? AND plan_code = ? AND status = 'active'")
        .bind(now.getTime(), now.getTime(), current.id, input.organizationId, current.planCode),
      database.$client.prepare("INSERT INTO organization_license (id, organization_id, billing_account_id, plan_code, price_id, status, started_at, activated_at, created_at, updated_at) SELECT ?, ?, ?, ?, ?, 'active', ?, ?, ?, ? WHERE changes() = 1 AND EXISTS (SELECT 1 FROM organization_license WHERE id = ? AND organization_id = ? AND status = 'cancelled' AND ends_at = ?)")
        .bind(newId, input.organizationId, current.billingAccountId, input.newPlanCode, price.id, now.getTime(), now.getTime(), now.getTime(), now.getTime(), current.id, input.organizationId, now.getTime()),
      database.$client.prepare("INSERT INTO platform_audit_log (id, actor_user_id, action, entity_type, entity_id, organization_id, previous_value, new_value, metadata, created_at) SELECT ?, ?, 'organization_license.change_plan', 'organization_license', ?, ?, ?, ?, NULL, ? WHERE EXISTS (SELECT 1 FROM organization_license WHERE id = ? AND plan_code = ? AND status = 'active')")
        .bind(crypto.randomUUID(), input.actorUserId, newId, input.organizationId, current.planCode, input.newPlanCode, now.getTime(), newId, input.newPlanCode),
    ]);
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new LicensingConflictError("Organization license changed concurrently; reload and retry");
    throw error;
  }
  if (results[0]?.meta.changes !== 1) throw new LicensingConflictError("Organization license changed concurrently; reload and retry");

  return { id: newId, billingAccountId: current.billingAccountId, planCode: input.newPlanCode, status: "active" as const };
}

export async function setOrganizationLicenseStatus(database: Database, input: {
  organizationId: string;
  expectedLicenseId: string;
  expectedStatus: "active" | "suspended" | "pending";
  status: "suspended" | "active";
  actorUserId: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const validTransition = (input.expectedStatus === "active" && input.status === "suspended") ||
    ((input.expectedStatus === "suspended" || input.expectedStatus === "pending") && input.status === "active");
  if (!validTransition) throw new LicensingError("Only active licenses can be suspended and pending or suspended licenses can be activated");

  const results = await database.$client.batch([
    database.$client.prepare("UPDATE organization_license SET status = ?, ends_at = CASE WHEN ? = 'active' THEN NULL ELSE ends_at END, activated_at = CASE WHEN ? = 'pending' AND ? = 'active' THEN ? ELSE activated_at END, updated_at = ? WHERE id = ? AND organization_id = ? AND status = ?")
      .bind(input.status, input.status, input.expectedStatus, input.status, now.getTime(), now.getTime(), input.expectedLicenseId, input.organizationId, input.expectedStatus),
    database.$client.prepare("INSERT INTO platform_audit_log (id, actor_user_id, action, entity_type, entity_id, organization_id, previous_value, new_value, metadata, created_at) SELECT ?, ?, ?, 'organization_license', ?, ?, ?, ?, NULL, ? WHERE changes() = 1")
      .bind(crypto.randomUUID(), input.actorUserId, `organization_license.${input.status}`, input.expectedLicenseId, input.organizationId, input.expectedStatus, input.status, now.getTime()),
  ]);
  if (results[0]?.meta.changes !== 1) throw new LicensingConflictError("Organization license changed concurrently; reload and retry");

  return { id: input.expectedLicenseId, status: input.status };
}

export async function cancelOrganizationLicense(database: Database, input: {
  organizationId: string;
  expectedLicenseId: string;
  actorUserId: string;
  now?: Date;
}) {
  const current = await database.query.organizationLicense.findFirst({ where: and(eq(organizationLicense.id, input.expectedLicenseId), eq(organizationLicense.organizationId, input.organizationId)) });
  if (!current) throw new LicensingNotFoundError("Organization license not found");
  if (current.status === "cancelled") throw new LicensingConflictError("Organization license is already cancelled or was replaced");
  const status = current.status;
  const nowMs = Math.max((input.now ?? new Date()).getTime(), current.updatedAt.getTime() + 1);
  const results = await database.$client.batch([
    database.$client.prepare("UPDATE organization_license SET status = 'cancelled', ends_at = ?, updated_at = ? WHERE id = ? AND organization_id = ? AND status = ?")
      .bind(nowMs, nowMs, input.expectedLicenseId, input.organizationId, status),
    database.$client.prepare("INSERT INTO platform_audit_log (id, actor_user_id, action, entity_type, entity_id, organization_id, previous_value, new_value, metadata, created_at) SELECT ?, ?, 'organization_license.cancelled', 'organization_license', ?, ?, ?, 'cancelled', NULL, ? WHERE changes() = 1")
      .bind(crypto.randomUUID(), input.actorUserId, input.expectedLicenseId, input.organizationId, status, nowMs),
  ]);
  if (results[0]?.meta.changes !== 1) throw new LicensingConflictError("Organization license changed concurrently; reload and retry");
  return { id: input.expectedLicenseId, status: "cancelled" as const };
}

export async function reactivateCancelledOrganizationLicense(database: Database, input: {
  organizationId: string;
  expectedLicenseId: string;
  actorUserId: string;
  now?: Date;
}) {
  const current = await database.query.organizationLicense.findFirst({ where: and(eq(organizationLicense.id, input.expectedLicenseId), eq(organizationLicense.organizationId, input.organizationId)) });
  if (!current) throw new LicensingNotFoundError("Organization license not found");
  if (current.status !== "cancelled" || !current.endsAt) throw new LicensingConflictError("Only a license cancelled by an administrator can be reactivated");
  const cancellation = await database.query.platformAuditLog.findFirst({
    where: and(eq(platformAuditLog.organizationId, input.organizationId), eq(platformAuditLog.entityType, "organization_license"), eq(platformAuditLog.entityId, current.id), eq(platformAuditLog.action, "organization_license.cancelled"), eq(platformAuditLog.createdAt, current.endsAt)),
    orderBy: (table) => [desc(table.createdAt), desc(table.id)],
  });
  const restoredStatus = cancellation?.previousValue;
  if (restoredStatus !== "pending" && restoredStatus !== "active" && restoredStatus !== "suspended") {
    throw new LicensingConflictError("This cancelled license cannot be reactivated");
  }
  const nowMs = Math.max((input.now ?? new Date()).getTime(), current.updatedAt.getTime() + 1);
  let results;
  try {
    results = await database.$client.batch([
      database.$client.prepare("UPDATE organization_license SET status = ?, ends_at = NULL, updated_at = ? WHERE id = ? AND organization_id = ? AND status = 'cancelled' AND ends_at = ?")
        .bind(restoredStatus, nowMs, input.expectedLicenseId, input.organizationId, current.endsAt.getTime()),
      database.$client.prepare("INSERT INTO platform_audit_log (id, actor_user_id, action, entity_type, entity_id, organization_id, previous_value, new_value, metadata, created_at) SELECT ?, ?, ?, 'organization_license', ?, ?, 'cancelled', ?, NULL, ? WHERE changes() = 1")
        .bind(crypto.randomUUID(), input.actorUserId, `organization_license.${restoredStatus}`, input.expectedLicenseId, input.organizationId, restoredStatus, nowMs),
    ]);
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new LicensingConflictError("Another current license already exists; reload and retry");
    throw error;
  }
  if (results[0]?.meta.changes !== 1) throw new LicensingConflictError("Organization license changed concurrently; reload and retry");
  return { id: input.expectedLicenseId, status: restoredStatus };
}

// «Una organización cambia de billing_account únicamente por operación autorizada» (§15): esta es
// esa única vía. No deriva de Better Auth; el llamador (la ruta) ya exigió `requirePlatformAdmin`.
// Calcula el precio de portafolio vigente para un billing_account: líneas + tiers activos + `now`.
// Envuelto aquí (en vez de importar `db/pricing/calculator` directamente desde una ruta) para que
// toda ruta solo dependa de módulos `.server`, igual que el resto de `app/routes/`.
export async function getBillingAccountPricing(database: Database, billingAccountId: string, now: Date) {
  const [lines, tiers] = await Promise.all([
    getLicenseLinesForBillingAccount(database, billingAccountId),
    getActivePortfolioTiers(database, now),
  ]);
  return calculateLicensePricing({ lines, portfolioTiers: tiers, now });
}

export async function reassignOrganizationLicenseBillingAccount(database: Database, input: {
  organizationId: string;
  newOwnerUserId: string;
  expectedLicenseId: string;
  expectedBillingAccountId: string;
  actorUserId: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const current = await getOrganizationLicense(database, input.organizationId);
  if (!current || current.status === "cancelled") throw new LicensingError("Organization has no current license");
  if (current.id !== input.expectedLicenseId || current.billingAccountId !== input.expectedBillingAccountId) {
    throw new LicensingConflictError("Organization license changed concurrently; reload and retry");
  }

  await assertLicenseAssignmentTargetsExist(database, input.organizationId, input.newOwnerUserId);

  const account = await getOrCreateBillingAccountForUser(database, input.newOwnerUserId);
  if (account.id === current.billingAccountId) return { id: current.id, billingAccountId: current.billingAccountId };

  const results = await database.$client.batch([
    database.$client.prepare("UPDATE organization_license SET billing_account_id = ?, updated_at = ? WHERE id = ? AND organization_id = ? AND billing_account_id = ? AND status <> 'cancelled'")
      .bind(account.id, now.getTime(), input.expectedLicenseId, input.organizationId, input.expectedBillingAccountId),
    database.$client.prepare("INSERT INTO platform_audit_log (id, actor_user_id, action, entity_type, entity_id, organization_id, previous_value, new_value, metadata, created_at) SELECT ?, ?, 'organization_license.transfer_billing_account', 'organization_license', ?, ?, ?, ?, NULL, ? WHERE changes() = 1")
      .bind(crypto.randomUUID(), input.actorUserId, current.id, input.organizationId, current.billingAccountId, account.id, now.getTime()),
  ]);
  if (results[0]?.meta.changes !== 1) throw new LicensingConflictError("Organization license changed concurrently; reload and retry");

  return { id: current.id, billingAccountId: account.id };
}
