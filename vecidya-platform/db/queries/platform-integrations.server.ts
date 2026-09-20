import { asc, eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { integrationConnection, organization } from "../schema";

export async function listPlatformIntegrations(database: Database) {
  return database
    .select({
      id: integrationConnection.id,
      organizationId: integrationConnection.organizationId,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      provider: integrationConnection.provider,
      externalId: integrationConnection.externalId,
      status: integrationConnection.status,
      createdAt: integrationConnection.createdAt,
      updatedAt: integrationConnection.updatedAt,
    })
    .from(integrationConnection)
    .innerJoin(organization, eq(integrationConnection.organizationId, organization.id))
    .orderBy(asc(organization.name), asc(integrationConnection.provider), asc(integrationConnection.externalId));
}
