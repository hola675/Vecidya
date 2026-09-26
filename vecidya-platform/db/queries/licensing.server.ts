import { and, eq, gt, isNull, lte, or } from "drizzle-orm";

import type { Database } from "../client.server";
import { billingAccount, licensePrice, organizationLicense, platformAuditLog, portfolioPricingTier } from "../schema";
import { calculateLicensePricing, type LicenseLine, type PlanCode, type PortfolioTier } from "../pricing/calculator";

export const planCodes = ["cuadra", "barrio", "ciudad"] as const;
export const organizationLicenseStatuses = ["pending", "active", "suspended", "cancelled"] as const;
export type OrganizationLicenseStatus = (typeof organizationLicenseStatuses)[number];

export function isPlanCode(value: unknown): value is PlanCode {
  return typeof value === "string" && (planCodes as readonly string[]).includes(value);
}

export class LicensingError extends Error {}

// Un billing_account nunca se deriva de `member`; en V1 cada persona controla como máximo uno,
// creado en el primer uso. No se audita: no es una acción de gobierno, es infraestructura implícita.
export async function getOrCreateBillingAccountForUser(database: Database, ownerUserId: string) {
  const existing = await database.query.billingAccount.findFirst({ where: eq(billingAccount.ownerUserId, ownerUserId) });
  if (existing) return existing;

  const now = new Date();
  const [created] = await database
    .insert(billingAccount)
    .values({ id: crypto.randomUUID(), ownerUserId, kind: "individual", createdAt: now, updatedAt: now })
    .returning();
  return created;
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
  return database.query.organizationLicense.findFirst({
    where: eq(organizationLicense.organizationId, organizationId),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });
}

function auditEntry(actorUserId: string, action: string, entityId: string, organizationId: string, previousValue: string | null, newValue: string | null) {
  return { id: crypto.randomUUID(), actorUserId, action, entityType: "organization_license", entityId, organizationId, previousValue, newValue, metadata: null, createdAt: new Date() };
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
  const existing = await getOrganizationLicense(database, input.organizationId);
  if (existing && existing.status !== "cancelled") {
    throw new LicensingError("Organization already has a license; use change-plan instead");
  }

  const price = await getCurrentLicensePrice(database, input.planCode, now);
  if (!price) throw new LicensingError(`No active price for plan ${input.planCode}`);

  const account = await getOrCreateBillingAccountForUser(database, input.ownerUserId);
  const id = crypto.randomUUID();
  const status: OrganizationLicenseStatus = input.activate ? "active" : "pending";

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

  return { id, billingAccountId: account.id, planCode: input.planCode, status };
}

// Un cambio de plan cancela la fila vigente y crea una nueva (§14): conserva historial y
// grandfathering, y nunca toca otras organizaciones del mismo billing_account.
export async function changeOrganizationLicensePlan(database: Database, input: {
  organizationId: string;
  newPlanCode: PlanCode;
  actorUserId: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const current = await getOrganizationLicense(database, input.organizationId);
  if (!current || current.status !== "active") {
    throw new LicensingError("Organization has no active license to change");
  }
  if (current.planCode === input.newPlanCode) {
    throw new LicensingError("Organization already has this plan");
  }

  const price = await getCurrentLicensePrice(database, input.newPlanCode, now);
  if (!price) throw new LicensingError(`No active price for plan ${input.newPlanCode}`);

  const newId = crypto.randomUUID();
  await database.batch([
    database.update(organizationLicense).set({ status: "cancelled", endsAt: now, updatedAt: now }).where(eq(organizationLicense.id, current.id)),
    database.insert(organizationLicense).values({
      id: newId,
      organizationId: input.organizationId,
      billingAccountId: current.billingAccountId,
      planCode: input.newPlanCode,
      priceId: price.id,
      status: "active",
      startedAt: now,
      activatedAt: now,
      createdAt: now,
      updatedAt: now,
    }),
    database.insert(platformAuditLog).values(auditEntry(input.actorUserId, "organization_license.change_plan", newId, input.organizationId, current.planCode, input.newPlanCode)),
  ]);

  return { id: newId, billingAccountId: current.billingAccountId, planCode: input.newPlanCode, status: "active" as const };
}

export async function setOrganizationLicenseStatus(database: Database, input: {
  organizationId: string;
  status: "suspended" | "active" | "cancelled";
  actorUserId: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const current = await getOrganizationLicense(database, input.organizationId);
  if (!current) throw new LicensingError("Organization has no license");

  await database.batch([
    database.update(organizationLicense).set({ status: input.status, updatedAt: now }).where(eq(organizationLicense.id, current.id)),
    database.insert(platformAuditLog).values(auditEntry(input.actorUserId, `organization_license.${input.status}`, current.id, input.organizationId, current.status, input.status)),
  ]);

  return { id: current.id, status: input.status };
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
  actorUserId: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const current = await getOrganizationLicense(database, input.organizationId);
  if (!current) throw new LicensingError("Organization has no license");

  const account = await getOrCreateBillingAccountForUser(database, input.newOwnerUserId);
  await database.batch([
    database.update(organizationLicense).set({ billingAccountId: account.id, updatedAt: now }).where(eq(organizationLicense.id, current.id)),
    database.insert(platformAuditLog).values(auditEntry(input.actorUserId, "organization_license.transfer_billing_account", current.id, input.organizationId, current.billingAccountId, account.id)),
  ]);

  return { id: current.id, billingAccountId: account.id };
}
