/**
 * Singles course records scraper
 * Scrapes Tips and SGT singles records from the combined SGT endpoint
 *
 * Performance optimizations:
 * 1. Pre-loads courses, players, and records into memory caches
 * 2. Wraps all writes in a single transaction (huge SQLite perf win)
 * 3. Batches history inserts instead of one-at-a-time
 */

import axios from "axios";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/db";
import {
  courseRecordHistory,
  courseRecords,
  courses,
  players,
  recordModes,
} from "../db/schema";
import logger from "../logger";
import { parseSinglesResponse } from "./html-parser";
import { upsertPlayerWithCacheTx } from "./player-service";
import type {
  ScrapedRecord,
  ScrapeResult,
  ScrapeTimings,
  UpsertRecordResult,
} from "./types";

// Type for cached course data
type CourseCache = Map<string, { id: number; name: string }>;

// Type for cached player data
type PlayerCache = Map<string, number>;

// Type for cached course record data
type CourseRecordCache = Map<string, typeof courseRecords.$inferSelect>;

// Type for pending history inserts (batched)
type HistoryInsert = typeof courseRecordHistory.$inferInsert;

const SINGLES_API_URL =
  "https://simulatorgolftour.com/sgt-api/courses/course-records";

/**
 * Normalize a course name for matching between our DB and the SGT feed.
 * Lowercases and strips everything but alphanumerics so punctuation and
 * spacing differences don't block a match.
 */
function normalizeCourseName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Scrape all singles records (Tips + SGT) from SGT
 */
export async function scrapeSinglesRecords(): Promise<ScrapeResult> {
  const totalStart = performance.now();

  // Initialize timings
  const timings: ScrapeTimings = {
    totalMs: 0,
    fetchMs: 0,
    parseMs: 0,
    cacheLoadMs: 0,
    transactionMs: 0,
    historyBatchInsertMs: 0,
    coursesCacheMs: 0,
    playersCacheMs: 0,
    recordsCacheMs: 0,
  };

  const result: ScrapeResult = {
    success: false,
    rowsProcessed: 0,
    tipsRecordsFound: 0,
    sgtRecordsFound: 0,
    playersCreated: 0,
    playersUpdated: 0,
    recordsCreated: 0,
    recordsUpdated: 0,
    coursesLinked: 0,
    coursesUnmatched: 0,
    errors: [],
    timings,
  };

  try {
    // Fetch the HTML (outside transaction - network I/O)
    console.log("Fetching singles records from SGT...");
    logger.info("Fetching singles records from SGT...");
    const fetchStart = performance.now();
    const response = await axios.get(SINGLES_API_URL, {
      timeout: 30000,
      headers: {
        "User-Agent": "GSPro-Course-Viewer/1.0",
      },
    });
    const html = response.data;
    timings.fetchMs = Math.round(performance.now() - fetchStart);
    logger.info(`Fetch completed in ${timings.fetchMs}ms`);

    // Parse all rows (CPU work, outside transaction)
    const parseStart = performance.now();
    const rows = parseSinglesResponse(html);
    timings.parseMs = Math.round(performance.now() - parseStart);
    logger.info(`Parsed ${rows.length} course rows in ${timings.parseMs}ms`);

    // Get record mode IDs for Tips and SGT singles
    const tipsModeId = await getRecordModeId("tips", "single", "putting");
    const sgtModeId = await getRecordModeId("sgt", "single", "putting");

    if (!tipsModeId || !sgtModeId) {
      throw new Error(
        "Record modes not found in database. Run migrations and seed data first."
      );
    }

    // Pre-load all caches for optimized batch processing
    // This reduces ~1500 SELECT queries down to 3
    logger.info("Pre-loading caches for batch processing...");
    const cacheLoadStart = performance.now();

    // Phase 1: Pre-load all courses
    // - courseCache: linked courses keyed by their SGT id (for the fast path)
    // - unlinkedByName: enabled courses missing an SGT id, keyed by normalized
    //   name, so we can auto-link them to feed rows. Names that collide are
    //   dropped (ambiguous -> never auto-link, to avoid mis-mapping).
    const coursesCacheStart = performance.now();
    const allCourses = await db.query.courses.findMany({
      columns: { id: true, sgtId: true, name: true, enabled: true },
    });
    const courseCache: CourseCache = new Map(
      allCourses
        .filter((c) => c.sgtId && c.sgtId.trim() !== "")
        .map((c) => [c.sgtId!, { id: c.id, name: c.name }])
    );

    const unlinkedByName = new Map<string, { id: number; name: string }>();
    const ambiguousNames = new Set<string>();
    for (const c of allCourses) {
      if (!c.enabled) continue;
      if (c.sgtId && c.sgtId.trim() !== "") continue;
      const key = normalizeCourseName(c.name);
      if (!key) continue;
      if (unlinkedByName.has(key)) {
        ambiguousNames.add(key);
        continue;
      }
      unlinkedByName.set(key, { id: c.id, name: c.name });
    }
    for (const key of ambiguousNames) unlinkedByName.delete(key);

    timings.coursesCacheMs = Math.round(performance.now() - coursesCacheStart);
    logger.info(
      `Loaded ${courseCache.size} linked courses into cache in ${timings.coursesCacheMs}ms ` +
        `(${unlinkedByName.size} unlinked enabled courses available for name auto-linking)`
    );

    // Phase 2: Pre-load all players
    const playersCacheStart = performance.now();
    const allPlayers = await db.query.players.findMany({
      columns: { id: true, sgtUsername: true },
    });
    const playerCache: PlayerCache = new Map(
      allPlayers.map((p) => [p.sgtUsername, p.id])
    );
    timings.playersCacheMs = Math.round(performance.now() - playersCacheStart);
    logger.info(
      `Loaded ${playerCache.size} players into cache in ${timings.playersCacheMs}ms`
    );

    // Phase 3: Pre-load existing course records for Tips and SGT modes
    const recordsCacheStart = performance.now();
    const existingRecords = await db.query.courseRecords.findMany({
      where: inArray(courseRecords.recordModeId, [tipsModeId, sgtModeId]),
    });
    const recordCache: CourseRecordCache = new Map(
      existingRecords.map((r) => [`${r.courseId}-${r.recordModeId}`, r])
    );
    timings.recordsCacheMs = Math.round(performance.now() - recordsCacheStart);
    logger.info(
      `Loaded ${recordCache.size} existing records into cache in ${timings.recordsCacheMs}ms`
    );

    timings.cacheLoadMs = Math.round(performance.now() - cacheLoadStart);
    logger.info(`Total cache loading completed in ${timings.cacheLoadMs}ms`);

    // Collect history inserts for batching
    const pendingHistoryInserts: HistoryInsert[] = [];

    // Wrap ALL database writes in a single transaction
    // This is the biggest performance win - SQLite commits once at the end
    logger.info("Starting transaction for batch processing...");
    const transactionStart = performance.now();

    await db.transaction(async (tx) => {
      // Process each row using cached lookups
      for (const row of rows) {
        result.rowsProcessed++;

        try {
          // Find our course by SGT ID using cache (Phase 1)
          let course = courseCache.get(row.sgtCourseId);
          if (!course) {
            // No linked course for this SGT id. Try to auto-link by name to an
            // enabled course of ours that has no SGT id yet (one-to-one match
            // only - ambiguous names were dropped during cache loading). This
            // self-heals courses synced from the filesystem that were never
            // linked, so their records stop being silently dropped.
            const nameKey = normalizeCourseName(row.courseName);
            const candidate = nameKey ? unlinkedByName.get(nameKey) : undefined;
            if (!candidate) {
              // Genuinely unknown course (not one of ours) - skip as before.
              continue;
            }

            await tx
              .update(courses)
              .set({ sgtId: row.sgtCourseId })
              .where(eq(courses.id, candidate.id));
            course = { id: candidate.id, name: candidate.name };
            courseCache.set(row.sgtCourseId, course);
            unlinkedByName.delete(nameKey);
            result.coursesLinked++;
            logger.info(
              `Auto-linked course "${candidate.name}" (id ${candidate.id}) ` +
                `to SGT id ${row.sgtCourseId} by name match`
            );
          }

          // Process Tips record
          if (row.tipsRecord) {
            result.tipsRecordsFound++;
            await processRecordTx(
              tx,
              course.id,
              tipsModeId,
              row.tipsRecord,
              result,
              playerCache,
              recordCache,
              pendingHistoryInserts
            );
          }

          // Process SGT record
          if (row.sgtRecord) {
            result.sgtRecordsFound++;
            await processRecordTx(
              tx,
              course.id,
              sgtModeId,
              row.sgtRecord,
              result,
              playerCache,
              recordCache,
              pendingHistoryInserts
            );
          }
        } catch (rowError) {
          const msg = `Error processing course ${row.sgtCourseId}: ${rowError}`;
          logger.error(msg);
          result.errors.push(msg);
        }
      }

      // Batch insert all history records at once
      if (pendingHistoryInserts.length > 0) {
        const historyStart = performance.now();
        logger.info(
          `Batch inserting ${pendingHistoryInserts.length} history records...`
        );
        await tx.insert(courseRecordHistory).values(pendingHistoryInserts);
        timings.historyBatchInsertMs = Math.round(
          performance.now() - historyStart
        );
        logger.info(
          `History batch insert completed in ${timings.historyBatchInsertMs}ms`
        );
      }
    });

    timings.transactionMs = Math.round(performance.now() - transactionStart);
    logger.info(`Transaction completed in ${timings.transactionMs}ms`);

    // Surface enabled courses we still couldn't link (their name never showed
    // up in the SGT feed). These are the actionable leftovers - usually courses
    // not on SGT (practice ranges) or a name that differs from SGT's.
    result.coursesUnmatched = unlinkedByName.size;
    if (result.coursesLinked > 0) {
      logger.info(`Auto-linked ${result.coursesLinked} courses by name this run`);
    }
    if (result.coursesUnmatched > 0) {
      const sample = Array.from(unlinkedByName.values())
        .slice(0, 30)
        .map((c) => c.name)
        .join(", ");
      logger.warn(
        `${result.coursesUnmatched} enabled courses remain unlinked (no SGT feed name match): ${sample}`
      );
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

  timings.totalMs = Math.round(performance.now() - totalStart);
  logger.info(`Total scrape time: ${timings.totalMs}ms`);

  return result;
}

// Transaction type from drizzle
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Process a single record - upsert player and course record (transaction-aware)
 */
async function processRecordTx(
  tx: Transaction,
  courseId: number,
  recordModeId: number,
  record: ScrapedRecord,
  result: ScrapeResult,
  playerCache: PlayerCache,
  recordCache: CourseRecordCache,
  pendingHistoryInserts: HistoryInsert[]
): Promise<void> {
  // Upsert player using cache and transaction (Phase 2)
  const playerResult = await upsertPlayerWithCacheTx(tx, record, playerCache);
  if (playerResult.created) {
    result.playersCreated++;
  } else {
    result.playersUpdated++;
  }

  // Upsert course record using cache and transaction (Phase 3)
  const recordResult = await upsertCourseRecordTx(
    tx,
    courseId,
    recordModeId,
    playerResult.playerId,
    record,
    recordCache,
    pendingHistoryInserts
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
 * Upsert a course record using transaction and pre-loaded cache
 * - Uses transaction for atomic commits
 * - Collects history inserts for batching instead of inserting one-by-one
 */
async function upsertCourseRecordTx(
  tx: Transaction,
  courseId: number,
  recordModeId: number,
  playerId: number,
  record: ScrapedRecord,
  recordCache: CourseRecordCache,
  pendingHistoryInserts: HistoryInsert[]
): Promise<UpsertRecordResult> {
  const now = new Date().toISOString();
  const cacheKey = `${courseId}-${recordModeId}`;

  // Check cache for existing record (Phase 3 - no DB query needed)
  const existing = recordCache.get(cacheKey);

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

      // Queue history insert for batching (instead of inserting now)
      pendingHistoryInserts.push({
        courseId,
        recordModeId,
        scrapeRunId: null,
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

      // Update the current record using transaction
      await tx
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

      // Update cache with new values to keep it consistent
      recordCache.set(cacheKey, {
        ...existing,
        playerId,
        score: record.score,
        scoreNumeric: record.scoreNumeric,
        recordDate: record.recordDate,
        scrapedAt: now,
        updatedAt: now,
      });

      return { created: false, updated: true };
    }

    // Just update scraped_at timestamp (no actual changes)
    await tx
      .update(courseRecords)
      .set({ scrapedAt: now })
      .where(eq(courseRecords.id, existing.id));
    return { created: false, updated: false };
  }

  // Create new record using transaction
  const [newRecord] = await tx
    .insert(courseRecords)
    .values({
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
    })
    .returning();

  // Add to cache so subsequent lookups for this course+mode work correctly
  recordCache.set(cacheKey, newRecord);

  // Queue initial history record for batching
  pendingHistoryInserts.push({
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
