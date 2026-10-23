import { createDatabase } from "../../db/client.server";
import { getBusinessMediaForPublicDelivery } from "../../db/queries/business-media.server";
import { getBusinessPublicationSnapshotForOrganization } from "../../db/queries/business-publication.server";
import { getPublishedBusinessProfileBySlug } from "../../db/queries/business-profile.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { Route } from "./+types/api-public-business-media";

export async function loader({ context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const database = createDatabase(env.DB);
  const profile = await getPublishedBusinessProfileBySlug(database, params.slug);
  if (!profile?.publicationSnapshot) throw new Response("Archivo no encontrado", { status: 404 });
  const snapshot = await getBusinessPublicationSnapshotForOrganization(database, profile.organizationId);
  if (!snapshot.snapshot || !snapshot.snapshot.media?.some((asset) => asset.id === params.assetId)) {
    throw new Response("Archivo no encontrado", { status: 404 });
  }
  const asset = await getBusinessMediaForPublicDelivery(database, profile.organizationId, params.assetId);
  if (!asset || !["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"].includes(asset.contentType)) {
    throw new Response("Archivo no encontrado", { status: 404 });
  }
  const object = await env.BUSINESS_MEDIA.get(asset.objectKey);
  if (!object) throw new Response("Archivo no encontrado", { status: 404 });
  return new Response(object.body, {
    headers: {
      "Content-Type": asset.contentType,
      "Content-Length": String(asset.sizeBytes),
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
