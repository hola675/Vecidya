import { Link, useLoaderData } from "react-router";

import { getBusinessProfileCompletion } from "../../db/business-profile-rules";
import { listPlatformBusinessProfiles } from "../../db/queries/platform-business-profiles.server";
import { createDatabase } from "../../db/client.server";
import { AdminShell } from "../components/admin-shell";
import { Badge } from "../components/ui";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import type { Route } from "./+types/internal-businesses";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requirePlatformAdmin(env, request);
  return { profiles: await listPlatformBusinessProfiles(createDatabase(env.DB)) };
}

export default function InternalBusinesses() {
  const { profiles } = useLoaderData<typeof loader>();

  return <AdminShell active="businesses">
    <main className="admin-content">
      <div className="page-heading"><div><p className="eyebrow">NEGOCIOS</p><h1>Business Profiles</h1><p>Consulta global read-only de los perfiles comerciales existentes.</p></div><Badge tone="neutral">{profiles.length} perfiles</Badge></div>
      {profiles.length ? <div className="admin-business-list" aria-label="Business Profiles administrados">{profiles.map((profile) => {
        const completion = getBusinessProfileCompletion(profile);
        return <section className="card admin-business-card" key={profile.id}>
          <div className="admin-business-card__heading"><div><p className="eyebrow">{profile.organizationSlug}</p><h2>{profile.displayName}</h2><p>{profile.organizationName} · /{profile.slug}</p></div><div className="admin-business-card__badges"><Badge tone={profile.status === "published" ? "success" : "neutral"}>{profile.status === "published" ? "Publicado" : "Borrador"}</Badge>{profile.verificationStatus === "verified" ? <Badge tone="success">Verificado</Badge> : null}{profile.platformStatus === "suspended" ? <Badge tone="danger">Suspendido</Badge> : null}</div></div>
          <dl><div><dt>Categoría</dt><dd>{profile.category || "Pendiente"}</dd></div><div><dt>Ubicación</dt><dd>{[profile.city, profile.country].filter(Boolean).join(", ") || "Pendiente"}</dd></div><div><dt>Completitud</dt><dd>{completion.percentage}%</dd></div><div><dt>Servicios</dt><dd>{profile.servicesCount}</dd></div></dl>
          <div className="admin-business-card__footer"><p>{completion.issues.length ? `Pendientes: ${completion.issues.join(", ")}` : "Listo para publicar"}</p>{profile.status === "published" ? <Link className="button button--secondary" to={`/vecindario/${profile.slug}`}>Ver página pública</Link> : null}<Link className="button button--secondary" to={`/app/internal/businesses/${profile.id}`}>Ver perfil</Link></div>
        </section>;
      })}</div> : <section className="empty-state card"><div><p className="eyebrow">SIN PERFILES</p><h2>No hay Business Profiles registrados</h2><p>Los perfiles aparecerán aquí cuando existan datos reales en la plataforma.</p></div></section>}
    </main>
  </AdminShell>;
}
