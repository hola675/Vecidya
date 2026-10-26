import { and, eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { organization, organizationService, platformAuditLog, serviceCatalog } from "../schema";

export type PlatformServiceStatus = "pending" | "active" | "suspended" | "ended";

export class PlatformServiceAssignmentConflict extends Error {}

export async function savePlatformServiceAssignment(database: Database, input: {
  organizationId: string;
  serviceId: string;
  status: PlatformServiceStatus;
  actorUserId: string;
}) {
  const [targetOrganization, service, existing] = await Promise.all([
    database.query.organization.findFirst({ where: eq(organization.id, input.organizationId) }),
    database.query.serviceCatalog.findFirst({ where: and(eq(serviceCatalog.id, input.serviceId), eq(serviceCatalog.status, "active")) }),
    database.query.organizationService.findFirst({ where: and(eq(organizationService.organizationId, input.organizationId), eq(organizationService.serviceId, input.serviceId)) }),
  ]);
  if (!targetOrganization) throw new Response("Organización no encontrada", { status: 404 });
  if (!service) throw new Response("El servicio seleccionado ya no está disponible.", { status: 404 });

  const now = new Date();
  const previousStatus = existing?.status ?? null;
  const activatedAt = input.status === "active" && previousStatus !== "active" ? now : existing?.activatedAt ?? null;
  const endedAt = input.status === "ended" ? (previousStatus === "ended" ? existing?.endedAt ?? now : now) : null;
  const assignmentId = existing?.id ?? crypto.randomUUID();
  const write = existing
    ? database.update(organizationService).set({ status: input.status, activatedAt, endedAt, updatedAt: now }).where(eq(organizationService.id, existing.id))
    : database.insert(organizationService).values({ id: assignmentId, organizationId: input.organizationId, serviceId: input.serviceId, status: input.status, activatedAt, endedAt, createdAt: now, updatedAt: now });
  const action = !existing ? "organization_service.assign" : input.status === "ended" ? "organization_service.end" : "organization_service.update";
  try {
    await database.batch([
      write,
      database.insert(platformAuditLog).values({
        id: crypto.randomUUID(), actorUserId: input.actorUserId, action, entityType: "organization_service",
        entityId: assignmentId, organizationId: input.organizationId, previousValue: previousStatus, newValue: input.status,
        metadata: JSON.stringify({ serviceId: input.serviceId, serviceName: service.name }), createdAt: now,
      }),
    ]);
  } catch (error) {
    if (!existing && error instanceof Error && /unique|constraint/i.test(error.message)) {
      throw new PlatformServiceAssignmentConflict("Otra operación asignó este servicio al mismo tiempo.");
    }
    throw error;
  }
  return { id: assignmentId, organizationId: input.organizationId, serviceId: input.serviceId, serviceName: service.name, previousStatus, status: input.status, activatedAt, endedAt, created: !existing };
}
