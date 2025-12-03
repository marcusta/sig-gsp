CREATE TABLE `course_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`record_mode_id` integer NOT NULL,
	`player_id` integer,
	`team_id` integer,
	`score` text NOT NULL,
	`score_numeric` integer NOT NULL,
	`record_date` text,
	`scraped_at` text NOT NULL,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`record_mode_id`) REFERENCES `record_modes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sgt_username` text NOT NULL,
	`display_name` text NOT NULL,
	`country_code` text,
	`avatar_url` text,
	`first_seen_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_sgt_username_unique` ON `players` (`sgt_username`);
--> statement-breakpoint
CREATE TABLE `record_modes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tee_type` text NOT NULL,
	`player_format` text NOT NULL,
	`putting_mode` text NOT NULL,
	`is_team` integer DEFAULT false NOT NULL,
	`team_size` integer DEFAULT 1 NOT NULL,
	`sgt_api_url` text,
	`display_name` text NOT NULL,
	`short_name` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `scrape_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	`status` text NOT NULL,
	`record_modes_scraped` text,
	`courses_processed` integer DEFAULT 0,
	`records_found` integer DEFAULT 0,
	`records_created` integer DEFAULT 0,
	`records_updated` integer DEFAULT 0,
	`players_created` integer DEFAULT 0,
	`error_message` text,
	`created_at` text
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	`position` integer DEFAULT 1 NOT NULL,
	`created_at` text,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`record_mode_id` integer NOT NULL,
	`team_hash` text NOT NULL,
	`created_at` text,
	FOREIGN KEY (`record_mode_id`) REFERENCES `record_modes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_team_hash_unique` ON `teams` (`team_hash`);
-- Seed record_modes with known configurations
INSERT INTO record_modes (
		tee_type,
		player_format,
		putting_mode,
		is_team,
		team_size,
		sgt_api_url,
		display_name,
		short_name,
		is_active
	)
VALUES -- Phase 1: Active (singles with putting)
	(
		'tips',
		'single',
		'putting',
		0,
		1,
		'https://simulatorgolftour.com/sgt-api/courses/course-records',
		'Tips Single',
		'Tips',
		1
	),
	(
		'sgt',
		'single',
		'putting',
		0,
		1,
		'https://simulatorgolftour.com/sgt-api/courses/course-records',
		'SGT Single',
		'SGT',
		1
	),
	-- Future: Team modes (putting)
	(
		'tips',
		'2-man-scramble',
		'putting',
		1,
		2,
		'https://simulatorgolftour.com/sgt-api/courses/course-team-records/TCRT1',
		'Tips 2-Man Scramble',
		'Tips 2M',
		0
	),
	(
		'tips',
		'4-man-scramble',
		'putting',
		1,
		4,
		'https://simulatorgolftour.com/sgt-api/courses/course-team-records/TCRT2',
		'Tips 4-Man Scramble',
		'Tips 4M',
		0
	),
	(
		'sgt',
		'2-man-scramble',
		'putting',
		1,
		2,
		NULL,
		'SGT 2-Man Scramble',
		'SGT 2M',
		0
	),
	(
		'sgt',
		'4-man-scramble',
		'putting',
		1,
		4,
		NULL,
		'SGT 4-Man Scramble',
		'SGT 4M',
		0
	),
	(
		'tips',
		'alt-shot',
		'putting',
		1,
		2,
		NULL,
		'Tips Alt-Shot',
		'Tips AS',
		0
	),
	(
		'sgt',
		'alt-shot',
		'putting',
		1,
		2,
		NULL,
		'SGT Alt-Shot',
		'SGT AS',
		0
	),
	-- Future: Auto-putt variants
	(
		'tips',
		'single',
		'autoputt',
		0,
		1,
		NULL,
		'Tips Single (Auto)',
		'Tips A',
		0
	),
	(
		'sgt',
		'single',
		'autoputt',
		0,
		1,
		NULL,
		'SGT Single (Auto)',
		'SGT A',
		0
	);