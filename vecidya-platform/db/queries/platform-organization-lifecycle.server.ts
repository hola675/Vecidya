import { and, eq } from "drizzle-orm";

import type { Database } from "../client.server";
import { member, organization, platformAuditLog, platformOrganizationLifecycle, platformOwnerInvitation } from "../schema";

export const OWNER_INVITATION_TTL_DAYS = 7;

export async function createOrganizationWithOwnerInvitation(database: Database, input: {
  name: string;
  slug: string;
  ownerEmail: string;
  actorUserId: string;
}) {
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  const email = input.ownerEmail.trim().toLowerCase();
  if (name.length < 2 || name.length > 120) throw new Response("El nombre debe tener entre 2 y 120 caracteres", { status: 400 });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) throw new Response("Slug inválido", { status: 400 });
  if (email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) throw new Response("Correo de propietario inválido", { status: 400 });

  const now = new Date();
  const organizationId = crypto.randomUUID();
  const invitationId = crypto.randomUUID();
  const rawToken = randomToken();
  const digest = await digestToken(rawToken);
  const expiresAt = new Date(now.getTime() + OWNER_INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await database.batch([
    database.insert(organization).values({ id: organizationId, name, slug, createdAt: now }),
    database.insert(platformOrganizationLifecycle).values({
      organizationId, status: "owner_invited", intendedOwnerEmail: email,
      ownerUserId: null, createdBy: input.actorUserId, updatedBy: input.actorUserId,
      createdAt: now, updatedAt: now,
    }),
    database.insert(platformOwnerInvitation).values({
      id: invitationId, organizationId, email, tokenDigest: digest, status: "pending",
      expiresAt, createdBy: input.actorUserId, acceptedBy: null, acceptedAt: null,
      acceptanceId: null, createdAt: now,
    }),
    database.insert(platformAuditLog).values({
      id: crypto.randomUUID(), actorUserId: input.actorUserId, action: "organization.create_owner_invitation",
      entityType: "organization", entityId: organizationId, organizationId,
      previousValue: null, newValue: "owner_invited",
      metadata: JSON.stringify({ slug, invitationId }), createdAt: now,
    }),
  ]);
  return { organizationId, invitationId, ownerEmail: email, organizationName: name, rawToken, expiresAt };
}

export async function replacePlatformOwnerInvitation(database: Database, input: { organizationId: string; actorUserId: string }) {
  const [lifecycle] = await database.select().from(platformOrganizationLifecycle)
    .where(eq(platformOrganizationLifecycle.organizationId, input.organizationId)).limit(1);
  if (!lifecycle || !["pending_owner", "owner_invited"].includes(lifecycle.status)) {
    throw new Response("La organización no admite una invitación nueva", { status: 409 });
  }
  const [previous] = await database.select({ id: platformOwnerInvitation.id }).from(platformOwnerInvitation)
    .where(and(eq(platformOwnerInvitation.organizationId, input.organizationId), eq(platformOwnerInvitation.status, "pending"))).limit(1);
  const now = new Date();
  const invitationId = crypto.randomUUID();
  const rawToken = randomToken();
  const digest = await digestToken(rawToken);
  const expiresAt = new Date(now.getTime() + OWNER_INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const nextInvitation = database.insert(platformOwnerInvitation).values({
      id: invitationId, organizationId: input.organizationId, email: lifecycle.intendedOwnerEmail,
      tokenDigest: digest, status: "pending", expiresAt, createdBy: input.actorUserId,
      acceptedBy: null, acceptedAt: null, acceptanceId: null, createdAt: now,
    });
  const updateLifecycle = database.update(platformOrganizationLifecycle).set({ status: "owner_invited", updatedBy: input.actorUserId, updatedAt: now })
      .where(eq(platformOrganizationLifecycle.organizationId, input.organizationId));
  const audit = database.insert(platformAuditLog).values({
      id: crypto.randomUUID(), actorUserId: input.actorUserId, action: "organization.owner_invitation.replace",
      entityType: "organization", entityId: input.organizationId, organizationId: input.organizationId,
      previousValue: previous ? "invited" : lifecycle.status, newValue: "owner_invited",
      metadata: JSON.stringify({ invitationId }), createdAt: now,
    });
  const revoke = previous ? database.update(platformOwnerInvitation).set({ status: "revoked" }).where(eq(platformOwnerInvitation.id, previous.id)) : null;
  if (revoke) await database.batch([revoke, nextInvitation, updateLifecycle, audit]);
  else await database.batch([nextInvitation, updateLifecycle, audit]);
  return { invitationId, organizationId: input.organizationId, ownerEmail: lifecycle.intendedOwnerEmail, rawToken, expiresAt };
}

export async function revokePlatformOwnerInvitation(database: Database, input: { organizationId: string; actorUserId: string }) {
  const [invitation] = await database.select({ id: platformOwnerInvitation.id }).from(platformOwnerInvitation)
    .where(and(eq(platformOwnerInvitation.organizationId, input.organizationId), eq(platformOwnerInvitation.status, "pending"))).limit(1);
  const [lifecycle] = await database.select().from(platformOrganizationLifecycle)
    .where(eq(platformOrganizationLifecycle.organizationId, input.organizationId)).limit(1);
  if (!invitation || !lifecycle || lifecycle.status !== "owner_invited") throw new Response("No hay invitación pendiente", { status: 409 });
  const now = new Date();
  await database.batch([
    database.update(platformOwnerInvitation).set({ status: "revoked" }).where(and(eq(platformOwnerInvitation.id, invitation.id), eq(platformOwnerInvitation.status, "pending"))),
    database.update(platformOrganizationLifecycle).set({ status: "pending_owner", updatedBy: input.actorUserId, updatedAt: now }).where(and(eq(platformOrganizationLifecycle.organizationId, input.organizationId), eq(platformOrganizationLifecycle.status, "owner_invited"))),
    database.insert(platformAuditLog).values({
      id: crypto.randomUUID(), actorUserId: input.actorUserId, action: "organization.owner_invitation.revoke",
      entityType: "organization", entityId: input.organizationId, organizationId: input.organizationId,
      previousValue: "owner_invited", newValue: "pending_owner", metadata: JSON.stringify({ invitationId: invitation.id }), createdAt: now,
    }),
  ]);
}

export async function getPlatformOwnerInvitation(database: Database, invitationId: string) {
  const [row] = await database.select({
    id: platformOwnerInvitation.id,
    organizationId: platformOwnerInvitation.organizationId,
    email: platformOwnerInvitation.email,
    status: platformOwnerInvitation.status,
    tokenDigest: platformOwnerInvitation.tokenDigest,
    expiresAt: platformOwnerInvitation.expiresAt,
    organizationName: organization.name,
    lifecycleStatus: platformOrganizationLifecycle.status,
  }).from(platformOwnerInvitation)
    .innerJoin(organization, eq(platformOwnerInvitation.organizationId, organization.id))
    .innerJoin(platformOrganizationLifecycle, eq(platformOrganizationLifecycle.organizationId, organization.id))
    .where(eq(platformOwnerInvitation.id, invitationId)).limit(1);
  return row ?? null;
}

export async function ownerInvitationAllowsSignup(database: Database, invitationId: string, email: string) {
  const invitation = await getPlatformOwnerInvitation(database, invitationId);
  return Boolean(invitation
    && invitation.status === "pending"
    && invitation.expiresAt.getTime() > Date.now()
    && invitation.lifecycleStatus === "owner_invited"
    && invitation.email === email.trim().toLowerCase());
}

export function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function digestToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function acceptPlatformOwnerInvitation(database: Database, input: {
  invitationId: string;
  token: string;
  userId: string;
  userEmail: string;
}) {
  const invitation = await getPlatformOwnerInvitation(database, input.invitationId);
  if (!invitation || invitation.status !== "pending" || invitation.expiresAt.getTime() <= Date.now()
    || invitation.lifecycleStatus !== "owner_invited"
    || invitation.email !== input.userEmail.trim().toLowerCase()
    || invitation.tokenDigest !== await digestToken(input.token)) {
    throw new Response("La invitación no está disponible para esta cuenta", { status: 409 });
  }
  const [existingMembership] = await database.select({ id: member.id, role: member.role }).from(member)
    .where(and(eq(member.organizationId, invitation.organizationId), eq(member.userId, input.userId))).limit(1);
  if (existingMembership) throw new Response("Esta cuenta ya tiene una membresía; solicita ayuda a Vecidya", { status: 409 });

  const acceptanceId = crypto.randomUUID();
  const now = new Date();
  await database.$client.batch([
    database.$client.prepare("UPDATE platform_owner_invitation SET status = 'accepted', accepted_by = ?, accepted_at = ?, acceptance_id = ? WHERE id = ? AND status = 'pending' AND token_digest = ? AND email = ?").bind(input.userId, now.getTime(), acceptanceId, invitation.id, invitation.tokenDigest, input.userEmail.trim().toLowerCase()),
    database.$client.prepare("INSERT INTO member (id, organization_id, user_id, role, created_at) SELECT ?, ?, ?, 'owner', ? WHERE EXISTS (SELECT 1 FROM platform_owner_invitation WHERE id = ? AND status = 'accepted' AND acceptance_id = ?)").bind(crypto.randomUUID(), invitation.organizationId, input.userId, now.getTime(), invitation.id, acceptanceId),
    database.$client.prepare("UPDATE platform_organization_lifecycle SET status = 'active', owner_user_id = ?, updated_by = ?, updated_at = ? WHERE organization_id = ? AND status = 'owner_invited' AND EXISTS (SELECT 1 FROM platform_owner_invitation WHERE id = ? AND status = 'accepted' AND acceptance_id = ?)").bind(input.userId, input.userId, now.getTime(), invitation.organizationId, invitation.id, acceptanceId),
    database.$client.prepare("INSERT INTO platform_audit_log (id, actor_user_id, action, entity_type, entity_id, organization_id, previous_value, new_value, metadata, created_at) SELECT ?, ?, 'organization.owner_invitation.accept', 'organization', ?, ?, 'owner_invited', 'active', ?, ? WHERE EXISTS (SELECT 1 FROM platform_owner_invitation WHERE id = ? AND status = 'accepted' AND acceptance_id = ?)").bind(crypto.randomUUID(), input.userId, invitation.organizationId, invitation.organizationId, JSON.stringify({ invitationId: invitation.id, acceptanceId }), now.getTime(), invitation.id, acceptanceId),
  ]);
  const [accepted] = await database.select({ status: platformOwnerInvitation.status, acceptanceId: platformOwnerInvitation.acceptanceId })
    .from(platformOwnerInvitation).where(eq(platformOwnerInvitation.id, invitation.id)).limit(1);
  if (accepted?.acceptanceId !== acceptanceId) throw new Response("La invitación ya fue procesada", { status: 409 });
  return { organizationId: invitation.organizationId };
}

export async function setPlatformOrganizationStatus(database: Database, input: {
  organizationId: string;
  actorUserId: string;
  status: "suspended" | "active";
}) {
  const [lifecycle] = await database.select().from(platformOrganizationLifecycle)
    .where(eq(platformOrganizationLifecycle.organizationId, input.organizationId)).limit(1);
  if (!lifecycle || lifecycle.status === "owner_invited" || lifecycle.status === "pending_owner") throw new Response("Organización no disponible para este cambio", { status: 409 });
  if (input.status === "active" && !lifecycle.ownerUserId) throw new Response("La organización necesita un propietario aceptado antes de activarse", { status: 409 });
  if (lifecycle.status === input.status) return;
  const now = new Date();
  await database.batch([
    database.update(platformOrganizationLifecycle).set({ status: input.status, updatedBy: input.actorUserId, updatedAt: now })
      .where(and(eq(platformOrganizationLifecycle.organizationId, input.organizationId), eq(platformOrganizationLifecycle.status, lifecycle.status))),
    database.insert(platformAuditLog).values({
      id: crypto.randomUUID(), actorUserId: input.actorUserId, action: `organization.${input.status}`,
      entityType: "organization", entityId: input.organizationId, organizationId: input.organizationId,
      previousValue: lifecycle.status, newValue: input.status, metadata: null, createdAt: now,
    }),
  ]);
}
