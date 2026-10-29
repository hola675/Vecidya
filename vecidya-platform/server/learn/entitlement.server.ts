import { getLearnGuideAccess } from "../../app/content/learn-publication";
import type { Database } from "../../db/client.server";
import { userHasLearnEntitlement } from "../../db/queries/learn-access.server";

/** Los artículos desconocidos o sin clasificación se deniegan por defecto. */
export async function canReadLearnGuideBody(database: Database, userId: string | null, slug: string, now = new Date()) {
  const access = getLearnGuideAccess(slug);
  if (access === "always_free") return true;
  if (access !== "licensed" || !userId) return false;
  return userHasLearnEntitlement(database, userId, now);
}
