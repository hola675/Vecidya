import { and, eq } from "drizzle-orm";

import { createDatabase } from "../../db/client.server";
import { organizationTrainingAssignment, organizationTrainingProgress } from "../../db/schema";
import { updateOwnOrganizationTrainingProgress } from "../../db/queries/platform-training.server";
import { requireOrganizationPermission } from "../../server/auth/authorization.server";
import { cloudflareContext } from "../../server/cloudflare-context";
import type { Route } from "./+types/api-organization-training";

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const membership = await requireOrganizationPermission(env, request, params.organizationId, "organization:read");
  const database = createDatabase(env.DB);
  const assignments = await database.select({
    id: organizationTrainingAssignment.id,
    trainingSlug: organizationTrainingAssignment.trainingSlug,
    assignedAt: organizationTrainingAssignment.assignedAt,
    status: organizationTrainingProgress.status,
  }).from(organizationTrainingAssignment)
    .leftJoin(organizationTrainingProgress, and(
      eq(organizationTrainingProgress.assignmentId, organizationTrainingAssignment.id),
      eq(organizationTrainingProgress.userId, membership.userId),
    ))
    .where(eq(organizationTrainingAssignment.organizationId, params.organizationId));
  return Response.json(assignments);
}

export async function action({ context, params, request }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const membership = await requireOrganizationPermission(env, request, params.organizationId, "organization:read");
  let body: { assignmentId?: unknown; status?: unknown };
  try { body = await request.json(); } catch { throw new Response("JSON inválido", { status: 400 }); }
  if (typeof body.assignmentId !== "string" || !["not_started", "in_progress", "completed"].includes(String(body.status))) {
    throw new Response("Progreso inválido", { status: 400 });
  }
  await updateOwnOrganizationTrainingProgress(createDatabase(env.DB), {
    organizationId: params.organizationId,
    assignmentId: body.assignmentId,
    userId: membership.userId,
    status: body.status as "not_started" | "in_progress" | "completed",
  });
  return Response.json({ ok: true });
}
