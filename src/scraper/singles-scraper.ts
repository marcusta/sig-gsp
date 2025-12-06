/**
 * Singles course records scraper
 * Scrapes Tips and SGT singles records from the combined SGT endpoint
 */

import axios from "axios";
import { and, eq } from "drizzle-orm";
import { db } from "../db/db";
import {
  courseRecordHistory,
  courseRecords,
  courses,
  recordModes,
} from "../db/schema";
import logger from "../logger";
import { parseSinglesResponse } from "./html-parser";
import { upsertPlayer } from "./player-service";
import type { ScrapedRecord, ScrapeResult, UpsertRecordResult } from "./types";

const SINGLES_API_URL =
  "https://simulatorgolftour.com/sgt-api/courses/course-records";

/**
 * Scrape all singles records (Tips + SGT) from SGT
 */
export async function scrapeSinglesRecords(): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    success: false,
    rowsProcessed: 0,
    tipsRecordsFound: 0,
    sgtRecordsFound: 0,
    playersCreated: 0,
    playersUpdated: 0,
    recordsCreated: 0,
    recordsUpdated: 0,
    errors: [],
  };

  try {
    // Fetch the HTML
    console.log("Fetching singles records from SGT...");
    logger.info("Fetching singles records from SGT...");
    const response = await axios.get(SINGLES_API_URL, {
      timeout: 30000,
      headers: {
        "User-Agent": "GSPro-Course-Viewer/1.0",
      },
    });
    const html = response.data;

    // Parse all rows
    const rows = parseSinglesResponse(html);
    logger.info(`Parsed ${rows.length} course rows from SGT`);

    // Get record mode IDs for Tips and SGT singles
    const tipsModeId = await getRecordModeId("tips", "single", "putting");
    const sgtModeId = await getRecordModeId("sgt", "single", "putting");

    if (!tipsModeId || !sgtModeId) {
      throw new Error(
        "Record modes not found in database. Run migrations and seed data first."
      );
    }

    // Process each row
    for (const row of rows) {
      result.rowsProcessed++;

      try {
        // Find our course by SGT ID
        const course = await findCourseBySgtId(row.sgtCourseId);
        if (!course) {
          // Course not in our DB - skip (expected for courses we don't track)
          continue;
        }

        // Process Tips record
        if (row.tipsRecord) {
          result.tipsRecordsFound++;
          await processRecord(course.id, tipsModeId, row.tipsRecord, result);
        }

        // Process SGT record
        if (row.sgtRecord) {
          result.sgtRecordsFound++;
          await processRecord(course.id, sgtModeId, row.sgtRecord, result);
        }
      } catch (rowError) {
        const msg = `Error processing course ${row.sgtCourseId}: ${rowError}`;
        logger.error(msg);
        result.errors.push(msg);
      }
    }

    result.success = true;
    logger.info(
      `Scrape complete: ${result.recordsCreated} created, ${result.recordsUpdated} updated, ${result.playersCreated} new players`
    );
  } catch (error) {
    const msg = `Scrape failed: ${error}`;
    logger.error(msg);
    result.errors.push(msg);
  }

  return result;
}

/**
 * Process a single record - upsert player and course record
 */
async function processRecord(
  courseId: number,
  recordModeId: number,
  record: ScrapedRecord,
  result: ScrapeResult
): Promise<void> {
  // Upsert player
  const playerResult = await upsertPlayer(record);
  if (playerResult.created) {
    result.playersCreated++;
  } else {
    result.playersUpdated++;
  }

  // Upsert course record
  const recordResult = await upsertCourseRecord(
    courseId,
    recordModeId,
    playerResult.playerId,
    record
  );
  if (recordResult.created) {
    result.recordsCreated++;
  } else if (recordResult.updated) {
    result.recordsUpdated++;
  }
}

/**
 * Get record mode ID by tee type, player format, and putting mode
 */
async function getRecordModeId(
  teeType: string,
  playerFormat: string,
  puttingMode: string
): Promise<number | null> {
  const mode = await db.query.recordModes.findFirst({
    where: and(
      eq(recordModes.teeType, teeType),
      eq(recordModes.playerFormat, playerFormat),
      eq(recordModes.puttingMode, puttingMode)
    ),
  });
  return mode?.id ?? null;
}

/**
 * Find a course by its SGT ID
 */
async function findCourseBySgtId(
  sgtId: string
): Promise<{ id: number; name: string } | null> {
  const course = await db.query.courses.findFirst({
    where: eq(courses.sgtId, sgtId),
    columns: { id: true, name: true },
  });
  return course ?? null;
}

/**
 * Upsert a course record and save history for changes
 */
async function upsertCourseRecord(
  courseId: number,
  recordModeId: number,
  playerId: number,
  record: ScrapedRecord
): Promise<UpsertRecordResult> {
  const now = new Date().toISOString();

  // Check if record exists for this course + mode
  const existing = await db.query.courseRecords.findFirst({
    where: and(
      eq(courseRecords.courseId, courseId),
      eq(courseRecords.recordModeId, recordModeId)
    ),
  });

  if (existing) {
    // Check if anything changed (different player or score)
    const playerChanged = existing.playerId !== playerId;
    const scoreChanged = existing.score !== record.score;

    if (playerChanged || scoreChanged) {
      // Determine change type
      const changeType = playerChanged ? "BROKEN" : "IMPROVED";
      const scoreImprovement =
        existing.scoreNumeric !== null
          ? existing.scoreNumeric - record.scoreNumeric
          : null;

      // Save to history before overwriting
      await db.insert(courseRecordHistory).values({
        courseId,
        recordModeId,
        scrapeRunId: null, // Can be linked if we track scrape runs
        previousPlayerId: existing.playerId,
        previousScore: existing.score,
        previousScoreNumeric: existing.scoreNumeric,
        previousRecordDate: existing.recordDate,
        newPlayerId: playerId,
        newScore: record.score,
        newScoreNumeric: record.scoreNumeric,
        newRecordDate: record.recordDate,
        changeType,
        scoreImprovement,
        detectedAt: now,
        createdAt: now,
      });

      logger.info(
        `Record ${changeType}: Course ${courseId}, Mode ${recordModeId}, ` +
          `${existing.score} → ${record.score} (improvement: ${scoreImprovement})`
      );

      // Update the current record
      await db
        .update(courseRecords)
        .set({
          playerId,
          score: record.score,
          scoreNumeric: record.scoreNumeric,
          recordDate: record.recordDate,
          scrapedAt: now,
          updatedAt: now,
        })
        .where(eq(courseRecords.id, existing.id));

      return { created: false, updated: true };
    }

    // Just update scraped_at timestamp (no actual changes)
    await db
      .update(courseRecords)
      .set({ scrapedAt: now })
      .where(eq(courseRecords.id, existing.id));
    return { created: false, updated: false };
  }

  // Create new record
  await db.insert(courseRecords).values({
    courseId,
    recordModeId,
    playerId,
    teamId: null, // Singles don't have teams
    score: record.score,
    scoreNumeric: record.scoreNumeric,
    recordDate: record.recordDate,
    scrapedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  // Save initial record to history
  await db.insert(courseRecordHistory).values({
    courseId,
    recordModeId,
    scrapeRunId: null,
    previousPlayerId: null,
    previousScore: null,
    previousScoreNumeric: null,
    previousRecordDate: null,
    newPlayerId: playerId,
    newScore: record.score,
    newScoreNumeric: record.scoreNumeric,
    newRecordDate: record.recordDate,
    changeType: "INITIAL",
    scoreImprovement: null,
    detectedAt: now,
    createdAt: now,
  });

  return { created: true, updated: false };
}
