import axios from "axios";
import {
  createCourseFromCourseData,
  getCourseByName,
  getCourses,
  updateCourse,
  updateCourseFromCourseData,
  updateCourseTags,
  updateParOnCourses,
} from "course-data";
import type { CourseData } from "course-data-types";
import { db } from "db/db";
import {
  courseRecords,
  courses,
  players,
  recordModes,
  type Course,
  type CourseRecord,
  type Player,
} from "db/schema";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { readFile } from "fs/promises";
import logger from "logger";
import {
  teeBoxesFromCourseData,
  teeBoxTotalDistanceFromCourseData,
  updateTeeBoxesFromCourseData,
} from "teebox-data";
import { scrapeLeaderboard } from "./sgt-scraper";

const routes = new Elysia()
  // Home route
  .get("/gsp-welcome", () => ({
    message: "Welcome to the Bun server with Elysia!",
  }))

  .get("/api/courses", async () => {
    const courseList = await db.query.courses.findMany({
      with: { teeBoxes: true, tags: true },
      where: eq(courses.enabled, true),
    });
    const courseListWithTags = await addTagsToCourses(courseList as any);
    return addRecordFlagsToCourses(courseListWithTags as any);
  })

  .get("/api/courses/paginated", async ({ query }) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 24, 1), 200);
    const offset = (page - 1) * limit;
    const thin = query.thin === "true" || query.thin === true;
    const enabledOnly = query.enabled !== "false";
    const search =
      typeof query.search === "string" ? query.search.trim().toLowerCase() : "";

    const enabledCondition = enabledOnly ? eq(courses.enabled, true) : undefined;
    const searchCondition = search
      ? sql`(
          lower(${courses.name}) LIKE ${`%${search}%`}
          OR lower(${courses.location}) LIKE ${`%${search}%`}
          OR lower(${courses.designer}) LIKE ${`%${search}%`}
          OR CAST(${courses.holes} AS TEXT) LIKE ${`%${search}%`}
        )`
      : undefined;

    const whereClause =
      enabledCondition && searchCondition
        ? and(enabledCondition, searchCondition)
        : enabledCondition ?? searchCondition;

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(whereClause);
    const total = Number(totalResult[0]?.count ?? 0);

    if (thin) {
      const thinCourses = await db
        .select({
          id: courses.id,
          name: courses.name,
          alternateName: courses.alternateName,
          location: courses.location,
          country: courses.country,
          holes: courses.holes,
          altitude: courses.altitude,
          grade: courses.grade,
          designer: courses.designer,
          difficulty: courses.difficulty,
          graphics: courses.graphics,
          golfQuality: courses.golfQuality,
          description: courses.description,
          opcdName: courses.opcdName,
          opcdVersion: courses.opcdVersion,
          addedDate: courses.addedDate,
          updatedDate: courses.updatedDate,
          sgtId: courses.sgtId,
          sgtSplashUrl: courses.sgtSplashUrl,
          sgtYoutubeUrl: courses.sgtYoutubeUrl,
          par: courses.par,
          isPar3: courses.isPar3,
          largestElevationDrop: courses.largestElevationDrop,
          averageElevationDifference: courses.averageElevationDifference,
          totalHazards: courses.totalHazards,
          islandGreens: courses.islandGreens,
          totalWaterHazards: courses.totalWaterHazards,
          totalInnerOOB: courses.totalInnerOOB,
          rangeEnabled: courses.rangeEnabled,
        })
        .from(courses)
        .where(whereClause)
        .orderBy(asc(courses.name))
        .limit(limit)
        .offset(offset);

      const mappedCourses = thinCourses.map((course) => ({
        ...course,
        teeBoxes: [],
        tags: [],
        attributes: [],
      }));

      const coursesWithRecordFlags = await addRecordFlagsToCourses(
        mappedCourses as any
      );

      return {
        courses: coursesWithRecordFlags,
        page,
        limit,
        total,
        hasMore: offset + coursesWithRecordFlags.length < total,
        thin: true,
      };
    }

    const courseList = await db.query.courses.findMany({
      with: { teeBoxes: true, tags: true },
      where: whereClause,
      limit,
      offset,
      orderBy: (course, { asc }) => [asc(course.name)],
    });
    const courseListWithTags = await addTagsToCourses(courseList as any);

    const coursesWithRecordFlags = await addRecordFlagsToCourses(
      courseListWithTags as any
    );

    return {
      courses: coursesWithRecordFlags,
      page,
      limit,
      total,
      hasMore: offset + coursesWithRecordFlags.length < total,
      thin: false,
    };
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
    const courseWithTags = await addTagsToCourses([course as any]);
    return {
      ...courseWithTags[0],
      gkData: course.gkData?.gkData,
    };
  })

  .get("/api/course-attributes", async () => {
    const tagList = await db.query.tags.findMany();
    return tagList;
  })

  .get(
    "/api/course-records/:sgtId/:teeType",
    async ({ params: { sgtId, teeType }, set }) => {
      try {
        console.log("sgtId", sgtId);
        // Validate teeType
        if (teeType !== "CR" && teeType !== "CRTips") {
          set.status = 400;
          return { error: "Invalid tee type. Must be 'CR' or 'CRTips'" };
        }

        const leaderboardData = await scrapeLeaderboard(sgtId, teeType);
        return leaderboardData;
      } catch (error) {
        logger.error(`Error fetching leaderboard for course ${sgtId}`, error);
        set.status = 500;
        return {
          error: "Failed to fetch leaderboard data",
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
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
      await updateCourseTags(
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

  .get("/api/courses/update-course-data", async () => {
    const courseList = await getCourses();
    for (const course of courseList) {
      const courseFromDb = await db.query.courses.findFirst({
        where: eq(courses.id, course.id),
        with: { gkData: true, teeBoxes: true, tags: true },
      });
      if (!courseFromDb) {
        logger.error(`Course not found ${course.name}`);
        continue;
      }
      const gkData = courseFromDb.gkData?.gkData;
      if (!gkData) {
        logger.error(`Course gkdata not found ${course.name}`);
        continue;
      }
      await updateCourseFromCourseData(course.id, gkData);
      await updateCourseTags(course.id, gkData);
    }
    return { success: "Course data updated" };
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

  .post("/api/courses/sync-with-sgt", async () => {
    const courseList = await getCourses();
    const sgtCourseIds = await getCoursesFromSgt();
    for (const course of courseList) {
      const courseSgtId = parseInt(course.sgtId || "-1");
      let enabled = false;
      if (sgtCourseIds.includes(courseSgtId)) {
        enabled = true;
      }
      await db
        .update(courses)
        .set({ enabled })
        .where(eq(courses.id, course.id));
    }
    return { success: "Courses synced with sgt" };
  })

  .get("/api/courses/sync-with-sgt", async () => {
    const courseList = await getCourses();
    const sgtCourseIds = await getCoursesFromSgt();
    // console.log("sgtCourseIds", sgtCourseIds);
    // return and print courses in DB that are not in sgtCourseIds
    const sgtCourseIdMap = new Map(sgtCourseIds.map((id) => [id, true]));
    const dbCourseSgtIdMap = new Map(
      courseList.map((course) => [parseInt(course.sgtId || "-1"), course.name])
    );
    const coursesNotInSgt = [];
    for (const course of courseList) {
      const courseSgtId = parseInt(course.sgtId || "-1");
      if (!sgtCourseIdMap.has(courseSgtId)) {
        coursesNotInSgt.push(course.name);
      }
    }
    // courses in SGT not in DB
    const coursesNotInDb = [];
    for (const sgtCourseId of sgtCourseIds) {
      if (!dbCourseSgtIdMap.has(sgtCourseId)) {
        coursesNotInDb.push(sgtCourseId);
      }
    }
    return {
      coursesNotInSgt: coursesNotInSgt,
      coursesNotInDb: coursesNotInDb,
    };
  })

  .get("/api/youtube-playlist", async ({ set }) => {
    try {
      // This functionality is no longer available
      set.status = 404;
      return { error: "YouTube playlist functionality has been removed" };
    } catch (error) {
      logger.error("Error in YouTube playlist route:", error);
      set.status = 500;
      return { error: "Failed to fetch YouTube playlist data" };
    }
  })

  .get("/api/courses/export-csv", async ({ set }) => {
    try {
      // Get all courses with tee boxes
      const courseList = await db.query.courses.findMany({
        with: { teeBoxes: true },
      });

      // Get unique tee box names across all courses
      const teeBoxNames = new Set<string>();
      courseList.forEach((course) => {
        course.teeBoxes.forEach((teeBox) => {
          teeBoxNames.add(teeBox.name);
        });
      });
      const sortedTeeBoxNames = Array.from(teeBoxNames).sort();

      // Create CSV header
      let csvContent = "Name,Location,Designer,Altitude,Holes,Par 3 Course,";

      // Add tee box columns
      sortedTeeBoxNames.forEach((name) => {
        csvContent += `${name} Length,${name} Rating,${name} Slope,`;
      });

      // Remove trailing comma and add newline
      csvContent = csvContent.slice(0, -1) + "\n";

      // Add course data
      courseList.forEach((course) => {
        // Add basic course info
        csvContent += `"${course.name}","${course.location}","${
          course.designer
        }",${course.altitude},${course.holes},${course.isPar3 ? "Yes" : "No"},`;

        // Add tee box data
        for (const teeBoxName of sortedTeeBoxNames) {
          const teeBox = course.teeBoxes.find((tb) => tb.name === teeBoxName);
          if (teeBox) {
            csvContent += `${teeBox.length},${teeBox.rating},${teeBox.slope},`;
          } else {
            csvContent += ",,,"; // Empty fields for missing tee box
          }
        }

        // Remove trailing comma and add newline
        csvContent = csvContent.slice(0, -1) + "\n";
      });

      // Set response headers for CSV download
      set.headers["Content-Type"] = "text/csv";
      set.headers["Content-Disposition"] = "attachment; filename=courses.csv";

      return csvContent;
    } catch (error) {
      logger.error("Error generating CSV export:", error);
      set.status = 500;
      return { error: "Failed to generate CSV export" };
    }
  })

  // ============================================================================
  // Course Records API
  // ============================================================================

  // Get course records for a specific course (from local DB)
  .get("/api/courses/:id/records", async ({ params: { id }, set }) => {
    try {
      const course = await db.query.courses.findFirst({
        where: eq(courses.id, Number(id)),
        columns: { id: true, name: true },
      });

      if (!course) {
        set.status = 404;
        return { error: "Course not found" };
      }

      // Get Tips and SGT record mode IDs
      const [tipsMode, sgtMode] = await Promise.all([
        getRecordModeByCode("tips", "single", "putting"),
        getRecordModeByCode("sgt", "single", "putting"),
      ]);

      // Fetch records with player info
      const [tipsRecord, sgtRecord] = await Promise.all([
        tipsMode ? getRecordWithPlayer(course.id, tipsMode.id) : null,
        sgtMode ? getRecordWithPlayer(course.id, sgtMode.id) : null,
      ]);

      return {
        courseId: course.id,
        courseName: course.name,
        tipsRecord: tipsRecord ? formatCourseRecord(tipsRecord) : null,
        sgtRecord: sgtRecord ? formatCourseRecord(sgtRecord) : null,
        lastScrapedAt: tipsRecord?.scrapedAt || sgtRecord?.scrapedAt || null,
      };
    } catch (error) {
      logger.error(`Error fetching course records for ${id}:`, error);
      set.status = 500;
      return { error: "Failed to fetch course records" };
    }
  })

  // Get available years for filtering
  .get("/api/records/years", async () => {
    const results = await db.all(sql`
      SELECT DISTINCT substr(record_date, 1, 4) as year
      FROM course_records
      WHERE record_date IS NOT NULL
      ORDER BY year DESC
    `);
    return { years: results.map((r: any) => r.year) };
  })

  // Get player leaderboard (aggregated record counts)
  .get("/api/records/leaderboard", async ({ query, set }) => {
    try {
      const teeType = (query.teeType as string) || "all";
      const year = (query.year as string) || "all";
      const limit = Math.min(Number(query.limit) || 50, 200);
      const offset = Number(query.offset) || 0;

      const leaderboard = await getPlayerLeaderboard(
        teeType,
        year,
        limit,
        offset
      );
      const total = await getPlayerLeaderboardCount(teeType, year);

      return {
        entries: leaderboard,
        total,
        filters: { teeType, year },
      };
    } catch (error) {
      logger.error("Error fetching leaderboard:", error);
      set.status = 500;
      return { error: "Failed to fetch leaderboard" };
    }
  })

  // Get player profile with all their records
  .get("/api/players/:id", async ({ params: { id }, set }) => {
    try {
      const player = await db.query.players.findFirst({
        where: eq(players.id, Number(id)),
      });

      if (!player) {
        set.status = 404;
        return { error: "Player not found" };
      }

      const records = await getPlayerRecords(player.id);
      const summary = await getPlayerRecordSummary(player.id);

      return {
        player: formatPlayer(player),
        records,
        summary,
      };
    } catch (error) {
      logger.error(`Error fetching player ${id}:`, error);
      set.status = 500;
      return { error: "Failed to fetch player" };
    }
  })

  // Get player by SGT username
  .get(
    "/api/players/by-username/:username",
    async ({ params: { username }, set }) => {
      try {
        const player = await db.query.players.findFirst({
          where: eq(players.sgtUsername, username),
        });

        if (!player) {
          set.status = 404;
          return { error: "Player not found" };
        }

        return formatPlayer(player);
      } catch (error) {
        logger.error(`Error fetching player ${username}:`, error);
        set.status = 500;
        return { error: "Failed to fetch player" };
      }
    }
  )

  // Get all record modes
  .get("/api/records/modes", async () => {
    const modes = await db.query.recordModes.findMany();
    return {
      modes,
      activeModes: modes.filter((m) => m.isActive),
    };
  })

  // Admin: Trigger scrape
  .post("/api/admin/scrape-records", async ({ set }) => {
    try {
      console.log("Importing records scrape");
      const { runRecordsScrape } = await import("./scraper");
      console.log("Running records scrape");
      const result = await runRecordsScrape();
      return result;
    } catch (error) {
      logger.error("Scrape endpoint error:", error);
      set.status = 500;
      return { error: "Scrape failed", details: String(error) };
    }
  })

  // Admin: Get scrape status and scheduler info
  .get("/api/admin/scrape-status", async () => {
    const { getSchedulerStatus } = await import("./scheduler");
    const recentRuns = await db.query.scrapeRuns.findMany({
      orderBy: (runs, { desc }) => [desc(runs.startedAt)],
      limit: 10,
    });
    return {
      lastRun: recentRuns[0] || null,
      recentRuns,
      scheduler: getSchedulerStatus(),
    };
  })

  // ============================================================================
  // Record History & Ranking Tracking API
  // ============================================================================

  // Get recent record changes (activity feed)
  .get("/api/records/activity", async ({ query, set }) => {
    try {
      const { getRecentRecordChanges, getRecordChangeStats } = await import(
        "./scraper"
      );

      const limit = Math.min(Number(query.limit) || 50, 100);
      const offset = Number(query.offset) || 0;
      const daysBack = Number(query.daysBack) || 30;

      const [changes, stats] = await Promise.all([
        getRecentRecordChanges(limit, offset),
        getRecordChangeStats(daysBack),
      ]);

      return {
        changes,
        stats,
        pagination: { limit, offset },
      };
    } catch (error) {
      logger.error("Error fetching record activity:", error);
      set.status = 500;
      return { error: "Failed to fetch record activity" };
    }
  })

  // Get record history for a specific course
  .get(
    "/api/courses/:id/record-history",
    async ({ params: { id }, query, set }) => {
      try {
        const { getCourseRecordHistory } = await import("./scraper");

        const recordType = query.recordType as "tips" | "sgt" | undefined;
        const history = await getCourseRecordHistory(Number(id), recordType);

        return { courseId: Number(id), history };
      } catch (error) {
        logger.error(`Error fetching course record history for ${id}:`, error);
        set.status = 500;
        return { error: "Failed to fetch course record history" };
      }
    }
  )

  // Get player rank history over time
  .get(
    "/api/players/:id/rank-history",
    async ({ params: { id }, query, set }) => {
      try {
        const { getPlayerRankHistory } = await import(
          "./scraper/snapshot-service"
        );

        const limit = Math.min(Number(query.limit) || 30, 90);
        const history = await getPlayerRankHistory(Number(id), limit);

        return { playerId: Number(id), history };
      } catch (error) {
        logger.error(`Error fetching player rank history for ${id}:`, error);
        set.status = 500;
        return { error: "Failed to fetch player rank history" };
      }
    }
  )

  // Get player's record change activity
  .get(
    "/api/players/:id/record-changes",
    async ({ params: { id }, query, set }) => {
      try {
        const { getPlayerRecordChanges } = await import("./scraper");

        const limit = Math.min(Number(query.limit) || 50, 100);
        const changes = await getPlayerRecordChanges(Number(id), limit);

        return { playerId: Number(id), changes };
      } catch (error) {
        logger.error(`Error fetching player record changes for ${id}:`, error);
        set.status = 500;
        return { error: "Failed to fetch player record changes" };
      }
    }
  )

  // Get players who took records from a specific player (rivalry tracker)
  .get(
    "/api/players/:id/rivalries",
    async ({ params: { id }, query, set }) => {
      try {
        const { getPlayersWhoTookRecordsFrom } = await import("./scraper");

        const daysBack = query.daysBack ? Number(query.daysBack) : undefined;
        const rivalries = await getPlayersWhoTookRecordsFrom(
          Number(id),
          daysBack
        );

        return { playerId: Number(id), rivalries, daysBack };
      } catch (error) {
        logger.error(`Error fetching rivalries for player ${id}:`, error);
        set.status = 500;
        return { error: "Failed to fetch rivalries" };
      }
    }
  )

  // Get top rivalries (pairs of players with most record exchanges)
  .get("/api/records/top-rivalries", async ({ query, set }) => {
    try {
      const { getTopRivalries } = await import("./scraper/history-service");

      const daysBack = query.daysBack ? Number(query.daysBack) : undefined;
      const limit = Math.min(Number(query.limit) || 20, 50);

      const rivalries = await getTopRivalries(daysBack, limit);

      return { rivalries, daysBack };
    } catch (error) {
      logger.error("Error fetching top rivalries:", error);
      set.status = 500;
      return { error: "Failed to fetch top rivalries" };
    }
  })

  // Enhanced leaderboard with rank changes (uses latest snapshot comparison)
  .get("/api/records/leaderboard-with-changes", async ({ query, set }) => {
    try {
      const teeType = (query.teeType as string) || "all";
      const year = (query.year as string) || "all";
      const limit = Math.min(Number(query.limit) || 50, 200);
      const offset = Number(query.offset) || 0;

      // Get base leaderboard
      const leaderboard = await getPlayerLeaderboard(
        teeType,
        year,
        limit,
        offset
      );
      const total = await getPlayerLeaderboardCount(teeType, year);

      // Enhance with rank changes from snapshots
      const { getLatestPlayerRankChange } = await import(
        "./scraper/snapshot-service"
      );

      const entriesWithChanges = await Promise.all(
        leaderboard.map(async (entry: any) => {
          const rankChange = await getLatestPlayerRankChange(entry.player.id);
          return {
            ...entry,
            rankChange: rankChange?.rankChange ?? 0,
            recordsChange: rankChange?.recordsChange ?? 0,
          };
        })
      );

      return {
        entries: entriesWithChanges,
        total,
        filters: { teeType, year },
      };
    } catch (error) {
      logger.error("Error fetching leaderboard with changes:", error);
      set.status = 500;
      return { error: "Failed to fetch leaderboard" };
    }
  })

  // Leaderboard with custom time period comparison
  .get("/api/records/leaderboard-with-period", async ({ query, set }) => {
    try {
      const teeType = (query.teeType as string) || "all";
      const year = (query.year as string) || "all";
      const limit = Math.min(Number(query.limit) || 50, 200);
      const offset = Number(query.offset) || 0;
      const period = (query.period as string) || "week"; // 'day', 'week', 'thisWeek', 'month'

      // Map period to days
      const { getDaysIntoCurrentWeek } = await import(
        "./scraper/snapshot-service"
      );
      const periodToDays: Record<string, number> = {
        day: 1,
        week: 7,
        thisWeek: getDaysIntoCurrentWeek(), // Days since Monday of current week
        month: 30,
      };
      const daysAgo = periodToDays[period] ?? 7;

      // Get base leaderboard
      const leaderboard = await getPlayerLeaderboard(
        teeType,
        year,
        limit,
        offset
      );
      const total = await getPlayerLeaderboardCount(teeType, year);

      // Enhance with rank changes over the specified period
      const { getPlayerRankChangeOverPeriod, getDateDaysAgo } = await import(
        "./scraper/snapshot-service"
      );
      const { getPlayerRecordsGainedLost } = await import(
        "./scraper/history-service"
      );

      // Calculate cutoff date for history queries
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      const cutoffDateStr = cutoffDate.toISOString();

      const entriesWithChanges = await Promise.all(
        leaderboard.map(async (entry: any) => {
          const [change, gainedLost] = await Promise.all([
            getPlayerRankChangeOverPeriod(entry.player.id, daysAgo),
            getPlayerRecordsGainedLost(entry.player.id, cutoffDateStr),
          ]);
          return {
            ...entry,
            rankChange: change?.rankChange ?? 0,
            recordsChange: change?.recordsChange ?? 0,
            recordsGained: gainedLost.recordsGained,
            recordsLost: gainedLost.recordsLost,
            previousRank: change?.previousRank,
            comparisonPeriod: period,
            comparisonDays: daysAgo,
          };
        })
      );

      return {
        entries: entriesWithChanges,
        total,
        filters: { teeType, year, period },
      };
    } catch (error) {
      logger.error("Error fetching leaderboard with period:", error);
      set.status = 500;
      return { error: "Failed to fetch leaderboard" };
    }
  })

  // Get players who gained/lost most records recently
  .get("/api/records/movers", async ({ query, set }) => {
    try {
      const { getPlayersWithGainedRecords, getPlayersWithLostRecords } =
        await import("./scraper");

      const daysBack = Math.min(Number(query.daysBack) || 7, 30);
      const limit = Math.min(Number(query.limit) || 10, 50);

      const [gainers, losers] = await Promise.all([
        getPlayersWithGainedRecords(daysBack, limit),
        getPlayersWithLostRecords(daysBack, limit),
      ]);

      return {
        gainers,
        losers,
        period: { daysBack },
      };
    } catch (error) {
      logger.error("Error fetching record movers:", error);
      set.status = 500;
      return { error: "Failed to fetch record movers" };
    }
  })

  // Admin: Generate player rank snapshot manually
  .post("/api/admin/generate-snapshot", async ({ set }) => {
    try {
      const { generatePlayerRankSnapshot } = await import("./scraper");
      const result = await generatePlayerRankSnapshot();
      return result;
    } catch (error) {
      logger.error("Snapshot generation error:", error);
      set.status = 500;
      return { error: "Snapshot generation failed", details: String(error) };
    }
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

async function getCoursesFromSgt() {
  // download https://simulatorgolftour.com/course_manifest.json
  // parse the json
  // return the courses
  const response = await axios.get(
    "https://simulatorgolftour.com/course_manifest.json"
  );
  const courses = response.data as { courseId: number }[];
  // only return this list of IDs
  return courses.map((course) => course.courseId) as number[];
}

async function addTagsToCourses(
  courseList: {
    Course: Course;
    tags: { tagId: number }[];
  }[]
) {
  const tagList = await db.query.tags.findMany();
  // convert tagList to a map of tagId to tagName
  const tagIdMap = new Map(tagList.map((tag) => [tag.id, tag.name]));
  // loop through course and add tags to course
  const courseListWithTags = [];
  for (const course of courseList) {
    if (!course.tags) {
      continue;
    }
    const courseWithTags = {
      ...course,
      attributes: course.tags.map((tag) => {
        return {
          id: tag.tagId,
          name: tagIdMap.get(tag.tagId),
        };
      }),
    };
    courseListWithTags.push(courseWithTags);
  }
  return courseListWithTags;
}

async function addRecordFlagsToCourses<
  T extends {
    id: number;
    hasTipsRecord?: boolean;
    hasSgtRecord?: boolean;
    tipsRecordScore?: string | null;
    tipsRecordPlayer?: string | null;
    sgtRecordScore?: string | null;
    sgtRecordPlayer?: string | null;
  }
>(courseList: T[]) {
  if (courseList.length === 0) {
    return courseList;
  }

  const recordFlags = await getCourseRecordFlags(courseList.map((c) => c.id));
  return courseList.map((course) => {
    const flags = recordFlags.get(course.id) ?? {
      hasTipsRecord: false,
      hasSgtRecord: false,
      tipsRecordScore: null,
      tipsRecordPlayer: null,
      sgtRecordScore: null,
      sgtRecordPlayer: null,
    };
    return {
      ...course,
      hasTipsRecord: flags.hasTipsRecord,
      hasSgtRecord: flags.hasSgtRecord,
      tipsRecordScore: flags.tipsRecordScore,
      tipsRecordPlayer: flags.tipsRecordPlayer,
      sgtRecordScore: flags.sgtRecordScore,
      sgtRecordPlayer: flags.sgtRecordPlayer,
    };
  });
}

async function getCourseRecordFlags(courseIds: number[]) {
  const uniqueCourseIds = Array.from(new Set(courseIds));
  const flags = new Map<
    number,
    {
      hasTipsRecord: boolean;
      hasSgtRecord: boolean;
      tipsRecordScore: string | null;
      tipsRecordPlayer: string | null;
      sgtRecordScore: string | null;
      sgtRecordPlayer: string | null;
    }
  >();

  for (const courseId of uniqueCourseIds) {
    flags.set(courseId, {
      hasTipsRecord: false,
      hasSgtRecord: false,
      tipsRecordScore: null,
      tipsRecordPlayer: null,
      sgtRecordScore: null,
      sgtRecordPlayer: null,
    });
  }

  if (uniqueCourseIds.length === 0) {
    return flags;
  }

  const [tipsMode, sgtMode] = await Promise.all([
    getRecordModeByCode("tips", "single", "putting"),
    getRecordModeByCode("sgt", "single", "putting"),
  ]);

  const modeIds: number[] = [];
  if (tipsMode) modeIds.push(tipsMode.id);
  if (sgtMode) modeIds.push(sgtMode.id);

  if (modeIds.length === 0) {
    return flags;
  }

  const records = await db
    .select({
      courseId: courseRecords.courseId,
      recordModeId: courseRecords.recordModeId,
      score: courseRecords.score,
      playerDisplayName: players.displayName,
      playerUsername: players.sgtUsername,
    })
    .from(courseRecords)
    .leftJoin(players, eq(players.id, courseRecords.playerId))
    .where(
      and(
        inArray(courseRecords.courseId, uniqueCourseIds),
        inArray(courseRecords.recordModeId, modeIds)
      )
    );

  for (const record of records) {
    const entry = flags.get(record.courseId) ?? {
      hasTipsRecord: false,
      hasSgtRecord: false,
      tipsRecordScore: null,
      tipsRecordPlayer: null,
      sgtRecordScore: null,
      sgtRecordPlayer: null,
    };
    const recordPlayer = record.playerDisplayName || record.playerUsername || null;
    if (tipsMode && record.recordModeId === tipsMode.id) {
      entry.hasTipsRecord = true;
      entry.tipsRecordScore = record.score;
      entry.tipsRecordPlayer = recordPlayer;
    }
    if (sgtMode && record.recordModeId === sgtMode.id) {
      entry.hasSgtRecord = true;
      entry.sgtRecordScore = record.score;
      entry.sgtRecordPlayer = recordPlayer;
    }
    flags.set(record.courseId, entry);
  }

  return flags;
}

// ============================================================================
// Course Records Helper Functions
// ============================================================================

async function getRecordModeByCode(
  teeType: string,
  playerFormat: string,
  puttingMode: string
) {
  return db.query.recordModes.findFirst({
    where: and(
      eq(recordModes.teeType, teeType),
      eq(recordModes.playerFormat, playerFormat),
      eq(recordModes.puttingMode, puttingMode)
    ),
  });
}

async function getRecordWithPlayer(courseId: number, recordModeId: number) {
  return db.query.courseRecords.findFirst({
    where: and(
      eq(courseRecords.courseId, courseId),
      eq(courseRecords.recordModeId, recordModeId)
    ),
    with: {
      player: true,
    },
  });
}

function formatCourseRecord(record: CourseRecord & { player: Player | null }) {
  return {
    score: record.score,
    scoreNumeric: record.scoreNumeric,
    recordDate: record.recordDate,
    player: record.player ? formatPlayer(record.player) : null,
  };
}

function formatPlayer(player: Player) {
  return {
    id: player.id,
    username: player.sgtUsername,
    displayName: player.displayName,
    countryCode: player.countryCode,
    avatarUrl: player.avatarUrl,
  };
}

async function getPlayerLeaderboard(
  teeType: string,
  year: string,
  limit: number,
  offset: number
) {
  // Build conditions based on filters
  const teeTypeCondition =
    teeType === "all" ? sql`1=1` : sql`rm.tee_type = ${teeType}`;
  const yearCondition =
    year === "all" ? sql`1=1` : sql`substr(cr.record_date, 1, 4) = ${year}`;

  const results = await db.all(sql`
    SELECT 
      p.id,
      p.sgt_username as username,
      p.display_name as displayName,
      p.country_code as countryCode,
      p.avatar_url as avatarUrl,
      COUNT(CASE WHEN rm.tee_type = 'tips' THEN 1 END) as tipsRecords,
      COUNT(CASE WHEN rm.tee_type = 'sgt' THEN 1 END) as sgtRecords,
      COUNT(*) as totalRecords,
      ROUND(AVG(CASE WHEN rm.tee_type = 'tips' THEN cr.score_numeric END), 1) as tipsAvgScore,
      ROUND(AVG(CASE WHEN rm.tee_type = 'sgt' THEN cr.score_numeric END), 1) as sgtAvgScore,
      ROUND(AVG(cr.score_numeric), 1) as totalAvgScore,
      SUM(CASE WHEN rm.tee_type = 'tips' THEN cr.score_numeric ELSE 0 END) as tipsTotalScore,
      SUM(CASE WHEN rm.tee_type = 'sgt' THEN cr.score_numeric ELSE 0 END) as sgtTotalScore,
      SUM(cr.score_numeric) as totalScore
    FROM players p
    JOIN course_records cr ON cr.player_id = p.id
    JOIN record_modes rm ON rm.id = cr.record_mode_id
    WHERE rm.player_format = 'single'
      AND rm.putting_mode = 'putting'
      AND ${teeTypeCondition}
      AND ${yearCondition}
    GROUP BY p.id
    ORDER BY totalRecords DESC, tipsRecords DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return results.map((row: any, index: number) => ({
    rank: offset + index + 1,
    player: {
      id: row.id,
      username: row.username,
      displayName: row.displayName,
      countryCode: row.countryCode,
      avatarUrl: row.avatarUrl,
    },
    tipsRecords: row.tipsRecords || 0,
    sgtRecords: row.sgtRecords || 0,
    totalRecords: row.totalRecords || 0,
    tipsAvgScore: row.tipsAvgScore,
    sgtAvgScore: row.sgtAvgScore,
    totalAvgScore: row.totalAvgScore,
    tipsTotalScore: row.tipsTotalScore || 0,
    sgtTotalScore: row.sgtTotalScore || 0,
    totalScore: row.totalScore || 0,
  }));
}

async function getPlayerLeaderboardCount(
  teeType: string,
  year: string
): Promise<number> {
  const teeTypeCondition =
    teeType === "all" ? sql`1=1` : sql`rm.tee_type = ${teeType}`;
  const yearCondition =
    year === "all" ? sql`1=1` : sql`substr(cr.record_date, 1, 4) = ${year}`;

  const results = await db.all(sql`
    SELECT COUNT(DISTINCT p.id) as count
    FROM players p
    JOIN course_records cr ON cr.player_id = p.id
    JOIN record_modes rm ON rm.id = cr.record_mode_id
    WHERE rm.player_format = 'single'
      AND rm.putting_mode = 'putting'
      AND ${teeTypeCondition}
      AND ${yearCondition}
  `);

  return (results[0] as any)?.count || 0;
}

async function getPlayerRecords(playerId: number) {
  const records = await db.query.courseRecords.findMany({
    where: eq(courseRecords.playerId, playerId),
    with: {
      course: {
        columns: {
          id: true,
          name: true,
          location: true,
          sgtId: true,
        },
      },
      recordMode: true,
    },
    orderBy: [desc(courseRecords.recordDate)],
  });

  return records.map((r) => ({
    course: {
      id: r.course.id,
      name: r.course.name,
      location: r.course.location,
      sgtId: r.course.sgtId,
    },
    recordType: r.recordMode.teeType,
    score: r.score,
    scoreNumeric: r.scoreNumeric,
    recordDate: r.recordDate,
  }));
}

async function getPlayerRecordSummary(playerId: number) {
  const results = await db.all(sql`
    SELECT 
      COUNT(CASE WHEN rm.tee_type = 'tips' THEN 1 END) as tipsRecords,
      COUNT(CASE WHEN rm.tee_type = 'sgt' THEN 1 END) as sgtRecords,
      COUNT(*) as totalRecords,
      ROUND(AVG(CASE WHEN rm.tee_type = 'tips' THEN cr.score_numeric END), 1) as tipsAvgScore,
      ROUND(AVG(CASE WHEN rm.tee_type = 'sgt' THEN cr.score_numeric END), 1) as sgtAvgScore,
      ROUND(AVG(cr.score_numeric), 1) as totalAvgScore,
      SUM(CASE WHEN rm.tee_type = 'tips' THEN cr.score_numeric ELSE 0 END) as tipsTotalScore,
      SUM(CASE WHEN rm.tee_type = 'sgt' THEN cr.score_numeric ELSE 0 END) as sgtTotalScore,
      SUM(cr.score_numeric) as totalScore
    FROM course_records cr
    JOIN record_modes rm ON rm.id = cr.record_mode_id
    WHERE cr.player_id = ${playerId}
      AND rm.player_format = 'single'
      AND rm.putting_mode = 'putting'
  `);

  const result = results[0] as any;
  return {
    tipsRecords: result?.tipsRecords || 0,
    sgtRecords: result?.sgtRecords || 0,
    totalRecords: result?.totalRecords || 0,
    tipsAvgScore: result?.tipsAvgScore ?? null,
    sgtAvgScore: result?.sgtAvgScore ?? null,
    totalAvgScore: result?.totalAvgScore ?? null,
    tipsTotalScore: result?.tipsTotalScore || 0,
    sgtTotalScore: result?.sgtTotalScore || 0,
    totalScore: result?.totalScore || 0,
  };
}
