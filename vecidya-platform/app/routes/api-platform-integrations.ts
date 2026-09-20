import { createDatabase } from "../../db/client.server";
import { createIntegrationConnection, listIntegrationConnections } from "../../db/queries/integration-connections.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { parseIntegrationConnection } from "../../server/integration-connection-validation.server";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import type { Route } from "./+types/api-platform-integrations";
export async function loader({ context, params, request }: Route.LoaderArgs) { const { env } = context.get(cloudflareContext); await requirePlatformAdmin(env, request); return Response.json(await listIntegrationConnections(createDatabase(env.DB), params.organizationId)); }
export async function action({ context, params, request }: Route.ActionArgs) { const { env } = context.get(cloudflareContext); await requirePlatformAdmin(env, request); let body: unknown; try { body = await request.json(); } catch { throw new Response("JSON inválido", { status: 400 }); } return Response.json(await createIntegrationConnection(createDatabase(env.DB), { organizationId: params.organizationId, ...parseIntegrationConnection(body) }), { status: 201 }); }
