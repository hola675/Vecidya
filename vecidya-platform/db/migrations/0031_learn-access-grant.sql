CREATE TABLE `organization_learn_access_grant` (
	`member_id` text PRIMARY KEY NOT NULL,
	`granted_by_user_id` text NOT NULL,
	`granted_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`granted_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
