/**
 * Course records scraper orchestration
 */

import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { scrapeRuns } from "../db/schema";
import logger from "../logger";
import { scrapeSinglesRecords } from "./singles-scraper";
import {
  generatePlayerRankSnapshot,
  type SnapshotResult,
} from "./snapshot-service";

export interface ScrapeRunResult {
  runId: number;
  success: boolean;
  summary: string;
  snapshotResult?: SnapshotResult;
}

/**
 * Run the full records scrape and generate player rank snapshot
 * Currently only scrapes singles (Tips + SGT)
 */
export async function runRecordsScrape(): Promise<ScrapeRunResult> {
  const now = new Date().toISOString();

  // Create scrape run record
  console.log("Creating scrape run record");
  const [run] = await db
    .insert(scrapeRuns)
    .values({
      startedAt: now,
      status: "running",
      recordModesScraped: JSON.stringify([
        "tips-single-putting",
        "sgt-single-putting",
      ]),
      createdAt: now,
    })
    .returning({ id: scrapeRuns.id });

  const runId = run.id;
  logger.info(`Started scrape run #${runId}`);

  try {
    // Run singles scraper
    const result = await scrapeSinglesRecords();

    // Update scrape run with results
    await db
      .update(scrapeRuns)
      .set({
        completedAt: new Date().toISOString(),
        status: result.success ? "completed" : "failed",
        coursesProcessed: result.rowsProcessed,
        recordsFound: result.tipsRecordsFound + result.sgtRecordsFound,
        recordsCreated: result.recordsCreated,
        recordsUpdated: result.recordsUpdated,
        playersCreated: result.playersCreated,
        errorMessage:
          result.errors.length > 0 ? result.errors.join("; ") : null,
      })
      .where(eq(scrapeRuns.id, runId));

    // Generate player rank snapshot after successful scrape
    let snapshotResult: SnapshotResult | undefined;
    if (result.success) {
      logger.info("Generating player rank snapshot...");
      snapshotResult = await generatePlayerRankSnapshot();
      logger.info(
        `Snapshot: ${snapshotResult.playersProcessed} players, ` +
          `${snapshotResult.newEntries} new, ${snapshotResult.updatedEntries} updated`
      );
    }

    const summary =
      `Run #${runId}: ${result.recordsCreated} created, ` +
      `${result.recordsUpdated} updated, ${result.playersCreated} new players`;
    logger.info(summary);

    return { runId, success: result.success, summary, snapshotResult };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    await db
      .update(scrapeRuns)
      .set({
        completedAt: new Date().toISOString(),
        status: "failed",
        errorMessage: errorMsg,
      })
      .where(eq(scrapeRuns.id, runId));

    logger.error(`Scrape run #${runId} failed: ${errorMsg}`);
    return { runId, success: false, summary: `Failed: ${errorMsg}` };
  }
}

// Re-export types and services
export {
  getCourseRecordHistory,
  getPlayerRecordChanges,
  getPlayersWithGainedRecords,
  getPlayersWithLostRecords,
  getRecentRecordChanges,
  getRecordChangeStats,
} from "./history-service";
export type { RecordChangeEvent } from "./history-service";
export { generatePlayerRankSnapshot } from "./snapshot-service";
export type { SnapshotResult } from "./snapshot-service";
export type { ScrapeResult } from "./types";
