-- Ranking History & Tracking Migration
-- Adds tables for tracking course record changes and player rank history

-- ============================================================================
-- Course Record History
-- Tracks every record change over time
-- ============================================================================

CREATE TABLE `course_record_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`record_mode_id` integer NOT NULL,
	`scrape_run_id` integer,
	`previous_player_id` integer,
	`previous_score` text,
	`previous_score_numeric` integer,
	`previous_record_date` text,
	`new_player_id` integer NOT NULL,
	`new_score` text NOT NULL,
	`new_score_numeric` integer NOT NULL,
	`new_record_date` text,
	`change_type` text NOT NULL,
	`score_improvement` integer,
	`detected_at` text NOT NULL,
	`created_at` text,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`record_mode_id`) REFERENCES `record_modes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scrape_run_id`) REFERENCES `scrape_runs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`previous_player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`new_player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

CREATE INDEX `idx_record_history_course` ON `course_record_history` (`course_id`);
--> statement-breakpoint
CREATE INDEX `idx_record_history_new_player` ON `course_record_history` (`new_player_id`);
--> statement-breakpoint
CREATE INDEX `idx_record_history_detected_at` ON `course_record_history` (`detected_at`);
--> statement-breakpoint
CREATE INDEX `idx_record_history_change_type` ON `course_record_history` (`change_type`);
--> statement-breakpoint

-- ============================================================================
-- Player Rank Snapshots
-- Tracks player leaderboard positions over time
-- ============================================================================

CREATE TABLE `player_rank_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snapshot_date` text NOT NULL,
	`player_id` integer NOT NULL,
	`overall_rank` integer NOT NULL,
	`tips_rank` integer,
	`sgt_rank` integer,
	`total_records` integer NOT NULL,
	`tips_records` integer DEFAULT 0,
	`sgt_records` integer DEFAULT 0,
	`rank_change` integer DEFAULT 0,
	`records_gained` integer DEFAULT 0,
	`records_lost` integer DEFAULT 0,
	`created_at` text,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

CREATE INDEX `idx_rank_snapshots_player` ON `player_rank_snapshots` (`player_id`);
--> statement-breakpoint
CREATE INDEX `idx_rank_snapshots_date` ON `player_rank_snapshots` (`snapshot_date`);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_rank_snapshots_date_player` ON `player_rank_snapshots` (`snapshot_date`, `player_id`);

