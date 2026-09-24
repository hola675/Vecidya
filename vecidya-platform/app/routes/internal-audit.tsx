import { Link, useLoaderData } from "react-router";

import { listPlatformAuditLog } from "../../db/queries/platform-governance.server";
import { createDatabase } from "../../db/client.server";
import { AdminShell } from "../components/admin-shell";
import { Badge } from "../components/ui";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin } from "../../server/platform-authorization.server";
import type { Route } from "./+types/internal-audit";

const auditActionLabels: Record<string, string> = {
  "business_profile.verify": "Verificó el perfil",
  "business_profile.unverify": "Retiró la verificación",
  "business_profile.suspend": "Suspendió el perfil",
  "business_profile.reactivate": "Reactivó el perfil",
};

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

  return (
    <AdminShell active="audit" workspaceUser={workspaceUser}>
      <main className="admin-content">
        <div className="page-heading">
          <div><p className="eyebrow">GOBIERNO</p><h1>Auditoría</h1><p>Acciones administrativas sensibles ejecutadas sobre Business Profiles: quién, qué, sobre qué perfil y cuándo.</p></div>
          <Badge tone="neutral">{activity.length} registros</Badge>
        </div>

        {activity.length ? (
          <ul className="admin-audit-list admin-audit-list--global">
            {activity.map((entry) => (
              <li className="card" key={entry.id}>
                <p><strong>{auditActionLabels[entry.action] ?? entry.action}</strong> · {entry.actorName ?? entry.actorEmail ?? "Actor desconocido"}</p>
                <p className="admin-audit-list__meta">
                  {entry.businessProfileDisplayName ?? entry.entityId}
                  {entry.businessProfileSlug ? <> · <Link to={`/app/internal/businesses/${entry.entityId}`}>Ver perfil</Link></> : null}
                  {entry.organizationName ? <> · {entry.organizationName}</> : null}
                </p>
                <p className="admin-audit-list__meta">{entry.previousValue} → {entry.newValue} · {formatTimestamp(entry.createdAt)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <section className="empty-state card"><div><p className="eyebrow">SIN ACTIVIDAD</p><h2>Todavía no hay acciones administrativas registradas</h2><p>Las verificaciones y suspensiones de Business Profiles aparecerán aquí.</p></div></section>
        )}
      </main>
    </AdminShell>
  );
}
