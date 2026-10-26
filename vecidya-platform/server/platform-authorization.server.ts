import { eq } from "drizzle-orm";

import { createDatabase } from "../db/client.server";
import { platformMember } from "../db/schema";
import type { AuthEnvironment } from "./auth.server";
import { requireSession } from "./auth/session.server";

export const platformAdminActions = [
  "training:assign", "training:progress:correct", "organization:create",
  "organization:lifecycle:update", "organization:license:update", "team:role:update", "miniweb:save", "miniweb:publish",
  "business_profile:governance", "organization:service:update", "organization:integration:create",
] as const;
export type PlatformAdminAction = (typeof platformAdminActions)[number];
type PlatformMemberRole = typeof platformMember.$inferSelect.role;

// A platform role grants an explicit set of control-plane permissions. Keep this mapping
// separate from the action allowlist so new role values or actions are denied by default.
const actionsByPlatformRole: Record<PlatformMemberRole, readonly PlatformAdminAction[]> = {
  staff: [],
  platform_admin: platformAdminActions,
};

export async function requirePlatformAdmin(env: AuthEnvironment, request: Request) {
  const session = await requireSession(env, request);
  const access = await createDatabase(env.DB).query.platformMember.findFirst({
    where: eq(platformMember.userId, session.user.id),
  });

  if (!access || access.status !== "active" || access.role !== "platform_admin") {
    throw new Response("Platform administration is required", { status: 403 });
  }

  return { ...access, workspaceUser: { name: session.user.name, email: session.user.email } };
}

export async function requirePlatformReadAccess(env: AuthEnvironment, request: Request) {
  const session = await requireSession(env, request);
  const access = await createDatabase(env.DB).query.platformMember.findFirst({
    where: eq(platformMember.userId, session.user.id),
  });
  if (!access || access.status !== "active") {
    throw new Response("Platform access is required", { status: 403 });
  }
  return { ...access, workspaceUser: { name: session.user.name, email: session.user.email } };
}

export async function requirePlatformAdminAction(env: AuthEnvironment, request: Request, action: PlatformAdminAction) {
  if (!platformAdminActions.includes(action)) throw new Response("Platform action is not permitted", { status: 403 });
  const access = await requirePlatformAdmin(env, request);
  if (!actionsByPlatformRole[access.role].includes(action)) {
    throw new Response("Platform action permission is required", { status: 403 });
  }
  return { ...access, action };
}
