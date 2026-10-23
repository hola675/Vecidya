CREATE TABLE `business_profile_publication` (
	`organization_id` text PRIMARY KEY NOT NULL,
	`draft_revision` integer DEFAULT 0 NOT NULL,
	`published_version` integer DEFAULT 0 NOT NULL,
	`published_slug` text,
	`snapshot_schema_version` integer,
	`snapshot_json` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `business_profile_publication_slug_unique` ON `business_profile_publication` (`published_slug`);