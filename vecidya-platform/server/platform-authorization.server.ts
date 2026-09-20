import { eq } from "drizzle-orm";

import { createDatabase } from "../db/client.server";
import { platformMember } from "../db/schema";
import type { AuthEnvironment } from "./auth.server";
import { requireSession } from "./auth/session.server";

export async function requirePlatformAdmin(env: AuthEnvironment, request: Request) {
  const session = await requireSession(env, request);
  const access = await createDatabase(env.DB).query.platformMember.findFirst({
    where: eq(platformMember.userId, session.user.id),
  });

  if (!access || access.status !== "active" || access.role !== "platform_admin") {
    throw new Response("Platform administration is required", { status: 403 });
  }

  return access;
}
