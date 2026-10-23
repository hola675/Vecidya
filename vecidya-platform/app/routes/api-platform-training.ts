import { createDatabase } from "../../db/client.server";
import { assignOrganizationTraining, correctOrganizationTrainingProgress, listOrganizationTraining, listOrganizationTrainingProgress } from "../../db/queries/platform-training.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import { requirePlatformAdmin, requirePlatformAdminAction } from "../../server/platform-authorization.server";
import type { Route } from "./+types/api-platform-training";

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requirePlatformAdmin(env, request);
  const database = createDatabase(env.DB);
  const organizationId = params.organizationId;
  const [assignments, progress] = await Promise.all([
    listOrganizationTraining(database, organizationId),
    listOrganizationTrainingProgress(database, organizationId),
  ]);
  return Response.json({ assignments, progress });
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { throw new Response("JSON inválido", { status: 400 }); }
  const database = createDatabase(env.DB);
  if (body.action === "assign" && typeof body.trainingSlug === "string") {
    const actor = await requirePlatformAdminAction(env, request, "training:assign");
    await assignOrganizationTraining(database, { organizationId: params.organizationId, trainingSlug: body.trainingSlug, actorUserId: actor.userId });
    return Response.json({ ok: true }, { status: 201 });
  }
  if (body.action === "correct_progress"
    && typeof body.assignmentId === "string"
    && typeof body.userId === "string"
    && ["not_started", "in_progress", "completed"].includes(String(body.status))
    && typeof body.reason === "string"
    && body.reason.trim().length >= 8) {
    const actor = await requirePlatformAdminAction(env, request, "training:progress:correct");
    await correctOrganizationTrainingProgress(database, {
      organizationId: params.organizationId,
      assignmentId: body.assignmentId,
      userId: body.userId,
      status: body.status as "not_started" | "in_progress" | "completed",
      reason: body.reason.trim().slice(0, 500),
      actorUserId: actor.userId,
    });
    return Response.json({ ok: true });
  }
  throw new Response("Acción o datos inválidos", { status: 400 });
}
