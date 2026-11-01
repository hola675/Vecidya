CREATE TABLE `miniweb_v2_draft` (
	`site_id` text PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`schema_version` integer NOT NULL,
	`document_json` text NOT NULL,
	`updated_by_user_id` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `miniweb_v2_site`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `miniweb_v2_publication` (
	`id` text PRIMARY KEY NOT NULL,
	`site_id` text NOT NULL,
	`revision` integer NOT NULL,
	`schema_version` integer NOT NULL,
	`document_json` text NOT NULL,
	`published_by_user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `miniweb_v2_site`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `miniweb_v2_publication_site_revision_unique` ON `miniweb_v2_publication` (`site_id`,`revision`);--> statement-breakpoint
CREATE INDEX `miniweb_v2_publication_site_created_idx` ON `miniweb_v2_publication` (`site_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `miniweb_v2_site` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`owner_user_id` text NOT NULL,
	`family_key` text NOT NULL,
	`visual_variant` text NOT NULL,
	`draft_revision` integer DEFAULT 0 NOT NULL,
	`published_revision` integer,
	`active_publication_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `miniweb_v2_site_org_family_unique` ON `miniweb_v2_site` (`organization_id`,`family_key`);--> statement-breakpoint
CREATE INDEX `miniweb_v2_site_owner_idx` ON `miniweb_v2_site` (`owner_user_id`);