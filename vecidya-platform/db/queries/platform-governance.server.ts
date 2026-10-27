import { and, asc, count, desc, eq, inArray, like, or } from "drizzle-orm";

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

export class PlatformGovernanceConflict extends Error {
  constructor() {
    super("El estado del perfil cambió durante la operación. Recarga la página e inténtalo de nuevo.");
    this.name = "PlatformGovernanceConflict";
  }
}

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
  expectedUpdatedAt: number | null,
) {
  const existing = await database.query.businessProfileGovernance.findFirst({
    where: eq(businessProfileGovernance.businessProfileId, businessProfileId),
  });
  if ((existing?.updatedAt.getTime() ?? null) !== expectedUpdatedAt) throw new PlatformGovernanceConflict();
  // D1 stores these timestamps at millisecond precision. Ensure a successful
  // write always advances the CAS token, even when two requests share a tick.
  const now = new Date(Math.max(Date.now(), (existing?.updatedAt.getTime() ?? 0) + 1));
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

  // A retried form can arrive after an earlier request already applied the
  // same transition. Treat that as a stale action instead of writing a second
  // identical state and duplicate audit event.
  if (previousValue === newValue) throw new PlatformGovernanceConflict();

  const governanceId = existing?.id ?? crypto.randomUUID();
  const auditId = crypto.randomUUID();
  const statements = existing
    ? [
      database.$client.prepare(`UPDATE business_profile_governance SET ${isVerificationAction ? "verification_status" : "platform_status"} = ?, ${isVerificationAction ? "verified_at" : "suspended_at"} = ?, ${isVerificationAction ? "verified_by" : "suspended_by"} = ?, updated_at = ? WHERE id = ? AND ${isVerificationAction ? "verification_status" : "platform_status"} = ? AND updated_at = ? AND ${isVerificationAction ? "verification_status" : "platform_status"} <> ?`)
        .bind(newValue, isVerificationAction ? (action === "verify" ? now.getTime() : null) : (action === "suspend" ? now.getTime() : null), isVerificationAction ? (action === "verify" ? actorUserId : null) : (action === "suspend" ? actorUserId : null), now.getTime(), governanceId, previousValue, existing!.updatedAt.getTime(), newValue),
      database.$client.prepare("INSERT INTO platform_audit_log (id,actor_user_id,action,entity_type,entity_id,organization_id,previous_value,new_value,metadata,created_at) SELECT ?,? ,?,'business_profile',?,?,?,?,NULL,? WHERE changes()=1")
        .bind(auditId, actorUserId, `business_profile.${action}`, businessProfileId, organizationId, previousValue, newValue, now.getTime()),
    ]
    : [
      database.$client.prepare("INSERT INTO business_profile_governance (id,business_profile_id,verification_status,verified_at,verified_by,platform_status,suspended_at,suspended_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(business_profile_id) DO NOTHING")
        .bind(governanceId, businessProfileId, patch.verificationStatus ?? defaultGovernance.verificationStatus, patch.verifiedAt?.getTime() ?? null, patch.verifiedBy ?? null, patch.platformStatus ?? defaultGovernance.platformStatus, patch.suspendedAt?.getTime() ?? null, patch.suspendedBy ?? null, now.getTime(), now.getTime()),
      database.$client.prepare("INSERT INTO platform_audit_log (id,actor_user_id,action,entity_type,entity_id,organization_id,previous_value,new_value,metadata,created_at) SELECT ?,? ,?,'business_profile',?,?,?,?,NULL,? WHERE changes()=1")
        .bind(auditId, actorUserId, `business_profile.${action}`, businessProfileId, organizationId, previousValue, newValue, now.getTime()),
    ];

  const results = await database.$client.batch(statements);
  if (results[0]?.meta.changes !== 1) throw new PlatformGovernanceConflict();
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

export async function listPlatformAuditLogPage(database: Database, options: {
  page: number;
  pageSize: number;
  action?: string;
  search?: string;
  actionLabels?: Record<string, string>;
}) {
  const query = options.search?.trim();
  const searchPattern = query ? `%${query}%` : undefined;
  const actions = await database.selectDistinct({ action: platformAuditLog.action }).from(platformAuditLog).orderBy(asc(platformAuditLog.action));
  const matchingLabelActions = query
    ? actions.map(({ action }) => action).filter((action) => options.actionLabels?.[action]?.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
    : [];
  const where = and(
    options.action ? eq(platformAuditLog.action, options.action) : undefined,
    searchPattern ? or(
      like(platformAuditLog.action, searchPattern),
      like(platformAuditLog.entityType, searchPattern),
      like(platformAuditLog.entityId, searchPattern),
      like(platformAuditLog.previousValue, searchPattern),
      like(platformAuditLog.newValue, searchPattern),
      like(user.name, searchPattern),
      like(user.email, searchPattern),
      like(organization.name, searchPattern),
      like(organization.slug, searchPattern),
      like(businessProfile.displayName, searchPattern),
      like(businessProfile.slug, searchPattern),
      matchingLabelActions.length ? inArray(platformAuditLog.action, matchingLabelActions) : undefined,
    ) : undefined,
  );
  const [countRows] = await Promise.all([
    database.select({ total: count() }).from(platformAuditLog)
      .leftJoin(user, eq(platformAuditLog.actorUserId, user.id))
      .leftJoin(organization, eq(platformAuditLog.organizationId, organization.id))
      .leftJoin(businessProfile, eq(platformAuditLog.entityId, businessProfile.id))
      .where(where),
  ]);
  const total = countRows[0]?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / options.pageSize));
  const page = Math.min(Math.max(1, options.page), pageCount);
  const activity = await database
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
    .where(where)
    .orderBy(desc(platformAuditLog.createdAt), desc(platformAuditLog.id))
    .limit(options.pageSize)
    .offset((page - 1) * options.pageSize);

  return { activity, actions: actions.map(({ action }) => action), page, pageCount, pageSize: options.pageSize, total };
}
