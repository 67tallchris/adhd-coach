CREATE TABLE `video_body_doubling_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`room_name` text NOT NULL,
	`jitsi_room_id` text NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`participant_count` integer DEFAULT 0 NOT NULL,
	`max_participants` integer,
	`description` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`last_activity_at` text DEFAULT (datetime('now')) NOT NULL
);

CREATE INDEX `idx_video_room_name` ON `video_body_doubling_sessions` (`room_name`);
CREATE INDEX `idx_video_jitsi_room` ON `video_body_doubling_sessions` (`jitsi_room_id`);
CREATE INDEX `idx_video_active` ON `video_body_doubling_sessions` (`is_active`);
CREATE INDEX `idx_video_created_at` ON `video_body_doubling_sessions` (`created_at`);

CREATE TABLE `video_body_doubling_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`jitsi_participant_id` text,
	`display_name` text,
	`joined_at` text DEFAULT (datetime('now')) NOT NULL,
	`left_at` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `video_body_doubling_sessions`(`id`) ON DELETE CASCADE
);

CREATE INDEX `idx_video_participant_session` ON `video_body_doubling_participants` (`session_id`);
CREATE INDEX `idx_video_participant_active` ON `video_body_doubling_participants` (`is_active`);
