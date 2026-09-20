import { asc, eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { businessHours } from "../schema";

export type BusinessHoursEntry = {
  dayOfWeek: number;
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
};

export async function listBusinessHoursForOrganization(database: Database, organizationId: string) {
  return database.query.businessHours.findMany({
    where: eq(businessHours.organizationId, organizationId),
    orderBy: [asc(businessHours.dayOfWeek)],
  });
}

export async function replaceBusinessHoursForOrganization(
  database: Database,
  organizationId: string,
  entries: BusinessHoursEntry[],
) {
  await database.delete(businessHours).where(eq(businessHours.organizationId, organizationId));

  if (!entries.length) return [];

  const now = new Date();
  return database
    .insert(businessHours)
    .values(entries.map((entry) => ({
      id: crypto.randomUUID(),
      organizationId,
      dayOfWeek: entry.dayOfWeek,
      isClosed: entry.isClosed,
      opensAt: entry.isClosed ? null : entry.opensAt,
      closesAt: entry.isClosed ? null : entry.closesAt,
      createdAt: now,
      updatedAt: now,
    })))
    .returning();
}
