import { and, eq } from "drizzle-orm";

import type { Database } from "../client.server";
import {
  member,
  organizationLearnAccessGrant,
  organizationLicense,
  platformOrganizationLifecycle,
  platformAuditLog,
} from "../schema";

export const learnLicensePlanCodes = ["cuadra", "barrio", "ciudad"] as const;

type LearnLicenseFacts = {
  role: string;
  lifecycleStatus: string;
  planCode: string;
  licenseStatus: string;
  startedAt: Date | null;
  endsAt: Date | null;
  hasGrant: boolean;
};

export function hasCurrentLearnEntitlement(facts: LearnLicenseFacts, now: Date) {
  const nowMs = now.getTime();
  const licenseIsCurrent =
    facts.lifecycleStatus === "active" &&
    facts.licenseStatus === "active" &&
    learnLicensePlanCodes.includes(facts.planCode as (typeof learnLicensePlanCodes)[number]) &&
    facts.startedAt instanceof Date &&
    facts.startedAt.getTime() <= nowMs &&
    (!facts.endsAt || facts.endsAt.getTime() > nowMs);

  return licenseIsCurrent && (facts.role === "owner" || facts.hasGrant);
}

/** El usuario puede estar en varias organizaciones; cualquier fila elegible basta. */
export function hasAnyLearnEntitlement(memberships: readonly LearnLicenseFacts[], now: Date) {
  return memberships.some((facts) => hasCurrentLearnEntitlement(facts, now));
}

/** Reevalúa la combinación licencia/lifecycle/rol/grant para una solicitud concreta. */
export async function userHasLearnEntitlement(database: Database, userId: string, now = new Date()) {
  const memberships = await database
    .select({
      role: member.role,
      lifecycleStatus: platformOrganizationLifecycle.status,
      planCode: organizationLicense.planCode,
      licenseStatus: organizationLicense.status,
      startedAt: organizationLicense.startedAt,
      endsAt: organizationLicense.endsAt,
      hasGrant: organizationLearnAccessGrant.memberId,
    })
    .from(member)
    .innerJoin(platformOrganizationLifecycle, eq(platformOrganizationLifecycle.organizationId, member.organizationId))
    .innerJoin(organizationLicense, eq(organizationLicense.organizationId, member.organizationId))
    .leftJoin(organizationLearnAccessGrant, eq(organizationLearnAccessGrant.memberId, member.id))
    .where(eq(member.userId, userId));

  return hasAnyLearnEntitlement(memberships.map((facts) => ({
    ...facts,
    hasGrant: facts.hasGrant !== null,
  })), now);
}

export async function listOrganizationLearnAccessGrants(database: Database, organizationId: string) {
  return database
    .select({ memberId: member.id, grantedAt: organizationLearnAccessGrant.grantedAt })
    .from(organizationLearnAccessGrant)
    .innerJoin(member, eq(member.id, organizationLearnAccessGrant.memberId))
    .where(eq(member.organizationId, organizationId))
    .orderBy(organizationLearnAccessGrant.grantedAt, member.id);
}

export async function grantOrganizationLearnAccess(database: Database, input: {
  organizationId: string;
  memberId: string;
  actorUserId: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const [target, lifecycle, owner] = await Promise.all([
    database.select({ id: member.id, role: member.role }).from(member).where(and(eq(member.id, input.memberId), eq(member.organizationId, input.organizationId))).limit(1),
    database.select({ status: platformOrganizationLifecycle.status }).from(platformOrganizationLifecycle).where(eq(platformOrganizationLifecycle.organizationId, input.organizationId)).limit(1),
    database.select({ id: member.id }).from(member).where(and(eq(member.organizationId, input.organizationId), eq(member.userId, input.actorUserId), eq(member.role, "owner"))).limit(1),
  ]);
  if (!owner.length || !target.length || target[0].role === "owner" || lifecycle[0]?.status !== "active") return false;

  const grantId = target[0].id;
  await database.$client.batch([
    database.$client.prepare(`
      INSERT INTO organization_learn_access_grant (member_id, granted_by_user_id, granted_at)
      SELECT target.id, ?, ?
      FROM member AS target
      WHERE target.id = ? AND target.organization_id = ? AND target.role <> 'owner'
        AND EXISTS (SELECT 1 FROM member AS actor WHERE actor.organization_id = ? AND actor.user_id = ? AND actor.role = 'owner')
        AND EXISTS (SELECT 1 FROM platform_organization_lifecycle WHERE organization_id = ? AND status = 'active')
      ON CONFLICT(member_id) DO NOTHING
    `).bind(input.actorUserId, now.getTime(), input.memberId, input.organizationId, input.organizationId, input.actorUserId, input.organizationId),
    database.$client.prepare(`
      INSERT INTO platform_audit_log (id, actor_user_id, action, entity_type, entity_id, organization_id, previous_value, new_value, metadata, created_at)
      SELECT ?, ?, 'learn_access.granted', 'organization_learn_access_grant', ?, ?, NULL, 'enabled', NULL, ?
      WHERE changes() = 1
    `).bind(crypto.randomUUID(), input.actorUserId, grantId, input.organizationId, now.getTime()),
  ]);

  const [currentOwner, currentLifecycle, grant] = await Promise.all([
    database.select({ id: member.id }).from(member).where(and(eq(member.organizationId, input.organizationId), eq(member.userId, input.actorUserId), eq(member.role, "owner"))).limit(1),
    database.select({ status: platformOrganizationLifecycle.status }).from(platformOrganizationLifecycle).where(eq(platformOrganizationLifecycle.organizationId, input.organizationId)).limit(1),
    database.select({ memberId: organizationLearnAccessGrant.memberId }).from(organizationLearnAccessGrant).where(eq(organizationLearnAccessGrant.memberId, grantId)).limit(1),
  ]);
  return Boolean(currentOwner.length && currentLifecycle[0]?.status === "active" && grant.length);
}

export async function revokeOrganizationLearnAccess(database: Database, input: {
  organizationId: string;
  memberId: string;
  actorUserId: string;
  now?: Date;
}) {
  const owner = await database.select({ id: member.id }).from(member)
    .where(and(eq(member.organizationId, input.organizationId), eq(member.userId, input.actorUserId), eq(member.role, "owner"))).limit(1);
  if (!owner.length) return false;

  const now = input.now ?? new Date();
  await database.$client.batch([
    database.$client.prepare(`
      DELETE FROM organization_learn_access_grant
      WHERE member_id = ?
        AND EXISTS (SELECT 1 FROM member target WHERE target.id = ? AND target.organization_id = ?)
        AND EXISTS (SELECT 1 FROM member actor WHERE actor.organization_id = ? AND actor.user_id = ? AND actor.role = 'owner')
    `).bind(input.memberId, input.memberId, input.organizationId, input.organizationId, input.actorUserId),
    database.$client.prepare(`
      INSERT INTO platform_audit_log (id, actor_user_id, action, entity_type, entity_id, organization_id, previous_value, new_value, metadata, created_at)
      SELECT ?, ?, 'learn_access.revoked', 'organization_learn_access_grant', ?, ?, 'enabled', NULL, NULL, ?
      WHERE changes() = 1
    `).bind(crypto.randomUUID(), input.actorUserId, input.memberId, input.organizationId, now.getTime()),
  ]);

  const currentOwner = await database.select({ id: member.id }).from(member)
    .where(and(eq(member.organizationId, input.organizationId), eq(member.userId, input.actorUserId), eq(member.role, "owner"))).limit(1);
  return currentOwner.length > 0;
}
