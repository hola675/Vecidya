import { and, asc, eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { member, organization, organizationTrainingAssignment, organizationTrainingProgress, organizationTrainingProgressHistory, platformAuditLog, user } from "../schema";
import { learnArticles } from "../../app/content/learn";

export async function listOrganizationTraining(database: Database, organizationId: string) {
  return database.select({
    id: organizationTrainingAssignment.id,
    trainingSlug: organizationTrainingAssignment.trainingSlug,
    assignedAt: organizationTrainingAssignment.assignedAt,
    assignedByName: user.name,
  }).from(organizationTrainingAssignment)
    .innerJoin(user, eq(organizationTrainingAssignment.assignedBy, user.id))
    .where(eq(organizationTrainingAssignment.organizationId, organizationId))
    .orderBy(asc(organizationTrainingAssignment.assignedAt));
}

export async function assignOrganizationTraining(database: Database, input: {
  organizationId: string;
  trainingSlug: string;
  actorUserId: string;
}) {
  if (!learnArticles.some((article) => article.slug === input.trainingSlug && !article.editorialDraft)) {
    throw new Response("Capacitación no encontrada", { status: 404 });
  }
  const [target] = await database.select({ id: organization.id }).from(organization)
    .where(eq(organization.id, input.organizationId)).limit(1);
  if (!target) throw new Response("Organización no encontrada", { status: 404 });
  const [existing] = await database.select({ id: organizationTrainingAssignment.id })
    .from(organizationTrainingAssignment)
    .where(and(eq(organizationTrainingAssignment.organizationId, input.organizationId), eq(organizationTrainingAssignment.trainingSlug, input.trainingSlug)))
    .limit(1);
  if (existing) return;

  const now = new Date();
  const id = crypto.randomUUID();
  const writes = [
    database.insert(organizationTrainingAssignment).values({
      id,
      organizationId: input.organizationId,
      trainingSlug: input.trainingSlug,
      assignedBy: input.actorUserId,
      assignedAt: now,
    }),
    database.insert(platformAuditLog).values({
      id: crypto.randomUUID(),
      actorUserId: input.actorUserId,
      action: "training.assign",
      entityType: "organization_training_assignment",
      entityId: id,
      organizationId: input.organizationId,
      previousValue: null,
      newValue: input.trainingSlug,
      metadata: null,
      createdAt: now,
    }),
  ] as const;
  await database.batch(writes);
}

export async function listOrganizationTrainingProgress(database: Database, organizationId: string) {
  return database.select({
    assignmentId: organizationTrainingAssignment.id,
    trainingSlug: organizationTrainingAssignment.trainingSlug,
    userId: organizationTrainingProgress.userId,
    memberName: user.name,
    memberEmail: user.email,
    status: organizationTrainingProgress.status,
    updatedAt: organizationTrainingProgress.updatedAt,
  }).from(organizationTrainingAssignment)
    .innerJoin(organizationTrainingProgress, eq(organizationTrainingProgress.assignmentId, organizationTrainingAssignment.id))
    .innerJoin(user, eq(organizationTrainingProgress.userId, user.id))
    .where(eq(organizationTrainingAssignment.organizationId, organizationId))
    .orderBy(asc(organizationTrainingAssignment.trainingSlug), asc(user.name));
}

export async function updateOwnOrganizationTrainingProgress(database: Database, input: {
  organizationId: string;
  assignmentId: string;
  userId: string;
  status: "not_started" | "in_progress" | "completed";
}) {
  const [assignment] = await database.select({ id: organizationTrainingAssignment.id })
    .from(organizationTrainingAssignment)
    .where(and(eq(organizationTrainingAssignment.id, input.assignmentId), eq(organizationTrainingAssignment.organizationId, input.organizationId)))
    .limit(1);
  if (!assignment) throw new Response("Asignación no encontrada", { status: 404 });
  const [targetMember] = await database.select({ userId: member.userId }).from(member)
    .where(and(eq(member.organizationId, input.organizationId), eq(member.userId, input.userId))).limit(1);
  if (!targetMember) throw new Response("Miembro no encontrado", { status: 404 });
  const now = new Date();
  const [existing] = await database.select().from(organizationTrainingProgress)
    .where(and(eq(organizationTrainingProgress.assignmentId, input.assignmentId), eq(organizationTrainingProgress.userId, input.userId))).limit(1);
  if (!existing) {
    const progressId = crypto.randomUUID();
    await database.batch([
      database.insert(organizationTrainingProgress).values({ id: progressId, assignmentId: input.assignmentId, userId: input.userId, status: input.status, updatedAt: now }),
      database.insert(organizationTrainingProgressHistory).values({ id: crypto.randomUUID(), progressId, actorUserId: input.userId, previousStatus: "not_started", newStatus: input.status, reason: null, createdAt: now }),
    ]);
    return;
  }
  if (existing.status === input.status) return;
  await database.batch([
    database.update(organizationTrainingProgress).set({ status: input.status, updatedAt: now }).where(eq(organizationTrainingProgress.id, existing.id)),
    database.insert(organizationTrainingProgressHistory).values({ id: crypto.randomUUID(), progressId: existing.id, actorUserId: input.userId, previousStatus: existing.status, newStatus: input.status, reason: null, createdAt: now }),
  ]);
}

export async function correctOrganizationTrainingProgress(database: Database, input: {
  organizationId: string;
  assignmentId: string;
  userId: string;
  status: "not_started" | "in_progress" | "completed";
  reason: string;
  actorUserId: string;
}) {
  const [assignment] = await database.select({ id: organizationTrainingAssignment.id })
    .from(organizationTrainingAssignment)
    .where(and(eq(organizationTrainingAssignment.id, input.assignmentId), eq(organizationTrainingAssignment.organizationId, input.organizationId)))
    .limit(1);
  if (!assignment) throw new Response("Asignación no encontrada", { status: 404 });
  const [targetMember] = await database.select({ userId: member.userId }).from(member)
    .where(and(eq(member.organizationId, input.organizationId), eq(member.userId, input.userId))).limit(1);
  if (!targetMember) throw new Response("Miembro no encontrado", { status: 404 });
  const [existing] = await database.select().from(organizationTrainingProgress)
    .where(and(eq(organizationTrainingProgress.assignmentId, input.assignmentId), eq(organizationTrainingProgress.userId, input.userId))).limit(1);
  if (!existing) throw new Response("Progreso no encontrado", { status: 404 });
  const now = new Date();
  await database.batch([
    database.update(organizationTrainingProgress).set({ status: input.status, updatedAt: now }).where(eq(organizationTrainingProgress.id, existing.id)),
    database.insert(organizationTrainingProgressHistory).values({
      id: crypto.randomUUID(), progressId: existing.id, actorUserId: input.actorUserId,
      previousStatus: existing.status, newStatus: input.status, reason: input.reason, createdAt: now,
    }),
    database.insert(platformAuditLog).values({
      id: crypto.randomUUID(), actorUserId: input.actorUserId, action: "training.progress.correct",
      entityType: "organization_training_progress", entityId: existing.id, organizationId: input.organizationId,
      previousValue: existing.status, newValue: input.status,
      metadata: JSON.stringify({ reason: input.reason }), createdAt: now,
    }),
  ]);
}
