import { and, eq } from "drizzle-orm";
import { Form, Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { organizationTrainingAssignment, organizationTrainingProgress } from "../../db/schema";
import { updateOwnOrganizationTrainingProgress } from "../../db/queries/platform-training.server";
import { getActiveOrganization, requireSession } from "../../server/auth/session.server";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { getClientWorkspaceContext } from "../../server/auth/client-workspace.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { ClientAreaShell } from "../components/client-area-shell";
import { Badge } from "../components/ui";
import { learnArticles } from "../content/learn";
import type { Route } from "./+types/organization-training";

const progressStatuses = ["not_started", "in_progress", "completed"] as const;
type ProgressStatus = (typeof progressStatuses)[number];
const progressLabels: Record<ProgressStatus, string> = { not_started: "Sin empezar", in_progress: "En curso", completed: "Completado por mí" };

export function meta() { return [{ title: "Capacitación | Mi Vecidya" }]; }

export async function loader({ context, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const [{ workspaceUser, organizations, isPlatformAdmin }, activeOrganization] = await Promise.all([
    getClientWorkspaceContext(env, request),
    getActiveOrganization(env, request),
  ]);
  if (!activeOrganization) return { workspaceUser, organizations, isPlatformAdmin, activeOrganization, assignments: [] };
  await requireOrganizationPermission(env, request, activeOrganization.id, "organization:read");
  const database = createDatabase(env.DB);
  const rows = await database.select({
    id: organizationTrainingAssignment.id,
    trainingSlug: organizationTrainingAssignment.trainingSlug,
    status: organizationTrainingProgress.status,
  }).from(organizationTrainingAssignment)
    .leftJoin(organizationTrainingProgress, and(
      eq(organizationTrainingProgress.assignmentId, organizationTrainingAssignment.id),
      eq(organizationTrainingProgress.userId, workspaceUser.id),
    ))
    .where(eq(organizationTrainingAssignment.organizationId, activeOrganization.id));
  const assignments = rows.map((row) => ({
    ...row,
    course: learnArticles.find((article) => article.slug === row.trainingSlug && !article.editorialDraft) ?? null,
    status: row.status ?? "not_started" as ProgressStatus,
  }));
  return { workspaceUser, organizations, isPlatformAdmin, activeOrganization, assignments };
}

export async function action({ context, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const membership = await getActiveOrganization(env, request);
  if (!membership) throw new Response("Se requiere una organización activa", { status: 403 });
  await requireOrganizationPermission(env, request, membership.id, "organization:read");
  const session = await requireSession(env, request);
  const data = await request.formData();
  const assignmentId = data.get("assignmentId");
  const status = data.get("status");
  if (typeof assignmentId !== "string" || !progressStatuses.includes(status as ProgressStatus)) {
    throw new Response("Progreso inválido", { status: 400 });
  }
  await updateOwnOrganizationTrainingProgress(createDatabase(env.DB), {
    organizationId: membership.id,
    assignmentId,
    userId: session.user.id,
    status: status as ProgressStatus,
  });
  return { ok: true };
}

export default function OrganizationTraining() {
  const { workspaceUser, organizations, isPlatformAdmin, activeOrganization, assignments } = useLoaderData<typeof loader>();
  return <ClientAreaShell active="training" workspaceUser={workspaceUser} organizations={organizations} activeOrganization={activeOrganization} isPlatformAdmin={isPlatformAdmin}>
    <main className="app-main" id="client-page-content">
      <div className="page-heading"><div><p className="eyebrow">APRENDIZAJE</p><h1>Capacitación de tu equipo</h1><p>Declara tu propio avance. No medimos visitas ni inferimos que completaste un artículo.</p></div></div>
      {!activeOrganization ? <section className="card"><h2>Selecciona una organización</h2><p>El contenido asignado aparecerá cuando tengas una organización activa.</p></section> : assignments.length ? <div className="admin-detail-grid">{assignments.map((item) => <section className="card admin-detail-card" key={item.id}>
        <p className="eyebrow">APRENDE</p>
        <h2>{item.course?.title ?? "Contenido ya no disponible"}</h2>
        {item.course ? <><p>{item.course.excerpt}</p><Link className="text-link" to={`/aprende/${item.trainingSlug}`}>Abrir artículo →</Link></> : <p>Esta asignación se conserva como referencia histórica.</p>}
        <Badge>{progressLabels[item.status]}</Badge>
        <Form method="post" className="admin-toolbar"><input type="hidden" name="assignmentId" value={item.id} /><label>Mi avance<select name="status" defaultValue={item.status}>{progressStatuses.map((status) => <option key={status} value={status}>{progressLabels[status]}</option>)}</select></label><button className="button button--primary" type="submit">Guardar mi avance</button></Form>
      </section>)}</div> : <section className="card"><h2>Aún no tienes capacitaciones asignadas</h2><p>Tu administrador de plataforma puede asignar artículos de Aprende para tu organización.</p></section>}
    </main>
  </ClientAreaShell>;
}
