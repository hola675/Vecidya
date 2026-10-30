import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { organization } from "./auth";

export const miniWebSite = sqliteTable(
  "miniweb_site",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    templateKey: text("template_key").notNull(),
    templateVersion: integer("template_version").notNull(),
    layoutVariant: text("layout_variant").notNull(),
    publishedConfigurationJson: text("published_configuration_json"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("miniweb_site_organization_unique").on(table.organizationId)],
);

/** V2's editable source is isolated from V1 miniweb_site/modules and its snapshots. */
export const miniWebV2Site = sqliteTable(
  "miniweb_v2_site",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    ownerUserId: text("owner_user_id").notNull(),
    familyKey: text("family_key").notNull(),
    visualVariant: text("visual_variant").notNull(),
    draftRevision: integer("draft_revision").notNull().default(0),
    publishedRevision: integer("published_revision"),
    activePublicationId: text("active_publication_id"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).$onUpdate(() => new Date()).notNull(),
  },
  (t) => [index("miniweb_v2_site_org_family_idx").on(t.organizationId, t.familyKey), index("miniweb_v2_site_owner_idx").on(t.ownerUserId)],
);

export const miniWebV2Draft = sqliteTable("miniweb_v2_draft", {
  siteId: text("site_id").primaryKey().references(() => miniWebV2Site.id, { onDelete: "cascade" }),
  revision: integer("revision").notNull(),
  schemaVersion: integer("schema_version").notNull(),
  documentJson: text("document_json").notNull(),
  updatedByUserId: text("updated_by_user_id").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull(),
});

export const miniWebV2Publication = sqliteTable("miniweb_v2_publication", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => miniWebV2Site.id, { onDelete: "cascade" }),
  revision: integer("revision").notNull(),
  schemaVersion: integer("schema_version").notNull(),
  documentJson: text("document_json").notNull(),
  publishedByUserId: text("published_by_user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull(),
}, (t) => [uniqueIndex("miniweb_v2_publication_site_revision_unique").on(t.siteId, t.revision), index("miniweb_v2_publication_site_created_idx").on(t.siteId, t.createdAt)]);

/** A slot is occupied only after publication; historical publications retain the slot. */
export const miniWebV2PublicationSlot = sqliteTable("miniweb_v2_publication_slot", {
  siteId: text("site_id").primaryKey().references(() => miniWebV2Site.id, { onDelete: "cascade" }),
  ownerUserId: text("owner_user_id").notNull(),
  reservedAt: integer("reserved_at", { mode: "timestamp_ms" }).default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull(),
}, (t) => [index("miniweb_v2_slot_owner_idx").on(t.ownerUserId, t.reservedAt)]);

export const miniWebModule = sqliteTable(
  "miniweb_module",
  {
    id: text("id").primaryKey(),
    miniWebSiteId: text("miniweb_site_id")
      .notNull()
      .references(() => miniWebSite.id, { onDelete: "cascade" }),
    moduleType: text("module_type").notNull(),
    moduleVersion: integer("module_version").notNull(),
    enabled: integer("enabled", { mode: "boolean" }).notNull(),
    sortOrder: integer("sort_order").notNull(),
    layoutVariant: text("layout_variant").notNull(),
    settingsJson: text("settings_json"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("miniweb_module_site_type_unique").on(table.miniWebSiteId, table.moduleType),
    index("miniweb_module_site_order_idx").on(table.miniWebSiteId, table.sortOrder, table.moduleType),
  ],
);

export const businessOffering = sqliteTable(
  "business_offering",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    priceLabel: text("price_label"),
    imageAssetId: text("image_asset_id"),
    sortOrder: integer("sort_order").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("business_offering_organization_order_idx").on(table.organizationId, table.sortOrder, table.id),
  ],
);

export const businessFaq = sqliteTable(
  "business_faq",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    sortOrder: integer("sort_order").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("business_faq_organization_order_idx").on(table.organizationId, table.sortOrder, table.id),
  ],
);

export const businessMediaAsset = sqliteTable(
  "business_media_asset",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    objectKey: text("object_key").notNull(),
    purpose: text("purpose").notNull().default("gallery"),
    mediaType: text("media_type").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    altText: text("alt_text").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("business_media_asset_object_key_unique").on(table.objectKey),
    index("business_media_asset_organization_created_idx").on(table.organizationId, table.createdAt, table.id),
  ],
);
