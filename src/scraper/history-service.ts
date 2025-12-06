/**
 * Course Record History Service
 * Provides access to record change history data
 */

import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db/db";
import { courseRecordHistory, courses, players, recordModes } from "../db/schema";

export interface RecordChangeEvent {
  id: number;
  courseId: number;
  courseName: string;
  courseLocation: string;
  recordType: string; // 'tips' or 'sgt'
  changeType: string; // 'INITIAL', 'BROKEN', 'IMPROVED'
  previousPlayer: {
    id: number;
    username: string;
    displayName: string;
    countryCode: string | null;
  } | null;
  previousScore: string | null;
  newPlayer: {
    id: number;
    username: string;
    displayName: string;
    countryCode: string | null;
  };
  newScore: string;
  scoreImprovement: number | null;
  detectedAt: string;
}

/**
 * Get recent record changes (activity feed)
 */
export async function getRecentRecordChanges(
  limit: number = 50,
  offset: number = 0
): Promise<RecordChangeEvent[]> {
  const results = await db.all(sql`
    SELECT 
      crh.id,
      crh.course_id,
      c.name as course_name,
      c.location as course_location,
      rm.tee_type as record_type,
      crh.change_type,
      crh.previous_player_id,
      pp.sgt_username as prev_player_username,
      pp.display_name as prev_player_display_name,
      pp.country_code as prev_player_country,
      crh.previous_score,
      crh.new_player_id,
      np.sgt_username as new_player_username,
      np.display_name as new_player_display_name,
      np.country_code as new_player_country,
      crh.new_score,
      crh.score_improvement,
      crh.detected_at
    FROM course_record_history crh
    JOIN courses c ON c.id = crh.course_id
    JOIN record_modes rm ON rm.id = crh.record_mode_id
    JOIN players np ON np.id = crh.new_player_id
    LEFT JOIN players pp ON pp.id = crh.previous_player_id
    ORDER BY crh.detected_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return results.map(formatRecordChangeEvent);
}

/**
 * Get record history for a specific course
 */
export async function getCourseRecordHistory(
  courseId: number,
  recordType?: "tips" | "sgt"
): Promise<RecordChangeEvent[]> {
  let query = sql`
    SELECT 
      crh.id,
      crh.course_id,
      c.name as course_name,
      c.location as course_location,
      rm.tee_type as record_type,
      crh.change_type,
      crh.previous_player_id,
      pp.sgt_username as prev_player_username,
      pp.display_name as prev_player_display_name,
      pp.country_code as prev_player_country,
      crh.previous_score,
      crh.new_player_id,
      np.sgt_username as new_player_username,
      np.display_name as new_player_display_name,
      np.country_code as new_player_country,
      crh.new_score,
      crh.score_improvement,
      crh.detected_at
    FROM course_record_history crh
    JOIN courses c ON c.id = crh.course_id
    JOIN record_modes rm ON rm.id = crh.record_mode_id
    JOIN players np ON np.id = crh.new_player_id
    LEFT JOIN players pp ON pp.id = crh.previous_player_id
    WHERE crh.course_id = ${courseId}
  `;

  if (recordType) {
    query = sql`${query} AND rm.tee_type = ${recordType}`;
  }

  query = sql`${query} ORDER BY crh.detected_at DESC`;

  const results = await db.all(query);
  return results.map(formatRecordChangeEvent);
}

/**
 * Get record changes by a specific player
 */
export async function getPlayerRecordChanges(
  playerId: number,
  limit: number = 50
): Promise<RecordChangeEvent[]> {
  const results = await db.all(sql`
    SELECT 
      crh.id,
      crh.course_id,
      c.name as course_name,
      c.location as course_location,
      rm.tee_type as record_type,
      crh.change_type,
      crh.previous_player_id,
      pp.sgt_username as prev_player_username,
      pp.display_name as prev_player_display_name,
      pp.country_code as prev_player_country,
      crh.previous_score,
      crh.new_player_id,
      np.sgt_username as new_player_username,
      np.display_name as new_player_display_name,
      np.country_code as new_player_country,
      crh.new_score,
      crh.score_improvement,
      crh.detected_at
    FROM course_record_history crh
    JOIN courses c ON c.id = crh.course_id
    JOIN record_modes rm ON rm.id = crh.record_mode_id
    JOIN players np ON np.id = crh.new_player_id
    LEFT JOIN players pp ON pp.id = crh.previous_player_id
    WHERE crh.new_player_id = ${playerId}
    ORDER BY crh.detected_at DESC
    LIMIT ${limit}
  `);

  return results.map(formatRecordChangeEvent);
}

/**
 * Get count of record changes by type within a date range
 */
export async function getRecordChangeStats(
  daysBack: number = 30
): Promise<{
  totalChanges: number;
  brokenRecords: number;
  improvedRecords: number;
  initialRecords: number;
}> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  const cutoffDateStr = cutoffDate.toISOString();

  const results = await db.all(sql`
    SELECT 
      COUNT(*) as total_changes,
      COUNT(CASE WHEN change_type = 'BROKEN' THEN 1 END) as broken_records,
      COUNT(CASE WHEN change_type = 'IMPROVED' THEN 1 END) as improved_records,
      COUNT(CASE WHEN change_type = 'INITIAL' THEN 1 END) as initial_records
    FROM course_record_history
    WHERE detected_at >= ${cutoffDateStr}
  `);

  const row = results[0] as any;
  return {
    totalChanges: row.total_changes || 0,
    brokenRecords: row.broken_records || 0,
    improvedRecords: row.improved_records || 0,
    initialRecords: row.initial_records || 0,
  };
}

/**
 * Get players who have lost records recently (their records were broken)
 */
export async function getPlayersWithLostRecords(
  daysBack: number = 7,
  limit: number = 20
): Promise<
  Array<{
    player: { id: number; username: string; displayName: string };
    recordsLost: number;
  }>
> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  const cutoffDateStr = cutoffDate.toISOString();

  const results = await db.all(sql`
    SELECT 
      p.id,
      p.sgt_username as username,
      p.display_name,
      COUNT(*) as records_lost
    FROM course_record_history crh
    JOIN players p ON p.id = crh.previous_player_id
    WHERE crh.change_type = 'BROKEN'
      AND crh.detected_at >= ${cutoffDateStr}
    GROUP BY p.id
    ORDER BY records_lost DESC
    LIMIT ${limit}
  `);

  return results.map((row: any) => ({
    player: {
      id: row.id,
      username: row.username,
      displayName: row.display_name,
    },
    recordsLost: row.records_lost,
  }));
}

/**
 * Get players who have gained records recently (broke someone else's record)
 */
export async function getPlayersWithGainedRecords(
  daysBack: number = 7,
  limit: number = 20
): Promise<
  Array<{
    player: { id: number; username: string; displayName: string };
    recordsGained: number;
  }>
> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  const cutoffDateStr = cutoffDate.toISOString();

  const results = await db.all(sql`
    SELECT 
      p.id,
      p.sgt_username as username,
      p.display_name,
      COUNT(*) as records_gained
    FROM course_record_history crh
    JOIN players p ON p.id = crh.new_player_id
    WHERE crh.change_type = 'BROKEN'
      AND crh.detected_at >= ${cutoffDateStr}
    GROUP BY p.id
    ORDER BY records_gained DESC
    LIMIT ${limit}
  `);

  return results.map((row: any) => ({
    player: {
      id: row.id,
      username: row.username,
      displayName: row.display_name,
    },
    recordsGained: row.records_gained,
  }));
}

/**
 * Get bidirectional rivalry data for a specific player
 * Shows records taken FROM this player and records taken BY this player
 */
export async function getPlayersWhoTookRecordsFrom(
  playerId: number,
  daysBack?: number
): Promise<
  Array<{
    player: {
      id: number;
      username: string;
      displayName: string;
      countryCode: string | null;
      avatarUrl: string | null;
    };
    recordsTakenFromMe: number; // How many records this rival took from me
    recordsTakenByMe: number; // How many records I took from this rival
    balance: number; // recordsTakenByMe - recordsTakenFromMe (positive = winning)
    coursesLost: Array<{
      courseId: number;
      courseName: string;
      recordType: string;
      detectedAt: string;
    }>;
    coursesWon: Array<{
      courseId: number;
      courseName: string;
      recordType: string;
      detectedAt: string;
    }>;
  }>
> {
  let dateFilter = sql``;
  if (daysBack) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    const cutoffDateStr = cutoffDate.toISOString();
    dateFilter = sql` AND crh.detected_at >= ${cutoffDateStr}`;
  }

  // Get all players I've had record exchanges with (both directions)
  const allRivalIds = await db.all(sql`
    SELECT DISTINCT
      CASE
        WHEN crh.previous_player_id = ${playerId} THEN crh.new_player_id
        WHEN crh.new_player_id = ${playerId} THEN crh.previous_player_id
      END as rival_id
    FROM course_record_history crh
    WHERE (crh.previous_player_id = ${playerId} OR crh.new_player_id = ${playerId})
      AND crh.change_type = 'BROKEN'
      ${dateFilter}
  `);

  const rivalIds = allRivalIds
    .map((r: any) => r.rival_id)
    .filter((id) => id !== null);

  if (rivalIds.length === 0) {
    return [];
  }

  // Get player details for all rivals
  const rivalPlayers = await db.all(sql`
    SELECT id, sgt_username as username, display_name, country_code, avatar_url
    FROM players
    WHERE id IN (${sql.join(rivalIds.map((id) => sql`${id}`), sql`, `)})
  `);

  // For each rival, get bidirectional stats
  const rivalriesWithDetails = await Promise.all(
    rivalPlayers.map(async (rival: any) => {
      // Records they took from me
      const coursesLost = await db.all(sql`
        SELECT
          c.id as course_id,
          c.name as course_name,
          rm.tee_type as record_type,
          crh.detected_at
        FROM course_record_history crh
        JOIN courses c ON c.id = crh.course_id
        JOIN record_modes rm ON rm.id = crh.record_mode_id
        WHERE crh.previous_player_id = ${playerId}
          AND crh.new_player_id = ${rival.id}
          AND crh.change_type = 'BROKEN'
          ${dateFilter}
        ORDER BY crh.detected_at DESC
      `);

      // Records I took from them
      const coursesWon = await db.all(sql`
        SELECT
          c.id as course_id,
          c.name as course_name,
          rm.tee_type as record_type,
          crh.detected_at
        FROM course_record_history crh
        JOIN courses c ON c.id = crh.course_id
        JOIN record_modes rm ON rm.id = crh.record_mode_id
        WHERE crh.previous_player_id = ${rival.id}
          AND crh.new_player_id = ${playerId}
          AND crh.change_type = 'BROKEN'
          ${dateFilter}
        ORDER BY crh.detected_at DESC
      `);

      const recordsTakenFromMe = coursesLost.length;
      const recordsTakenByMe = coursesWon.length;
      const balance = recordsTakenByMe - recordsTakenFromMe;

      return {
        player: {
          id: rival.id,
          username: rival.username,
          displayName: rival.display_name,
          countryCode: rival.country_code,
          avatarUrl: rival.avatar_url,
        },
        recordsTakenFromMe,
        recordsTakenByMe,
        balance,
        coursesLost: coursesLost.map((c: any) => ({
          courseId: c.course_id,
          courseName: c.course_name,
          recordType: c.record_type,
          detectedAt: c.detected_at,
        })),
        coursesWon: coursesWon.map((c: any) => ({
          courseId: c.course_id,
          courseName: c.course_name,
          recordType: c.record_type,
          detectedAt: c.detected_at,
        })),
      };
    })
  );

  // Sort by total interactions (most active rivalries first)
  return rivalriesWithDetails.sort(
    (a, b) =>
      b.recordsTakenFromMe +
      b.recordsTakenByMe -
      (a.recordsTakenFromMe + a.recordsTakenByMe)
  );
}

/**
 * Format a raw database row into a RecordChangeEvent
 */
function formatRecordChangeEvent(row: any): RecordChangeEvent {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.course_name,
    courseLocation: row.course_location,
    recordType: row.record_type,
    changeType: row.change_type,
    previousPlayer: row.previous_player_id
      ? {
          id: row.previous_player_id,
          username: row.prev_player_username,
          displayName: row.prev_player_display_name,
          countryCode: row.prev_player_country,
        }
      : null,
    previousScore: row.previous_score,
    newPlayer: {
      id: row.new_player_id,
      username: row.new_player_username,
      displayName: row.new_player_display_name,
      countryCode: row.new_player_country,
    },
    newScore: row.new_score,
    scoreImprovement: row.score_improvement,
    detectedAt: row.detected_at,
  };
}


