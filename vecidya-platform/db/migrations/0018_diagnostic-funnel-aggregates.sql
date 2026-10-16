CREATE TABLE `diagnostic_funnel_aggregate` (
	`event_day` text NOT NULL,
	`diagnostic_version` text NOT NULL,
	`contract_version` integer NOT NULL,
	`event_type` text NOT NULL,
	`event_count` integer NOT NULL,
	PRIMARY KEY(`event_day`, `diagnostic_version`, `contract_version`, `event_type`),
	CONSTRAINT "diagnostic_funnel_aggregate_day_check" CHECK(length("diagnostic_funnel_aggregate"."event_day") = 10),
	CONSTRAINT "diagnostic_funnel_aggregate_diagnostic_version_check" CHECK("diagnostic_funnel_aggregate"."diagnostic_version" = 'diag-v3-public-v1'),
	CONSTRAINT "diagnostic_funnel_aggregate_contract_version_check" CHECK("diagnostic_funnel_aggregate"."contract_version" = 1),
	CONSTRAINT "diagnostic_funnel_aggregate_event_type_check" CHECK("diagnostic_funnel_aggregate"."event_type" IN ('diagnostic_started', 'diagnostic_completed', 'detailed_report_cta_clicked', 'identified_request_created', 'email_verified', 'detailed_report_first_opened')),
	CONSTRAINT "diagnostic_funnel_aggregate_count_check" CHECK("diagnostic_funnel_aggregate"."event_count" > 0)
);
--> statement-breakpoint
ALTER TABLE `diagnostic_report_access` ADD `first_opened_at` integer;