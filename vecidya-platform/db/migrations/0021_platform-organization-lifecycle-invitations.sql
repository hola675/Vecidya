CREATE TABLE `platform_organization_lifecycle` (
	`organization_id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`intended_owner_email` text NOT NULL,
	`owner_user_id` text,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `platform_organization_lifecycle_status_idx` ON `platform_organization_lifecycle` (`status`,`updated_at`);--> statement-breakpoint
CREATE TABLE `platform_owner_invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`token_digest` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_by` text NOT NULL,
	`accepted_by` text,
	`accepted_at` integer,
	`acceptance_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`accepted_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `platform_owner_invitation_token_digest_unique` ON `platform_owner_invitation` (`token_digest`);--> statement-breakpoint
CREATE INDEX `platform_owner_invitation_org_idx` ON `platform_owner_invitation` (`organization_id`,`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `platform_owner_invitation_pending_org_unique` ON `platform_owner_invitation` (`organization_id`) WHERE "platform_owner_invitation"."status" = 'pending';