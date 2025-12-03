/**
 * Types for the SGT course records scraper
 */

/** A single scraped record from SGT */
export interface ScrapedRecord {
  playerUsername: string;
  playerDisplayName: string;
  countryCode: string | null;
  avatarUrl: string | null;
  score: string;
  scoreNumeric: number;
  recordDate: string | null;
}

/** A row from the singles records table (contains both Tips and SGT records) */
export interface ScrapedSinglesRow {
  sgtCourseId: string;
  courseName: string;
  tipsRecord: ScrapedRecord | null;
  sgtRecord: ScrapedRecord | null;
}

/** Result of a scrape run */
export interface ScrapeResult {
  success: boolean;
  rowsProcessed: number;
  tipsRecordsFound: number;
  sgtRecordsFound: number;
  playersCreated: number;
  playersUpdated: number;
  recordsCreated: number;
  recordsUpdated: number;
  errors: string[];
}

/** Result of upserting a player */
export interface UpsertPlayerResult {
  playerId: number;
  created: boolean;
}

/** Result of upserting a course record */
export interface UpsertRecordResult {
  created: boolean;
  updated: boolean;
}

