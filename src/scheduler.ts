/**
 * Scheduled tasks for scraping and snapshot generation
 *
 * Schedules:
 * - Scraping: Every 2 hours (at minute 0, every 2nd hour)
 * - Snapshots: Daily at 10:00 UTC
 */

import cron, { type ScheduledTask } from "node-cron";
import logger from "./logger";

// Track running jobs to prevent overlaps
let isScrapeRunning = false;
let isSnapshotRunning = false;

// Store scheduled tasks for potential cleanup
let scrapeTask: ScheduledTask | null = null;
let snapshotTask: ScheduledTask | null = null;

/**
 * Run the scraping job with overlap protection
 */
async function runScrapeJob(): Promise<void> {
  if (isScrapeRunning) {
    logger.warn("Scrape job skipped - previous run still in progress");
    return;
  }

  isScrapeRunning = true;
  const startTime = Date.now();
  logger.info("Scheduled scrape job starting...");

  try {
    const { runRecordsScrape } = await import("./scraper");
    const result = await runRecordsScrape();

    const duration = Math.round((Date.now() - startTime) / 1000);
    logger.info(
      `Scheduled scrape completed in ${duration}s: ${result.summary}`
    );

    if (result.timings) {
      logger.info(`Scrape timings: ${JSON.stringify(result.timings)}`);
    }
  } catch (error) {
    logger.error(`Scheduled scrape failed: ${error}`);
  } finally {
    isScrapeRunning = false;
  }
}

/**
 * Run the snapshot generation job with overlap protection
 */
async function runSnapshotJob(): Promise<void> {
  if (isSnapshotRunning) {
    logger.warn("Snapshot job skipped - previous run still in progress");
    return;
  }

  isSnapshotRunning = true;
  const startTime = Date.now();
  logger.info("Scheduled snapshot job starting...");

  try {
    const { generatePlayerRankSnapshot } = await import("./scraper");
    const result = await generatePlayerRankSnapshot();

    const duration = Math.round((Date.now() - startTime) / 1000);
    if (result.success) {
      logger.info(
        `Scheduled snapshot completed in ${duration}s: ${result.playersProcessed} players processed`
      );
    } else {
      logger.error(
        `Scheduled snapshot failed in ${duration}s: ${result.errors.join("; ")}`
      );
    }
  } catch (error) {
    logger.error(`Scheduled snapshot failed: ${error}`);
  } finally {
    isSnapshotRunning = false;
  }
}

/**
 * Initialize and start all scheduled tasks
 */
export function startScheduler(): void {
  logger.info("Initializing scheduler...");

  // Scrape every 2 hours: minute 0 of every 2nd hour
  // Cron: 0 */2 * * * (at minute 0 past every 2nd hour)
  scrapeTask = cron.schedule(
    "0 */2 * * *",
    () => {
      runScrapeJob();
    },
    {
      timezone: "UTC",
    }
  );
  logger.info("Scrape job scheduled: every 2 hours (0 */2 * * * UTC)");

  // Snapshot daily at 10:00 UTC
  // Cron: 0 10 * * * (at 10:00 every day)
  snapshotTask = cron.schedule(
    "0 10 * * *",
    () => {
      runSnapshotJob();
    },
    {
      timezone: "UTC",
    }
  );
  logger.info("Snapshot job scheduled: daily at 10:00 UTC (0 10 * * * UTC)");

  logger.info("Scheduler started successfully");
}

/**
 * Stop all scheduled tasks (useful for graceful shutdown)
 */
export function stopScheduler(): void {
  logger.info("Stopping scheduler...");

  if (scrapeTask) {
    scrapeTask.stop();
    scrapeTask = null;
  }

  if (snapshotTask) {
    snapshotTask.stop();
    snapshotTask = null;
  }

  logger.info("Scheduler stopped");
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): {
  scrapeJob: { scheduled: boolean; running: boolean; nextRun: string };
  snapshotJob: { scheduled: boolean; running: boolean; nextRun: string };
} {
  const now = new Date();

  // Calculate next run times
  const getNextScrapeRun = (): string => {
    const next = new Date(now);
    next.setUTCMinutes(0, 0, 0);
    // Find next even hour
    const currentHour = next.getUTCHours();
    const nextEvenHour = currentHour % 2 === 0 ? currentHour + 2 : currentHour + 1;
    next.setUTCHours(nextEvenHour);
    if (next <= now) {
      next.setUTCHours(next.getUTCHours() + 2);
    }
    return next.toISOString();
  };

  const getNextSnapshotRun = (): string => {
    const next = new Date(now);
    next.setUTCHours(10, 0, 0, 0);
    if (next <= now) {
      next.setUTCDate(next.getUTCDate() + 1);
    }
    return next.toISOString();
  };

  return {
    scrapeJob: {
      scheduled: scrapeTask !== null,
      running: isScrapeRunning,
      nextRun: getNextScrapeRun(),
    },
    snapshotJob: {
      scheduled: snapshotTask !== null,
      running: isSnapshotRunning,
      nextRun: getNextSnapshotRun(),
    },
  };
}
