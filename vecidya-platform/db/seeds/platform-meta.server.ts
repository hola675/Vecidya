import type { Database } from "../client.server";
import { platformMeta } from "../schema";

const initialMetadata = [
  { key: "schema_version", value: "1" },
  { key: "platform_name", value: "Vecidya" },
] as const;

export async function seedPlatformMeta(database: Database) {
  const updatedAt = new Date();

  await database
    .insert(platformMeta)
    .values(initialMetadata.map((item) => ({ ...item, updatedAt })))
    .onConflictDoUpdate({
      target: platformMeta.key,
      set: { updatedAt },
    });
}
