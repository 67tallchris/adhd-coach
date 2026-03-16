CREATE TABLE `video_body_doubling_announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`wait_until` text NOT NULL,
	`late_join_until` text,
	`session_duration_min` integer DEFAULT 25 NOT NULL,
	`interested_count` integer DEFAULT 0 NOT NULL,
	`joined_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `video_body_doubling_sessions`(`id`) ON DELETE CASCADE
);

CREATE INDEX `idx_announcement_session` ON `video_body_doubling_announcements` (`session_id`);
CREATE INDEX `idx_announcement_status` ON `video_body_doubling_announcements` (`status`);
CREATE INDEX `idx_announcement_wait_until` ON `video_body_doubling_announcements` (`wait_until`);
CREATE INDEX `idx_announcement_created_at` ON `video_body_doubling_announcements` (`created_at`);
