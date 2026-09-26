CREATE TABLE `billing_account` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`kind` text DEFAULT 'individual' NOT NULL,
	`name` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `billing_account_owner_unique` ON `billing_account` (`owner_user_id`);--> statement-breakpoint
CREATE TABLE `billing_account_promotion` (
	`id` text PRIMARY KEY NOT NULL,
	`billing_account_id` text NOT NULL,
	`promotion_id` text NOT NULL,
	`assigned_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`billing_account_id`) REFERENCES `billing_account`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`promotion_id`) REFERENCES `promotion`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `billing_account_promotion_account_idx` ON `billing_account_promotion` (`billing_account_id`);--> statement-breakpoint
CREATE TABLE `license_price` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_code` text NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`amount_cents` integer NOT NULL,
	`billing_interval` text DEFAULT 'monthly' NOT NULL,
	`effective_from` integer NOT NULL,
	`effective_to` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `license_price_plan_idx` ON `license_price` (`plan_code`,`effective_from`);--> statement-breakpoint
CREATE TABLE `organization_license` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`billing_account_id` text NOT NULL,
	`plan_code` text NOT NULL,
	`price_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`started_at` integer,
	`activated_at` integer,
	`ends_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`billing_account_id`) REFERENCES `billing_account`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`price_id`) REFERENCES `license_price`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `organization_license_organization_idx` ON `organization_license` (`organization_id`);--> statement-breakpoint
CREATE INDEX `organization_license_billing_account_idx` ON `organization_license` (`billing_account_id`);--> statement-breakpoint
CREATE TABLE `portfolio_pricing_tier` (
	`id` text PRIMARY KEY NOT NULL,
	`min_organizations` integer NOT NULL,
	`max_organizations` integer,
	`discount_bps` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`effective_from` integer NOT NULL,
	`effective_to` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `promotion` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`value` integer NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`duration_cycles` integer,
	`min_organizations` integer,
	`max_organizations` integer,
	`new_customer_only` integer DEFAULT false NOT NULL,
	`stackable` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `promotion_code_unique` ON `promotion` (`code`);--> statement-breakpoint
INSERT INTO `license_price` (`id`, `plan_code`, `currency`, `amount_cents`, `billing_interval`, `effective_from`, `effective_to`, `status`, `created_at`, `updated_at`) VALUES
  ('license-price-cuadra-v1', 'cuadra', 'USD', 3900, 'monthly', cast(unixepoch('subsecond') * 1000 as integer), NULL, 'active', cast(unixepoch('subsecond') * 1000 as integer), cast(unixepoch('subsecond') * 1000 as integer)),
  ('license-price-barrio-v1', 'barrio', 'USD', 5900, 'monthly', cast(unixepoch('subsecond') * 1000 as integer), NULL, 'active', cast(unixepoch('subsecond') * 1000 as integer), cast(unixepoch('subsecond') * 1000 as integer)),
  ('license-price-ciudad-v1', 'ciudad', 'USD', 8900, 'monthly', cast(unixepoch('subsecond') * 1000 as integer), NULL, 'active', cast(unixepoch('subsecond') * 1000 as integer), cast(unixepoch('subsecond') * 1000 as integer));
--> statement-breakpoint
INSERT INTO `portfolio_pricing_tier` (`id`, `min_organizations`, `max_organizations`, `discount_bps`, `active`, `effective_from`, `effective_to`, `created_at`, `updated_at`) VALUES
  ('portfolio-tier-1', 1, 1, 0, true, cast(unixepoch('subsecond') * 1000 as integer), NULL, cast(unixepoch('subsecond') * 1000 as integer), cast(unixepoch('subsecond') * 1000 as integer)),
  ('portfolio-tier-2', 2, 2, 1000, true, cast(unixepoch('subsecond') * 1000 as integer), NULL, cast(unixepoch('subsecond') * 1000 as integer), cast(unixepoch('subsecond') * 1000 as integer)),
  ('portfolio-tier-3', 3, 4, 1500, true, cast(unixepoch('subsecond') * 1000 as integer), NULL, cast(unixepoch('subsecond') * 1000 as integer), cast(unixepoch('subsecond') * 1000 as integer)),
  ('portfolio-tier-5', 5, NULL, 2000, true, cast(unixepoch('subsecond') * 1000 as integer), NULL, cast(unixepoch('subsecond') * 1000 as integer), cast(unixepoch('subsecond') * 1000 as integer));