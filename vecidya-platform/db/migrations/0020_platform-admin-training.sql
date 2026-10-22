CREATE TABLE `organization_training_assignment` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`training_slug` text NOT NULL,
	`assigned_by` text NOT NULL,
	`assigned_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_training_assignment_unique` ON `organization_training_assignment` (`organization_id`,`training_slug`);--> statement-breakpoint
CREATE INDEX `organization_training_assignment_org_idx` ON `organization_training_assignment` (`organization_id`);--> statement-breakpoint
CREATE TABLE `organization_training_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`assignment_id`) REFERENCES `organization_training_assignment`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_training_progress_member_unique` ON `organization_training_progress` (`assignment_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `organization_training_progress_assignment_idx` ON `organization_training_progress` (`assignment_id`);--> statement-breakpoint
CREATE TABLE `organization_training_progress_history` (
	`id` text PRIMARY KEY NOT NULL,
	`progress_id` text NOT NULL,
	`actor_user_id` text NOT NULL,
	`previous_status` text NOT NULL,
	`new_status` text NOT NULL,
	`reason` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`progress_id`) REFERENCES `organization_training_progress`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `organization_training_progress_history_progress_idx` ON `organization_training_progress_history` (`progress_id`,`created_at`);