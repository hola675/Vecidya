import { redirect } from "react-router";
import { createDatabase } from "../../db/client.server";
import { getPublicMiniWebV2BySiteId } from "../../db/queries/miniweb-v2.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import type { Route } from "./+types/public-miniweb-v2";

export async function loader({ context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const row = await getPublicMiniWebV2BySiteId(createDatabase(env.DB), params.siteId);
  if (!row?.publicSlug) throw new Response("MiniWeb no encontrado", { status: 404 });
  return redirect(`/vecindario/${encodeURIComponent(row.publicSlug)}`, { status: 308 });
}

export function meta() { return [{ title: "Redirigiendo sitio | Vecidya" }, { name: "robots", content: "noindex" }]; }

export default function PublicMiniWebV2Page() { return null; }
