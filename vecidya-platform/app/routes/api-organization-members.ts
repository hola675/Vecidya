import { createAuth } from "../../server/auth.server";
import { createDatabase } from "../../db/client.server";
import { getOrganizationMemberById } from "../../db/queries/organization.server";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/api-organization-members";

const editableRoles = ["owner", "admin", "member"] as const;
type EditableRole = (typeof editableRoles)[number];

function isEditableRole(value: unknown): value is EditableRole {
  return typeof value === "string" && editableRoles.includes(value as EditableRole);
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const organizationId = params.organizationId;
  const { env } = context.get(cloudflareContext);
  await requireOrganizationPermission(env, request, organizationId, "member:read");

  const result = await createAuth(env, request).api.listMembers({
    headers: request.headers,
    query: { organizationId },
  });

  return Response.json(result);
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const organizationId = params.organizationId;
  const body = (await request.json()) as {
    memberId?: unknown;
    role?: unknown;
    operation?: unknown;
  };
  const { env } = context.get(cloudflareContext);
  const auth = createAuth(env, request);

  async function requireTargetMember() {
    const target = await getOrganizationMemberById(createDatabase(env.DB), body.memberId as string);
    if (!target || target.organizationId !== organizationId) {
      throw new Response("Organization member is not accessible", { status: 403 });
    }
  }

  if (body.operation === "update-role") {
    if (typeof body.memberId !== "string" || !isEditableRole(body.role)) {
      return Response.json({ error: "Invalid member role update" }, { status: 400 });
    }

    await requireOrganizationPermission(env, request, organizationId, "member:role:update");
    await requireTargetMember();
    try {
      const result = await auth.api.updateMemberRole({
        headers: request.headers,
        body: { memberId: body.memberId, organizationId, role: body.role },
      });
      return Response.json(result);
    } catch (error) {
      const status = typeof error === "object" && error && "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : 500;
      return Response.json({ error: "Member role update was rejected" }, { status });
    }
  }

  if (body.operation === "remove") {
    if (typeof body.memberId !== "string") {
      return Response.json({ error: "Invalid member removal" }, { status: 400 });
    }

    await requireOrganizationPermission(env, request, organizationId, "member:remove");
    await requireTargetMember();
    try {
      const result = await auth.api.removeMember({
        headers: request.headers,
        body: { memberIdOrEmail: body.memberId, organizationId },
      });
      return Response.json(result);
    } catch (error) {
      const status = typeof error === "object" && error && "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : 500;
      return Response.json({ error: "Member removal was rejected" }, { status });
    }
  }

  return Response.json({ error: "Unsupported member operation" }, { status: 400 });
}
