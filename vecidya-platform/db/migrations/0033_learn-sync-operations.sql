CREATE TABLE `learn_operation_receipt` (
	`user_id` text NOT NULL,
	`operation_id` text NOT NULL,
	`device_id` text NOT NULL,
	`client_sequence` integer NOT NULL,
	`guide_id` text NOT NULL,
	`operation_type` text NOT NULL,
	`base_version` integer NOT NULL,
	`base_reset_epoch` integer NOT NULL,
	`result_version` integer NOT NULL,
	`result_reset_epoch` integer NOT NULL,
	`outcome` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `operation_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learn_operation_receipt_device_sequence_unique` ON `learn_operation_receipt` (`user_id`,`device_id`,`client_sequence`);--> statement-breakpoint
CREATE INDEX `learn_operation_receipt_created_idx` ON `learn_operation_receipt` (`created_at`);--> statement-breakpoint
CREATE TABLE `learn_sync_device` (
	`user_id` text NOT NULL,
	`device_id` text NOT NULL,
	`last_sequence` integer DEFAULT 0 NOT NULL,
	`last_operation_id` text,
	`last_seen_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `device_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learn_sync_device_last_seen_idx` ON `learn_sync_device` (`last_seen_at`);--> statement-breakpoint
ALTER TABLE `learn_favorite` ADD `is_favorite` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `learn_favorite` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `learn_favorite` ADD `operation_id` text;--> statement-breakpoint
ALTER TABLE `learn_guide_progress` ADD `last_operation_id` text;--> statement-breakpoint
ALTER TABLE `learn_section_progress` ADD `reset_epoch` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `learn_section_progress` ADD `version` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `learn_section_progress` ADD `is_checked` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `learn_section_progress` ADD `operation_id` text;