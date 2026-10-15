import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const identifiedDiagnosticRequest = sqliteTable("identified_diagnostic_request", {
  id: text("id").primaryKey(),
  idempotencyKeyHash: text("idempotency_key_hash").notNull(),
  requestFingerprintHash: text("request_fingerprint_hash").notNull().default(""),
  engineIdentity: text("engine_identity").notNull(),
  reportVersion: text("report_version").notNull(),
  methodologyVersion: text("methodology_version").notNull(),
  status: text("status", { enum: ["verification_pending", "verified"] }).notNull(),
  fullName: text("full_name").notNull(),
  businessName: text("business_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  serviceNoticeVersion: text("service_notice_version").notNull(),
  serviceNoticeAcknowledgedAt: integer("service_notice_acknowledged_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  uniqueIndex("identified_diagnostic_request_idempotency_uq").on(table.idempotencyKeyHash),
  index("identified_diagnostic_request_email_idx").on(table.email),
  index("identified_diagnostic_request_expires_idx").on(table.expiresAt),
]);

export const diagnosticReportSnapshot = sqliteTable("diagnostic_report_snapshot", {
  requestId: text("request_id").primaryKey().references(() => identifiedDiagnosticRequest.id, { onDelete: "cascade" }),
  engineIdentity: text("engine_identity").notNull(),
  reportVersion: text("report_version").notNull(),
  methodologyVersion: text("methodology_version").notNull(),
  reportJson: text("report_json").notNull(),
  reportSha256: text("report_sha256").notNull(),
  computedAt: integer("computed_at", { mode: "timestamp_ms" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("diagnostic_report_snapshot_expires_idx").on(table.expiresAt)]);

export const verifiedEmailChallenge = sqliteTable("verified_email_challenge", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().references(() => identifiedDiagnosticRequest.id, { onDelete: "cascade" }),
  purpose: text("purpose", { enum: ["verification", "access_recovery"] }).notNull().default("verification"),
  tokenDigest: text("token_digest").notNull(),
  status: text("status", { enum: ["pending", "consumed", "expired", "superseded", "locked"] }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  issuedAt: integer("issued_at", { mode: "timestamp_ms" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  consumedAt: integer("consumed_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  uniqueIndex("verified_email_challenge_token_digest_uq").on(table.tokenDigest),
  index("verified_email_challenge_request_status_idx").on(table.requestId, table.status),
  index("verified_email_challenge_expires_idx").on(table.expiresAt),
]);

export const diagnosticReportAccess = sqliteTable("diagnostic_report_access", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().references(() => identifiedDiagnosticRequest.id, { onDelete: "cascade" }),
  challengeId: text("challenge_id").notNull().references(() => verifiedEmailChallenge.id, { onDelete: "cascade" }),
  tokenDigest: text("token_digest").notNull(),
  issuedAt: integer("issued_at", { mode: "timestamp_ms" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
}, (table) => [
  uniqueIndex("diagnostic_report_access_challenge_uq").on(table.challengeId),
  uniqueIndex("diagnostic_report_access_token_digest_uq").on(table.tokenDigest),
  index("diagnostic_report_access_request_idx").on(table.requestId),
  index("diagnostic_report_access_expires_idx").on(table.expiresAt),
]);

export const commercialContactIntent = sqliteTable("commercial_contact_intent", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().references(() => identifiedDiagnosticRequest.id, { onDelete: "cascade" }),
  noticeVersion: text("notice_version").notNull(),
  source: text("source").notNull(),
  consentedAt: integer("consented_at", { mode: "timestamp_ms" }).notNull(),
  revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
}, (table) => [uniqueIndex("commercial_contact_intent_request_uq").on(table.requestId)]);

export const diagnosticResearchIntent = sqliteTable("diagnostic_research_intent", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().references(() => identifiedDiagnosticRequest.id, { onDelete: "cascade" }),
  noticeVersion: text("notice_version").notNull(),
  source: text("source").notNull(),
  consentedAt: integer("consented_at", { mode: "timestamp_ms" }).notNull(),
  revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
}, (table) => [uniqueIndex("diagnostic_research_intent_request_uq").on(table.requestId)]);
