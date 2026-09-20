import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { and, asc, eq } from "drizzle-orm";

import { createDatabase } from "../../db/client.server";
import { organization, organizationService, serviceCatalog } from "../../db/schema";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import { AdminShell } from "../components/admin-shell";

import type { Route } from "./+types/internal-services";

const serviceStatuses = ["pending", "active", "suspended", "ended"] as const;
type ServiceStatus = (typeof serviceStatuses)[number];
const serviceStatusLabels: Record<ServiceStatus, string> = { pending: "Pendiente", active: "Activo", suspended: "Suspendido", ended: "Finalizado" };

function isServiceStatus(value: FormDataEntryValue | null): value is ServiceStatus {
  return typeof value === "string" && serviceStatuses.includes(value as ServiceStatus);
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Administración interna de servicios | Vecidya" }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requirePlatformAdmin(env, request);

  const database = createDatabase(env.DB);
  const [organizations, catalog, assignments] = await Promise.all([
    database.select().from(organization).orderBy(asc(organization.name)),
    database.select().from(serviceCatalog).where(eq(serviceCatalog.status, "active")).orderBy(asc(serviceCatalog.name)),
    database.select().from(organizationService),
  ]);

  return { organizations, catalog, assignments, selectedOrganizationId: new URL(request.url).searchParams.get("organizationId") };
}

export async function action({ context, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  await requirePlatformAdmin(env, request);

  const formData = await request.formData();
  const organizationId = formData.get("organizationId");
  const serviceId = formData.get("serviceId");
  const status = formData.get("status");
  if (typeof organizationId !== "string" || typeof serviceId !== "string" || !isServiceStatus(status)) {
    return { error: "No se pudo guardar: revisa la organización, el servicio y el estado seleccionados." };
  }

  const database = createDatabase(env.DB);
  const service = await database.query.serviceCatalog.findFirst({
    where: eq(serviceCatalog.id, serviceId),
  });
  if (!service || service.status !== "active") {
    return { error: "El servicio seleccionado ya no está disponible." };
  }

  const [existing] = await database
    .select({ id: organizationService.id })
    .from(organizationService)
    .where(and(
      eq(organizationService.organizationId, organizationId),
      eq(organizationService.serviceId, serviceId),
    ));
  const now = new Date();

  if (existing) {
    await database
      .update(organizationService)
      .set({ status, updatedAt: now })
      .where(eq(organizationService.id, existing.id));
  } else {
    await database.insert(organizationService).values({
      id: crypto.randomUUID(),
      organizationId,
      serviceId,
      status,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { success: `${service.name}: estado actualizado a ${serviceStatusLabels[status]}.`, organizationId };
}

export default function InternalServices() {
  const { assignments, catalog, organizations, selectedOrganizationId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";
  const orderedOrganizations = selectedOrganizationId
    ? [...organizations].sort((left, right) => Number(right.id === selectedOrganizationId) - Number(left.id === selectedOrganizationId))
    : organizations;

  return (
    <AdminShell active="services">
    <main className="admin-main admin-service-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">OPERACIONES INTERNAS</p>
          <h1>Servicios por organización</h1>
          <p>Gestiona únicamente las asignaciones de servicios Vecidya. Selecciona una organización para revisar su contexto.</p>
        </div>
      </div>

      {actionData?.success ? <p className="success-message" role="status">{actionData.success}</p> : null}
      {actionData?.error ? <p className="alert" role="alert">{actionData.error}</p> : null}
      {selectedOrganizationId ? <p className="admin-selected-context" role="status">Organización seleccionada: <strong>{organizations.find((item) => item.id === selectedOrganizationId)?.name ?? "no encontrada"}</strong></p> : null}

      {organizations.length === 0 ? <section className="empty-state card"><div><h2>No hay organizaciones</h2><p>Las asignaciones aparecerán cuando exista una organización.</p></div></section> : orderedOrganizations.map((item) => {
        const assigned = assignments.filter((assignment) => assignment.organizationId === item.id);
        const isSelected = selectedOrganizationId === item.id;
        return <section className={`card admin-organization-service-card${isSelected ? " is-selected" : ""}`} key={item.id}>
          <div className="admin-service-card__heading"><div><p className="eyebrow">ORGANIZACIÓN</p><h2>{item.name}</h2><p>{item.slug}</p></div>{isSelected ? <span className="admin-selected-badge">Seleccionada</span> : null}</div>
          {catalog.map((service) => {
            const assignment = assigned.find((value) => value.serviceId === service.id);
            return <Form key={service.id} method="post" className="organization-form admin-service-assignment-form">
              <input name="organizationId" type="hidden" value={item.id} />
              <input name="serviceId" type="hidden" value={service.id} />
              <div><strong>{service.name}</strong><small>{service.description ?? "Servicio Vecidya"}</small></div>
              <label>Estado<select aria-label={`Estado de ${service.name} para ${item.name}`} defaultValue={assignment?.status ?? "pending"} name="status">{serviceStatuses.map((status) => <option key={status} value={status}>{serviceStatusLabels[status]}</option>)}</select></label>
              <button className="button button--secondary" disabled={isSaving} type="submit">{isSaving ? "Guardando…" : assignment ? "Guardar estado" : "Asignar"}</button>
            </Form>;
          })}
        </section>;
      })}
    </main>
    </AdminShell>
  );
}
