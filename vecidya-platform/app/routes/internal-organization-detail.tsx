import { Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { getPlatformOrganizationDetail } from "../../db/queries/platform-organizations.server";
import { AdminShell } from "../components/admin-shell";
import { Badge } from "../components/ui";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";

import type { Route } from "./+types/internal-organization-detail";

export function meta({}: Route.MetaArgs) { return [{ title: "Detalle de organización | Administración Vecidya" }]; }

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requirePlatformAdmin(env, request);
  const detail = await getPlatformOrganizationDetail(createDatabase(env.DB), params.organizationId);
  if (!detail) throw new Response("Organización no encontrada", { status: 404 });
  return detail;
}

const serviceStatus = { active: "Activo", pending: "Pendiente", suspended: "Suspendido", ended: "Finalizado" } as const;
const integrationStatus = { active: "Activa", pending: "Pendiente", inactive: "Inactiva", error: "Error" } as const;

export default function InternalOrganizationDetail() {
  const { organization, members, profile, services, integrations } = useLoaderData<typeof loader>();
  return (
    <AdminShell active="organizations">
      <main className="admin-main">
        <Link className="back-link" to="/app/internal/organizations">← Volver a organizaciones</Link>
        <div className="page-heading"><div><p className="eyebrow">ORGANIZACIÓN</p><h1>{organization.name}</h1><p>{organization.slug}</p></div><Badge tone={profile?.status === "published" ? "success" : "neutral"}>{profile ? profile.status === "published" ? "Perfil publicado" : "Perfil borrador" : "Sin perfil"}</Badge></div>
        <div className="admin-detail-grid">
          <section className="card admin-detail-card"><p className="eyebrow">OWNER</p>{members.filter((member) => member.role === "owner").map((member) => <div key={member.id}><h2>{member.name}</h2><p>{member.email}</p></div>)}{!members.some((member) => member.role === "owner") ? <p>No hay owner registrado.</p> : null}</section>
          <section className="card admin-detail-card"><p className="eyebrow">BUSINESS PROFILE</p>{profile ? <><h2>{profile.displayName}</h2><p>{profile.shortDescription ?? "Sin descripción corta."}</p><Link className="text-link" to={`/vecindario/${profile.slug}`}>Ver perfil público →</Link></> : <p>Esta organización todavía no tiene Business Profile.</p>}</section>
          <section className="card admin-detail-card"><p className="eyebrow">MIEMBROS · {members.length}</p><ul className="admin-detail-list">{members.map((member) => <li key={member.id}><span>{member.name}<small>{member.email}</small></span><Badge>{member.role}</Badge></li>)}</ul></section>
          <section className="card admin-detail-card"><p className="eyebrow">SERVICIOS · {services.length}</p>{services.length ? <ul className="admin-detail-list">{services.map((service) => <li key={service.code}><span>{service.name}<small>{service.description ?? "Servicio Vecidya"}</small></span><Badge tone={service.status === "active" ? "success" : "neutral"}>{serviceStatus[service.status as keyof typeof serviceStatus] ?? service.status}</Badge></li>)}</ul> : <p>Sin servicios asignados.</p>}<Link className="button button--secondary" to={`/app/internal/services?organizationId=${organization.id}`}>Administrar servicios de esta organización</Link></section>
          <section className="card admin-detail-card"><p className="eyebrow">INTEGRACIONES · {integrations.length}</p>{integrations.length ? <ul className="admin-detail-list">{integrations.map((integration) => <li key={`${integration.provider}-${integration.externalId}`}><span>{integration.provider}<small>{integration.externalId}</small></span><Badge tone={integration.status === "active" ? "success" : "neutral"}>{integrationStatus[integration.status as keyof typeof integrationStatus] ?? integration.status}</Badge></li>)}</ul> : <p>Sin conexiones genéricas registradas.</p>}<Link className="button button--secondary" to={`/app/internal/integrations?organizationId=${organization.id}`}>Ver integraciones de esta organización</Link></section>
        </div>
      </main>
    </AdminShell>
  );
}
