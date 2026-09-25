import { and, count, eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { invitation, member, organization } from "../schema";

export async function listOrganizationsForUser(database: Database, userId: string) {
  return database
    .select({
      id: organization.id,
      userId: member.userId,
      name: organization.name,
      slug: organization.slug,
      role: member.role,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId));
}

export async function getOrganizationMembership(
  database: Database,
  userId: string,
  organizationId: string,
) {
  const [membership] = await database
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      role: member.role,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(
      and(eq(member.userId, userId), eq(member.organizationId, organizationId)),
    )
    .limit(1);

  return membership ?? null;
}

export async function getOrganizationMemberById(database: Database, memberId: string) {
  const [membership] = await database
    .select({ id: member.id, organizationId: member.organizationId })
    .from(member)
    .where(eq(member.id, memberId))
    .limit(1);

  return membership ?? null;
}

export async function getOrganizationInvitationById(database: Database, invitationId: string) {
  const [record] = await database
    .select({
      id: invitation.id,
      organizationId: invitation.organizationId,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    })
    .from(invitation)
    .where(eq(invitation.id, invitationId))
    .limit(1);

  return record ?? null;
}

export async function getInvitationWithOrganization(database: Database, invitationId: string) {
  const [record] = await database
    .select({
      id: invitation.id,
      organizationId: invitation.organizationId,
      organizationName: organization.name,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .where(eq(invitation.id, invitationId))
    .limit(1);

  return record ?? null;
}

export async function countOrganizationMembers(database: Database, organizationId: string) {
  const [result] = await database
    .select({ total: count() })
    .from(member)
    .where(eq(member.organizationId, organizationId));

  return result?.total ?? 0;
}
