import { and, desc, eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { businessProfileGovernance, businessProfile, organization, platformAuditLog, user } from "../schema";

export type VerificationStatus = "unverified" | "verified";
export type PlatformStatus = "active" | "suspended";
export type GovernanceAction = "verify" | "unverify" | "suspend" | "reactivate";

export const governanceActions: readonly GovernanceAction[] = ["verify", "unverify", "suspend", "reactivate"];

export function isGovernanceAction(value: FormDataEntryValue | null): value is GovernanceAction {
  return typeof value === "string" && (governanceActions as readonly string[]).includes(value);
}

const defaultGovernance = {
  id: null as string | null,
  verificationStatus: "unverified" as VerificationStatus,
  verifiedAt: null as Date | null,
  verifiedBy: null as string | null,
  platformStatus: "active" as PlatformStatus,
  suspendedAt: null as Date | null,
  suspendedBy: null as string | null,
};

export async function getBusinessProfileGovernance(database: Database, businessProfileId: string) {
  const row = await database.query.businessProfileGovernance.findFirst({
    where: eq(businessProfileGovernance.businessProfileId, businessProfileId),
  });
  return row ?? { ...defaultGovernance, businessProfileId };
}

export async function applyGovernanceAction(
  database: Database,
  businessProfileId: string,
  organizationId: string,
  actorUserId: string,
  action: GovernanceAction,
) {
  const existing = await database.query.businessProfileGovernance.findFirst({
    where: eq(businessProfileGovernance.businessProfileId, businessProfileId),
  });
  const now = new Date();
  const isVerificationAction = action === "verify" || action === "unverify";
  const previousValue = existing
    ? (isVerificationAction ? existing.verificationStatus : existing.platformStatus)
    : (isVerificationAction ? defaultGovernance.verificationStatus : defaultGovernance.platformStatus);

  const patch = action === "verify"
    ? { verificationStatus: "verified" as const, verifiedAt: now, verifiedBy: actorUserId }
    : action === "unverify"
      ? { verificationStatus: "unverified" as const, verifiedAt: null, verifiedBy: null }
      : action === "suspend"
        ? { platformStatus: "suspended" as const, suspendedAt: now, suspendedBy: actorUserId }
        : { platformStatus: "active" as const, suspendedAt: null, suspendedBy: null };
  const newValue = isVerificationAction ? patch.verificationStatus : patch.platformStatus;

  const governanceWrite = existing
    ? database
      .update(businessProfileGovernance)
      .set({ ...patch, updatedAt: now })
      .where(eq(businessProfileGovernance.id, existing.id))
    : database.insert(businessProfileGovernance).values({
      id: crypto.randomUUID(),
      businessProfileId,
      verificationStatus: defaultGovernance.verificationStatus,
      platformStatus: defaultGovernance.platformStatus,
      ...patch,
      createdAt: now,
      updatedAt: now,
    });

  const auditInsert = database.insert(platformAuditLog).values({
    id: crypto.randomUUID(),
    actorUserId,
    action: `business_profile.${action}`,
    entityType: "business_profile",
    entityId: businessProfileId,
    organizationId,
    previousValue,
    newValue,
    metadata: null,
    createdAt: now,
  });

  await database.batch([governanceWrite, auditInsert]);
}

export async function listPlatformAuditLog(database: Database, options: { limit?: number; entityId?: string } = {}) {
  return database
    .select({
      id: platformAuditLog.id,
      action: platformAuditLog.action,
      entityType: platformAuditLog.entityType,
      entityId: platformAuditLog.entityId,
      previousValue: platformAuditLog.previousValue,
      newValue: platformAuditLog.newValue,
      createdAt: platformAuditLog.createdAt,
      actorName: user.name,
      actorEmail: user.email,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      businessProfileDisplayName: businessProfile.displayName,
      businessProfileSlug: businessProfile.slug,
    })
    .from(platformAuditLog)
    .leftJoin(user, eq(platformAuditLog.actorUserId, user.id))
    .leftJoin(organization, eq(platformAuditLog.organizationId, organization.id))
    .leftJoin(businessProfile, eq(platformAuditLog.entityId, businessProfile.id))
    .where(options.entityId ? eq(platformAuditLog.entityId, options.entityId) : undefined)
    .orderBy(desc(platformAuditLog.createdAt))
    .limit(options.limit ?? 100);
}
