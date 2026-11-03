import { createDatabase } from "../../db/client.server";
import { getPublicMiniWebV2BySiteId } from "../../db/queries/miniweb-v2.server";
import { getBusinessMediaForPublicDelivery } from "../../db/queries/business-media.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { validateMiniWebV2Document } from "../features/miniweb-v2/sections";
import { publishedMiniWebV2ImageIds } from "../features/miniweb-v2/media";
import type { Route } from "./+types/api-public-miniweb-v2-media";

export async function loader({ context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const database = createDatabase(env.DB);
  const publication = await getPublicMiniWebV2BySiteId(database, params.siteId);
  if (!publication) throw new Response("Medio no encontrado", { status: 404 });
  let parsed: unknown;
  try { parsed = JSON.parse(publication.documentJson); } catch { throw new Response("Medio no encontrado", { status: 404 }); }
  const validated = validateMiniWebV2Document(parsed);
  if (!validated.valid || !publishedMiniWebV2ImageIds(validated.value).has(params.assetId))
    throw new Response("Medio no encontrado", { status: 404 });
  const asset = await getBusinessMediaForPublicDelivery(database, publication.organizationId, params.assetId);
  // La baja explícita del medio revoca también su entrega pública V2.
  if (!asset?.isActive || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(asset.contentType))
    throw new Response("Medio no encontrado", { status: 404 });
  const object = await env.BUSINESS_MEDIA.get(asset.objectKey);
  if (!object) throw new Response("Medio no encontrado", { status: 404 });
  return new Response(object.body, { headers: {
    "Content-Type": asset.contentType, "Content-Length": String(asset.sizeBytes),
    // Una copia en CDN seguiría accesible después de retirar el medio o su consentimiento.
    "Content-Disposition": "inline", "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff", "Cross-Origin-Resource-Policy": "same-origin",
  }});
}
