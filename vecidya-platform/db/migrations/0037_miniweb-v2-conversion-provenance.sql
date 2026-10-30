ALTER TABLE `miniweb_v2_site` ADD `source_organization_id` text;--> statement-breakpoint
ALTER TABLE `miniweb_v2_site` ADD `source_publication_version` integer;--> statement-breakpoint
ALTER TABLE `miniweb_v2_site` ADD `conversion_migration_version` integer;--> statement-breakpoint
ALTER TABLE `miniweb_v2_site` ADD `conversion_report_json` text;--> statement-breakpoint
ALTER TABLE `miniweb_v2_site` ADD `conversion_consented_at` integer;--> statement-breakpoint
ALTER TABLE `miniweb_v2_site` ADD `conversion_consented_by_user_id` text;