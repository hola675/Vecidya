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
