CREATE TABLE `devices` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`fcm_token` text NOT NULL,
	`platform` text DEFAULT 'android' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`last_active_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_devices_user` ON `devices` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_devices_token` ON `devices` (`fcm_token`);
