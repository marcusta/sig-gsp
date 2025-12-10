/**
 * Player Rank Snapshot Service
 * Generates periodic snapshots of player rankings to track changes over time
 */

import { sql } from "drizzle-orm";
import { db } from "../db/db";
import { playerRankSnapshots } from "../db/schema";
import logger from "../logger";

interface PlayerRanking {
  playerId: number;
  totalRecords: number;
  tipsRecords: number;
  sgtRecords: number;
}

interface PreviousSnapshot {
  playerId: number;
  overallRank: number;
  totalRecords: number;
}

export interface SnapshotResult {
  success: boolean;
  snapshotDate: string;
  playersProcessed: number;
  newEntries: number;
  updatedEntries: number;
  errors: string[];
}

/**
 * Generate a player rank snapshot for the current state
 * Compares with the previous snapshot to calculate rank changes
 */
export async function generatePlayerRankSnapshot(): Promise<SnapshotResult> {
  const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'
  const now = new Date().toISOString();

  const result: SnapshotResult = {
    success: false,
    snapshotDate: today,
    playersProcessed: 0,
    newEntries: 0,
    updatedEntries: 0,
    errors: [],
  };

  try {
    logger.info(`Generating player rank snapshot for ${today}...`);

    // Get current rankings from course_records
    const currentRankings = await getCurrentPlayerRankings();
    logger.info(`Found ${currentRankings.length} players with records`);

    // Get previous snapshot for comparison
    const previousSnapshot = await getPreviousSnapshot(today);
    const previousMap = new Map(
      previousSnapshot.map((p) => [p.playerId, p])
    );

    logger.info(
      `Found ${previousSnapshot.length} players in previous snapshot`
    );

    // Calculate tips-specific and sgt-specific rankings
    const tipsRankMap = calculateTeeTypeRanks(currentRankings, "tips");
    const sgtRankMap = calculateTeeTypeRanks(currentRankings, "sgt");

    // Insert/update snapshots for each player
    for (let i = 0; i < currentRankings.length; i++) {
      const current = currentRankings[i];
      const prev = previousMap.get(current.playerId);
      const overallRank = i + 1;

      // Calculate changes
      const rankChange = prev ? prev.overallRank - overallRank : 0;
      const recordsChange = prev
        ? current.totalRecords - prev.totalRecords
        : current.totalRecords;

      try {
        // Check if snapshot already exists for this date/player
        const existingSnapshot = await db.all(sql`
          SELECT id FROM player_rank_snapshots 
          WHERE snapshot_date = ${today} AND player_id = ${current.playerId}
        `);

        if (existingSnapshot.length > 0) {
          // Update existing snapshot
          await db.run(sql`
            UPDATE player_rank_snapshots SET
              overall_rank = ${overallRank},
              tips_rank = ${tipsRankMap.get(current.playerId) ?? null},
              sgt_rank = ${sgtRankMap.get(current.playerId) ?? null},
              total_records = ${current.totalRecords},
              tips_records = ${current.tipsRecords},
              sgt_records = ${current.sgtRecords},
              rank_change = ${rankChange},
              records_gained = ${recordsChange > 0 ? recordsChange : 0},
              records_lost = ${recordsChange < 0 ? Math.abs(recordsChange) : 0}
            WHERE snapshot_date = ${today} AND player_id = ${current.playerId}
          `);
          result.updatedEntries++;
        } else {
          // Insert new snapshot
          await db.insert(playerRankSnapshots).values({
            snapshotDate: today,
            playerId: current.playerId,
            overallRank,
            tipsRank: tipsRankMap.get(current.playerId) ?? null,
            sgtRank: sgtRankMap.get(current.playerId) ?? null,
            totalRecords: current.totalRecords,
            tipsRecords: current.tipsRecords,
            sgtRecords: current.sgtRecords,
            rankChange,
            recordsGained: recordsChange > 0 ? recordsChange : 0,
            recordsLost: recordsChange < 0 ? Math.abs(recordsChange) : 0,
            createdAt: now,
          });
          result.newEntries++;
        }

        result.playersProcessed++;
      } catch (playerError) {
        const msg = `Error processing player ${current.playerId}: ${playerError}`;
        logger.error(msg);
        result.errors.push(msg);
      }
    }

    result.success = true;
    logger.info(
      `Snapshot complete: ${result.newEntries} new, ${result.updatedEntries} updated`
    );
  } catch (error) {
    const msg = `Snapshot generation failed: ${error}`;
    logger.error(msg);
    result.errors.push(msg);
  }

  return result;
}

/**
 * Get current player rankings from course_records
 */
async function getCurrentPlayerRankings(): Promise<PlayerRanking[]> {
  const results = await db.all(sql`
    SELECT 
      p.id as player_id,
      COUNT(*) as total_records,
      COUNT(CASE WHEN rm.tee_type = 'tips' THEN 1 END) as tips_records,
      COUNT(CASE WHEN rm.tee_type = 'sgt' THEN 1 END) as sgt_records
    FROM players p
    JOIN course_records cr ON cr.player_id = p.id
    JOIN record_modes rm ON rm.id = cr.record_mode_id
    WHERE rm.player_format = 'single' AND rm.putting_mode = 'putting'
    GROUP BY p.id
    ORDER BY total_records DESC, tips_records DESC, sgt_records DESC
  `);

  return results.map((row: any) => ({
    playerId: row.player_id,
    totalRecords: row.total_records,
    tipsRecords: row.tips_records,
    sgtRecords: row.sgt_records,
  }));
}

/**
 * Get the most recent snapshot before the given date
 */
async function getPreviousSnapshot(
  beforeDate: string
): Promise<PreviousSnapshot[]> {
  const results = await db.all(sql`
    SELECT player_id, overall_rank, total_records
    FROM player_rank_snapshots
    WHERE snapshot_date = (
      SELECT MAX(snapshot_date) 
      FROM player_rank_snapshots 
      WHERE snapshot_date < ${beforeDate}
    )
  `);

  return results.map((row: any) => ({
    playerId: row.player_id,
    overallRank: row.overall_rank,
    totalRecords: row.total_records,
  }));
}

/**
 * Calculate tee-type-specific rankings
 */
function calculateTeeTypeRanks(
  rankings: PlayerRanking[],
  teeType: "tips" | "sgt"
): Map<number, number> {
  const rankMap = new Map<number, number>();

  // Filter and sort by tee-type specific records
  const sorted = [...rankings]
    .filter((r) => (teeType === "tips" ? r.tipsRecords : r.sgtRecords) > 0)
    .sort((a, b) => {
      const aRecords = teeType === "tips" ? a.tipsRecords : a.sgtRecords;
      const bRecords = teeType === "tips" ? b.tipsRecords : b.sgtRecords;
      return bRecords - aRecords;
    });

  sorted.forEach((player, index) => {
    rankMap.set(player.playerId, index + 1);
  });

  return rankMap;
}

/**
 * Get player rank history over time
 */
export async function getPlayerRankHistory(
  playerId: number,
  limit: number = 30
): Promise<any[]> {
  const results = await db.all(sql`
    SELECT 
      snapshot_date,
      overall_rank,
      tips_rank,
      sgt_rank,
      total_records,
      tips_records,
      sgt_records,
      rank_change,
      records_gained,
      records_lost
    FROM player_rank_snapshots
    WHERE player_id = ${playerId}
    ORDER BY snapshot_date DESC
    LIMIT ${limit}
  `);

  return results.map((row: any) => ({
    date: row.snapshot_date,
    overallRank: row.overall_rank,
    tipsRank: row.tips_rank,
    sgtRank: row.sgt_rank,
    totalRecords: row.total_records,
    tipsRecords: row.tips_records,
    sgtRecords: row.sgt_records,
    rankChange: row.rank_change,
    recordsGained: row.records_gained,
    recordsLost: row.records_lost,
  }));
}

/**
 * Get the latest rank change for a player
 */
export async function getLatestPlayerRankChange(
  playerId: number
): Promise<{ rankChange: number; recordsChange: number } | null> {
  const results = await db.all(sql`
    SELECT rank_change, records_gained, records_lost
    FROM player_rank_snapshots
    WHERE player_id = ${playerId}
    ORDER BY snapshot_date DESC
    LIMIT 1
  `);

  if (results.length === 0) {
    return null;
  }

  const row = results[0] as any;
  return {
    rankChange: row.rank_change || 0,
    recordsChange: (row.records_gained || 0) - (row.records_lost || 0),
  };
}

/**
 * Get snapshot for a player near a specific date (returns closest snapshot on or before the date)
 */
export async function getSnapshotNearDate(
  playerId: number,
  targetDate: string
): Promise<{
  date: string;
  overallRank: number;
  totalRecords: number;
  tipsRecords: number;
  sgtRecords: number;
} | null> {
  const results = await db.all(sql`
    SELECT
      snapshot_date,
      overall_rank,
      total_records,
      tips_records,
      sgt_records
    FROM player_rank_snapshots
    WHERE player_id = ${playerId} AND snapshot_date <= ${targetDate}
    ORDER BY snapshot_date DESC
    LIMIT 1
  `);

  if (results.length === 0) {
    return null;
  }

  const row = results[0] as any;
  return {
    date: row.snapshot_date,
    overallRank: row.overall_rank,
    totalRecords: row.total_records,
    tipsRecords: row.tips_records,
    sgtRecords: row.sgt_records,
  };
}

/**
 * Calculate the date X days ago from today
 */
export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0]; // 'YYYY-MM-DD'
}

/**
 * Get the date for the start of last week (Monday)
 */
export function getLastWeekStart(): string {
  const date = new Date();
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1; // If Sunday (0), go back 6 days, else go back to Monday
  date.setDate(date.getDate() - diff - 7); // Go back to last Monday
  return date.toISOString().split("T")[0];
}

/**
 * Get rank change for a player over a specific time period
 */
export async function getPlayerRankChangeOverPeriod(
  playerId: number,
  daysAgo: number
): Promise<{
  currentRank: number | null;
  previousRank: number | null;
  rankChange: number;
  currentRecords: number;
  previousRecords: number;
  recordsChange: number;
} | null> {
  const compareDate = getDateDaysAgo(daysAgo);

  // Get most recent snapshot (current)
  const currentResults = await db.all(sql`
    SELECT overall_rank, total_records
    FROM player_rank_snapshots
    WHERE player_id = ${playerId}
    ORDER BY snapshot_date DESC
    LIMIT 1
  `);

  if (currentResults.length === 0) {
    return null;
  }

  const current = currentResults[0] as any;
  const previousSnapshot = await getSnapshotNearDate(playerId, compareDate);

  if (!previousSnapshot) {
    // Player has no snapshot from that far back, treat as new
    return {
      currentRank: current.overall_rank,
      previousRank: null,
      rankChange: 0,
      currentRecords: current.total_records,
      previousRecords: 0,
      recordsChange: current.total_records,
    };
  }

  return {
    currentRank: current.overall_rank,
    previousRank: previousSnapshot.overallRank,
    rankChange: previousSnapshot.overallRank - current.overall_rank, // positive = moved up
    currentRecords: current.total_records,
    previousRecords: previousSnapshot.totalRecords,
    recordsChange: current.total_records - previousSnapshot.totalRecords,
  };
}



