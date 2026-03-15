CREATE TABLE `focus_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` text DEFAULT (datetime('now')) NOT NULL,
	`focus_level` integer NOT NULL,
	`notes` text,
	`context` text
);
--> statement-breakpoint
CREATE INDEX `idx_focus_timestamp` ON `focus_logs` (`timestamp`);
--> statement-breakpoint
CREATE INDEX `idx_focus_level` ON `focus_logs` (`focus_level`);

CREATE TABLE `focus_correlations` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`avg_focus_level` integer NOT NULL,
	`habits_completed` text DEFAULT '[]' NOT NULL,
	`pomodoro_sessions` integer DEFAULT 0 NOT NULL,
	`tasks_completed` integer DEFAULT 0 NOT NULL,
	`correlation_scores` text DEFAULT '{}' NOT NULL,
	`computed_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_focus_corr_date` ON `focus_correlations` (`date`);
