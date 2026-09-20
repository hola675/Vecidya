import { createDatabase } from "../../db/client.server";
import { listIntegrationConnections } from "../../db/queries/integration-connections.server";
import { requireMembership } from "../../server/auth/session.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import type { Route } from "./+types/api-organization-integrations";
export async function loader({ context, params, request }: Route.LoaderArgs) { const { env } = context.get(cloudflareContext); await requireMembership(env, request, params.organizationId); return Response.json(await listIntegrationConnections(createDatabase(env.DB), params.organizationId)); }
