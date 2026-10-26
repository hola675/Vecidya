import { createDatabase } from "../../db/client.server";
import { listIntegrationConnections } from "../../db/queries/integration-connections.server";
import { integrationConnection, organization, platformAuditLog } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import { cloudflareContext } from "../../server/cloudflare-context";
import { parseIntegrationConnection } from "../../server/integration-connection-validation.server";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import type { Route } from "./+types/api-platform-integrations";
export async function loader({ context, params, request }: Route.LoaderArgs) { const { env } = context.get(cloudflareContext); await requirePlatformAdmin(env, request); return Response.json(await listIntegrationConnections(createDatabase(env.DB), params.organizationId)); }
export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const actor = await requirePlatformAdmin(env, request);
  let body: unknown;
  try { body = await request.json(); } catch { throw new Response("JSON inválido", { status: 400 }); }
  const database = createDatabase(env.DB);
  const organizationId = params.organizationId ?? "";
  const target = await database.query.organization.findFirst({ where: eq(organization.id, organizationId) });
  if (!target) throw new Response("Organización no encontrada", { status: 404 });
  const input = parseIntegrationConnection(body);
  const duplicate = await database.query.integrationConnection.findFirst({
    where: and(eq(integrationConnection.provider, input.provider), eq(integrationConnection.externalId, input.externalId)),
  });
  if (duplicate) return Response.json({ error: "Esta conexión ya está registrada.", organizationId: duplicate.organizationId }, { status: 409 });
  const now = new Date();
  const id = crypto.randomUUID();
  try {
    await database.batch([
      database.insert(integrationConnection).values({ id, organizationId, ...input, createdAt: now, updatedAt: now }),
      database.insert(platformAuditLog).values({ id: crypto.randomUUID(), actorUserId: actor.userId, action: "organization_integration.create", entityType: "integration_connection", entityId: id, organizationId, previousValue: null, newValue: input.status, metadata: JSON.stringify({ provider: input.provider, externalId: input.externalId }), createdAt: now }),
    ]);
  } catch (error) {
    if (error instanceof Error && /unique|constraint/i.test(error.message)) {
      return Response.json({ error: "Esta conexión ya está registrada." }, { status: 409 });
    }
    throw error;
  }
  return Response.json({ id, organizationId, ...input, createdAt: now, updatedAt: now }, { status: 201 });
}
