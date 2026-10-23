CREATE TABLE `business_media_asset` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`object_key` text NOT NULL,
	`media_type` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`alt_text` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `business_media_asset_object_key_unique` ON `business_media_asset` (`object_key`);--> statement-breakpoint
CREATE INDEX `business_media_asset_organization_created_idx` ON `business_media_asset` (`organization_id`,`created_at`,`id`);