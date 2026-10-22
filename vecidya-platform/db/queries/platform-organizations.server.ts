import { and, asc, count, eq, ne } from "drizzle-orm";

import type { Database } from "../client.server";
import { businessProfile, integrationConnection, member, organization, organizationService, platformAuditLog, platformOrganizationLifecycle, serviceCatalog, user } from "../schema";

export async function updatePlatformTeamRole(database: Database, input: { organizationId: string; memberId: string; role: "admin" | "member"; actorUserId: string }) {
  const [target] = await database.select({ id: member.id, role: member.role, userId: member.userId }).from(member)
    .where(and(eq(member.id, input.memberId), eq(member.organizationId, input.organizationId), ne(member.role, "owner"))).limit(1);
  if (!target) throw new Response("Solo se pueden cambiar roles de miembros admin/member existentes", { status: 404 });
  if (target.role === input.role) return;
  const now = new Date();
  await database.batch([
    database.update(member).set({ role: input.role }).where(and(eq(member.id, input.memberId), eq(member.organizationId, input.organizationId), ne(member.role, "owner"))),
    database.insert(platformAuditLog).values({ id: crypto.randomUUID(), actorUserId: input.actorUserId, action: "organization.team_role.update", entityType: "member", entityId: input.memberId, organizationId: input.organizationId, previousValue: target.role, newValue: input.role, metadata: JSON.stringify({ targetUserId: target.userId }), createdAt: now }),
  ]);
}

export async function listPlatformOrganizations(database: Database) {
  const [organizations, owners, memberCounts, profiles, serviceCounts, integrationCounts, lifecycles] = await Promise.all([
    database.select({ id: organization.id, name: organization.name, slug: organization.slug }).from(organization).orderBy(asc(organization.name)),
    database.select({ organizationId: member.organizationId, id: user.id, name: user.name, email: user.email }).from(member).innerJoin(user, eq(member.userId, user.id)).where(eq(member.role, "owner")),
    database.select({ organizationId: member.organizationId, total: count() }).from(member).groupBy(member.organizationId),
    database.select({ organizationId: businessProfile.organizationId, displayName: businessProfile.displayName, status: businessProfile.status, slug: businessProfile.slug }).from(businessProfile),
    database.select({ organizationId: organizationService.organizationId, total: count() }).from(organizationService).groupBy(organizationService.organizationId),
    database.select({ organizationId: integrationConnection.organizationId, total: count() }).from(integrationConnection).groupBy(integrationConnection.organizationId),
    database.select({ organizationId: platformOrganizationLifecycle.organizationId, status: platformOrganizationLifecycle.status }).from(platformOrganizationLifecycle),
  ]);

  return organizations.map((item) => ({
    ...item,
    lifecycleStatus: lifecycles.find((value) => value.organizationId === item.id)?.status ?? "legacy",
    owner: owners.find((owner) => owner.organizationId === item.id) ?? null,
    membersCount: memberCounts.find((value) => value.organizationId === item.id)?.total ?? 0,
    profile: profiles.find((profile) => profile.organizationId === item.id) ?? null,
    servicesCount: serviceCounts.find((value) => value.organizationId === item.id)?.total ?? 0,
    integrationsCount: integrationCounts.find((value) => value.organizationId === item.id)?.total ?? 0,
  }));
}

export async function getPlatformOrganizationDetail(database: Database, organizationId: string) {
  const [organizationRecord] = await database.select({ id: organization.id, name: organization.name, slug: organization.slug, createdAt: organization.createdAt }).from(organization).where(eq(organization.id, organizationId)).limit(1);
  if (!organizationRecord) return null;

  const [members, profile, services, integrations] = await Promise.all([
    database.select({ id: member.id, role: member.role, name: user.name, email: user.email }).from(member).innerJoin(user, eq(member.userId, user.id)).where(eq(member.organizationId, organizationId)).orderBy(asc(user.name)),
    database.select({ displayName: businessProfile.displayName, slug: businessProfile.slug, status: businessProfile.status, shortDescription: businessProfile.shortDescription }).from(businessProfile).where(eq(businessProfile.organizationId, organizationId)).limit(1),
    database.select({ code: serviceCatalog.code, name: serviceCatalog.name, status: organizationService.status, description: serviceCatalog.description }).from(organizationService).innerJoin(serviceCatalog, eq(organizationService.serviceId, serviceCatalog.id)).where(eq(organizationService.organizationId, organizationId)).orderBy(asc(serviceCatalog.name)),
    database.select({ provider: integrationConnection.provider, externalId: integrationConnection.externalId, status: integrationConnection.status }).from(integrationConnection).where(eq(integrationConnection.organizationId, organizationId)).orderBy(asc(integrationConnection.provider)),
  ]);

  return { organization: organizationRecord, members, profile: profile[0] ?? null, services, integrations };
}
