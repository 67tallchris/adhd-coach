CREATE TABLE `user_levels` (
	`id` text PRIMARY KEY NOT NULL,
	`current_xp` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`tier` text DEFAULT 'wood' NOT NULL,
	`tier_progress` integer DEFAULT 0 NOT NULL,
	`focus_mode` text,
	`next_unlock_level` integer DEFAULT 2 NOT NULL,
	`has_seen_onboarding` integer DEFAULT 0 NOT NULL,
	`last_level_up_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);

CREATE TABLE `xp_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`xp_amount` integer NOT NULL,
	`source` text NOT NULL,
	`description` text NOT NULL,
	`metadata` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_xp_source` ON `xp_logs` (`source`);
--> statement-breakpoint
CREATE INDEX `idx_xp_created_at` ON `xp_logs` (`created_at`);
