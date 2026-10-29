import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    activeOrganizationId: text("active_organization_id"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const organization = sqliteTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  metadata: text("metadata"),
});

export const member = sqliteTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
    uniqueIndex("member_organization_user_unique").on(table.organizationId, table.userId),
  ],
);

export const businessProfile = sqliteTable(
  "business_profile",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    slug: text("slug").notNull(),
    shortDescription: text("short_description"),
    description: text("description"),
    category: text("category"),
    city: text("city"),
    country: text("country"),
    phone: text("phone"),
    publicEmail: text("public_email"),
    websiteUrl: text("website_url"),
    logoUrl: text("logo_url"),
    whatsapp: text("whatsapp"),
    instagramUrl: text("instagram_url"),
    facebookUrl: text("facebook_url"),
    linkedinUrl: text("linkedin_url"),
    tiktokUrl: text("tiktok_url"),
    youtubeUrl: text("youtube_url"),
    serviceMode: text("service_mode", { enum: ["in_person", "remote", "hybrid"] }),
    serviceArea: text("service_area"),
    status: text("status", { enum: ["draft", "published"] }).default("draft").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("business_profile_organization_unique").on(table.organizationId),
    uniqueIndex("business_profile_slug_unique").on(table.slug),
  ],
);

export const businessProfileGovernance = sqliteTable("business_profile_governance", {
  id: text("id").primaryKey(), businessProfileId: text("business_profile_id").notNull().references(() => businessProfile.id, { onDelete: "cascade" }), verificationStatus: text("verification_status", { enum: ["unverified", "verified"] }).default("unverified").notNull(), verifiedAt: integer("verified_at", { mode: "timestamp_ms" }), verifiedBy: text("verified_by").references(() => user.id), platformStatus: text("platform_status", { enum: ["active", "suspended"] }).default("active").notNull(), suspendedAt: integer("suspended_at", { mode: "timestamp_ms" }), suspendedBy: text("suspended_by").references(() => user.id), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("business_profile_governance_profile_unique").on(table.businessProfileId)]);

export const businessProfilePublication = sqliteTable("business_profile_publication", {
  organizationId: text("organization_id").primaryKey().references(() => organization.id, { onDelete: "cascade" }),
  draftRevision: integer("draft_revision").default(0).notNull(),
  draftWriteToken: text("draft_write_token"),
  publishedVersion: integer("published_version").default(0).notNull(),
  publishedSlug: text("published_slug"),
  snapshotSchemaVersion: integer("snapshot_schema_version"),
  snapshotJson: text("snapshot_json"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("business_profile_publication_slug_unique").on(table.publishedSlug)]);

export const platformAuditLog = sqliteTable("platform_audit_log", {
  id: text("id").primaryKey(), actorUserId: text("actor_user_id").notNull().references(() => user.id), action: text("action").notNull(), entityType: text("entity_type").notNull(), entityId: text("entity_id").notNull(), organizationId: text("organization_id").notNull().references(() => organization.id), previousValue: text("previous_value"), newValue: text("new_value"), metadata: text("metadata"), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("platform_audit_log_entity_idx").on(table.entityType, table.entityId), index("platform_audit_log_organization_idx").on(table.organizationId), index("platform_audit_log_created_idx").on(table.createdAt)]);

export const businessHours = sqliteTable("business_hours", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }), dayOfWeek: integer("day_of_week").notNull(), opensAt: text("opens_at"), closesAt: text("closes_at"), isClosed: integer("is_closed", { mode: "boolean" }).default(false).notNull(), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("business_hours_organization_day_unique").on(table.organizationId, table.dayOfWeek), index("business_hours_organization_idx").on(table.organizationId)]);

export const serviceCatalog = sqliteTable("service_catalog", {
  id: text("id").primaryKey(), code: text("code").notNull().unique(), name: text("name").notNull(), description: text("description"), status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const organizationService = sqliteTable("organization_service", {
  id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }), serviceId: text("service_id").notNull().references(() => serviceCatalog.id), status: text("status", { enum: ["pending", "active", "suspended", "ended"] }).default("pending").notNull(), activatedAt: integer("activated_at", { mode: "timestamp_ms" }), endedAt: integer("ended_at", { mode: "timestamp_ms" }), metadata: text("metadata"), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("organization_service_unique").on(table.organizationId, table.serviceId), index("organization_service_organization_idx").on(table.organizationId)]);

export const platformMember = sqliteTable("platform_member", { id: text("id").primaryKey(), userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }).unique(), role: text("role", { enum: ["staff", "platform_admin"] }).notNull(), status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull() });

export const platformOrganizationLifecycle = sqliteTable("platform_organization_lifecycle", {
  organizationId: text("organization_id").primaryKey().references(() => organization.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["pending_owner", "owner_invited", "active", "suspended"] }).notNull(),
  intendedOwnerEmail: text("intended_owner_email").notNull(),
  ownerUserId: text("owner_user_id").references(() => user.id),
  createdBy: text("created_by").notNull().references(() => user.id),
  updatedBy: text("updated_by").notNull().references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("platform_organization_lifecycle_status_idx").on(table.status, table.updatedAt)]);

/** Grant explícito por membresía. Si Better Auth retira el miembro, el permiso se elimina. */
export const organizationLearnAccessGrant = sqliteTable("organization_learn_access_grant", {
  memberId: text("member_id").primaryKey().references(() => member.id, { onDelete: "cascade" }),
  grantedByUserId: text("granted_by_user_id").notNull().references(() => user.id),
  grantedAt: integer("granted_at", { mode: "timestamp_ms" }).notNull(),
});

export const platformOwnerInvitation = sqliteTable("platform_owner_invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  tokenDigest: text("token_digest").notNull().unique(),
  status: text("status", { enum: ["pending", "accepted", "revoked"] }).default("pending").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdBy: text("created_by").notNull().references(() => user.id),
  acceptedBy: text("accepted_by").references(() => user.id),
  acceptedAt: integer("accepted_at", { mode: "timestamp_ms" }),
  acceptanceId: text("acceptance_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  index("platform_owner_invitation_org_idx").on(table.organizationId, table.status),
  uniqueIndex("platform_owner_invitation_pending_org_unique").on(table.organizationId).where(sql`${table.status} = 'pending'`),
]);

export const organizationTrainingAssignment = sqliteTable("organization_training_assignment", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  trainingSlug: text("training_slug").notNull(),
  assignedBy: text("assigned_by").notNull().references(() => user.id),
  assignedAt: integer("assigned_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("organization_training_assignment_unique").on(table.organizationId, table.trainingSlug), index("organization_training_assignment_org_idx").on(table.organizationId)]);

export const organizationTrainingProgress = sqliteTable("organization_training_progress", {
  id: text("id").primaryKey(),
  assignmentId: text("assignment_id").notNull().references(() => organizationTrainingAssignment.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["not_started", "in_progress", "completed"] }).default("not_started").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [uniqueIndex("organization_training_progress_member_unique").on(table.assignmentId, table.userId), index("organization_training_progress_assignment_idx").on(table.assignmentId)]);

export const organizationTrainingProgressHistory = sqliteTable("organization_training_progress_history", {
  id: text("id").primaryKey(),
  progressId: text("progress_id").notNull().references(() => organizationTrainingProgress.id, { onDelete: "cascade" }),
  actorUserId: text("actor_user_id").notNull().references(() => user.id),
  previousStatus: text("previous_status", { enum: ["not_started", "in_progress", "completed"] }).notNull(),
  newStatus: text("new_status", { enum: ["not_started", "in_progress", "completed"] }).notNull(),
  reason: text("reason"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("organization_training_progress_history_progress_idx").on(table.progressId, table.createdAt)]);

export const integrationConnection = sqliteTable("integration_connection", { id: text("id").primaryKey(), organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }), provider: text("provider").notNull(), externalId: text("external_id").notNull(), status: text("status", { enum: ["pending", "active", "inactive", "error"] }).default("pending").notNull(), metadata: text("metadata"), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull() }, (table) => [uniqueIndex("integration_connection_provider_external_unique").on(table.provider, table.externalId), index("integration_connection_organization_idx").on(table.organizationId)]);

export const invitation = sqliteTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").default("pending").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  businessProfiles: many(businessProfile),
}));

export const businessProfileRelations = relations(businessProfile, ({ one }) => ({
  organization: one(organization, {
    fields: [businessProfile.organizationId],
    references: [organization.id],
  }),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));
