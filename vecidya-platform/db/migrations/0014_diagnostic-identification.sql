CREATE TABLE `commercial_contact_intent` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`notice_version` text NOT NULL,
	`source` text NOT NULL,
	`consented_at` integer NOT NULL,
	`revoked_at` integer,
	FOREIGN KEY (`request_id`) REFERENCES `identified_diagnostic_request`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commercial_contact_intent_request_uq` ON `commercial_contact_intent` (`request_id`);--> statement-breakpoint
CREATE TABLE `diagnostic_report_access` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`challenge_id` text NOT NULL,
	`token_digest` text NOT NULL,
	`issued_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`revoked_at` integer,
	FOREIGN KEY (`request_id`) REFERENCES `identified_diagnostic_request`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`challenge_id`) REFERENCES `verified_email_challenge`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diagnostic_report_access_challenge_uq` ON `diagnostic_report_access` (`challenge_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `diagnostic_report_access_token_digest_uq` ON `diagnostic_report_access` (`token_digest`);--> statement-breakpoint
CREATE INDEX `diagnostic_report_access_request_idx` ON `diagnostic_report_access` (`request_id`);--> statement-breakpoint
CREATE INDEX `diagnostic_report_access_expires_idx` ON `diagnostic_report_access` (`expires_at`);--> statement-breakpoint
CREATE TABLE `diagnostic_report_snapshot` (
	`request_id` text PRIMARY KEY NOT NULL,
	`engine_identity` text NOT NULL,
	`report_version` text NOT NULL,
	`methodology_version` text NOT NULL,
	`report_json` text NOT NULL,
	`report_sha256` text NOT NULL,
	`computed_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `identified_diagnostic_request`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `diagnostic_report_snapshot_expires_idx` ON `diagnostic_report_snapshot` (`expires_at`);--> statement-breakpoint
CREATE TABLE `diagnostic_research_intent` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`notice_version` text NOT NULL,
	`source` text NOT NULL,
	`consented_at` integer NOT NULL,
	`revoked_at` integer,
	FOREIGN KEY (`request_id`) REFERENCES `identified_diagnostic_request`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diagnostic_research_intent_request_uq` ON `diagnostic_research_intent` (`request_id`);--> statement-breakpoint
CREATE TABLE `identified_diagnostic_request` (
	`id` text PRIMARY KEY NOT NULL,
	`idempotency_key_hash` text NOT NULL,
	`engine_identity` text NOT NULL,
	`report_version` text NOT NULL,
	`methodology_version` text NOT NULL,
	`status` text NOT NULL,
	`full_name` text NOT NULL,
	`business_name` text,
	`email` text NOT NULL,
	`phone` text,
	`service_notice_version` text NOT NULL,
	`service_notice_acknowledged_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `identified_diagnostic_request_idempotency_uq` ON `identified_diagnostic_request` (`idempotency_key_hash`);--> statement-breakpoint
CREATE INDEX `identified_diagnostic_request_email_idx` ON `identified_diagnostic_request` (`email`);--> statement-breakpoint
CREATE INDEX `identified_diagnostic_request_expires_idx` ON `identified_diagnostic_request` (`expires_at`);--> statement-breakpoint
CREATE TABLE `verified_email_challenge` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`token_digest` text NOT NULL,
	`status` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`issued_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `identified_diagnostic_request`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verified_email_challenge_token_digest_uq` ON `verified_email_challenge` (`token_digest`);--> statement-breakpoint
CREATE INDEX `verified_email_challenge_request_status_idx` ON `verified_email_challenge` (`request_id`,`status`);--> statement-breakpoint
CREATE INDEX `verified_email_challenge_expires_idx` ON `verified_email_challenge` (`expires_at`);