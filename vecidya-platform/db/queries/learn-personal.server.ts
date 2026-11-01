import { and, eq, inArray, sql } from "drizzle-orm";

import type { Database } from "../client.server";
import { learnFavorite, learnGuideProgress, learnSectionProgress } from "../schema";

export async function getLearnPersonalState(database: Database, userId: string) {
  const [guides, sections, favorites] = await Promise.all([
    database.select().from(learnGuideProgress).where(eq(learnGuideProgress.userId, userId)),
    database.select().from(learnSectionProgress).where(eq(learnSectionProgress.userId, userId)),
    database.select().from(learnFavorite).where(eq(learnFavorite.userId, userId)),
  ]);
  return { guides, sections, favorites: favorites.filter((row) => row.isFavorite).map((row) => row.guideId) };
}

export async function setLearnSectionChecked(database: Database, input: { userId: string; guideId: string; sectionId: string; revision: number; checked: boolean }) {
  const now = new Date();
  await database.insert(learnGuideProgress).values({ userId: input.userId, guideId: input.guideId, contentRevision: input.revision, lastActivityAt: now, updatedAt: now, version: 1 })
    .onConflictDoUpdate({ target: [learnGuideProgress.userId, learnGuideProgress.guideId], set: { contentRevision: input.revision, lastActivityAt: now, updatedAt: now, version: sql`${learnGuideProgress.version} + 1` } });
  await database.insert(learnSectionProgress).values({ userId: input.userId, guideId: input.guideId, sectionId: input.sectionId, contentRevision: input.revision, checkedAt: now, isChecked: input.checked })
    .onConflictDoUpdate({ target: [learnSectionProgress.userId, learnSectionProgress.guideId, learnSectionProgress.sectionId], set: { contentRevision: input.revision, checkedAt: now, isChecked: input.checked, version: sql`${learnSectionProgress.version} + 1` } });
}

export async function setLearnLastSection(database: Database, input: { userId: string; guideId: string; sectionId: string; revision: number }) {
  const now = new Date();
  await database.insert(learnGuideProgress).values({ userId: input.userId, guideId: input.guideId, contentRevision: input.revision, lastSectionId: input.sectionId, lastActivityAt: now, updatedAt: now, version: 1 })
    .onConflictDoUpdate({ target: [learnGuideProgress.userId, learnGuideProgress.guideId], set: { contentRevision: input.revision, lastSectionId: input.sectionId, lastActivityAt: now, updatedAt: now, version: sql`${learnGuideProgress.version} + 1` } });
}

export async function setLearnFavorite(database: Database, userId: string, guideId: string, favorite: boolean) {
  const now = new Date();
  await database.insert(learnFavorite).values({ userId, guideId, isFavorite: favorite, updatedAt: now })
    .onConflictDoUpdate({ target: [learnFavorite.userId, learnFavorite.guideId], set: { isFavorite: favorite, updatedAt: now, version: sql`${learnFavorite.version} + 1` } });
}

export async function hideLearnRecent(database: Database, userId: string, guideId: string) {
  const now = new Date();
  await database.update(learnGuideProgress).set({ hiddenRecentAt: now, updatedAt: now, version: sql`${learnGuideProgress.version} + 1` })
    .where(and(eq(learnGuideProgress.userId, userId), eq(learnGuideProgress.guideId, guideId)));
}

export async function restoreLearnRecent(database: Database, userId: string, guideId: string) {
  const now = new Date();
  await database.update(learnGuideProgress).set({ hiddenRecentAt: null, updatedAt: now, version: sql`${learnGuideProgress.version} + 1` })
    .where(and(eq(learnGuideProgress.userId, userId), eq(learnGuideProgress.guideId, guideId)));
}

export async function resetLearnGuide(database: Database, userId: string, guideId: string, revision = 1) {
  await database.delete(learnSectionProgress).where(and(eq(learnSectionProgress.userId, userId), eq(learnSectionProgress.guideId, guideId)));
  const now = new Date();
  await database.insert(learnGuideProgress).values({ userId, guideId, contentRevision: revision, resetEpoch: 1, version: 2, lastSectionId: null, lastActivityAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: [learnGuideProgress.userId, learnGuideProgress.guideId], set: { contentRevision: revision, resetEpoch: sql`${learnGuideProgress.resetEpoch} + 1`, version: sql`${learnGuideProgress.version} + 1`, lastSectionId: null, lastActivityAt: now, hiddenRecentAt: null, updatedAt: now } });
}

export async function clearLearnRecentVisibility(database: Database, userId: string, guideIds: string[]) {
  if (!guideIds.length) return;
  await database.update(learnGuideProgress).set({ hiddenRecentAt: null }).where(and(eq(learnGuideProgress.userId, userId), inArray(learnGuideProgress.guideId, guideIds)));
}
