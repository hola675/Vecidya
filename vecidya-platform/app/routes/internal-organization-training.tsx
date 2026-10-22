import { Form, Link, useLoaderData } from "react-router";

import { createDatabase } from "../../db/client.server";
import { correctOrganizationTrainingProgress, listOrganizationTraining, listOrganizationTrainingProgress, assignOrganizationTraining } from "../../db/queries/platform-training.server";
import { learnArticles } from "../content/learn";
import { AdminShell } from "../components/admin-shell";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin, requirePlatformAdminAction } from "../../server/platform-authorization.server";
import type { Route } from "./+types/internal-organization-training";

const statuses = ["not_started", "in_progress", "completed"] as const;
type TrainingStatus = (typeof statuses)[number];

export function meta() { return [{ title: "Capacitación de organización | Vecidya" }]; }

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const access = await requirePlatformAdmin(env, request);
  const database = createDatabase(env.DB);
  const [organization, assignments, progress] = await Promise.all([
    database.query.organization.findFirst({ where: (table, { eq }) => eq(table.id, params.organizationId) }),
    listOrganizationTraining(database, params.organizationId),
    listOrganizationTrainingProgress(database, params.organizationId),
  ]);
  if (!organization) throw new Response("Organización no encontrada", { status: 404 });
  return {
    organization,
    assignments,
    progress,
    courses: learnArticles.filter((article) => !article.editorialDraft).map(({ slug, title }) => ({ slug, title })),
    workspaceUser: access.workspaceUser,
  };
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const data = await request.formData();
  const database = createDatabase(env.DB);
  if (data.get("operation") === "assign") {
    const actor = await requirePlatformAdminAction(env, request, "training:assign");
    const trainingSlug = data.get("trainingSlug");
    if (typeof trainingSlug !== "string") throw new Response("Capacitación inválida", { status: 400 });
    await assignOrganizationTraining(database, { organizationId: params.organizationId, trainingSlug, actorUserId: actor.userId });
    return { ok: true };
  }
  if (data.get("operation") === "correct") {
    const actor = await requirePlatformAdminAction(env, request, "training:progress:correct");
    const assignmentId = data.get("assignmentId");
    const userId = data.get("userId");
    const status = data.get("status");
    const reason = data.get("reason");
    if (typeof assignmentId !== "string" || typeof userId !== "string" || !statuses.includes(status as TrainingStatus) || typeof reason !== "string" || reason.trim().length < 8) {
      throw new Response("La corrección requiere un estado y un motivo de al menos 8 caracteres", { status: 400 });
    }
    await correctOrganizationTrainingProgress(database, { organizationId: params.organizationId, assignmentId, userId, status: status as TrainingStatus, reason: reason.trim().slice(0, 500), actorUserId: actor.userId });
    return { ok: true };
  }
  throw new Response("Operación inválida", { status: 400 });
}

export default function InternalOrganizationTraining() {
  const { organization, assignments, progress, courses, workspaceUser } = useLoaderData<typeof loader>();
  const assigned = new Set(assignments.map((item) => item.trainingSlug));
  const courseTitle = (slug: string) => courses.find((course) => course.slug === slug)?.title ?? slug;
  return <AdminShell active="organizations" workspaceUser={workspaceUser}>
    <main className="admin-main">
      <Link className="back-link" to={`/app/internal/organizations/${organization.id}`}>← Volver a {organization.name}</Link>
      <div className="page-heading"><div><p className="eyebrow">CAPACITACIÓN</p><h1>Aprendizaje asignado</h1><p>El progreso lo declara cada miembro. Las correcciones quedan registradas con motivo.</p></div></div>
      <section className="card admin-detail-card">
        <h2>Asignar contenido existente de Aprende</h2>
        <Form method="post" className="admin-toolbar">
          <input type="hidden" name="operation" value="assign" />
          <label>Artículo<select name="trainingSlug" required defaultValue="">
            <option value="" disabled>Selecciona una capacitación</option>
            {courses.filter((course) => !assigned.has(course.slug)).map((course) => <option key={course.slug} value={course.slug}>{course.title}</option>)}
          </select></label>
          <button className="button button--primary" type="submit" disabled={courses.every((course) => assigned.has(course.slug))}>Asignar</button>
        </Form>
        {assignments.length ? <ul className="admin-detail-list">{assignments.map((item) => <li key={item.id}><span>{courseTitle(item.trainingSlug)}<small>Asignada por {item.assignedByName} · {new Date(item.assignedAt).toLocaleDateString("es")}</small></span></li>)}</ul> : <p>No hay capacitaciones asignadas.</p>}
      </section>
      <section className="card admin-detail-card">
        <h2>Progreso declarado</h2>
        {progress.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Contenido</th><th>Miembro</th><th>Estado</th><th>Corregir</th></tr></thead><tbody>{progress.map((item) => <tr key={`${item.assignmentId}-${item.userId}`}><td>{courseTitle(item.trainingSlug)}</td><td>{item.memberName}<span className="admin-table__meta">{item.memberEmail}</span></td><td>{item.status}</td><td><Form method="post" className="admin-toolbar"><input type="hidden" name="operation" value="correct" /><input type="hidden" name="assignmentId" value={item.assignmentId} /><input type="hidden" name="userId" value={item.userId} /><select name="status" defaultValue={item.status} aria-label={`Nuevo estado para ${item.memberName}`}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select><input name="reason" required minLength={8} maxLength={500} placeholder="Motivo de corrección" aria-label="Motivo de corrección" /><button className="button button--secondary" type="submit">Guardar</button></Form></td></tr>)}</tbody></table></div> : <p>Aún no hay progreso declarado por los miembros.</p>}
      </section>
    </main>
  </AdminShell>;
}
