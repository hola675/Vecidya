import { asc, eq } from "drizzle-orm";
import type { Database } from "../client.server";
import { integrationConnection } from "../schema";
export const integrationStatuses = ["pending", "active", "inactive", "error"] as const;
export type IntegrationStatus = (typeof integrationStatuses)[number];
export async function listIntegrationConnections(database: Database, organizationId: string) { return database.select().from(integrationConnection).where(eq(integrationConnection.organizationId, organizationId)).orderBy(asc(integrationConnection.provider)); }
export async function createIntegrationConnection(database: Database, input: { organizationId: string; provider: string; externalId: string; status: IntegrationStatus; metadata: string | null }) { const now = new Date(); const [connection] = await database.insert(integrationConnection).values({ id: crypto.randomUUID(), ...input, createdAt: now, updatedAt: now }).returning(); return connection; }
