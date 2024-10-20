import {
  createCourseFromCourseData,
  getCourseByName,
  updateCourse,
  updateCourseFromCourseData,
  updateParOnCourses,
} from "course-data";
import type { CourseData } from "course-data-types";
import { db } from "db/db";
import { courses } from "db/schema";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
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

  .get("/api/courses", () => db.query.courses.findMany())

  .get("/api/courses/:id", ({ params: { id } }) =>
    db.query.courses.findFirst({
      where: eq(courses.id, Number(id)),
      with: { gkData: true, teeBoxes: true, tags: true },
    })
  )

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
      console.error(e);
      return "error";
    }
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
