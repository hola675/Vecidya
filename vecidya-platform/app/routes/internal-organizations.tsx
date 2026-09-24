import { useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { listPlatformOrganizations } from "../../db/queries/platform-organizations.server";
import { AdminShell } from "../components/admin-shell";
import { Badge, Icon } from "../components/ui";
import { publicAssets } from "../assets/public-assets";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";

import type { Route } from "./+types/internal-organizations";

export function meta({}: Route.MetaArgs) { return [{ title: "Organizaciones | Administración Vecidya" }]; }

type ProfileFilter = "all" | "published" | "draft" | "none";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);
  return { organizations: await listPlatformOrganizations(createDatabase(env.DB)), workspaceUser: access.workspaceUser };
}

function profileLabel(profile: { status: string } | null) {
  if (!profile) return "Sin perfil";
  return profile.status === "published" ? "Publicado" : "Borrador";
}

function profileTone(profile: { status: string } | null): "success" | "neutral" {
  return profile?.status === "published" ? "success" : "neutral";
}

export default function InternalOrganizations() {
  const { organizations, workspaceUser } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState("");
  const [profileFilter, setProfileFilter] = useState<ProfileFilter>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return organizations.filter((item) => {
      if (profileFilter === "published" && item.profile?.status !== "published") return false;
      if (profileFilter === "draft" && (!item.profile || item.profile.status === "published")) return false;
      if (profileFilter === "none" && item.profile) return false;
      if (!query) return true;
      return [item.name, item.slug, item.owner?.name, item.owner?.email].some((value) => value?.toLowerCase().includes(query));
    });
  }, [organizations, search, profileFilter]);

  return (
    <AdminShell active="organizations" workspaceUser={workspaceUser}>
      <main className="admin-main">
        <Link className="back-link" to="/app/internal">← Volver a administración</Link>
        <div className="page-heading"><div><p className="eyebrow">ORGANIZACIONES</p><h1>Organizaciones Vecidya</h1><p>Consulta el estado general de los espacios que administra Vecidya.</p></div><Badge tone="neutral">{organizations.length} en total</Badge></div>

        {organizations.length ? (
          <>
            <div className="admin-toolbar">
              <label className="admin-search">
                <Icon name="eye" />
                <input
                  aria-label="Buscar organizaciones"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre, slug o propietario…"
                  type="search"
                  value={search}
                />
              </label>
              <label className="admin-filter">
                Perfil
                <select onChange={(event) => setProfileFilter(event.target.value as ProfileFilter)} value={profileFilter}>
                  <option value="all">Todos</option>
                  <option value="published">Publicado</option>
                  <option value="draft">Borrador</option>
                  <option value="none">Sin perfil</option>
                </select>
              </label>
              <p className="admin-result-count">{filtered.length} de {organizations.length}</p>
            </div>

            {filtered.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Organización</th><th>Owner</th><th>Miembros</th><th>Perfil</th><th>Servicios</th><th>Integraciones</th><th className="admin-table__action">Acción</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.name}</strong><span className="admin-table__meta">{item.slug}</span></td>
                        <td>{item.owner ? <>{item.owner.name}<span className="admin-table__meta">{item.owner.email}</span></> : <span className="admin-table__meta">Sin owner registrado</span>}</td>
                        <td>{item.membersCount}</td>
                        <td><Badge tone={profileTone(item.profile)}>{profileLabel(item.profile)}</Badge></td>
                        <td>{item.servicesCount}</td>
                        <td>{item.integrationsCount}</td>
                        <td className="admin-table__action"><Link className="button button--secondary" to={`/app/internal/organizations/${item.id}`}>Ver</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
