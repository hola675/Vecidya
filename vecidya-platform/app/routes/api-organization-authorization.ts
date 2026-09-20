import {
  getPermissionsForRole,
  isOrganizationPermission,
  requireOrganizationPermission,
} from "../../server/auth/authorization.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/api-organization-authorization";

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const membership = await requireOrganizationPermission(
    env,
    request,
    params.organizationId,
    "organization:read",
  );

  return Response.json({
    organization: membership,
    permissions: getPermissionsForRole(membership.role),
  });
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { permission } = (await request.json()) as { permission?: string };

  if (!permission || !isOrganizationPermission(permission)) {
    return Response.json({ error: "Unknown organization permission" }, { status: 400 });
  }

  const { env } = context.get(cloudflareContext);
  const membership = await requireOrganizationPermission(
    env,
    request,
    params.organizationId,
    permission,
  );

  return Response.json({ allowed: true, membership, permission });
}
