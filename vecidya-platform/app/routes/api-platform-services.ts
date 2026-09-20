import { and, eq } from "drizzle-orm";

import { createDatabase } from "../../db/client.server";
import { organizationService, serviceCatalog } from "../../db/schema";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";

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
  await requirePlatformAdmin(env, request);

  let body: { serviceId?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    throw new Response("Invalid JSON body", { status: 400 });
  }

  if (typeof body.serviceId !== "string" || !isServiceStatus(body.status)) {
    throw new Response("A serviceId and a valid status are required", { status: 400 });
  }

  const database = createDatabase(env.DB);
  const service = await database.query.serviceCatalog.findFirst({
    where: and(eq(serviceCatalog.id, body.serviceId), eq(serviceCatalog.status, "active")),
  });
  if (!service) {
    throw new Response("Service not found", { status: 404 });
  }

  const now = new Date();
  const [existing] = await database
    .select({ id: organizationService.id })
    .from(organizationService)
    .where(and(
      eq(organizationService.organizationId, params.organizationId),
      eq(organizationService.serviceId, body.serviceId),
    ));

  const [assignment] = existing
    ? await database
      .update(organizationService)
      .set({ status: body.status, updatedAt: now })
      .where(eq(organizationService.id, existing.id))
      .returning()
    : await database
      .insert(organizationService)
      .values({
        id: crypto.randomUUID(),
        organizationId: params.organizationId,
        serviceId: body.serviceId,
        status: body.status,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

  return Response.json(assignment, { status: existing ? 200 : 201 });
}
