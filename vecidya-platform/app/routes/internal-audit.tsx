import { Form, Link, useLoaderData } from "react-router";

import { listPlatformAuditLogPage } from "../../db/queries/platform-governance.server";
import { platformAuditActionLabels } from "../lib/platform-audit-labels";
import { createDatabase } from "../../db/client.server";
import { AdminShell } from "../components/admin-shell";
import { Badge, Icon } from "../components/ui";
import { publicAssets } from "../assets/public-assets";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import type { Route } from "./+types/internal-audit";

type AuditActionFilter = "all" | string;
const auditPageSize = 50;

function formatTimestamp(date: Date) {
  return new Date(date).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Auditoría | Vecidya" }];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);
  const url = new URL(request.url);
  const search = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const action = (url.searchParams.get("action") ?? "").trim().slice(0, 160);
  const parsedPage = Number(url.searchParams.get("page") ?? "1");
  const requestedPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const result = await listPlatformAuditLogPage(createDatabase(env.DB), {
    page: requestedPage,
    pageSize: auditPageSize,
    actionLabels: platformAuditActionLabels,
    ...(action && action !== "all" ? { action } : {}),
    ...(search ? { search } : {}),
  });
  return { ...result, search, action: action === "all" ? "" : action, workspaceUser: access.workspaceUser };
}

function auditPageHref(page: number, search: string, action: AuditActionFilter) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (action !== "all") params.set("action", action);
  params.set("page", String(page));
  return `/app/internal/audit?${params.toString()}#audit-results`;
}

export default function InternalAudit() {
  const { activity, actions, action, page, pageCount, pageSize, search, total, workspaceUser } = useLoaderData<typeof loader>();
  const actionFilter: AuditActionFilter = action || "all";
  const hasFilters = Boolean(search || action);
  const firstResult = total ? (page - 1) * pageSize + 1 : 0;
  const lastResult = Math.min(page * pageSize, total);

  return (
    <AdminShell active="audit" workspaceUser={workspaceUser}>
      <main className="admin-content">
        <div className="page-heading">
          <div><p className="eyebrow">GOBIERNO</p><h1>Auditoría</h1><p>Acciones administrativas registradas en Vecidya: actor, organización, cambio y fecha. Las acciones no instrumentadas se identifican con su clave técnica.</p></div>
          <Badge tone="neutral">{total} {total === 1 ? "registro" : "registros"}</Badge>
        </div>

        {total || hasFilters ? (
          <>
            <Form className="admin-toolbar" method="get">
              <label className="admin-search"><Icon name="eye" /><input aria-label="Buscar en auditoría" defaultValue={search} maxLength={100} name="q" placeholder="Buscar actor, negocio o cambio…" type="search" /></label>
              <label className="admin-filter">Acción
                <select defaultValue={actionFilter} name="action">
                  <option value="all">Todas</option>
                  {actions.map((item) => <option key={item} value={item}>{platformAuditActionLabels[item] ?? item}</option>)}
                </select>
              </label>
              <button className="button button--secondary" type="submit">Aplicar filtros</button>
              {hasFilters ? <Link className="button button--ghost" to="/app/internal/audit">Limpiar</Link> : null}
            </Form>
            <p className="admin-result-count" aria-live="polite">Mostrando {firstResult}–{lastResult} de {total} registros</p>
            {activity.length ? <div className="admin-table-wrap" id="audit-results">
              <table className="admin-table admin-audit-table">
                <thead><tr><th>Fecha</th><th>Acción</th><th>Organización / perfil</th><th>Actor</th><th>Cambio</th></tr></thead>
                <tbody>{activity.map((entry) => <tr key={entry.id}>
                  <td><time dateTime={entry.createdAt.toISOString()}>{formatTimestamp(entry.createdAt)}</time></td>
                  <td><strong>{platformAuditActionLabels[entry.action] ?? entry.action}</strong><span className="admin-table__meta">{entry.action}</span></td>
                  <td><strong>{entry.organizationName ?? "Organización no disponible"}</strong><span className="admin-table__meta">{entry.businessProfileDisplayName ?? `${entry.entityType}: ${entry.entityId}`}{entry.businessProfileSlug ? <> · <Link to={`/app/internal/businesses/${entry.entityId}`}>Ver perfil</Link></> : null}</span></td>
                  <td>{entry.actorName ?? entry.actorEmail ?? "Actor desconocido"}{entry.actorName && entry.actorEmail ? <span className="admin-table__meta">{entry.actorEmail}</span> : null}</td>
                  <td><span className="admin-audit-table__change">{entry.previousValue ?? "—"} → {entry.newValue ?? "—"}</span></td>
                </tr>)}</tbody>
              </table>
            </div> : <section className="admin-filter-empty card"><p className="eyebrow">SIN COINCIDENCIAS</p><h2>No hay registros con estos criterios</h2><p>Ajusta la búsqueda o selecciona otra acción.</p></section>}
            {total > 0 ? <nav aria-label="Paginación de auditoría" className="admin-pagination">
              {page > 1 ? <Link className="button button--secondary" to={auditPageHref(page - 1, search, actionFilter)}>Anterior</Link> : <span aria-disabled="true" className="button button--secondary">Anterior</span>}
              <span aria-current="page">Página {page} de {pageCount}</span>
              {page < pageCount ? <Link className="button button--secondary" to={auditPageHref(page + 1, search, actionFilter)}>Siguiente</Link> : <span aria-disabled="true" className="button button--secondary">Siguiente</span>}
            </nav> : null}
          </>
        ) : (
          <section className="empty-state card"><img alt="" height="320" src={publicAssets.illustrations.adminEmptySearch} width="320" /><div><p className="eyebrow">SIN ACTIVIDAD</p><h2>Todavía no hay acciones administrativas registradas</h2><p>Los cambios de organizaciones, perfiles, servicios, integraciones, licencias y capacitación aparecerán aquí cuando se realicen.</p></div></section>
        )}
      </main>
    </AdminShell>
  );
}
