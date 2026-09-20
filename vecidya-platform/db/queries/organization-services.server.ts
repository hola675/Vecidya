import { asc, eq } from "drizzle-orm";
import type { Database } from "../client.server";
import { organizationService, serviceCatalog } from "../schema";
export async function listOrganizationServices(database: Database, organizationId: string) {
  return database.select({ code: serviceCatalog.code, name: serviceCatalog.name, description: serviceCatalog.description, status: organizationService.status, activatedAt: organizationService.activatedAt }).from(organizationService).innerJoin(serviceCatalog, eq(organizationService.serviceId, serviceCatalog.id)).where(eq(organizationService.organizationId, organizationId)).orderBy(asc(serviceCatalog.name));
}
