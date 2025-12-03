import { relations } from "drizzle-orm";
import {
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import type { CourseData } from "../course-data-types";

export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  alternateName: text("alternate_name").default(""),
  location: text("location").notNull(),
  country: text("country").default("USA"),
  holes: integer("holes").notNull(),
  altitude: integer("altitude").default(0),
  grade: integer("grade").default(0),
  designer: text("designer").default(""),
  difficulty: integer("difficulty").default(0),
  graphics: integer("graphics").default(0),
  golfQuality: integer("golf_quality").default(0),
  description: text("description").default("-"),
  opcdName: text("opcd_name").default(""),
  opcdVersion: text("opcd_version").default(""),
  addedDate: text("added_date").default(""),
  updatedDate: text("updated_date").default(""),
  sgtId: text("sgt_id").default(""),
  sgtSplashUrl: text("sgt_splash_url").default(""),
  sgtYoutubeUrl: text("sgt_youtube_url").default(""),
  par: integer("par").default(72),
  isPar3: integer("is_par_3", { mode: "boolean" }).default(false),
  largestElevationDrop: integer("largest_elevation_drop").default(0),
  averageElevationDifference: integer("average_elevation_difference").default(
    0
  ),
  totalHazards: integer("total_hazards").default(0),
  islandGreens: integer("island_greens").default(0),
  totalWaterHazards: integer("total_water_hazards").default(0),
  totalInnerOOB: integer("total_inner_oob").default(0),
  rangeEnabled: integer("range_enabled", { mode: "boolean" }).default(false),
  enabled: integer("enabled", { mode: "boolean" }).default(true),
});

export type NewCourse = typeof courses.$inferInsert;
export type Course = typeof courses.$inferSelect;

export const courseGkDataRelations = relations(courses, ({ one, many }) => ({
  gkData: one(gkData, {
    fields: [courses.id],
    references: [gkData.courseId],
  }),
  teeBoxes: many(teeBoxes),
  tags: many(courseToTags),
}));

export const teeBoxes = sqliteTable("tee_boxes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  name: text("name").notNull(),
  rating: real("rating").notNull().default(0),
  slope: real("slope").notNull().default(0),
  length: real("length").notNull().default(0),
});
export const teeBoxCourseRelations = relations(teeBoxes, ({ one }) => ({
  courses: one(courses, {
    fields: [teeBoxes.courseId],
    references: [courses.id],
  }),
}));
export type NewTeeBox = typeof teeBoxes.$inferInsert;
export type TeeBox = typeof teeBoxes.$inferSelect;

export const gkData = sqliteTable("gk_data", {
  courseId: integer("course_id")
    .primaryKey()
    .notNull()
    .references(() => courses.id),
  gkData: text("data", { mode: "json" }).$type<CourseData | null>(),
});

export type NewGkData = typeof gkData.$inferInsert;
export type GkData = typeof gkData.$inferSelect;

export type CourseWithGkData = Course & {
  gkData: GkData;
  teeBoxes: TeeBox[];
};

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});
export const tagsRelations = relations(tags, ({ many }) => ({
  courseToTags: many(courseToTags),
}));

export const courseToTags = sqliteTable(
  "course_to_tags",
  {
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.courseId, t.tagId] }),
  })
);
export const courseToTagsRelations = relations(courseToTags, ({ one }) => ({
  tags: one(tags, {
    fields: [courseToTags.tagId],
    references: [tags.id],
  }),
  courses: one(courses, {
    fields: [courseToTags.courseId],
    references: [courses.id],
  }),
}));

// ============================================================================
// Course Records Feature Tables
// ============================================================================

// Record Modes - flat configuration table for all record type combinations
export const recordModes = sqliteTable("record_modes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teeType: text("tee_type").notNull(),
  playerFormat: text("player_format").notNull(),
  puttingMode: text("putting_mode").notNull(),
  isTeam: integer("is_team", { mode: "boolean" }).notNull().default(false),
  teamSize: integer("team_size").notNull().default(1),
  sgtApiUrl: text("sgt_api_url"),
  displayName: text("display_name").notNull(),
  shortName: text("short_name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at"),
});

export type RecordMode = typeof recordModes.$inferSelect;
export type NewRecordMode = typeof recordModes.$inferInsert;

// Players - SGT player information
export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sgtUsername: text("sgt_username").notNull().unique(),
  displayName: text("display_name").notNull(),
  countryCode: text("country_code"),
  avatarUrl: text("avatar_url"),
  firstSeenAt: text("first_seen_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

// Teams - team compositions for team modes
export const teams = sqliteTable("teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  recordModeId: integer("record_mode_id")
    .notNull()
    .references(() => recordModes.id),
  teamHash: text("team_hash").notNull().unique(),
  createdAt: text("created_at"),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

// Team Members - links players to teams
export const teamMembers = sqliteTable("team_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id),
  position: integer("position").notNull().default(1),
  createdAt: text("created_at"),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;

// Course Records - main records table
export const courseRecords = sqliteTable("course_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id),
  recordModeId: integer("record_mode_id")
    .notNull()
    .references(() => recordModes.id),
  playerId: integer("player_id").references(() => players.id),
  teamId: integer("team_id").references(() => teams.id),
  score: text("score").notNull(),
  scoreNumeric: integer("score_numeric").notNull(),
  recordDate: text("record_date"),
  scrapedAt: text("scraped_at").notNull(),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export type CourseRecord = typeof courseRecords.$inferSelect;
export type NewCourseRecord = typeof courseRecords.$inferInsert;

// Scrape Runs - track scraping history
export const scrapeRuns = sqliteTable("scrape_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  status: text("status").notNull(),
  recordModesScraped: text("record_modes_scraped"),
  coursesProcessed: integer("courses_processed").default(0),
  recordsFound: integer("records_found").default(0),
  recordsCreated: integer("records_created").default(0),
  recordsUpdated: integer("records_updated").default(0),
  playersCreated: integer("players_created").default(0),
  errorMessage: text("error_message"),
  createdAt: text("created_at"),
});

export type ScrapeRun = typeof scrapeRuns.$inferSelect;
export type NewScrapeRun = typeof scrapeRuns.$inferInsert;

// ============================================================================
// Course Records Relations
// ============================================================================

export const recordModesRelations = relations(recordModes, ({ many }) => ({
  courseRecords: many(courseRecords),
  teams: many(teams),
}));

export const playersRelations = relations(players, ({ many }) => ({
  courseRecords: many(courseRecords),
  teamMemberships: many(teamMembers),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  recordMode: one(recordModes, {
    fields: [teams.recordModeId],
    references: [recordModes.id],
  }),
  members: many(teamMembers),
  courseRecords: many(courseRecords),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  player: one(players, {
    fields: [teamMembers.playerId],
    references: [players.id],
  }),
}));

export const courseRecordsRelations = relations(courseRecords, ({ one }) => ({
  course: one(courses, {
    fields: [courseRecords.courseId],
    references: [courses.id],
  }),
  recordMode: one(recordModes, {
    fields: [courseRecords.recordModeId],
    references: [recordModes.id],
  }),
  player: one(players, {
    fields: [courseRecords.playerId],
    references: [players.id],
  }),
  team: one(teams, {
    fields: [courseRecords.teamId],
    references: [teams.id],
  }),
}));
