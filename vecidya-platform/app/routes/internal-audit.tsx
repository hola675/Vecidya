import { useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";

import { listPlatformAuditLog } from "../../db/queries/platform-governance.server";
import { createDatabase } from "../../db/client.server";
import { AdminShell } from "../components/admin-shell";
import { Badge, Icon } from "../components/ui";
import { publicAssets } from "../assets/public-assets";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import type { Route } from "./+types/internal-audit";

const auditActionLabels: Record<string, string> = {
  "business_profile.verify": "Verificó el perfil",
  "business_profile.unverify": "Retiró la verificación",
  "business_profile.suspend": "Suspendió el perfil",
  "business_profile.reactivate": "Reactivó el perfil",
};
type AuditActionFilter = "all" | keyof typeof auditActionLabels;

function formatTimestamp(date: Date) {
  return new Date(date).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Auditoría | Vecidya" }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);
  const activity = await listPlatformAuditLog(createDatabase(env.DB), { limit: 200 });
  return { activity, workspaceUser: access.workspaceUser };
}

export default function InternalAudit() {
  const { activity, workspaceUser } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditActionFilter>("all");
  const filteredActivity = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return activity.filter((entry) => {
      if (actionFilter !== "all" && entry.action !== actionFilter) return false;
      if (!query) return true;
      return [
        auditActionLabels[entry.action] ?? entry.action,
        entry.actorName,
        entry.actorEmail,
        entry.businessProfileDisplayName,
        entry.businessProfileSlug,
        entry.organizationName,
        entry.previousValue,
        entry.newValue,
      ].some((value) => value?.toLocaleLowerCase().includes(query));
    });
  }, [activity, search, actionFilter]);

  return (
    <AdminShell active="audit" workspaceUser={workspaceUser}>
      <main className="admin-content">
        <div className="page-heading">
          <div><p className="eyebrow">GOBIERNO</p><h1>Auditoría</h1><p>Acciones administrativas sensibles ejecutadas sobre Business Profiles: quién, qué, sobre qué perfil y cuándo. Se muestran hasta 200 registros recientes.</p></div>
          <Badge tone="neutral">{activity.length} registros recientes</Badge>
        </div>

        {activity.length ? (
          <>
            <div className="admin-toolbar">
              <label className="admin-search"><Icon name="eye" /><input aria-label="Buscar en auditoría" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar actor, negocio o cambio…" type="search" value={search} /></label>
              <label className="admin-filter">Acción
                <select onChange={(event) => setActionFilter(event.target.value as AuditActionFilter)} value={actionFilter}>
                  <option value="all">Todas</option>
                  {Object.entries(auditActionLabels).map(([action, label]) => <option key={action} value={action}>{label}</option>)}
                </select>
              </label>
              <p className="admin-result-count" aria-live="polite">{filteredActivity.length} de {activity.length} registros</p>
            </div>
            {filteredActivity.length ? <div className="admin-table-wrap">
              <table className="admin-table admin-audit-table">
                <thead><tr><th>Fecha</th><th>Acción</th><th>Organización / perfil</th><th>Actor</th><th>Cambio</th></tr></thead>
                <tbody>{filteredActivity.map((entry) => <tr key={entry.id}>
                  <td><time dateTime={entry.createdAt.toISOString()}>{formatTimestamp(entry.createdAt)}</time></td>
                  <td><strong>{auditActionLabels[entry.action] ?? entry.action}</strong></td>
                  <td><strong>{entry.organizationName ?? "Organización no disponible"}</strong><span className="admin-table__meta">{entry.businessProfileDisplayName ?? entry.entityId}{entry.businessProfileSlug ? <> · <Link to={`/app/internal/businesses/${entry.entityId}`}>Ver perfil</Link></> : null}</span></td>
                  <td>{entry.actorName ?? entry.actorEmail ?? "Actor desconocido"}{entry.actorName && entry.actorEmail ? <span className="admin-table__meta">{entry.actorEmail}</span> : null}</td>
                  <td><span className="admin-audit-table__change">{entry.previousValue ?? "—"} → {entry.newValue ?? "—"}</span></td>
                </tr>)}</tbody>
              </table>
            </div> : <section className="admin-filter-empty card"><p className="eyebrow">SIN COINCIDENCIAS</p><h2>No hay registros con estos criterios</h2><p>Ajusta la búsqueda o selecciona otra acción.</p></section>}
          </>
        ) : (
          <section className="empty-state card"><img alt="" height="320" src={publicAssets.illustrations.adminEmptySearch} width="320" /><div><p className="eyebrow">SIN ACTIVIDAD</p><h2>Todavía no hay acciones administrativas registradas</h2><p>Las verificaciones y suspensiones de Business Profiles aparecerán aquí.</p></div></section>
        )}
      </main>
    </AdminShell>
  );
}
