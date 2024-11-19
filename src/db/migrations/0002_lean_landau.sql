PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_courses` (
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
	`par` integer DEFAULT 72,
	`is_par_3` integer DEFAULT false
);
--> statement-breakpoint
INSERT INTO `__new_courses`("id", "name", "alternate_name", "location", "country", "holes", "altitude", "grade", "designer", "difficulty", "graphics", "golf_quality", "description", "opcd_name", "opcd_version", "added_date", "updated_date", "sgt_id", "sgt_splash_url", "sgt_youtube_url", "par", "is_par_3") SELECT "id", "name", "alternate_name", "location", "country", "holes", "altitude", "grade", "designer", "difficulty", "graphics", "golf_quality", "description", "opcd_name", "opcd_version", "added_date", "updated_date", "sgt_id", "sgt_splash_url", "sgt_youtube_url", "par", "is_par_3" FROM `courses`;--> statement-breakpoint
DROP TABLE `courses`;--> statement-breakpoint
ALTER TABLE `__new_courses` RENAME TO `courses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;