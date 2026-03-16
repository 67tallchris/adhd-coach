CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
