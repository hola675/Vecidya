import { createDatabase } from "../../db/client.server";
import { getBusinessMediaForPublicDelivery } from "../../db/queries/business-media.server";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { requireOrganization } from "../../server/auth/session.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/api-organization-business-media-asset";

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const organization = await requireOrganization(env, request);
  if (organization.id !== params.organizationId) return new Response("La organización activa no coincide.", { status: 403 });
  await requireOrganizationPermission(env, request, organization.id, "business-profile:read");
  const database = createDatabase(env.DB);
  const asset = await getBusinessMediaForPublicDelivery(database, organization.id, params.assetId);
  if (!asset) throw new Response("Archivo no encontrado", { status: 404 });
  const object = await env.BUSINESS_MEDIA.get(asset.objectKey);
  if (!object) throw new Response("Archivo no encontrado", { status: 404 });
  return new Response(object.body, { headers: { "Content-Type": asset.contentType, "Content-Length": String(asset.sizeBytes), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } });
}
