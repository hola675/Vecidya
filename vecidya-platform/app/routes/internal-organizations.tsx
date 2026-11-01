import { Form, Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { listPlatformOrganizationsPage, listPlatformOrganizationOptions } from "../../db/queries/platform-organizations.server";
import type { OrganizationProfileFilter, OrganizationSort } from "../../db/queries/platform-organizations.server";
import { AdminShell } from "../components/admin-shell";
import { Badge, Icon } from "../components/ui";
import { publicAssets } from "../assets/public-assets";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformReadAccess } from "../../server/platform-authorization.server";
import { useLocation } from "react-router";

import type { Route } from "./+types/internal-organizations";

const organizationPageSize = 50;
const profileFilters: readonly OrganizationProfileFilter[] = ["all", "published", "draft", "none"];
const organizationSorts: readonly OrganizationSort[] = ["name-asc", "name-desc", "created-desc", "created-asc"];

export function meta({}: Route.MetaArgs) { return [{ title: "Espacios de trabajo | Administración Vecidya" }]; }

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformReadAccess(env, request);
  const url = new URL(request.url);
  const search = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const requestedProfile = url.searchParams.get("profile");
  const profileFilter = profileFilters.find((filter) => filter === requestedProfile) ?? "all";
  const requestedSort = url.searchParams.get("order");
  const sort = organizationSorts.find((option) => option === requestedSort) ?? "name-asc";
  const parsedPage = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const result = await listPlatformOrganizationsPage(createDatabase(env.DB), {
    search,
    profile: profileFilter,
    sort,
    page,
    pageSize: organizationPageSize,
  });
  const organizationOptions = await listPlatformOrganizationOptions(createDatabase(env.DB));
  return { ...result, organizationOptions, search, profileFilter, sort, workspaceUser: access.workspaceUser, platformRole: access.role };
}

function profileLabel(profile: { status: string } | null) {
  if (!profile) return "Sin perfil";
  return profile.status === "published" ? "Publicado" : "Borrador";
}

function profileTone(profile: { status: string } | null): "success" | "neutral" {
  return profile?.status === "published" ? "success" : "neutral";
}

function organizationPageHref(base: string, page: number, search: string, profile: OrganizationProfileFilter, sort: OrganizationSort) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (profile !== "all") params.set("profile", profile);
  params.set("order", sort);
  params.set("page", String(page));
  return `${base}/organizations?${params.toString()}#organizations-results`;
}

export default function InternalOrganizations() {
  const location = useLocation();
  const routeBase = location.pathname.startsWith("/app/platform") ? "/app/platform" : "/app/internal";
  const { organizations, organizationOptions, page, pageCount, pageSize, total, search, profileFilter, sort, workspaceUser, platformRole } = useLoaderData<typeof loader>();
  const hasFilters = Boolean(search || profileFilter !== "all");
  const firstResult = total ? (page - 1) * pageSize + 1 : 0;
  const lastResult = Math.min(page * pageSize, total);

  return (
    <AdminShell active="organizations" workspaceUser={workspaceUser} platformRole={platformRole} organizationOptions={organizationOptions}>
      <main className="admin-main">
        <Link className="back-link" to={routeBase}>← Volver a administración</Link>
        <div className="page-heading"><div><p className="eyebrow">ORGANIZACIONES DE VECIDYA</p><h1>Administrar organizaciones</h1><p>Selecciona un negocio para gestionar su ciclo, miembros, servicios, MiniWeb y capacitación con permisos de superadministrador.</p></div><Badge tone="neutral">{total} organizaciones</Badge>{platformRole === "platform_admin" ? <Link className="button button--primary" to={`${routeBase}/organizations/new`}>Crear organización</Link> : null}</div>

        {total || hasFilters ? (
          <>
            <Form action={`${routeBase}/organizations`} className="admin-toolbar" method="get">
              <label className="admin-search">
                <Icon name="eye" />
                <input
                  aria-label="Buscar negocios o clientes"
                  defaultValue={search}
                  maxLength={100}
                  name="q"
                  placeholder="Buscar por negocio, cliente o slug…"
                  type="search"
                />
              </label>
              <label className="admin-filter">
                Perfil
                <select defaultValue={profileFilter} name="profile">
                  <option value="all">Todos</option>
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                  <option value="none">Sin perfil</option>
                </select>
              </label>
              <label className="admin-filter">
                Ordenar
                <select aria-label="Ordenar organizaciones" defaultValue={sort} name="order">
                  <option value="name-asc">Nombre A–Z</option>
                  <option value="name-desc">Nombre Z–A</option>
                  <option value="created-desc">Más recientes</option>
                  <option value="created-asc">Más antiguas</option>
                </select>
              </label>
              <button className="button button--secondary" type="submit">Aplicar filtros</button>
              {hasFilters || sort !== "name-asc" ? <Link className="button button--ghost" to={`${routeBase}/organizations`}>Limpiar</Link> : null}
            </Form>

            <p className="admin-result-count" aria-live="polite">Mostrando {firstResult}–{lastResult} de {total} espacios</p>
            {organizations.length ? (
              <>
                <div className="admin-table-wrap" id="organizations-results">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Espacio de trabajo</th><th>Cliente responsable</th><th>Estado</th><th>Miembros</th><th>Perfil</th><th>Servicios</th><th>Integraciones</th><th className="admin-table__action">Acción</th></tr>
                    </thead>
                    <tbody>{organizations.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.name}</strong><span className="admin-table__meta">{item.slug}</span></td>
                        <td>{item.owner ? <>{item.owner.name}<span className="admin-table__meta">{item.owner.email}</span></> : <span className="admin-table__meta">Sin owner registrado</span>}</td>
                        <td><Badge tone={item.lifecycleStatus === "active" ? "success" : "neutral"}>{item.lifecycleStatus}</Badge></td>
                        <td>{item.membersCount}</td>
                        <td><Badge tone={profileTone(item.profile)}>{profileLabel(item.profile)}</Badge></td>
                        <td>{item.servicesCount}</td>
                        <td>{item.integrationsCount}</td>
                        <td className="admin-table__action"><Link className="button button--secondary" to={`${routeBase}/organizations/${item.id}`}>Gestionar</Link></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                {pageCount > 1 ? <nav aria-label="Paginación de organizaciones" className="admin-pagination">
                  {page > 1 ? <Link className="button button--secondary" to={organizationPageHref(routeBase, page - 1, search, profileFilter, sort)}>Anterior</Link> : <span aria-disabled="true" className="button button--secondary">Anterior</span>}
                  <span aria-current="page">Página {page} de {pageCount}</span>
                  {page < pageCount ? <Link className="button button--secondary" to={organizationPageHref(routeBase, page + 1, search, profileFilter, sort)}>Siguiente</Link> : <span aria-disabled="true" className="button button--secondary">Siguiente</span>}
                </nav> : null}
              </>
            ) : (
              <section className="empty-state card"><img alt="" height="320" src={publicAssets.illustrations.adminEmptySearch} width="320" /><div><p className="eyebrow">SIN RESULTADOS</p><h2>Ninguna organización coincide</h2><p>Ajusta la búsqueda o el filtro de perfil.</p></div></section>
            )}
          </>
        ) : (
          <section className="empty-state card"><img alt="" height="320" src={publicAssets.illustrations.adminEmptySearch} width="320" /><div><p className="eyebrow">SIN ORGANIZACIONES</p><h2>No hay organizaciones registradas</h2><p>Las organizaciones aparecerán aquí cuando existan datos reales en la plataforma.</p></div></section>
        )}
      </main>
    </AdminShell>
  );
}
