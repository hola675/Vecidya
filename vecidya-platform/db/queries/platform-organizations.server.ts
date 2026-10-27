import { and, asc, count, desc, eq, exists, inArray, isNull, ne, or, sql } from "drizzle-orm";

import type { Database } from "../client.server";
import { businessProfile, integrationConnection, member, organization, organizationService, platformOrganizationLifecycle, serviceCatalog, user } from "../schema";

export async function updatePlatformTeamRole(database: Database, input: { organizationId: string; memberId: string; role: "admin" | "member"; actorUserId: string }) {
  const [target] = await database.select({ id: member.id, role: member.role, userId: member.userId }).from(member)
    .where(and(eq(member.id, input.memberId), eq(member.organizationId, input.organizationId), ne(member.role, "owner"))).limit(1);
  if (!target) throw new Response("Solo se pueden cambiar roles de miembros admin/member existentes", { status: 404 });
  if (target.role === input.role) return;
  const now = new Date();
  const results = await database.$client.batch([
    database.$client.prepare("UPDATE member SET role = ? WHERE id = ? AND organization_id = ? AND role = ? AND role != 'owner'").bind(input.role, input.memberId, input.organizationId, target.role),
    database.$client.prepare("INSERT INTO platform_audit_log (id, actor_user_id, action, entity_type, entity_id, organization_id, previous_value, new_value, metadata, created_at) SELECT ?, ?, 'organization.team_role.update', 'member', ?, ?, ?, ?, ?, ? WHERE changes() = 1").bind(crypto.randomUUID(), input.actorUserId, input.memberId, input.organizationId, target.role, input.role, JSON.stringify({ targetUserId: target.userId }), now.getTime()),
  ]);
  if (results[0]?.meta.changes !== 1) throw new Response("El rol cambió mientras se procesaba; vuelve a intentarlo", { status: 409 });
}

export type OrganizationProfileFilter = "all" | "published" | "draft" | "none";
export type OrganizationSort = "name-asc" | "name-desc" | "created-asc" | "created-desc";

export async function listPlatformOrganizationsPage(database: Database, options: {
  search: string;
  profile: OrganizationProfileFilter;
  sort: OrganizationSort;
  page: number;
  pageSize: number;
}) {
  const conditions = [];
  if (options.profile === "published") conditions.push(eq(businessProfile.status, "published"));
  if (options.profile === "draft") conditions.push(eq(businessProfile.status, "draft"));
  if (options.profile === "none") conditions.push(isNull(businessProfile.id));

  if (options.search) {
    const ownerMatch = exists(database.select({ id: member.id }).from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(and(
        eq(member.organizationId, organization.id),
        eq(member.role, "owner"),
        or(
          sql`instr(lower(${user.name}), lower(${options.search})) > 0`,
          sql`instr(lower(${user.email}), lower(${options.search})) > 0`,
        ),
      )));
    conditions.push(or(
      sql`instr(lower(${organization.name}), lower(${options.search})) > 0`,
      sql`instr(lower(${organization.slug}), lower(${options.search})) > 0`,
      ownerMatch,
    ));
  }

  const where = and(...conditions);
  const [countRows] = await database.select({ total: count() }).from(organization)
    .leftJoin(businessProfile, eq(businessProfile.organizationId, organization.id))
    .where(where);
  const total = countRows?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / options.pageSize));
  const page = Math.min(Math.max(1, options.page), pageCount);
  const orderBy = {
    "name-asc": [asc(sql`lower(${organization.name})`), asc(organization.id)],
    "name-desc": [desc(sql`lower(${organization.name})`), desc(organization.id)],
    "created-asc": [asc(organization.createdAt), asc(organization.id)],
    "created-desc": [desc(organization.createdAt), desc(organization.id)],
  }[options.sort];
  const organizations = await database.select({
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    profile: {
      displayName: businessProfile.displayName,
      status: businessProfile.status,
      slug: businessProfile.slug,
    },
  }).from(organization)
    .leftJoin(businessProfile, eq(businessProfile.organizationId, organization.id))
    .where(where)
    .orderBy(...orderBy)
    .limit(options.pageSize)
    .offset((page - 1) * options.pageSize);

  const organizationIds = organizations.map(({ id }) => id);
  if (!organizationIds.length) return { organizations: [], page, pageCount, pageSize: options.pageSize, total };

  const [owners, memberCounts, serviceCounts, integrationCounts, lifecycles] = await Promise.all([
    database.select({ organizationId: member.organizationId, id: user.id, name: user.name, email: user.email })
      .from(member).innerJoin(user, eq(member.userId, user.id))
      .where(and(eq(member.role, "owner"), inArray(member.organizationId, organizationIds))),
    database.select({ organizationId: member.organizationId, total: count() }).from(member)
      .where(inArray(member.organizationId, organizationIds)).groupBy(member.organizationId),
    database.select({ organizationId: organizationService.organizationId, total: count() }).from(organizationService)
      .where(inArray(organizationService.organizationId, organizationIds)).groupBy(organizationService.organizationId),
    database.select({ organizationId: integrationConnection.organizationId, total: count() }).from(integrationConnection)
      .where(inArray(integrationConnection.organizationId, organizationIds)).groupBy(integrationConnection.organizationId),
    database.select({ organizationId: platformOrganizationLifecycle.organizationId, status: platformOrganizationLifecycle.status })
      .from(platformOrganizationLifecycle).where(inArray(platformOrganizationLifecycle.organizationId, organizationIds)),
  ]);
  const ownerByOrganization = new Map(owners.map((owner) => [owner.organizationId, owner]));
  const memberCountByOrganization = new Map(memberCounts.map(({ organizationId, total: value }) => [organizationId, value]));
  const serviceCountByOrganization = new Map(serviceCounts.map(({ organizationId, total: value }) => [organizationId, value]));
  const integrationCountByOrganization = new Map(integrationCounts.map(({ organizationId, total: value }) => [organizationId, value]));
  const lifecycleByOrganization = new Map(lifecycles.map(({ organizationId, status }) => [organizationId, status]));

  return {
    organizations: organizations.map((item) => ({
      ...item,
      lifecycleStatus: lifecycleByOrganization.get(item.id) ?? "legacy",
      owner: ownerByOrganization.get(item.id) ?? null,
      membersCount: memberCountByOrganization.get(item.id) ?? 0,
      servicesCount: serviceCountByOrganization.get(item.id) ?? 0,
      integrationsCount: integrationCountByOrganization.get(item.id) ?? 0,
    })),
    page,
    pageCount,
    pageSize: options.pageSize,
    total,
  };
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
