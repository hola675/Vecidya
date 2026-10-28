import { eq } from "drizzle-orm";

import { createDatabase } from "../../db/client.server";
import { listOrganizationsForUser } from "../../db/queries/organization.server";
import { listPlatformOrganizationOptions } from "../../db/queries/platform-organizations.server";
import { platformMember } from "../../db/schema";
import type { AuthEnvironment } from "../auth.server";
import { requireSession } from "./session.server";

export async function getClientWorkspaceContext(env: AuthEnvironment, request: Request) {
  const { user } = await requireSession(env, request);
  const database = createDatabase(env.DB);
  const [memberOrganizations, platformAccess] = await Promise.all([
    listOrganizationsForUser(database, user.id),
    database.query.platformMember.findFirst({ where: eq(platformMember.userId, user.id) }),
  ]);
  const isPlatformAdmin = platformAccess?.status === "active" && platformAccess.role === "platform_admin";
  const platformOrganizationOptions = isPlatformAdmin ? await listPlatformOrganizationOptions(database) : [];

  return {
    workspaceUser: { id: user.id, name: user.name, email: user.email },
    organizations: isPlatformAdmin ? platformOrganizationOptions : memberOrganizations,
    memberOrganizations,
    platformOrganizationOptions,
    isPlatformAdmin,
  };
}
