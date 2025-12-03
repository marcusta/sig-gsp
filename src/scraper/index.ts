/**
 * Course records scraper orchestration
 */

import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { scrapeRuns } from "../db/schema";
import logger from "../logger";
import { scrapeSinglesRecords } from "./singles-scraper";

export interface ScrapeRunResult {
  runId: number;
  success: boolean;
  summary: string;
}

/**
 * Run the full records scrape
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

    const summary = `Run #${runId}: ${result.recordsCreated} created, ${result.recordsUpdated} updated, ${result.playersCreated} new players`;
    logger.info(summary);

    return { runId, success: result.success, summary };
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

// Re-export types
export type { ScrapeResult } from "./types";
