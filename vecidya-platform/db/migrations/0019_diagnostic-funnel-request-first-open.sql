ALTER TABLE `identified_diagnostic_request` ADD `first_report_opened_at` integer;--> statement-breakpoint
UPDATE `identified_diagnostic_request`
SET `first_report_opened_at` = (
  SELECT MIN(`first_opened_at`)
  FROM `diagnostic_report_access`
  WHERE `request_id` = `identified_diagnostic_request`.`id`
    AND `first_opened_at` IS NOT NULL
)
WHERE EXISTS (
  SELECT 1
  FROM `diagnostic_report_access`
  WHERE `request_id` = `identified_diagnostic_request`.`id`
    AND `first_opened_at` IS NOT NULL
);--> statement-breakpoint
ALTER TABLE `diagnostic_report_access` DROP COLUMN `first_opened_at`;
