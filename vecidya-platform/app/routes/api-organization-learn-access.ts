import { createDatabase } from "../../db/client.server";
import { getOrganizationMembership } from "../../db/queries/organization.server";
import {
  grantOrganizationLearnAccess,
  listOrganizationLearnAccessGrants,
  revokeOrganizationLearnAccess,
} from "../../db/queries/learn-access.server";
import { getSession } from "../../server/auth/session.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/api-organization-learn-access";

const privateHeaders = { "Cache-Control": "private, no-store" };

function error(status: number, message: string) {
  return Response.json({ error: message }, { status, headers: privateHeaders });
}

async function requireLearnOwner(env: Env, request: Request, organizationId: string) {
  const session = await getSession(env, request);
  if (!session) return { response: error(401, "Se requiere una sesión vigente.") } as const;

  const database = createDatabase(env.DB);
  const membership = await getOrganizationMembership(database, session.user.id, organizationId);
  if (!membership || membership.role !== "owner") {
    return { response: error(403, "Se requiere el rol owner en la organización indicada.") } as const;
  }
  return { session, database } as const;
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return error(403, "Origin no permitido.");

  const { env } = context.get(cloudflareContext);
  const access = await requireLearnOwner(env, request, params.organizationId);
  if ("response" in access) return access.response;

  const grants = await listOrganizationLearnAccessGrants(access.database, params.organizationId);
  return Response.json({ grants: grants.map((grant) => ({
    memberId: grant.memberId,
    grantedAt: grant.grantedAt.toISOString(),
  })) }, { headers: privateHeaders });
}

export async function action({ context, params, request }: Route.ActionArgs) {
  if (!sameOrigin(request)) return error(403, "Origin no permitido.");
  if (request.method !== "PUT" && request.method !== "DELETE") {
    return new Response(null, { status: 405, headers: { ...privateHeaders, Allow: "PUT, DELETE" } });
  }
  if (typeof params.memberId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(params.memberId)) return error(400, "Identificador de miembro inválido.");

  const { env } = context.get(cloudflareContext);
  const access = await requireLearnOwner(env, request, params.organizationId);
  if ("response" in access) return access.response;

  const input = {
    organizationId: params.organizationId,
    memberId: params.memberId,
    actorUserId: access.session.user.id,
  };

  if (request.method === "PUT") {
    const granted = await grantOrganizationLearnAccess(access.database, input);
    return granted
      ? new Response(null, { status: 204, headers: privateHeaders })
      : error(403, "No se puede conceder acceso a ese miembro.");
  }

  if (request.method === "DELETE") {
    const revoked = await revokeOrganizationLearnAccess(access.database, input);
    return revoked
      ? new Response(null, { status: 204, headers: privateHeaders })
      : error(403, "Se requiere el rol owner en la organización indicada.");
  }

  return new Response(null, { status: 405, headers: { ...privateHeaders, Allow: "PUT, DELETE" } });
}
