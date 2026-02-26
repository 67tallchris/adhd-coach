CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`target_date` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `habit_completions` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`date` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_completions_date` ON `habit_completions` (`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_habit_date` ON `habit_completions` (`habit_id`,`date`);--> statement-breakpoint
CREATE TABLE `habits` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`goal_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `nudges` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`type` text DEFAULT 'app_open' NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_nudges_created` ON `nudges` (`created_at`);--> statement-breakpoint
CREATE TABLE `pomodoro_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text,
	`duration_min` integer DEFAULT 25 NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	`notes` text,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_pomo_started` ON `pomodoro_sessions` (`started_at`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`notes` text,
	`status` text DEFAULT 'inbox' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`snooze_until` text,
	`goal_id` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_status` ON `tasks` (`status`);--> statement-breakpoint
CREATE INDEX `idx_tasks_snooze` ON `tasks` (`snooze_until`);