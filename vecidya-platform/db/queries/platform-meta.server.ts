import { eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { platformMeta } from "../schema";

export async function getPlatformMeta(database: Database, key: string) {
  return database.query.platformMeta.findFirst({
    where: eq(platformMeta.key, key),
  });
}
