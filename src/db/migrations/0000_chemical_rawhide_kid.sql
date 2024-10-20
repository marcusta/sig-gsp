CREATE TABLE `course_to_tags` (
	`course_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`course_id`, `tag_id`),
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`alternate_name` text DEFAULT '',
	`location` text NOT NULL,
	`country` text DEFAULT 'USA',
	`holes` integer NOT NULL,
	`altitude` integer DEFAULT 0,
	`grade` integer DEFAULT 0,
	`designer` text DEFAULT '',
	`difficulty` integer DEFAULT 0,
	`graphics` integer DEFAULT 0,
	`golf_quality` integer DEFAULT 0,
	`description` text DEFAULT '-',
	`opcd_name` text DEFAULT '',
	`opcd_version` text DEFAULT '',
	`added_date` text DEFAULT '',
	`updated_date` text DEFAULT '',
	`sgt_id` text DEFAULT '',
	`sgt_splash_url` text DEFAULT '',
	`sgt_youtube_url` text DEFAULT '',
	`par` integer DEFAULT 72
);
--> statement-breakpoint
CREATE TABLE `gk_data` (
	`course_id` integer PRIMARY KEY NOT NULL,
	`data` text,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tee_boxes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`name` text NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`slope` real DEFAULT 0 NOT NULL,
	`length` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
