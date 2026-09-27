CREATE TABLE `diagnostic_event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_uuid` text NOT NULL,
	`session_id` text NOT NULL,
	`analytics_schema_version` integer NOT NULL,
	`event_type` text NOT NULL,
	`question_id` text,
	`section_id` text,
	`answer_kind` text,
	`route_signature` text,
	`questions_seen` integer,
	`questions_answered` integer,
	`applicable_questions` integer,
	`received_at` integer NOT NULL,
	`retention_until` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `diagnostic_session`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diagnostic_event_uuid_unique` ON `diagnostic_event` (`event_uuid`);--> statement-breakpoint
CREATE INDEX `diagnostic_event_session_idx` ON `diagnostic_event` (`session_id`);--> statement-breakpoint
CREATE INDEX `diagnostic_event_type_question_idx` ON `diagnostic_event` (`event_type`,`question_id`);--> statement-breakpoint
CREATE INDEX `diagnostic_event_retention_idx` ON `diagnostic_event` (`retention_until`);--> statement-breakpoint
ALTER TABLE `diagnostic_session` ADD `save_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `diagnostic_session` ADD `resume_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `diagnostic_session` ADD `last_saved_at` integer;--> statement-breakpoint
ALTER TABLE `diagnostic_session` ADD `last_resumed_at` integer;