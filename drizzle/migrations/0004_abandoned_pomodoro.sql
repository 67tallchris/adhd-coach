ALTER TABLE `pomodoro_sessions` ADD COLUMN `abandoned_at` text;--> statement-breakpoint
ALTER TABLE `pomodoro_sessions` ADD COLUMN `actual_duration_min` integer;--> statement-breakpoint
CREATE INDEX `idx_pomo_completed` ON `pomodoro_sessions` (`completed_at`);--> statement-breakpoint
CREATE INDEX `idx_pomo_abandoned` ON `pomodoro_sessions` (`abandoned_at`);
