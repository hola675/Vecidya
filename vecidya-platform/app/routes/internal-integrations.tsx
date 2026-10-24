import { useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { listPlatformIntegrations } from "../../db/queries/platform-integrations.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import { AdminShell } from "../components/admin-shell";
import { Badge, Icon } from "../components/ui";
import { publicAssets } from "../assets/public-assets";

import type { Route } from "./+types/internal-integrations";

const integrationStatusLabels = { pending: "Pendiente", active: "Activa", inactive: "Inactiva", error: "Error" } as const;
type IntegrationStatusFilter = "all" | keyof typeof integrationStatusLabels;

export function meta({}: Route.MetaArgs) { return [{ title: "Integraciones | Administración Vecidya" }]; }

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);
  const integrations = await listPlatformIntegrations(createDatabase(env.DB));
  const selectedOrganizationId = new URL(request.url).searchParams.get("organizationId");
  return { integrations, selectedOrganizationId, workspaceUser: access.workspaceUser };
}

export default function InternalIntegrations() {
  const { integrations, selectedOrganizationId, workspaceUser } = useLoaderData<typeof loader>();
  const orderedIntegrations = selectedOrganizationId
    ? [...integrations].sort((left, right) => Number(right.organizationId === selectedOrganizationId) - Number(left.organizationId === selectedOrganizationId))
    : integrations;
  const selectedOrganization = integrations.find((item) => item.organizationId === selectedOrganizationId);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IntegrationStatusFilter>("all");
  const filteredIntegrations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return orderedIntegrations.filter((integration) => {
      if (statusFilter !== "all" && integration.status !== statusFilter) return false;
      if (!query) return true;
      return [integration.organizationName, integration.organizationSlug, integration.provider, integration.externalId, integrationStatusLabels[integration.status]]
        .some((value) => value.toLocaleLowerCase().includes(query));
    });
  }, [orderedIntegrations, search, statusFilter]);

  return <AdminShell active="integrations" workspaceUser={workspaceUser}>
    <main className="admin-main admin-integration-page">
      <div className="page-heading"><div><p className="eyebrow">OPERACIONES INTERNAS</p><h1>Integraciones</h1><p>Consulta las conexiones genéricas registradas por organización. Esta vista no conecta proveedores ni modifica datos.</p></div><Badge tone="neutral">{integrations.length} conexiones</Badge></div>
      {selectedOrganizationId ? <p className="admin-selected-context" role="status">Organización seleccionada: <strong>{selectedOrganization?.organizationName ?? "no encontrada"}</strong></p> : null}
      {integrations.length ? <>
        <div className="admin-toolbar">
          <label className="admin-search">
            <Icon name="eye" />
            <input aria-label="Buscar integraciones" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar organización, proveedor o ID…" type="search" value={search} />
          </label>
          <label className="admin-filter">Estado
            <select onChange={(event) => setStatusFilter(event.target.value as IntegrationStatusFilter)} value={statusFilter}>
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
              <option value="error">Error</option>
            </select>
          </label>
          <p className="admin-result-count" aria-live="polite">{filteredIntegrations.length} de {integrations.length} conexiones</p>
        </div>
        {filteredIntegrations.length ? <div className="admin-table-wrap">
          <table className="admin-table admin-integration-table">
            <thead><tr><th>Organización</th><th>Proveedor</th><th>ID externo</th><th>Estado</th><th className="admin-table__action">Acción</th></tr></thead>
            <tbody>{filteredIntegrations.map((integration) => <tr className={integration.organizationId === selectedOrganizationId ? "is-selected" : undefined} key={integration.id}>
              <td><strong>{integration.organizationName}</strong><span className="admin-table__meta">{integration.organizationSlug}</span></td>
              <td>{integration.provider}</td>
              <td><span className="admin-integration-table__external-id">{integration.externalId}</span></td>
              <td><Badge tone={integration.status === "active" ? "success" : integration.status === "error" ? "danger" : "neutral"}>{integrationStatusLabels[integration.status]}</Badge></td>
              <td className="admin-table__action"><Link className="button button--secondary" to={`/app/internal/organizations/${integration.organizationId}`}>Ver organización</Link></td>
            </tr>)}</tbody>
          </table>
        </div> : <section className="admin-filter-empty card"><p className="eyebrow">SIN COINCIDENCIAS</p><h2>No hay integraciones con estos criterios</h2><p>Prueba con otro término o selecciona un estado distinto.</p></section>}
      </> : <section className="empty-state card"><img alt="" height="320" src={publicAssets.illustrations.adminEmptySearch} width="320" /><div><p className="eyebrow">SIN INTEGRACIONES</p><h2>No hay conexiones registradas</h2><p>Las conexiones genéricas aparecerán aquí cuando existan datos reales.</p></div></section>}
    </main>
  </AdminShell>;
}
