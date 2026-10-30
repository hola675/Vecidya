CREATE TABLE `billing_miniweb_capacity_extension` (
	`id` text PRIMARY KEY NOT NULL,
	`billing_account_id` text NOT NULL,
	`kind` text DEFAULT 'cuadra_extra' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`reason` text NOT NULL,
	`granted_by_user_id` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`billing_account_id`) REFERENCES `billing_account`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`granted_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `billing_miniweb_capacity_extension_account_idx` ON `billing_miniweb_capacity_extension` (`billing_account_id`,`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `billing_miniweb_capacity_extension_idempotency_unique` ON `billing_miniweb_capacity_extension` (`idempotency_key`);