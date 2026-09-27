CREATE TABLE `diagnostic_answer` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`question_id` text NOT NULL,
	`question_version` integer NOT NULL,
	`answer_value` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `diagnostic_session`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diagnostic_answer_session_question_unique` ON `diagnostic_answer` (`session_id`,`question_id`);--> statement-breakpoint
CREATE INDEX `diagnostic_answer_session_idx` ON `diagnostic_answer` (`session_id`);--> statement-breakpoint
CREATE TABLE `diagnostic_result` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`diagnostic_version` text NOT NULL,
	`result_schema_version` integer NOT NULL,
	`state` text NOT NULL,
	`overall_score` integer,
	`confidence_level` text NOT NULL,
	`structured_result_json` text NOT NULL,
	`dimension_results_json` text NOT NULL,
	`completion_hash` text NOT NULL,
	`retention_until` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `diagnostic_session`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diagnostic_result_session_unique` ON `diagnostic_result` (`session_id`);--> statement-breakpoint
CREATE INDEX `diagnostic_result_completion_hash_idx` ON `diagnostic_result` (`completion_hash`);--> statement-breakpoint
CREATE TABLE `diagnostic_session` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'STARTED' NOT NULL,
	`token_hash` text NOT NULL,
	`diagnostic_version` text NOT NULL,
	`question_bank_version` integer NOT NULL,
	`routing_version` integer NOT NULL,
	`scoring_version` integer NOT NULL,
	`result_schema_version` integer NOT NULL,
	`profile` text,
	`stage` text,
	`goal` text,
	`started_at` integer NOT NULL,
	`last_activity_at` integer NOT NULL,
	`completed_at` integer,
	`snapshot_expires_at` integer NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`current_question_id` text,
	`questions_seen` integer DEFAULT 0 NOT NULL,
	`questions_answered` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `diagnostic_session_status_idx` ON `diagnostic_session` (`status`);--> statement-breakpoint
CREATE INDEX `diagnostic_session_last_activity_idx` ON `diagnostic_session` (`last_activity_at`);