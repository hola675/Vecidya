import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { useMemo, useState } from "react";
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
type AssignmentFilter = "all" | "unassigned" | ServiceStatus;

function isServiceStatus(value: FormDataEntryValue | null): value is ServiceStatus {
  return typeof value === "string" && serviceStatuses.includes(value as ServiceStatus);
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Administración interna de servicios | Vecidya" }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);

  const database = createDatabase(env.DB);
  const [organizations, catalog, assignments] = await Promise.all([
    database.select().from(organization).orderBy(asc(organization.name)),
    database.select().from(serviceCatalog).where(eq(serviceCatalog.status, "active")).orderBy(asc(serviceCatalog.name)),
    database.select().from(organizationService),
  ]);

  return { organizations, catalog, assignments, selectedOrganizationId: new URL(request.url).searchParams.get("organizationId"), workspaceUser: access.workspaceUser };
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
  const { assignments, catalog, organizations, selectedOrganizationId, workspaceUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";
  const orderedOrganizations = selectedOrganizationId
    ? [...organizations].sort((left, right) => Number(right.id === selectedOrganizationId) - Number(left.id === selectedOrganizationId))
    : organizations;
  const [search, setSearch] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("all");
  const serviceRows = useMemo(() => {
    const assignmentByKey = new Map(assignments.map((assignment) => [`${assignment.organizationId}:${assignment.serviceId}`, assignment]));
    const query = search.trim().toLocaleLowerCase();
    return orderedOrganizations.flatMap((organization) => catalog.map((service) => {
      const assignment = assignmentByKey.get(`${organization.id}:${service.id}`);
      return { organization, service, assignment };
    })).filter(({ organization, service, assignment }) => {
      if (assignmentFilter === "unassigned" && assignment) return false;
      if (assignmentFilter !== "all" && assignmentFilter !== "unassigned" && assignment?.status !== assignmentFilter) return false;
      if (!query) return true;
      const statusLabel = assignment ? serviceStatusLabels[assignment.status] : "sin asignación sin asignar";
      return [organization.name, organization.slug, service.name, service.description, statusLabel]
        .some((value) => value?.toLocaleLowerCase().includes(query));
    });
  }, [assignments, assignmentFilter, catalog, orderedOrganizations, search]);

  return (
    <AdminShell active="services" workspaceUser={workspaceUser}>
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

      {organizations.length === 0 ? <section className="empty-state card"><div><h2>No hay organizaciones</h2><p>Las asignaciones aparecerán cuando exista una organización.</p></div></section> : catalog.length === 0 ? <section className="empty-state card"><div><h2>No hay servicios disponibles</h2><p>Los servicios activos del catálogo aparecerán aquí para su asignación.</p></div></section> : <>
        <div className="admin-toolbar">
          <label className="admin-search"><input aria-label="Buscar asignaciones" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar organización, servicio o estado…" type="search" value={search} /></label>
          <label className="admin-filter">Asignación
            <select onChange={(event) => setAssignmentFilter(event.target.value as AssignmentFilter)} value={assignmentFilter}>
              <option value="all">Todas</option>
              <option value="unassigned">Sin asignar</option>
              {serviceStatuses.map((status) => <option key={status} value={status}>{serviceStatusLabels[status]}</option>)}
            </select>
          </label>
          <p className="admin-result-count" aria-live="polite">{serviceRows.length} de {organizations.length * catalog.length} asignaciones posibles</p>
        </div>
        {serviceRows.length ? <>
          <p className="admin-service-table-scroll-hint" id="admin-service-table-scroll-hint">En pantallas pequeñas, desplaza la tabla horizontalmente para ver las acciones.</p>
          <div aria-describedby="admin-service-table-scroll-hint" aria-label="Asignaciones de servicios" className="admin-table-wrap admin-service-table-wrap" role="region" tabIndex={0}>
            <table className="admin-table admin-service-table">
              <thead><tr><th>Organización</th><th>Servicio</th><th>Estado actual</th><th>Actualizar estado</th><th className="admin-table__action">Acción</th></tr></thead>
              <tbody>{serviceRows.map(({ organization: targetOrganization, service, assignment }) => {
                const formId = `service-assignment-${targetOrganization.id}-${service.id}`;
                return <tr className={targetOrganization.id === selectedOrganizationId ? "is-selected" : undefined} key={`${targetOrganization.id}:${service.id}`}>
                  <td><strong>{targetOrganization.name}</strong><span className="admin-table__meta">{targetOrganization.slug}{targetOrganization.id === selectedOrganizationId ? " · Seleccionada" : ""}</span></td>
                  <td><strong>{service.name}</strong><span className="admin-table__meta">{service.description ?? "Servicio Vecidya"}</span></td>
                  <td>{assignment ? <span className={`badge badge--${assignment.status === "active" ? "success" : assignment.status === "suspended" ? "danger" : "neutral"}`}>{serviceStatusLabels[assignment.status]}</span> : <span className="badge badge--neutral">Sin asignar</span>}</td>
                  <td><label><span className="sr-only">Estado de {service.name} para {targetOrganization.name}</span><select defaultValue={assignment?.status ?? "pending"} form={formId} name="status">{serviceStatuses.map((status) => <option key={status} value={status}>{serviceStatusLabels[status]}</option>)}</select></label></td>
                  <td className="admin-table__action"><Form id={formId} method="post" className="admin-service-table__submit">
                    <input name="organizationId" type="hidden" value={targetOrganization.id} />
                    <input name="serviceId" type="hidden" value={service.id} />
                    <button className="button button--secondary" disabled={isSaving} type="submit">{isSaving ? "Guardando…" : assignment ? "Guardar estado" : "Asignar"}</button>
                  </Form></td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </> : <section className="admin-filter-empty card"><p className="eyebrow">SIN COINCIDENCIAS</p><h2>No hay asignaciones con estos criterios</h2><p>Ajusta la búsqueda o selecciona otro estado.</p></section>}
      </>}
    </main>
    </AdminShell>
  );
}
