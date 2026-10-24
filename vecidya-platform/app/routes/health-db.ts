import { createDatabase } from "../../db/client.server";
import { getPlatformMeta } from "../../db/queries/platform-meta.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/health-db";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const database = createDatabase(env.DB);

  const platformName = await getPlatformMeta(database, "platform_name");

  if (platformName?.value !== "Vecidya") {
    throw new Response("Database health check failed", { status: 503 });
  }

  return Response.json({
    status: "ok",
    database: "d1",
    environment: env.APP_ENV ?? "unknown",
  });
}
