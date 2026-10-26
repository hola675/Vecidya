import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { organization, user } from "./auth";

// LICENSE-STRATEGY-001. Toda cantidad monetaria se guarda como entero en la unidad mínima
// (amount_cents); nunca float. Los descuentos se guardan como basis points (1/100 de 1%, 0-10000).
// Ningún enum tiene CHECK a nivel de base de datos, igual que el resto del schema: se valida en
// la aplicación (ver `db/pricing/`).

// Entidad que paga las licencias. Puede tener varias organizaciones; no se deriva de la membresía
// de Better Auth (`member`). En V1, una persona controla como máximo un billing_account.
export const billingAccount = sqliteTable(
  "billing_account",
  {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id").notNull().references(() => user.id),
    kind: text("kind", { enum: ["individual", "company"] }).default("individual").notNull(),
    name: text("name"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("billing_account_owner_unique").on(table.ownerUserId)],
);

// Versión de precio de un plan. Una organization_license conserva su price_id: cambiar el precio
// vigente de un plan no afecta a quien ya contrató (grandfathering), porque nunca se re-resuelve
// el precio de una licencia existente por plan_code, solo se lee por su price_id guardado.
export const licensePrice = sqliteTable(
  "license_price",
  {
    id: text("id").primaryKey(),
    planCode: text("plan_code", { enum: ["cuadra", "barrio", "ciudad"] }).notNull(),
    currency: text("currency").default("USD").notNull(),
    amountCents: integer("amount_cents").notNull(),
    billingInterval: text("billing_interval", { enum: ["monthly"] }).default("monthly").notNull(),
    effectiveFrom: integer("effective_from", { mode: "timestamp_ms" }).notNull(),
    effectiveTo: integer("effective_to", { mode: "timestamp_ms" }),
    status: text("status", { enum: ["active", "retired"] }).default("active").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("license_price_plan_idx").on(table.planCode, table.effectiveFrom)],
);

// 1 organización = 1 negocio = 1 licencia. Un cambio de plan (upgrade/downgrade) no muta esta fila:
// cancela la vigente y crea una nueva, para conservar historial y grandfathering. La base impone
// una sola fila no cancelada por organización; la cancelada permanece como historial.
export const organizationLicense = sqliteTable(
  "organization_license",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    billingAccountId: text("billing_account_id").notNull().references(() => billingAccount.id),
    planCode: text("plan_code", { enum: ["cuadra", "barrio", "ciudad"] }).notNull(),
    priceId: text("price_id").notNull().references(() => licensePrice.id),
    status: text("status", { enum: ["pending", "active", "suspended", "cancelled"] }).default("pending").notNull(),
    startedAt: integer("started_at", { mode: "timestamp_ms" }),
    activatedAt: integer("activated_at", { mode: "timestamp_ms" }),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("organization_license_one_current_unique").on(table.organizationId).where(sql`${table.status} <> 'cancelled'`),
    index("organization_license_organization_idx").on(table.organizationId),
    index("organization_license_billing_account_idx").on(table.billingAccountId),
  ],
);

// Escalera de beneficio por cantidad de organizaciones con licencia activa en el mismo
// billing_account. Configuración, no lógica repartida en componentes (ver `db/pricing/calculator.ts`).
export const portfolioPricingTier = sqliteTable("portfolio_pricing_tier", {
  id: text("id").primaryKey(),
  minOrganizations: integer("min_organizations").notNull(),
  maxOrganizations: integer("max_organizations"),
  discountBps: integer("discount_bps").notNull(),
  active: integer("active", { mode: "boolean" }).default(true).notNull(),
  effectiveFrom: integer("effective_from", { mode: "timestamp_ms" }).notNull(),
  effectiveTo: integer("effective_to", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// Incentivo configurable y temporal. `value` depende de `type`: basis points para `percentage`,
// centavos para `fixed_amount`, y el total plano objetivo en centavos para `fixed_bundle`.
// `free_license` queda representable desde V1 pero su cálculo no se implementa todavía
// (`db/pricing/calculator.ts` lo documenta explícitamente).
export const promotion = sqliteTable(
  "promotion",
  {
    id: text("id").primaryKey(),
    code: text("code"),
    name: text("name").notNull(),
    type: text("type", { enum: ["percentage", "fixed_amount", "fixed_bundle", "free_license"] }).notNull(),
    value: integer("value").notNull(),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }),
    durationCycles: integer("duration_cycles"),
    minOrganizations: integer("min_organizations"),
    maxOrganizations: integer("max_organizations"),
    newCustomerOnly: integer("new_customer_only", { mode: "boolean" }).default(false).notNull(),
    stackable: integer("stackable", { mode: "boolean" }).default(false).notNull(),
    active: integer("active", { mode: "boolean" }).default(true).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("promotion_code_unique").on(table.code)],
);

// Asignación de una promoción a un billing_account: código canjeado, asignación manual de Admin,
// o (a futuro) automática. No toda promoción es pública.
export const billingAccountPromotion = sqliteTable(
  "billing_account_promotion",
  {
    id: text("id").primaryKey(),
    billingAccountId: text("billing_account_id").notNull().references(() => billingAccount.id, { onDelete: "cascade" }),
    promotionId: text("promotion_id").notNull().references(() => promotion.id),
    assignedAt: integer("assigned_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }),
    status: text("status", { enum: ["active", "expired", "revoked"] }).default("active").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("billing_account_promotion_account_idx").on(table.billingAccountId)],
);
