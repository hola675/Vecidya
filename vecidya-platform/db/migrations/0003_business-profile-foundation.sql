CREATE TABLE `business_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`display_name` text NOT NULL,
	`slug` text NOT NULL,
	`short_description` text,
	`description` text,
	`category` text,
	`city` text,
	`country` text,
	`phone` text,
	`public_email` text,
	`website_url` text,
	`logo_url` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `business_profile_organization_unique` ON `business_profile` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `business_profile_slug_unique` ON `business_profile` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `member_organization_user_unique` ON `member` (`organization_id`,`user_id`);