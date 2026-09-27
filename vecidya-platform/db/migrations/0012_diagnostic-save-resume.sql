CREATE TABLE `diagnostic_saved_snapshot` (
	`session_id` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`current_question_id` text,
	`active_answers_json` text NOT NULL,
	`questions_seen` integer NOT NULL,
	`questions_answered` integer NOT NULL,
	`diagnostic_version` text NOT NULL,
	`question_bank_version` integer NOT NULL,
	`routing_version` integer NOT NULL,
	`scoring_version` integer NOT NULL,
	`result_schema_version` integer NOT NULL,
	`canonical_hash` text NOT NULL,
	`recovery_lookup_digest` text NOT NULL,
	`saved_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `diagnostic_session`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diagnostic_saved_snapshot_recovery_digest_unique` ON `diagnostic_saved_snapshot` (`recovery_lookup_digest`);--> statement-breakpoint
CREATE INDEX `diagnostic_saved_snapshot_expires_idx` ON `diagnostic_saved_snapshot` (`expires_at`);