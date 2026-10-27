import { Form, Link, redirect, useLoaderData, useSearchParams } from "react-router";

import { cloudflareContext } from "../../server/cloudflare-context";
import { getActiveOrganization, requireMembership, requireSession } from "../../server/auth/session.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { linkOwnedDiagnosticRunToOrganizationV9, type V9IdentityDb } from "../features/diagnostic/qa03b/v9-identity-repository";
import { ClientAreaShell } from "../components/client-area-shell";
import { Alert, Button, Card } from "../components/ui";

import type { Route } from "./+types/app-diagnostics";

export function meta() {
  return [
    { title: "Mis diagnósticos | Vecidya" },
    { name: "description", content: "Consulta tus diagnósticos y vincúlalos a las organizaciones que administras." },
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
  return { ...workspace, activeOrganization, runs, available };
}

export async function action({ context, request }: Route.ActionArgs) {
  if (request.method !== "POST") throw new Response("Método no permitido", { status: 405 });
  if (request.headers.get("origin") !== new URL(request.url).origin) throw new Response("Origen no permitido", { status: 403 });
  const { env } = context.get(cloudflareContext);
  const session = await requireSession(env, request);
  const form = await request.formData();
  const workspaceId = String(form.get("workspaceId") ?? "").trim();
  const runId = String(form.get("runId") ?? "").trim();
  const organizationId = String(form.get("organizationId") ?? "").trim();
  if (!workspaceId || !runId || !organizationId) throw new Response("Faltan datos para vincular el diagnóstico.", { status: 400 });
  await requireMembership(env, request, organizationId);
  try {
    await linkOwnedDiagnosticRunToOrganizationV9(env.DB as unknown as V9IdentityDb, {
      workspaceId,
      runId,
      organizationId,
      linkedByUserId: session.user.id,
      linkedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "v9_run_not_owned") {
      throw new Response("No tienes permiso para vincular este diagnóstico.", { status: 404 });
    }
    throw error;
  }
  return redirect("/app/diagnosticos?linked=1");
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
  const { workspaceUser, organizations, isPlatformAdmin, activeOrganization, runs, available } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const linked = searchParams.get("linked") === "1";
  return (
    <ClientAreaShell active="diagnostics" workspaceUser={workspaceUser} organizations={organizations} activeOrganization={activeOrganization} isPlatformAdmin={isPlatformAdmin}>
      <main className="app-main account-page" id="client-page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">TU HISTORIAL PERSONAL</p>
            <h1>Mis diagnósticos</h1>
            <p>Los diagnósticos pertenecen a tu identidad personal. Puedes vincularlos a una organización en la que tengas acceso, sin transferir su propiedad.</p>
          </div>
          <Link className="button button--primary" to="/diagnostico">Nuevo diagnóstico</Link>
        </div>
        {linked ? <Alert>La organización quedó vinculada al diagnóstico.</Alert> : null}
        {!available ? (
          <Alert>El historial V9 todavía no está disponible en este entorno. No se han modificado ni eliminado diagnósticos.</Alert>
        ) : runs.length === 0 ? (
          <Card>
            <h2>Aún no hay diagnósticos en tu historial</h2>
            <p>Cuando un diagnóstico se guarde asociado a tu cuenta, aparecerá aquí. También podrás vincularlo a una de tus organizaciones.</p>
            <Link className="button button--primary" to="/diagnostico">Comenzar diagnóstico</Link>
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
                  </div>
                </div>
                {organizations.length > 0 ? (
                  <Form method="post" className="account-form">
                    <input type="hidden" name="workspaceId" value={run.workspace_id} />
                    <input type="hidden" name="runId" value={run.run_id} />
                    <label htmlFor={"organization-" + run.run_id}>Vincular a una organización</label>
                    <select id={"organization-" + run.run_id} name="organizationId" required defaultValue="">
                      <option value="" disabled>Selecciona una organización</option>
                      {organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
                    </select>
                    <Button type="submit">Vincular organización</Button>
                  </Form>
                ) : <p>Para vincular este diagnóstico, primero debes pertenecer a una organización de Vecidya.</p>}
              </Card>
            ))}
          </div>
        )}
      </main>
    </ClientAreaShell>
  );
}
