CREATE TABLE `business_hours` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`opens_at` text,
	`closes_at` text,
	`is_closed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `business_hours_organization_day_unique` ON `business_hours` (`organization_id`,`day_of_week`);--> statement-breakpoint
CREATE INDEX `business_hours_organization_idx` ON `business_hours` (`organization_id`);--> statement-breakpoint
ALTER TABLE `business_profile` ADD `service_mode` text;--> statement-breakpoint
ALTER TABLE `business_profile` ADD `service_area` text;