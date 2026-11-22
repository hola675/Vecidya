ALTER TABLE `miniweb_v2_site` ADD `public_slug` text;--> statement-breakpoint
UPDATE `miniweb_v2_site` SET `public_slug` = 'site-' || lower(`id`) WHERE `public_slug` IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `miniweb_v2_site_public_slug_unique` ON `miniweb_v2_site` (`public_slug`);
