import { and, eq, sql } from "drizzle-orm";
import type { Database } from "../client.server";
import { miniWebV2Draft, miniWebV2Publication, miniWebV2PublicationSlot, miniWebV2Site } from "../schema/miniweb";
import { billingAccount, organizationLicense } from "../schema/licensing";

export type MiniWebV2SiteInput = {
  id: string; organizationId: string; ownerUserId: string; familyKey: string; visualVariant: string;
};

export async function getMiniWebV2EditorState(database: Database, organizationId: string) {
  const [site] = await database.select().from(miniWebV2Site).where(eq(miniWebV2Site.organizationId, organizationId)).orderBy(miniWebV2Site.createdAt).limit(1);
  if (!site) return null;
  const [draft] = await database.select().from(miniWebV2Draft).where(eq(miniWebV2Draft.siteId, site.id)).limit(1);
  return draft ? { site, draft } : null;
}

export async function getMiniWebV2PublicationCapacity(database: Database, ownerUserId: string, now = new Date()) {
  const active = await database.select({ id: organizationLicense.id }).from(organizationLicense)
    .innerJoin(billingAccount, eq(billingAccount.id, organizationLicense.billingAccountId))
    .where(and(eq(billingAccount.ownerUserId, ownerUserId), eq(organizationLicense.status, "active"), sql`(${organizationLicense.endsAt} IS NULL OR ${organizationLicense.endsAt} > ${now.getTime()})`));
  const capacity = active.length ? 3 : 0;
  const slots = await database.select({ siteId: miniWebV2PublicationSlot.siteId }).from(miniWebV2PublicationSlot).where(eq(miniWebV2PublicationSlot.ownerUserId, ownerUserId));
  return { capacity, occupied: slots.length, available: Math.max(0, capacity - slots.length) };
}

/** Creates an empty V2 site and revision-zero draft atomically. Caller must authorize org membership. */
export async function createMiniWebV2Site(database: Database, input: MiniWebV2SiteInput) {
  await database.batch([
    database.insert(miniWebV2Site).values({ ...input, draftRevision: 0 }),
    database.insert(miniWebV2Draft).values({ siteId: input.id, revision: 0, schemaVersion: 1, documentJson: JSON.stringify({ schemaVersion: 1, sections: [] }), updatedByUserId: input.ownerUserId }),
  ]);
  return { siteId: input.id, revision: 0 };
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
  input: { siteId: string; organizationId: string; actorUserId: string; expectedRevision: number; publicationId: string; capacity: number },
) {
  const slot = database.insert(miniWebV2PublicationSlot).select(
    database.select({ siteId: miniWebV2Site.id, ownerUserId: miniWebV2Site.ownerUserId }).from(miniWebV2Site)
      .where(sql`${eq(miniWebV2Site.id, input.siteId)} AND ${eq(miniWebV2Site.organizationId, input.organizationId)} AND (EXISTS (SELECT 1 FROM miniweb_v2_publication_slot s WHERE s.site_id = ${input.siteId}) OR (SELECT COUNT(*) FROM miniweb_v2_publication_slot s WHERE s.owner_user_id = miniweb_v2_site.owner_user_id) < ${input.capacity})`),
  ).onConflictDoNothing();
  const inserted = database.insert(miniWebV2Publication).select(
    database.select({ id: sql<string>`${input.publicationId}`.as("id"), siteId: miniWebV2Draft.siteId, revision: miniWebV2Draft.revision, schemaVersion: miniWebV2Draft.schemaVersion, documentJson: miniWebV2Draft.documentJson, publishedByUserId: sql<string>`${input.actorUserId}`.as("published_by_user_id") })
      .from(miniWebV2Draft).innerJoin(miniWebV2Site, eq(miniWebV2Site.id, miniWebV2Draft.siteId))
      .where(sql`${eq(miniWebV2Draft.siteId, input.siteId)} AND ${eq(miniWebV2Site.organizationId, input.organizationId)} AND ${eq(miniWebV2Draft.revision, input.expectedRevision)} AND ${eq(miniWebV2Site.draftRevision, input.expectedRevision)} AND EXISTS (SELECT 1 FROM miniweb_v2_publication_slot s WHERE s.site_id = ${input.siteId} AND s.owner_user_id = ${miniWebV2Site.ownerUserId})`),
  );
  const results = await database.batch([
    slot,
    inserted,
    database.update(miniWebV2Site).set({ activePublicationId: input.publicationId, publishedRevision: input.expectedRevision, updatedAt: new Date() })
      .where(sql`${eq(miniWebV2Site.id, input.siteId)} AND ${eq(miniWebV2Site.organizationId, input.organizationId)} AND ${eq(miniWebV2Site.draftRevision, input.expectedRevision)} AND EXISTS (SELECT 1 FROM miniweb_v2_publication p WHERE p.id = ${input.publicationId} AND p.site_id = ${input.siteId} AND p.revision = ${input.expectedRevision})`),
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
