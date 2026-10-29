CREATE TABLE `learn_favorite` (
	`user_id` text NOT NULL,
	`guide_id` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `guide_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learn_favorite_user_updated_idx` ON `learn_favorite` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `learn_guide_progress` (
	`user_id` text NOT NULL,
	`guide_id` text NOT NULL,
	`content_revision` integer NOT NULL,
	`reset_epoch` integer DEFAULT 0 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`last_section_id` text,
	`last_activity_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`hidden_recent_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `guide_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learn_guide_progress_user_activity_idx` ON `learn_guide_progress` (`user_id`,`last_activity_at`);--> statement-breakpoint
CREATE TABLE `learn_section_progress` (
	`user_id` text NOT NULL,
	`guide_id` text NOT NULL,
	`section_id` text NOT NULL,
	`content_revision` integer NOT NULL,
	`checked_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `guide_id`, `section_id`),
	FOREIGN KEY (`user_id`,`guide_id`) REFERENCES `learn_guide_progress`(`user_id`,`guide_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `learn_section_progress_guide_idx` ON `learn_section_progress` (`user_id`,`guide_id`);
