import { cloudflareContext } from "../../server/cloudflare-context";
import { isLoopbackDevelopmentHost } from "../features/diagnostic/funnel-analytics-contract";
import { runIdentifiedReportPurge } from "../../server/identified-report-purge.server";
import type { ActionFunctionArgs } from "react-router";

const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export function loader() {
  return Response.json({ error: "Método no permitido." }, { status: 405, headers });
}

export async function action({ context, request }: ActionFunctionArgs) {
  const origin = new URL(request.url).origin;
  if (!import.meta.env.DEV || !isLoopbackDevelopmentHost(new URL(request.url).hostname)) {
    return Response.json({ error: "No disponible." }, { status: 404, headers });
  }
  if (request.method !== "POST") return Response.json({ error: "Método no permitido." }, { status: 405, headers });
  if (request.headers.get("origin") !== origin) return Response.json({ error: "Origen no permitido." }, { status: 403, headers });

  try {
    const { env } = context.get(cloudflareContext);
    const result = await runIdentifiedReportPurge(env, new Date());
    return Response.json(result, { headers });
  } catch {
    return Response.json({ error: "No se pudo completar la corrida local de purga." }, { status: 500, headers });
  }
}
