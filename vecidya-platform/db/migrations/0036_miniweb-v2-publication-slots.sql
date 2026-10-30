CREATE TABLE `miniweb_v2_publication_slot` (
	`site_id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`reserved_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `miniweb_v2_site`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `miniweb_v2_slot_owner_idx` ON `miniweb_v2_publication_slot` (`owner_user_id`,`reserved_at`);