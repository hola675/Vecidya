import { Link, useLoaderData } from "react-router";

import { cloudflareContext } from "../../server/cloudflare-context";
import { getActiveOrganization, requireSession } from "../../server/auth/session.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import type { V9IdentityDb } from "../features/diagnostic/qa03b/v9-identity-repository";
import { isV9PublicRuntimeAvailable, type V9PublicRuntimeConfig } from "../features/diagnostic/qa03b/v9-public-availability.server";
import { ClientAreaShell } from "../components/client-area-shell";
import { Alert, Card } from "../components/ui";

import type { Route } from "./+types/app-diagnostics";

export function meta() {
  return [
    { title: "Mis diagnósticos | Vecidya" },
    { name: "description", content: "Consulta en privado los diagnósticos históricos asociados a tu identidad." },
    { name: "robots", content: "noindex" },
  ];
}

type OwnedRun = {
  workspace_id: string;
  run_id: string;
  status: "active" | "completed" | "abandoned" | "failed";
  started_at: string;
  finished_at: string | null;
  last_seq: number;
  organization_count: number;
};

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const session = await requireSession(env, request);
  const [workspace, activeOrganization] = await Promise.all([
    getClientWorkspaceContext(env, request),
    getActiveOrganization(env, request),
  ]);
  let available = true;
  let runs: OwnedRun[] = [];
  try {
    const identity = await env.DB.prepare(
      "SELECT identity_id FROM diagnostic_v9_identities WHERE identity_type='user' AND user_id=?",
    ).bind(session.user.id).first<{ identity_id: string }>();
    if (identity) {
      const result = await env.DB.prepare(
        "SELECT o.workspace_id,o.run_id,r.status,r.started_at,r.finished_at,r.last_seq,(SELECT COUNT(*) FROM diagnostic_v9_run_organizations x WHERE x.workspace_id=o.workspace_id AND x.run_id=o.run_id) AS organization_count FROM diagnostic_v9_run_ownership o JOIN diagnostic_v9_runs r ON r.workspace_id=o.workspace_id AND r.run_id=o.run_id JOIN diagnostic_v9_identities i ON i.identity_id=o.identity_id WHERE i.identity_type='user' AND i.user_id=? ORDER BY r.started_at DESC LIMIT 100",
      ).bind(session.user.id).all<OwnedRun>();
      runs = result.results;
    }
  } catch {
    available = false;
  }
  const v9Enabled = isV9PublicRuntimeAvailable(env as unknown as V9PublicRuntimeConfig);
  return { ...workspace, activeOrganization, runs, available, v9Enabled };
}

export async function action({ context, request }: Route.ActionArgs) {
  if (request.method !== "POST") throw new Response("Método no permitido", { status: 405 });
  if (request.headers.get("origin") !== new URL(request.url).origin) throw new Response("Origen no permitido", { status: 403 });
  throw new Response("La persistencia y asociación de historiales V9 está deshabilitada por la política de privacidad.", { status: 503 });
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

const statusLabels: Record<OwnedRun["status"], string> = {
  active: "En curso",
  completed: "Completado",
  abandoned: "Abandonado",
  failed: "No completado",
};

export default function AppDiagnosticsPage() {
  const { workspaceUser, organizations, isPlatformAdmin, activeOrganization, runs, available, v9Enabled } = useLoaderData<typeof loader>();
  return (
    <ClientAreaShell active="diagnostics" workspaceUser={workspaceUser} organizations={organizations} activeOrganization={activeOrganization} isPlatformAdmin={isPlatformAdmin}>
      <main className="app-main account-page" id="client-page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">TU HISTORIAL PERSONAL</p>
            <h1>Mis diagnósticos</h1>
            <p>Los diagnósticos históricos pertenecen a tu identidad personal. El historial no se vincula ni se transfiere a organizaciones.</p>
          </div>
          <Link className="button button--primary" to={v9Enabled ? "/diagnostico/v9" : "/diagnostico"}>Nuevo diagnóstico</Link>
        </div>
        {!available ? (
          <Alert>El historial V9 todavía no está disponible en este entorno. No se han modificado ni eliminado diagnósticos.</Alert>
        ) : runs.length === 0 ? (
          <Card>
            <h2>Aún no hay diagnósticos en tu historial</h2>
            <p>Los diagnósticos nuevos se procesan sin guardar respuestas individuales en D1. Esta pantalla solo muestra historiales existentes asociados a tu identidad.</p>
            <Link className="button button--primary" to={v9Enabled ? "/diagnostico/v9" : "/diagnostico"}>Comenzar diagnóstico</Link>
          </Card>
        ) : (
          <div className="account-form-stack">
            {runs.map((run) => (
              <Card key={run.workspace_id + ":" + run.run_id}>
                <div className="page-heading">
                  <div>
                    <h2>Diagnóstico {run.run_id.slice(0, 8)}</h2>
                    <p>Inicio: {formatDate(run.started_at)}</p>
                    <p>Estado: {statusLabels[run.status]} · {run.last_seq} eventos registrados</p>
                    <p>Organizaciones vinculadas: {run.organization_count}</p>
                    <Link to={`/app/diagnosticos/${encodeURIComponent(run.workspace_id)}/${encodeURIComponent(run.run_id)}`}>Ver detalle del diagnóstico</Link>
                    {v9Enabled && run.status === "active" ? (
                      <Link to={`/diagnostico/v9/${encodeURIComponent(run.run_id)}`}>Continuar diagnóstico</Link>
                    ) : null}
                  </div>
                </div>
                <p>Este historial se conserva asociado únicamente a tu identidad personal.</p>
              </Card>
            ))}
          </div>
        )}
      </main>
    </ClientAreaShell>
  );
}
