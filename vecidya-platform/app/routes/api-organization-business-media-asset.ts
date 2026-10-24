import { createDatabase } from "../../db/client.server";
import { getBusinessMediaForPublicDelivery } from "../../db/queries/business-media.server";
import { commitBusinessDraftMutation } from "../../db/queries/business-publication.server";
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

export async function action({ context, params, request }: Route.ActionArgs) {
  if (request.method !== "DELETE") return new Response("Método no permitido.", { status: 405, headers: { Allow: "DELETE" } });
  const { env } = context.get(cloudflareContext);
  const organization = await requireOrganization(env, request);
  if (organization.id !== params.organizationId) return new Response("La organización activa no coincide.", { status: 403 });
  await requireOrganizationPermission(env, request, organization.id, "business-profile:update");
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "La solicitud no es válida." }, { status: 400 }); }
  const expectedRevision = body && typeof body === "object" && "draftRevision" in body ? Number(body.draftRevision) : NaN;
  if (!Number.isInteger(expectedRevision) || expectedRevision < 0) return Response.json({ error: "Recarga la página para obtener la revisión actual." }, { status: 409 });

  const database = createDatabase(env.DB);
  const asset = await getBusinessMediaForPublicDelivery(database, organization.id, params.assetId);
  if (!asset?.isActive) return Response.json({ error: "El medio ya no está disponible en el borrador." }, { status: 404 });
  try {
    await commitBusinessDraftMutation(database, organization.id, expectedRevision, (revision, token) => [database.$client.prepare(`UPDATE business_media_asset SET is_active = 0 WHERE organization_id = ? AND id = ? AND is_active = 1 AND EXISTS (
      SELECT 1 FROM business_profile_publication WHERE organization_id = ? AND draft_revision = ? AND draft_write_token = ?
    )`)
      .bind(organization.id, asset.id, organization.id, revision, token)]);
  } catch (error) {
    if (error instanceof Response && error.status === 409) return Response.json({ error: await error.text() }, { status: 409 });
    throw error;
  }
  return Response.json({ ok: true, draftRevision: expectedRevision + 1 });
}
