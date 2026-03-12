CREATE TABLE `body_doubling_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`started_at` text NOT NULL,
	`last_heartbeat` text NOT NULL,
	`task_type` text DEFAULT 'work' NOT NULL,
	`region` text
);
--> statement-breakpoint
CREATE INDEX `idx_body_session` ON `body_doubling_sessions` (`session_id`);--> statement-breakpoint
CREATE INDEX `idx_body_heartbeat` ON `body_doubling_sessions` (`last_heartbeat`);--> statement-breakpoint
CREATE INDEX `idx_body_task_type` ON `body_doubling_sessions` (`task_type`);
