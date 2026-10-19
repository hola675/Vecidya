import { getInvitationListState } from "../../db/invitation-rules";
import { createAuth } from "../../server/auth.server";
import {
  requireOrganizationInvitationTarget,
  requireOrganizationPermission,
} from "../../server/auth/authorization.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { EmailDeliveryUnavailableError, createAndDeliverOrganizationInvitation, isOrganizationInvitationEmailConfigured } from "../../server/email/invitation.server";

import type { Route } from "./+types/api-organization-invitations";

function responseFromError(error: unknown, fallback: string) {
  if (error instanceof EmailDeliveryUnavailableError) return Response.json({ error: error.message }, { status: 503 });
  const status = typeof error === "object" && error && "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : 500;
  return Response.json({ error: fallback }, { status });
}

function invitationEmailConfig(env: Env) {
  return { ...env, appUrl: env.APP_URL || undefined };
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requireOrganizationPermission(env, request, params.organizationId, "member:invite");
  const invitations = await createAuth(env, request).api.listInvitations({
    headers: request.headers,
    query: { organizationId: params.organizationId },
  });
  return Response.json(invitations);
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const membership = await requireOrganizationPermission(env, request, params.organizationId, "member:invite");
  const body = (await request.json()) as { operation?: unknown; email?: unknown; role?: unknown; invitationId?: unknown };
  const auth = createAuth(env, request, { invitationDeliveryManagedByRoute: true });

  if (body.operation === "invite") {
    if (typeof body.email !== "string" || !/^\S+@\S+\.\S+$/.test(body.email) || !(body.role === "member" || body.role === "admin")) {
      return Response.json({ error: "Invalid invitation" }, { status: 400 });
    }
    if (!isOrganizationInvitationEmailConfigured(invitationEmailConfig(env))) {
      return Response.json({ error: "Organization invitation email delivery is not configured" }, { status: 503 });
    }
    try {
      const created = await createAndDeliverOrganizationInvitation(
        () => auth.api.createInvitation({
          headers: request.headers,
          body: { email: body.email.trim().toLowerCase(), role: body.role as "member" | "admin", organizationId: params.organizationId },
        }),
        invitationEmailConfig(env),
        membership.name,
      );
      return Response.json({
        ...created.invitation,
        deliveryStatus: created.delivery,
        ...(created.delivery === "unconfirmed" ? { warning: "Invitation created; email delivery not confirmed. No automatic retry." } : {}),
      }, { status: created.delivery === "unconfirmed" ? 202 : 201 });
    } catch (error) {
      return responseFromError(error, "Invitation delivery is unavailable");
    }
  }

  if (body.operation === "cancel") {
    if (typeof body.invitationId !== "string") return Response.json({ error: "Invalid invitation" }, { status: 400 });
    const target = await requireOrganizationInvitationTarget(env, params.organizationId, body.invitationId);
    // Better Auth marcaría como cancelada incluso una invitación aceptada o ya cancelada.
    if (getInvitationListState(target, new Date()) !== "pending") {
      return Response.json({ error: "Invitation is no longer pending" }, { status: 409 });
    }
    try {
      const result = await auth.api.cancelInvitation({ headers: request.headers, body: { invitationId: body.invitationId } });
      return Response.json(result);
    } catch (error) {
      return responseFromError(error, "Invitation cancellation was rejected");
    }
  }

  return Response.json({ error: "Unsupported invitation operation" }, { status: 400 });
}
