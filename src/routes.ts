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
import { readFile } from "fs/promises";
import logger from "logger";
import {
  teeBoxesFromCourseData,
  teeBoxTotalDistanceFromCourseData,
  updateTeeBoxesFromCourseData,
} from "teebox-data";

const routes = new Elysia()
  // Home route
  .get("/gsp-welcome", () => ({
    message: "Welcome to the Bun server with Elysia!",
  }))

  .get("/api/courses", async () => {
    const courseList = await db.query.courses.findMany({
      with: { teeBoxes: true, tags: true },
    });
    const result = [];
    console.log("getting courseList", courseList.length);
    for (const course of courseList) {
      if (course.sgtId !== "") {
        result.push(course);
      } else {
        logger.debug(`Skipping course ${course.name} as it has no sgtId`);
      }
    }
    console.log("returning courseList", result.length);
    return result;
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
    return {
      ...course,
      gkData: course.gkData?.gkData,
    };
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

  .post("/api/update-from-filesystem", async ({ body, set }) => {
    const courseChangeRequest = body as UpdateFromFilesystemBody;
    try {
      let courseFromDb = await getCourseByName(courseChangeRequest.courseName);
      if (!courseFromDb) {
        console.log("course not found, creating new course");
        courseFromDb = await createCourseFromCourseData(
          courseChangeRequest.courseName,
          courseChangeRequest.gkdFileContents
        );
      }

      const courseToSave = {
        ...courseFromDb,
        opcdName: courseChangeRequest.opcdName,
        opcdVersion: courseChangeRequest.opcdInfo.opcdVersion,
        addedDate: courseChangeRequest.opcdInfo.addedDate,
        updatedDate: courseChangeRequest.opcdInfo.updatedDate,
        sgtId: courseChangeRequest.sgtInfo?.sgtId ?? courseFromDb.sgtId ?? "",
        sgtSplashUrl:
          courseChangeRequest.sgtInfo?.sgtSplashUrl ??
          courseFromDb.sgtSplashUrl ??
          "",
        sgtYoutubeUrl:
          courseChangeRequest.sgtInfo?.sgtYoutubeUrl ??
          courseFromDb.sgtYoutubeUrl ??
          "",
        par: courseChangeRequest.coursePar,
        isPar3:
          courseFromDb.holes === 0
            ? false
            : courseChangeRequest.coursePar / courseFromDb.holes === 3,
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
      let missingSgtInfo = "";
      if (!courseChangeRequest.sgtInfo) {
        missingSgtInfo = " !!! Missing sgt info";
        logger.warn(
          `update-from-filesystem: ${courseChangeRequest.courseName} Missing sgt info`
        );
      }

      return "success" + courseFromDb.name + missingSgtInfo;
    } catch (e) {
      logger.error(
        `update-from-filesystem: ${courseChangeRequest.courseName} Error updating course ${e}`,
        e
      );
      set.status = 500;
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
  })

  .get("/assets/*", async ({ path, set }) => {
    try {
      const filePath = `./public/gsp${path}`;
      const file = await readFile(filePath);
      // Set appropriate content-type based on file extension
      const ext = path.split(".").pop();
      if (ext === "css") set.headers["Content-Type"] = "text/css";
      if (ext === "js") set.headers["Content-Type"] = "application/javascript";
      return file;
    } catch (e) {
      set.status = 404;
      return { error: "Asset not found" };
    }
  })

  .get("/api/courses/:id/gkd-info", async ({ params: { id } }) => {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, Number(id)),
      with: { gkData: true, teeBoxes: true },
    });
    // extract tee boxes and and total tee box lengths from gkd file
    const gkData = course?.gkData?.gkData;
    if (!gkData) {
      return { error: "Course gkdata not found" };
    }
    const teeBoxes = gkData.TeeTypeTotalDistance;
    const teeBoxes2 = teeBoxesFromCourseData(gkData);
    if (course.gkData) {
      course.gkData.gkData = null;
    }

    const teeboxDistances: { teeBoxName: string; teeBoxDistance: number }[] =
      [];
    for (const teeBox of teeBoxes) {
      const teeboxDistance = teeBoxTotalDistanceFromCourseData(
        gkData,
        teeBox.TeeType
      );
      teeboxDistances.push({
        teeBoxName: teeBox.TeeType,
        teeBoxDistance: teeboxDistance,
      });
    }
    return {
      teeBoxes,
      teeBoxes2,
      teeboxDistances,
      // course,
    };
  })

  .get("/api/courses/:id/update-teebox", async ({ params: { id } }) => {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, Number(id)),
      with: { gkData: true },
    });
    if (!course) {
      return { error: "Course not found" };
    }
    if (!course.gkData) {
      return { error: "Course gkdata not found" };
    }
    const gkData = course.gkData.gkData;
    if (!gkData) {
      return { error: "Course gkdata not found" };
    }
    await updateTeeBoxesFromCourseData(course.id, gkData);
    return { success: "Tee boxes updated" };
  })

  // Catch-all route to serve index.html
  .all("*", async ({ set }) => {
    try {
      const html = await readFile("./public/gsp/index.html");
      set.headers["Content-Type"] = "text/html";
      return html;
    } catch (e) {
      set.status = 500;
      logger.error("Could not load index.html", e);
      return { error: "Could not load index.html" };
    }
  });
export default routes;

type UpdateFromFilesystemBody = {
  courseName: string;
  opcdName: string;
  gkdFileContents: CourseData;
  coursePar: number;
  sgtInfo?: {
    sgtId?: string;
    sgtSplashUrl?: string;
    sgtYoutubeUrl?: string;
  };
  opcdInfo: {
    addedDate: string;
    updatedDate: string;
    opcdVersion: string;
  };
};
