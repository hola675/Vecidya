import { useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";

import { getBusinessProfileCompletion } from "../../db/business-profile-rules";
import { listPlatformBusinessProfiles } from "../../db/queries/platform-business-profiles.server";
import { createDatabase } from "../../db/client.server";
import { AdminShell } from "../components/admin-shell";
import { Badge, Icon } from "../components/ui";
import { publicAssets } from "../assets/public-assets";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import type { Route } from "./+types/internal-businesses";

export function meta({}: Route.MetaArgs) { return [{ title: "Negocios | Administración Vecidya" }]; }

type StatusFilter = "all" | "published" | "draft" | "suspended";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);
  return { profiles: await listPlatformBusinessProfiles(createDatabase(env.DB)), workspaceUser: access.workspaceUser };
}

export default function InternalBusinesses() {
  const { profiles, workspaceUser } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return profiles.filter((profile) => {
      if (statusFilter === "published" && profile.status !== "published") return false;
      if (statusFilter === "draft" && profile.status !== "draft") return false;
      if (statusFilter === "suspended" && profile.platformStatus !== "suspended") return false;
      if (!query) return true;
      return [profile.displayName, profile.slug, profile.organizationName, profile.organizationSlug, profile.category].some((value) => value?.toLowerCase().includes(query));
    });
  }, [profiles, search, statusFilter]);

  return <AdminShell active="businesses" workspaceUser={workspaceUser}>
    <main className="admin-content">
      <div className="page-heading"><div><p className="eyebrow">NEGOCIOS</p><h1>Business Profiles</h1><p>Consulta global read-only de los perfiles comerciales existentes.</p></div><Badge tone="neutral">{profiles.length} en total</Badge></div>

      {profiles.length ? (
        <>
          <div className="admin-toolbar">
            <label className="admin-search">
              <Icon name="eye" />
              <input aria-label="Buscar negocios" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, slug, organización o categoría…" type="search" value={search} />
            </label>
            <label className="admin-filter">
              Estado
              <select onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} value={statusFilter}>
                <option value="all">Todos</option>
                <option value="published">Publicado</option>
                <option value="draft">Borrador</option>
                <option value="suspended">Suspendido</option>
              </select>
            </label>
            <p className="admin-result-count">{filtered.length} de {profiles.length}</p>
          </div>

          {filtered.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Negocio</th><th>Organización</th><th>Categoría / ubicación</th><th>Estado</th><th>Completitud</th><th>Servicios</th><th className="admin-table__action">Acción</th></tr></thead>
                <tbody>
                  {filtered.map((profile) => {
                    const completion = getBusinessProfileCompletion(profile);
                    return (
                      <tr key={profile.id}>
                        <td><strong>{profile.displayName}</strong><span className="admin-table__meta">/{profile.slug}</span></td>
                        <td>{profile.organizationName}<span className="admin-table__meta">{profile.organizationSlug}</span></td>
                        <td>{profile.category || "Pendiente"}<span className="admin-table__meta">{[profile.city, profile.country].filter(Boolean).join(", ") || "Sin ubicación"}</span></td>
                        <td>
                          <div className="admin-table__badges">
                            <Badge tone={profile.status === "published" ? "success" : "neutral"}>{profile.status === "published" ? "Publicado" : "Borrador"}</Badge>
                            {profile.verificationStatus === "verified" ? <Badge tone="success">Verificado</Badge> : null}
                            {profile.platformStatus === "suspended" ? <Badge tone="danger">Suspendido</Badge> : null}
                          </div>
                        </td>
                        <td>{completion.percentage}%</td>
                        <td>{profile.servicesCount}</td>
                        <td className="admin-table__action">
                          <div className="admin-table__actions">
                            {profile.status === "published" ? <Link className="text-link" to={`/vecindario/${profile.slug}`}>Página pública</Link> : null}
                            <Link className="button button--secondary" to={`/app/internal/businesses/${profile.id}`}>Ver</Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <section className="empty-state card"><img alt="" height="320" src={publicAssets.illustrations.adminEmptySearch} width="320" /><div><p className="eyebrow">SIN RESULTADOS</p><h2>Ningún negocio coincide</h2><p>Ajusta la búsqueda o el filtro de estado.</p></div></section>
          )}
        </>
      ) : (
        <section className="empty-state card"><img alt="" height="320" src={publicAssets.illustrations.adminEmptySearch} width="320" /><div><p className="eyebrow">SIN PERFILES</p><h2>No hay Business Profiles registrados</h2><p>Los perfiles aparecerán aquí cuando existan datos reales en la plataforma.</p></div></section>
      )}
    </main>
  </AdminShell>;
}
