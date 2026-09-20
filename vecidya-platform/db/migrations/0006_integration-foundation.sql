CREATE TABLE `integration_connection` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`provider` text NOT NULL,
	`external_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `integration_connection_provider_external_unique` ON `integration_connection` (`provider`,`external_id`);--> statement-breakpoint
CREATE INDEX `integration_connection_organization_idx` ON `integration_connection` (`organization_id`);