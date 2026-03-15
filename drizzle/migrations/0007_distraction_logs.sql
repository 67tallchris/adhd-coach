CREATE TABLE `distraction_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text,
	`timestamp` text DEFAULT (datetime('now')) NOT NULL,
	`distraction_type` text NOT NULL,
	`notes` text,
	`action` text NOT NULL,
	`time_elapsed` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `pomodoro_sessions`(`id`) ON UPDATE NO ACTION ON DELETE SET NULL
);
--> statement-breakpoint
CREATE INDEX `idx_distraction_session` ON `distraction_logs` (`session_id`);
--> statement-breakpoint
CREATE INDEX `idx_distraction_type` ON `distraction_logs` (`distraction_type`);
--> statement-breakpoint
CREATE INDEX `idx_distraction_timestamp` ON `distraction_logs` (`timestamp`);
