import { Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { listPlatformIntegrations } from "../../db/queries/platform-integrations.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import { AdminShell } from "../components/admin-shell";
import { Badge } from "../components/ui";

import type { Route } from "./+types/internal-integrations";

const integrationStatusLabels = { pending: "Pendiente", active: "Activa", inactive: "Inactiva", error: "Error" } as const;

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

  return <AdminShell active="integrations" workspaceUser={workspaceUser}>
    <main className="admin-main admin-integration-page">
      <div className="page-heading"><div><p className="eyebrow">OPERACIONES INTERNAS</p><h1>Integraciones</h1><p>Consulta las conexiones genéricas registradas por organización. Esta vista no conecta proveedores ni modifica datos.</p></div><Badge tone="neutral">{integrations.length} conexiones</Badge></div>
      {selectedOrganizationId ? <p className="admin-selected-context" role="status">Organización seleccionada: <strong>{selectedOrganization?.organizationName ?? "no encontrada"}</strong></p> : null}
      {integrations.length ? <div className="admin-integration-list" aria-label="Integraciones administradas">{orderedIntegrations.map((integration) => <section className={`card admin-integration-card${integration.organizationId === selectedOrganizationId ? " is-selected" : ""}`} key={integration.id}><div className="admin-integration-card__heading"><div><p className="eyebrow">{integration.organizationSlug}</p><h2>{integration.organizationName}</h2></div><Badge tone={integration.status === "active" ? "success" : "neutral"}>{integrationStatusLabels[integration.status]}</Badge></div><dl><div><dt>Proveedor</dt><dd>{integration.provider}</dd></div><div><dt>ID externo</dt><dd>{integration.externalId}</dd></div></dl><Link className="button button--secondary" to={`/app/internal/organizations/${integration.organizationId}`}>Ver organización</Link></section>)}</div> : <section className="empty-state card"><div><p className="eyebrow">SIN INTEGRACIONES</p><h2>No hay conexiones registradas</h2><p>Las conexiones genéricas aparecerán aquí cuando existan datos reales.</p></div></section>}
    </main>
  </AdminShell>;
}
