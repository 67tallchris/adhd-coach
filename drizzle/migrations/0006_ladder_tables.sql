CREATE TABLE `ladder_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`task_id` text,
	`goal_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE NO ACTION ON DELETE SET NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE NO ACTION ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `ladder_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`ladder_id` text NOT NULL,
	`step_number` integer NOT NULL,
	`title` text NOT NULL,
	`notes` text,
	`is_completed` integer DEFAULT false NOT NULL,
	`completed_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`ladder_id`) REFERENCES `ladder_goals`(`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `idx_ladder_status` ON `ladder_goals` (`status`);
--> statement-breakpoint
CREATE INDEX `idx_ladder_task` ON `ladder_goals` (`task_id`);
--> statement-breakpoint
CREATE INDEX `idx_ladder_goal` ON `ladder_goals` (`goal_id`);
--> statement-breakpoint
CREATE INDEX `idx_step_ladder` ON `ladder_steps` (`ladder_id`);
--> statement-breakpoint
CREATE INDEX `idx_step_number` ON `ladder_steps` (`step_number`);
--> statement-breakpoint
CREATE INDEX `idx_step_completed` ON `ladder_steps` (`is_completed`);
