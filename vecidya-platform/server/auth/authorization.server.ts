import { createDatabase } from "../../db/client.server";
import {
  getOrganizationInvitationById,
  getOrganizationMemberById,
} from "../../db/queries/organization.server";
import type { AuthEnvironment } from "../auth.server";
import {
  getActiveOrganization,
  requireMembership,
} from "./session.server";

export const organizationPermissions = [
  "organization:read",
  "organization:update",
  "member:read",
  "member:invite",
  "member:remove",
  "member:role:update",
  "organization:delete",
  "business-profile:read",
  "business-profile:update",
  "business-profile:publish",
] as const;

export type OrganizationPermission = (typeof organizationPermissions)[number];
export type OrganizationRole = "owner" | "admin" | "member";

const rolesByPermission: Record<OrganizationPermission, OrganizationRole[]> = {
  "organization:read": ["owner", "admin", "member"],
  "organization:update": ["owner", "admin"],
  "member:read": ["owner", "admin", "member"],
  "member:invite": ["owner", "admin"],
  "member:remove": ["owner", "admin"],
  "member:role:update": ["owner", "admin"],
  "organization:delete": ["owner"],
  "business-profile:read": ["owner", "admin", "member"],
  "business-profile:update": ["owner", "admin"],
  "business-profile:publish": ["owner", "admin"],
};

function asOrganizationRole(role: string): OrganizationRole {
  if (role === "owner" || role === "admin" || role === "member") {
    return role;
  }

  throw new Response("Unknown organization role", { status: 403 });
}

export function isOrganizationPermission(value: string): value is OrganizationPermission {
  return organizationPermissions.includes(value as OrganizationPermission);
}

export function hasPermission(role: string, permission: OrganizationPermission) {
  return rolesByPermission[permission].includes(asOrganizationRole(role));
}

export function getPermissionsForRole(role: string) {
  return organizationPermissions.filter((permission) => hasPermission(role, permission));
}

export async function requireRole(
  env: AuthEnvironment,
  request: Request,
  allowedRoles: OrganizationRole[],
) {
  const membership = await getActiveOrganization(env, request);

  if (!membership || !allowedRoles.includes(asOrganizationRole(membership.role))) {
    throw new Response("Organization role is not permitted", { status: 403 });
  }

  return membership;
}

export async function requirePermission(
  env: AuthEnvironment,
  request: Request,
  permission: OrganizationPermission,
) {
  const membership = await getActiveOrganization(env, request);

  if (!membership || !hasPermission(membership.role, permission)) {
    throw new Response("Organization permission is required", { status: 403 });
  }

  return membership;
}

export async function requireOrganizationPermission(
  env: AuthEnvironment,
  request: Request,
  organizationId: string,
  permission: OrganizationPermission,
) {
  const membership = await requireMembership(env, request, organizationId);

  if (!hasPermission(membership.role, permission)) {
    throw new Response("Organization permission is required", { status: 403 });
  }

  return membership;
}

// Las dos guardas siguientes comprueban el recurso, no a quien pide: se usan después de
// `requireOrganizationPermission`. Un ID inexistente y uno de otra organización dan el mismo 403.
export async function requireOrganizationMemberTarget(
  env: AuthEnvironment,
  organizationId: string,
  memberId: string,
) {
  const target = await getOrganizationMemberById(createDatabase(env.DB), memberId);

  if (!target || target.organizationId !== organizationId) {
    throw new Response("Organization member is not accessible", { status: 403 });
  }

  return target;
}

export async function requireOrganizationInvitationTarget(
  env: AuthEnvironment,
  organizationId: string,
  invitationId: string,
) {
  const target = await getOrganizationInvitationById(createDatabase(env.DB), invitationId);

  if (!target || target.organizationId !== organizationId) {
    throw new Response("Organization invitation is not accessible", { status: 403 });
  }

  return target;
}
