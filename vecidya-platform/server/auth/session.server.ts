import { redirect } from "react-router";

import { createDatabase } from "../../db/client.server";
import { getOrganizationMembership } from "../../db/queries/organization.server";
import { createAuth, type AuthEnvironment } from "../auth.server";

export async function getSession(env: AuthEnvironment, request: Request) {
  return createAuth(env, request).api.getSession({
    headers: request.headers,
  });
}

export async function requireSession(env: AuthEnvironment, request: Request) {
  const session = await getSession(env, request);

  if (!session) {
    throw redirect("/login");
  }

  return session;
}

export async function getActiveOrganization(
  env: AuthEnvironment,
  request: Request,
) {
  const session = await requireSession(env, request);
  const organizationId = session.session.activeOrganizationId;

  if (!organizationId) {
    return null;
  }

  const membership = await getOrganizationMembership(
    createDatabase(env.DB),
    session.user.id,
    organizationId,
  );

  if (!membership) {
    throw new Response("Active organization membership is invalid", { status: 403 });
  }

  return membership;
}

export async function requireOrganization(
  env: AuthEnvironment,
  request: Request,
) {
  const organization = await getActiveOrganization(env, request);

  if (!organization) {
    throw new Response("An active organization is required", { status: 403 });
  }

  return organization;
}

export async function requireMembership(
  env: AuthEnvironment,
  request: Request,
  organizationId: string,
) {
  const session = await requireSession(env, request);
  const membership = await getOrganizationMembership(
    createDatabase(env.DB),
    session.user.id,
    organizationId,
  );

  if (!membership) {
    throw new Response("Organization membership is required", { status: 403 });
  }

  return membership;
}
