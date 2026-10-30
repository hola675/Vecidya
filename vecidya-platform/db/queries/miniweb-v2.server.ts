import { and, eq, sql } from "drizzle-orm";
import type { Database } from "../client.server";
import { miniWebV2Draft, miniWebV2Publication, miniWebV2PublicationSlot, miniWebV2Site } from "../schema/miniweb";
import { billingAccount, billingMiniwebCapacityExtension, organizationLicense } from "../schema/licensing";
import { calculateMiniWebCapacity } from "../../app/features/miniweb-v2/capacity";

export type MiniWebV2SiteInput = {
  id: string; organizationId: string; ownerUserId: string; familyKey: string; visualVariant: string;
};

export async function listMiniWebV2Sites(database: Database, organizationId: string) {
  return database.select({ id: miniWebV2Site.id, familyKey: miniWebV2Site.familyKey, visualVariant: miniWebV2Site.visualVariant, createdAt: miniWebV2Site.createdAt })
    .from(miniWebV2Site).where(eq(miniWebV2Site.organizationId, organizationId)).orderBy(miniWebV2Site.createdAt);
}

export async function getMiniWebV2EditorState(database: Database, organizationId: string, siteId?: string) {
  const [site] = await database.select().from(miniWebV2Site).where(siteId
    ? and(eq(miniWebV2Site.organizationId, organizationId), eq(miniWebV2Site.id, siteId))
    : eq(miniWebV2Site.organizationId, organizationId)).orderBy(miniWebV2Site.createdAt).limit(1);
  if (!site) return null;
  const [draft] = await database.select().from(miniWebV2Draft).where(eq(miniWebV2Draft.siteId, site.id)).limit(1);
  return draft ? { site, draft } : null;
}

export async function getMiniWebV2PublicationCapacity(database: Database, ownerUserId: string, now = new Date()) {
  const active = await database.select({ id: organizationLicense.id }).from(organizationLicense)
    .innerJoin(billingAccount, eq(billingAccount.id, organizationLicense.billingAccountId))
    .where(and(eq(billingAccount.ownerUserId, ownerUserId), eq(organizationLicense.status, "active"), sql`(${organizationLicense.startedAt} IS NULL OR ${organizationLicense.startedAt} <= ${now.getTime()})`, sql`(${organizationLicense.endsAt} IS NULL OR ${organizationLicense.endsAt} > ${now.getTime()})`));
  const extensions = await database.select({ id: billingMiniwebCapacityExtension.id }).from(billingMiniwebCapacityExtension)
    .innerJoin(billingAccount, eq(billingAccount.id, billingMiniwebCapacityExtension.billingAccountId))
    .where(and(eq(billingAccount.ownerUserId, ownerUserId), eq(billingMiniwebCapacityExtension.status, "active"),
      sql`${billingMiniwebCapacityExtension.startsAt} <= ${now.getTime()}`,
      sql`(${billingMiniwebCapacityExtension.endsAt} IS NULL OR ${billingMiniwebCapacityExtension.endsAt} > ${now.getTime()})`));
  const capacity = calculateMiniWebCapacity(active.length > 0, extensions.length);
  const slots = await database.select({ siteId: miniWebV2PublicationSlot.siteId }).from(miniWebV2PublicationSlot).where(eq(miniWebV2PublicationSlot.ownerUserId, ownerUserId));
  return { capacity, occupied: slots.length, available: Math.max(0, capacity - slots.length) };
}

/** Creates an empty V2 site and revision-zero draft atomically. Caller must authorize org membership. */
export async function createMiniWebV2Site(database: Database, input: MiniWebV2SiteInput & { documentJson?: string; conversion?: { sourceOrganizationId: string; sourcePublicationVersion: number; reportJson: string; consentedAt: Date; consentedByUserId: string } }) {
  const { documentJson, conversion, ...site } = input;
  await database.batch([
    database.insert(miniWebV2Site).values({ ...site, sourceOrganizationId: conversion?.sourceOrganizationId ?? null, sourcePublicationVersion: conversion?.sourcePublicationVersion ?? null, conversionMigrationVersion: conversion ? 1 : null, conversionReportJson: conversion?.reportJson ?? null, conversionConsentedAt: conversion?.consentedAt ?? null, conversionConsentedByUserId: conversion?.consentedByUserId ?? null, draftRevision: documentJson ? 1 : 0 }),
    database.insert(miniWebV2Draft).values({ siteId: site.id, revision: documentJson ? 1 : 0, schemaVersion: 1, documentJson: documentJson ?? JSON.stringify({ schemaVersion: 1, sections: [] }), updatedByUserId: conversion?.consentedByUserId ?? site.ownerUserId }),
  ]);
  return { siteId: site.id, revision: documentJson ? 1 : 0 };
}

/** Revision CAS. The site increment and draft replacement are one D1 batch transaction. */
export async function saveMiniWebV2Draft(
  database: Database,
  input: { siteId: string; organizationId: string; actorUserId: string; expectedRevision: number; schemaVersion: number; documentJson: string },
) {
  const nextRevision = input.expectedRevision + 1;
  const result = await database.batch([
    database.update(miniWebV2Draft).set({ revision: nextRevision, schemaVersion: input.schemaVersion, documentJson: input.documentJson, updatedByUserId: input.actorUserId, updatedAt: new Date() })
      .where(sql`${eq(miniWebV2Draft.siteId, input.siteId)} AND ${eq(miniWebV2Draft.revision, input.expectedRevision)} AND EXISTS (SELECT 1 FROM miniweb_v2_site s WHERE s.id = ${input.siteId} AND s.organization_id = ${input.organizationId} AND s.draft_revision = ${input.expectedRevision})`),
    database.update(miniWebV2Site).set({ draftRevision: nextRevision, updatedAt: new Date() })
      .where(sql`${eq(miniWebV2Site.id, input.siteId)} AND ${eq(miniWebV2Site.organizationId, input.organizationId)} AND ${eq(miniWebV2Site.draftRevision, input.expectedRevision)} AND EXISTS (SELECT 1 FROM miniweb_v2_draft d WHERE d.site_id = ${input.siteId} AND d.revision = ${nextRevision})`),
  ]);
  if ((result[0]?.meta?.changes ?? 0) !== 1 || (result[1]?.meta?.changes ?? 0) !== 1) return { ok: false as const, reason: "conflict" as const };
  return { ok: true as const, revision: nextRevision };
}

/** Immutable snapshot insert plus active pointer CAS, committed atomically. */
export async function publishMiniWebV2Draft(
  database: Database,
  input: { siteId: string; organizationId: string; actorUserId: string; expectedRevision: number; publicationId: string; now?: Date },
) {
  const now = input.now ?? new Date();
  const ownerHasActiveLicense = sql`EXISTS (
    SELECT 1 FROM organization_license l INNER JOIN billing_account b ON b.id = l.billing_account_id
    WHERE b.owner_user_id = miniweb_v2_site.owner_user_id AND l.status = 'active'
      AND (l.started_at IS NULL OR l.started_at <= ${now.getTime()})
      AND (l.ends_at IS NULL OR l.ends_at > ${now.getTime()})
  )`;
  const explicitExtensionCount = sql`(
    SELECT COUNT(*) FROM billing_miniweb_capacity_extension e
    INNER JOIN billing_account b ON b.id = e.billing_account_id
    WHERE b.owner_user_id = miniweb_v2_site.owner_user_id AND e.status = 'active'
      AND e.starts_at <= ${now.getTime()} AND (e.ends_at IS NULL OR e.ends_at > ${now.getTime()})
  )`;
  const effectiveCapacity = sql`(CASE WHEN ${ownerHasActiveLicense} THEN 3 + 3 * ${explicitExtensionCount} ELSE 0 END)`;
  const slot = database.insert(miniWebV2PublicationSlot).select(
    database.select({ siteId: miniWebV2Site.id, ownerUserId: miniWebV2Site.ownerUserId, reservedAt: sql<number>`${now.getTime()}`.as("reserved_at") }).from(miniWebV2Site)
      .where(sql`${eq(miniWebV2Site.id, input.siteId)} AND ${eq(miniWebV2Site.organizationId, input.organizationId)} AND ${ownerHasActiveLicense} AND (EXISTS (SELECT 1 FROM miniweb_v2_publication_slot s WHERE s.site_id = ${input.siteId}) OR (SELECT COUNT(*) FROM miniweb_v2_publication_slot s WHERE s.owner_user_id = miniweb_v2_site.owner_user_id) < ${effectiveCapacity})`),
  ).onConflictDoNothing();
  const inserted = database.insert(miniWebV2Publication).select(
    database.select({ id: sql<string>`${input.publicationId}`.as("id"), siteId: miniWebV2Draft.siteId, revision: miniWebV2Draft.revision, schemaVersion: miniWebV2Draft.schemaVersion, documentJson: miniWebV2Draft.documentJson, publishedByUserId: sql<string>`${input.actorUserId}`.as("published_by_user_id"), createdAt: sql<number>`${now.getTime()}`.as("created_at") })
      .from(miniWebV2Draft).innerJoin(miniWebV2Site, eq(miniWebV2Site.id, miniWebV2Draft.siteId))
      .where(sql`${eq(miniWebV2Draft.siteId, input.siteId)} AND ${eq(miniWebV2Site.organizationId, input.organizationId)} AND ${ownerHasActiveLicense} AND ${eq(miniWebV2Draft.revision, input.expectedRevision)} AND ${eq(miniWebV2Site.draftRevision, input.expectedRevision)} AND EXISTS (SELECT 1 FROM miniweb_v2_publication_slot s WHERE s.site_id = ${input.siteId} AND s.owner_user_id = ${miniWebV2Site.ownerUserId})`),
  );
  const results = await database.batch([
    slot,
    inserted,
    database.update(miniWebV2Site).set({ activePublicationId: input.publicationId, publishedRevision: input.expectedRevision, updatedAt: now })
      .where(sql`${eq(miniWebV2Site.id, input.siteId)} AND ${eq(miniWebV2Site.organizationId, input.organizationId)} AND ${ownerHasActiveLicense} AND ${eq(miniWebV2Site.draftRevision, input.expectedRevision)} AND EXISTS (SELECT 1 FROM miniweb_v2_publication p WHERE p.id = ${input.publicationId} AND p.site_id = ${input.siteId} AND p.revision = ${input.expectedRevision})`),
  ]);
  if ((results[1]?.meta?.changes ?? 0) !== 1 || (results[2]?.meta?.changes ?? 0) !== 1) return { ok: false as const, reason: (results[0]?.meta?.changes ?? 0) === 0 ? "capacity" as const : "conflict" as const };
  return { ok: true as const, publicationId: input.publicationId, revision: input.expectedRevision };
}

export async function getPublishedMiniWebV2(database: Database, siteId: string, organizationId: string) {
  const [site] = await database.select({ id: miniWebV2Site.id, publicationId: miniWebV2Site.activePublicationId })
    .from(miniWebV2Site).where(sql`${eq(miniWebV2Site.id, siteId)} AND ${eq(miniWebV2Site.organizationId, organizationId)}`).limit(1);
  if (!site?.publicationId) return null;
  const [publication] = await database.select().from(miniWebV2Publication)
    .where(sql`${eq(miniWebV2Publication.id, site.publicationId)} AND ${eq(miniWebV2Publication.siteId, site.id)}`).limit(1);
  return publication ?? null;
}

/** Public lookup follows only the site's active publication pointer, never its draft. */
export async function getPublicMiniWebV2BySiteId(database: Database, siteId: string) {
  const [row] = await database.select({ siteId: miniWebV2Site.id, familyKey: miniWebV2Site.familyKey, visualVariant: miniWebV2Site.visualVariant, publicationId: miniWebV2Site.activePublicationId, revision: miniWebV2Publication.revision, schemaVersion: miniWebV2Publication.schemaVersion, documentJson: miniWebV2Publication.documentJson })
    .from(miniWebV2Site).innerJoin(miniWebV2Publication, eq(miniWebV2Site.activePublicationId, miniWebV2Publication.id))
    .where(and(eq(miniWebV2Site.id, siteId), eq(miniWebV2Publication.siteId, miniWebV2Site.id))).limit(1);
  return row ?? null;
}
