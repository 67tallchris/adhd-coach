CREATE TABLE `streak_config` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`weekly_goal` integer DEFAULT 5 NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_streak_type` ON `streak_config` (`type`);
--> statement-breakpoint
-- Insert default streak configs for pomodoro, habits, and tasks
INSERT INTO `streak_config` (`id`, `type`, `weekly_goal`, `timezone`) 
VALUES 
  ('streak_pomodoro', 'pomodoro', 5, 'UTC'),
  ('streak_habits', 'habits', 5, 'UTC'),
  ('streak_tasks', 'tasks', 10, 'UTC');
