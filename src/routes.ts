import {
  createCourseFromCourseData,
  getCourseByName,
  getCourses,
  updateCourse,
  updateCourseFromCourseData,
  updateParOnCourses,
} from "course-data";
import type { CourseData } from "course-data-types";
import { db } from "db/db";
import { courses } from "db/schema";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import logger from "logger";
import { updateTeeBoxesFromCourseData } from "teebox-data";

const routes = new Elysia()
  // Home route
  .get("/", () => ({
    message: "Welcome to the Bun server with Elysia!",
  }))

  // Example route with a parameter
  .get("/hello/:name", ({ params: { name } }) => ({
    message: `Hello, ${name}!`,
  }))

  .get("/api/courses", async () => {
    const courses = await db.query.courses.findMany();
    logger.info(`Getting ${courses.length} courses`);
    return courses;
  })

  .get("/api/courses/:id", async ({ params: { id } }) => {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, Number(id)),
      with: { gkData: true, teeBoxes: true, tags: true },
    });
    if (!course) {
      logger.error(`Course not found ${id}`);
      return { error: "Course not found" };
    }
    logger.info(`Getting course ${course.name}`);
    return course;
  })

  .post("/api/add-par-to-all-courses", async () => {
    const courseList = await db.query.courses.findMany();
    const [failedCourses, successCourses] = await updateParOnCourses(
      courseList
    );
    return {
      failedCourses,
      successCourses,
    };
  })

  .post("/api/update-from-filesystem", async ({ body }) => {
    try {
      const courseChangeRequest = body as UpdateFromFilesystemBody;
      let courseFromDb = await getCourseByName(courseChangeRequest.courseName);
      if (!courseFromDb) {
        console.log("course not found, creating new course");
        courseFromDb = await createCourseFromCourseData(
          courseChangeRequest.gkdFileContents
        );
      }

      const courseToSave = {
        ...courseFromDb,
        opcdName: courseChangeRequest.opcdName,
        opcdVersion: courseChangeRequest.opcdInfo.opcdVersion,
        addedDate: courseChangeRequest.opcdInfo.addedDate,
        updatedDate: courseChangeRequest.opcdInfo.updatedDate,
        sgtId: courseChangeRequest.sgtInfo.sgtId,
        sgtSplashUrl: courseChangeRequest.sgtInfo.sgtSplashUrl,
        sgtYoutubeUrl: courseChangeRequest.sgtInfo.sgtYoutubeUrl,
        par: courseChangeRequest.coursePar,
      };
      logger.info(
        `update-from-filesystem: Updating course ${courseFromDb.name}`
      );
      await updateCourseFromCourseData(
        courseFromDb.id,
        courseChangeRequest.gkdFileContents
      );
      await updateCourse(courseToSave);
      await updateTeeBoxesFromCourseData(
        courseFromDb.id,
        courseChangeRequest.gkdFileContents
      );
      return "success" + courseFromDb.name;
    } catch (e) {
      logger.error(`update-from-filesystem: Error updating course ${e}`);
      return "error";
    }
  })

  .get("/api/course-sync-list", async () => {
    const courses = await getCourses();
    const coursesToSync: {
      name: string | null;
      opcdName: string | null;
      addedDate: string | null;
      updatedDate: string | null;
    }[] = courses.map((course) => ({
      name: course.name,
      opcdName: course.opcdName,
      addedDate: course.addedDate,
      updatedDate: course.updatedDate,
    }));
    return coursesToSync;
  });
export default routes;

type UpdateFromFilesystemBody = {
  courseName: string;
  opcdName: string;
  gkdFileContents: CourseData;
  coursePar: number;
  sgtInfo: {
    sgtId: string;
    sgtSplashUrl: string;
    sgtYoutubeUrl: string;
  };
  opcdInfo: {
    addedDate: string;
    updatedDate: string;
    opcdVersion: string;
  };
};
