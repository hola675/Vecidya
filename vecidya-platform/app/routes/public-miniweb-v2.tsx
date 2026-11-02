import { useLoaderData } from "react-router";
import { createDatabase } from "../../db/client.server";
import { getPublicMiniWebV2BySiteId } from "../../db/queries/miniweb-v2.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { MiniWebV2Renderer } from "../components/miniweb-v2-renderer";
import { validateMiniWebV2Document } from "../features/miniweb-v2/sections";
import { miniWebV2ImageUrl } from "../features/miniweb-v2/media";
import { publicMeta } from "../components/public-layout";
import type { Route } from "./+types/public-miniweb-v2";

export async function loader({ context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const row = await getPublicMiniWebV2BySiteId(createDatabase(env.DB), params.siteId);
  if (!row) throw new Response("MiniWeb no encontrado", { status: 404 });
  let parsed: unknown;
  try { parsed = JSON.parse(row.documentJson); } catch { throw new Response("Publicación inválida", { status: 404 }); }
  const validated = validateMiniWebV2Document(parsed);
  if (!validated.valid) throw new Response("Publicación inválida", { status: 404 });
  return { siteId: row.siteId, document: validated.value, familyKey: row.familyKey, variant: row.visualVariant };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const data = loaderData;
  const hero = data?.document.sections.find((section) => section.visible && section.type === "hero");
  const title = hero?.type === "hero" && hero.content.title.trim() ? hero.content.title.trim() : "Sitio del negocio";
  const summary = hero?.type === "hero" && hero.content.subtitle.trim() ? hero.content.subtitle.trim() : "Conoce este negocio, sus servicios y cómo contactarlo.";
  return publicMeta(title, summary, data ? `/miniweb/${encodeURIComponent(data.siteId)}` : "/miniweb", data ? "index, follow" : "noindex, follow");
}

export default function PublicMiniWebV2Page() {
  const data = useLoaderData<typeof loader>();
  return <MiniWebV2Renderer document={data.document} familyKey={data.familyKey} variant={data.variant} mediaUrl={(assetId) => miniWebV2ImageUrl(data.siteId, assetId)}/>;
}
