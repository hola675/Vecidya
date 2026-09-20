import { Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { listPlatformOrganizations } from "../../db/queries/platform-organizations.server";
import { AdminShell } from "../components/admin-shell";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";

import type { Route } from "./+types/internal-organizations";

export function meta({}: Route.MetaArgs) { return [{ title: "Organizaciones | Administración Vecidya" }]; }

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requirePlatformAdmin(env, request);
  return { organizations: await listPlatformOrganizations(createDatabase(env.DB)) };
}

export default function InternalOrganizations() {
  const { organizations } = useLoaderData<typeof loader>();
  return (
    <AdminShell active="organizations">
      <main className="admin-main">
        <Link className="back-link" to="/app/internal">← Volver a administración</Link>
        <div className="page-heading"><div><p className="eyebrow">ORGANIZACIONES</p><h1>Organizaciones Vecidya</h1><p>Consulta el estado general de los espacios que administra Vecidya.</p></div></div>
        {organizations.length ? <div className="admin-organization-list" aria-label="Organizaciones administradas">{organizations.map((item) => <section className="card admin-organization-card" key={item.id}><div><p className="eyebrow">{item.slug}</p><h2>{item.name}</h2><p>{item.owner ? `Owner: ${item.owner.name} · ${item.owner.email}` : "Sin owner registrado"}</p></div><dl><div><dt>Miembros</dt><dd>{item.membersCount}</dd></div><div><dt>Perfil</dt><dd>{item.profile ? item.profile.status === "published" ? "Publicado" : "Borrador" : "Sin perfil"}</dd></div><div><dt>Servicios</dt><dd>{item.servicesCount}</dd></div><div><dt>Integraciones</dt><dd>{item.integrationsCount}</dd></div></dl><Link className="button button--secondary" to={`/app/internal/organizations/${item.id}`}>Ver organización</Link></section>)}</div> : <section className="empty-state card"><div><p className="eyebrow">SIN ORGANIZACIONES</p><h2>No hay organizaciones registradas</h2><p>Las organizaciones aparecerán aquí cuando existan datos reales en la plataforma.</p></div></section>}
      </main>
    </AdminShell>
  );
}
