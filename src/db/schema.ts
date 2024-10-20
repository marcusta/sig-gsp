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
