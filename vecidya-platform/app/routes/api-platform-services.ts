import { eq } from "drizzle-orm";

import { createDatabase } from "../../db/client.server";
import { organizationService, serviceCatalog } from "../../db/schema";
import { PlatformServiceAssignmentConflict, savePlatformServiceAssignment } from "../../db/queries/platform-services.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin, requirePlatformAdminAction } from "../../server/platform-authorization.server";

import type { Route } from "./+types/api-platform-services";

const serviceStatuses = ["pending", "active", "suspended", "ended"] as const;
type ServiceStatus = (typeof serviceStatuses)[number];

function isServiceStatus(value: unknown): value is ServiceStatus {
  return typeof value === "string" && serviceStatuses.includes(value as ServiceStatus);
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requirePlatformAdmin(env, request);

  const database = createDatabase(env.DB);
  const services = await database
    .select({
      id: organizationService.id,
      serviceId: organizationService.serviceId,
      code: serviceCatalog.code,
      name: serviceCatalog.name,
      status: organizationService.status,
    })
    .from(organizationService)
    .innerJoin(serviceCatalog, eq(organizationService.serviceId, serviceCatalog.id))
    .where(eq(organizationService.organizationId, params.organizationId));

  return Response.json(services);
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdminAction(env, request, "organization:service:update");

  let body: { serviceId?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    throw new Response("Invalid JSON body", { status: 400 });
  }

  if (typeof body.serviceId !== "string" || !isServiceStatus(body.status)) {
    throw new Response("A serviceId and a valid status are required", { status: 400 });
  }

  try {
    const assignment = await savePlatformServiceAssignment(createDatabase(env.DB), {
      organizationId: params.organizationId, serviceId: body.serviceId, status: body.status, actorUserId: access.userId,
    });
    return Response.json(assignment, { status: assignment.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof PlatformServiceAssignmentConflict) return Response.json({ error: error.message }, { status: 409 });
    throw error;
  }
}
