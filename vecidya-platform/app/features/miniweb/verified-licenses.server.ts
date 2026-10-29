import { eq } from "drizzle-orm";

import type { Database } from "../../../db/client.server";
import { organizationLicense } from "../../../db/schema";

/**
 * Lee licencias directamente de D1. Nunca deriva derechos de Better Auth ni de GHL.
 * El consumidor debe autorizar previamente la identidad y la organización solicitada.
 */
export async function getVerifiedMiniWebVisualLicenses(database: Database, billingAccountId: string) {
  if (!billingAccountId.trim()) return [];
  const rows = await database
    .select({
      billingOwnerId: organizationLicense.billingAccountId,
      tier: organizationLicense.planCode,
      status: organizationLicense.status,
    })
    .from(organizationLicense)
    .where(eq(organizationLicense.billingAccountId, billingAccountId));

  return rows.map((row) => ({
    billingOwnerId: row.billingOwnerId,
    tier: row.tier,
    active: row.status === "active",
  }));
}
