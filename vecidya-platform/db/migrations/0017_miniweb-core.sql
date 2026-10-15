CREATE TABLE `miniweb_module` (
	`id` text PRIMARY KEY NOT NULL,
	`miniweb_site_id` text NOT NULL,
	`module_type` text NOT NULL,
	`module_version` integer NOT NULL,
	`enabled` integer NOT NULL,
	`sort_order` integer NOT NULL,
	`layout_variant` text NOT NULL,
	`settings_json` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`miniweb_site_id`) REFERENCES `miniweb_site`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `miniweb_module_site_type_unique` ON `miniweb_module` (`miniweb_site_id`,`module_type`);--> statement-breakpoint
CREATE INDEX `miniweb_module_site_order_idx` ON `miniweb_module` (`miniweb_site_id`,`sort_order`,`module_type`);--> statement-breakpoint
CREATE TABLE `miniweb_site` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`template_key` text NOT NULL,
	`template_version` integer NOT NULL,
	`layout_variant` text NOT NULL,
	`published_configuration_json` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `miniweb_site_organization_unique` ON `miniweb_site` (`organization_id`);