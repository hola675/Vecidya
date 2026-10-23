import { createDatabase } from "../../db/client.server";
import {
  getBusinessProfileForOrganization,
  saveBusinessProfileForOrganization,
} from "../../db/queries/business-profile.server";
import { getBusinessDraftRevision } from "../../db/queries/business-publication.server";
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

  const database = createDatabase(env.DB);
  const [profile, draftRevision] = await Promise.all([
    getBusinessProfileForOrganization(database, params.organizationId),
    getBusinessDraftRevision(database, params.organizationId),
  ]);

  return Response.json({ profile, draftRevision });
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
    const formData = await request.formData();
    const expectedRevision = Number(formData.get("draftRevision"));
    const profile = await saveBusinessProfileForOrganization(
      createDatabase(env.DB),
      params.organizationId,
      parseBusinessProfileForm(formData),
      expectedRevision,
    );
    return Response.json({ profile });
  } catch (error) {
    if (error instanceof Response && (error.status === 400 || error.status === 409)) {
      return Response.json({ error: await error.text() }, { status: error.status });
    }
    throw error;
  }
}
