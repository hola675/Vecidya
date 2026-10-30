import { eq, sql } from "drizzle-orm";
import type { Database } from "../client.server";
import { miniWebV2Draft, miniWebV2Publication, miniWebV2Site } from "../schema/miniweb";

export type MiniWebV2SiteInput = {
  id: string; organizationId: string; ownerUserId: string; familyKey: string; visualVariant: string;
};

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
  input: { siteId: string; organizationId: string; actorUserId: string; expectedRevision: number; publicationId: string },
) {
  const createdAt = new Date();
  const inserted = database.insert(miniWebV2Publication).select(
    database.select({ id: sql<string>`${input.publicationId}`.as("id"), siteId: miniWebV2Draft.siteId, revision: miniWebV2Draft.revision, schemaVersion: miniWebV2Draft.schemaVersion, documentJson: miniWebV2Draft.documentJson, publishedByUserId: sql<string>`${input.actorUserId}`.as("published_by_user_id"), createdAt: sql<number>`${createdAt.getTime()}`.as("created_at") })
      .from(miniWebV2Draft).innerJoin(miniWebV2Site, eq(miniWebV2Site.id, miniWebV2Draft.siteId))
      .where(sql`${eq(miniWebV2Draft.siteId, input.siteId)} AND ${eq(miniWebV2Site.organizationId, input.organizationId)} AND ${eq(miniWebV2Draft.revision, input.expectedRevision)} AND ${eq(miniWebV2Site.draftRevision, input.expectedRevision)}`),
  ).onConflictDoNothing();
  const results = await database.batch([
    inserted,
    database.update(miniWebV2Site).set({ activePublicationId: input.publicationId, publishedRevision: input.expectedRevision, updatedAt: new Date() })
      .where(sql`${eq(miniWebV2Site.id, input.siteId)} AND ${eq(miniWebV2Site.organizationId, input.organizationId)} AND ${eq(miniWebV2Site.draftRevision, input.expectedRevision)} AND EXISTS (SELECT 1 FROM miniweb_v2_publication p WHERE p.id = ${input.publicationId} AND p.site_id = ${input.siteId} AND p.revision = ${input.expectedRevision})`),
  ]);
  if ((results[0]?.meta?.changes ?? 0) !== 1 || (results[1]?.meta?.changes ?? 0) !== 1) return { ok: false as const, reason: "conflict" as const };
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
