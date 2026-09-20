CREATE TABLE `business_profile_governance` (
	`id` text PRIMARY KEY NOT NULL,
	`business_profile_id` text NOT NULL,
	`verification_status` text DEFAULT 'unverified' NOT NULL,
	`verified_at` integer,
	`verified_by` text,
	`platform_status` text DEFAULT 'active' NOT NULL,
	`suspended_at` integer,
	`suspended_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`business_profile_id`) REFERENCES `business_profile`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`verified_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`suspended_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `business_profile_governance_profile_unique` ON `business_profile_governance` (`business_profile_id`);--> statement-breakpoint
CREATE TABLE `platform_audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`previous_value` text,
	`new_value` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`actor_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `platform_audit_log_entity_idx` ON `platform_audit_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `platform_audit_log_organization_idx` ON `platform_audit_log` (`organization_id`);--> statement-breakpoint
CREATE INDEX `platform_audit_log_created_idx` ON `platform_audit_log` (`created_at`);