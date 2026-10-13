import { purgeExpiredIdentifiedReports } from "../../db/queries/diagnostic-identification.server";
import { cloudflareContext } from "../../server/cloudflare-context";

import type { ActionFunctionArgs } from "react-router";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (status: number, error: string) => Response.json({ error }, { status, headers });

export function loader() {
  return failure(405, "Método no permitido.");
}

export async function action({ context, request }: ActionFunctionArgs) {
  if (!import.meta.env.DEV) return failure(404, "No disponible.");
  if (request.method !== "POST") return failure(405, "Método no permitido.");
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure(403, "Origen no permitido.");
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return failure(415, "Formato no permitido.");
  let body: unknown;
  try { body = await request.json(); } catch { return failure(400, "Confirmación no válida."); }
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length !== 1 || (body as { confirm?: unknown }).confirm !== "PURGE_EXPIRED_IDENTIFIED_DIAGNOSTICS") return failure(400, "Confirmación no válida.");

  try {
    const { env } = context.get(cloudflareContext);
    const purged = await purgeExpiredIdentifiedReports(env.DB, new Date());
    return Response.json({ purged }, { headers });
  } catch {
    return failure(500, "No se pudo completar la limpieza local.");
  }
}
