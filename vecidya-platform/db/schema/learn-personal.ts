import { sql } from "drizzle-orm";
import { foreignKey, index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

export const learnGuideProgress = sqliteTable("learn_guide_progress", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  guideId: text("guide_id").notNull(),
  contentRevision: integer("content_revision").notNull(),
  resetEpoch: integer("reset_epoch").notNull().default(0),
  version: integer("version").notNull().default(1),
  lastSectionId: text("last_section_id"),
  lastActivityAt: integer("last_activity_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  hiddenRecentAt: integer("hidden_recent_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
}, (table) => [
  primaryKey({ columns: [table.userId, table.guideId] }),
  index("learn_guide_progress_user_activity_idx").on(table.userId, table.lastActivityAt),
]);

export const learnSectionProgress = sqliteTable("learn_section_progress", {
  userId: text("user_id").notNull(),
  guideId: text("guide_id").notNull(),
  sectionId: text("section_id").notNull(),
  contentRevision: integer("content_revision").notNull(),
  checkedAt: integer("checked_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
}, (table) => [
  primaryKey({ columns: [table.userId, table.guideId, table.sectionId] }),
  index("learn_section_progress_guide_idx").on(table.userId, table.guideId),
  foreignKey({ columns: [table.userId, table.guideId], foreignColumns: [learnGuideProgress.userId, learnGuideProgress.guideId], name: "learn_section_progress_guide_fk" }).onDelete("cascade"),
]);

export const learnFavorite = sqliteTable("learn_favorite", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  guideId: text("guide_id").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
}, (table) => [
  primaryKey({ columns: [table.userId, table.guideId] }),
  index("learn_favorite_user_updated_idx").on(table.userId, table.updatedAt),
]);
