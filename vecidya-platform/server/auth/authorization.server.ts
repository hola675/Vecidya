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
