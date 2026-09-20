CREATE TABLE `organization_service` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`service_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`activated_at` integer,
	`ended_at` integer,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`service_id`) REFERENCES `service_catalog`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_service_unique` ON `organization_service` (`organization_id`,`service_id`);--> statement-breakpoint
CREATE INDEX `organization_service_organization_idx` ON `organization_service` (`organization_id`);--> statement-breakpoint
CREATE TABLE `service_catalog` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_catalog_code_unique` ON `service_catalog` (`code`);
--> statement-breakpoint
INSERT INTO `service_catalog` (`id`, `code`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
  ('service-presence', 'presence', 'Presencia digital', 'Presencia pública y perfil digital para el negocio.', 'active', cast(unixepoch('subsecond') * 1000 as integer), cast(unixepoch('subsecond') * 1000 as integer)),
  ('service-marketing', 'marketing', 'Marketing', 'Acompañamiento de marketing para el negocio.', 'active', cast(unixepoch('subsecond') * 1000 as integer), cast(unixepoch('subsecond') * 1000 as integer)),
  ('service-crm', 'crm', 'CRM', 'Servicio CRM entregado mediante una integración posterior.', 'active', cast(unixepoch('subsecond') * 1000 as integer), cast(unixepoch('subsecond') * 1000 as integer));
