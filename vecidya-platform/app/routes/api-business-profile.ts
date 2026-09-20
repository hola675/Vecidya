import { createDatabase } from "../../db/client.server";
import {
  getBusinessProfileForOrganization,
  saveBusinessProfileForOrganization,
} from "../../db/queries/business-profile.server";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { parseBusinessProfileForm } from "../../server/business-profile-validation.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/api-business-profile";

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requireOrganizationPermission(
    env,
    request,
    params.organizationId,
    "business-profile:read",
  );

  const profile = await getBusinessProfileForOrganization(
    createDatabase(env.DB),
    params.organizationId,
  );

  return Response.json({ profile });
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  await requireOrganizationPermission(
    env,
    request,
    params.organizationId,
    "business-profile:update",
  );

  try {
    const profile = await saveBusinessProfileForOrganization(
      createDatabase(env.DB),
      params.organizationId,
      parseBusinessProfileForm(await request.formData()),
    );
    return Response.json({ profile });
  } catch (error) {
    if (error instanceof Response && error.status === 400) {
      return Response.json({ error: await error.text() }, { status: 400 });
    }
    throw error;
  }
}
