import { asc, eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { businessHours } from "../schema";
import { commitBusinessDraftMutation, ensureLegacyBusinessPublicationSnapshot } from "./business-publication.server";

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
  expectedRevision: number,
) {
  await ensureLegacyBusinessPublicationSnapshot(database, organizationId);
  const now = new Date();
  const rows = entries.map((entry) => ({
    id: crypto.randomUUID(),
    organizationId,
    dayOfWeek: entry.dayOfWeek,
    isClosed: entry.isClosed,
    opensAt: entry.isClosed ? null : entry.opensAt,
    closesAt: entry.isClosed ? null : entry.closesAt,
    createdAt: now,
    updatedAt: now,
  }));
  await commitBusinessDraftMutation(database, organizationId, expectedRevision, (revision, token) => [
    database.$client.prepare(`DELETE FROM business_hours WHERE organization_id = ? AND EXISTS (
      SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND draft_revision = ? AND draft_write_token = ?
    )`).bind(organizationId, organizationId, revision, token),
    ...(rows.length ? [database.$client.prepare(`INSERT INTO business_hours
      (id, organization_id, day_of_week, is_closed, opens_at, closes_at, created_at, updated_at)
      ${rows.map(() => "SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND draft_revision = ? AND draft_write_token = ?)").join(" UNION ALL ")}`)
      .bind(...rows.flatMap((row) => [row.id, row.organizationId, row.dayOfWeek, row.isClosed ? 1 : 0, row.opensAt, row.closesAt, row.createdAt.getTime(), row.updatedAt.getTime(), organizationId, revision, token]))] : []),
  ]);
  return listBusinessHoursForOrganization(database, organizationId);
}
