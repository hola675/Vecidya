import { sql } from "drizzle-orm";
import { foreignKey, index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

export const learnGuideProgress = sqliteTable("learn_guide_progress", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  guideId: text("guide_id").notNull(),
  contentRevision: integer("content_revision").notNull(),
  resetEpoch: integer("reset_epoch").notNull().default(0),
  version: integer("version").notNull().default(1),
  lastOperationId: text("last_operation_id"),
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
  resetEpoch: integer("reset_epoch").notNull().default(0),
  version: integer("version").notNull().default(1),
  isChecked: integer("is_checked", { mode: "boolean" }).notNull().default(true),
  operationId: text("operation_id"),
  checkedAt: integer("checked_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
}, (table) => [
  primaryKey({ columns: [table.userId, table.guideId, table.sectionId] }),
  index("learn_section_progress_guide_idx").on(table.userId, table.guideId),
  foreignKey({ columns: [table.userId, table.guideId], foreignColumns: [learnGuideProgress.userId, learnGuideProgress.guideId], name: "learn_section_progress_guide_fk" }).onDelete("cascade"),
]);

export const learnFavorite = sqliteTable("learn_favorite", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  guideId: text("guide_id").notNull(),
  isFavorite: integer("is_favorite", { mode: "boolean" }).notNull().default(true),
  version: integer("version").notNull().default(1),
  operationId: text("operation_id"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
}, (table) => [
  primaryKey({ columns: [table.userId, table.guideId] }),
  index("learn_favorite_user_updated_idx").on(table.userId, table.updatedAt),
]);

export const learnSyncDevice = sqliteTable("learn_sync_device", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  deviceId: text("device_id").notNull(),
  lastSequence: integer("last_sequence").notNull().default(0),
  lastOperationId: text("last_operation_id"),
  lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
}, (table) => [primaryKey({ columns: [table.userId, table.deviceId] }), index("learn_sync_device_last_seen_idx").on(table.lastSeenAt)]);

export const learnOperationReceipt = sqliteTable("learn_operation_receipt", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  operationId: text("operation_id").notNull(),
  deviceId: text("device_id").notNull(),
  clientSequence: integer("client_sequence").notNull(),
  guideId: text("guide_id").notNull(),
  operationType: text("operation_type").notNull(),
  baseVersion: integer("base_version").notNull(),
  baseResetEpoch: integer("base_reset_epoch").notNull(),
  resultVersion: integer("result_version").notNull(),
  resultResetEpoch: integer("result_reset_epoch").notNull(),
  outcome: text("outcome").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
}, (table) => [
  primaryKey({ columns: [table.userId, table.operationId] }),
  uniqueIndex("learn_operation_receipt_device_sequence_unique").on(table.userId, table.deviceId, table.clientSequence),
  index("learn_operation_receipt_created_idx").on(table.createdAt),
]);
