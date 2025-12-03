# Feature Plan: Course Records System

## Overview

Build a comprehensive course records tracking system that scrapes SGT data, stores it locally, and provides both per-course and per-player aggregate views.

**Status**: Planning  
**Last Updated**: 2024-12-03  
**Priority**: High

---

## Record Type Dimensions

SGT tracks course records across **three independent dimensions**:

| Dimension | Current Values | Extensible |
|-----------|----------------|------------|
| **Putting Mode** | `putting`, `autoputt` | Yes |
| **Tee Type** | `tips`, `sgt` | Yes |
| **Player Mode** | `single`, `2-man-scramble`, `4-man-scramble`, `alt-shot` | Yes |

This creates a matrix of possible combinations (currently 2×2×4 = 16 theoretical combinations, though not all may exist on SGT).

### Implementation Scope

**Phase 1 (Initial)**: Only scrape:
- ✅ Putting Mode: `putting` only
- ✅ Tee Types: `tips` AND `sgt`
- ✅ Player Mode: `single` only

**Future Phases**: Extend to other combinations as needed.

---

## SGT API Endpoints (Discovered)

Based on research documented in `docs/sgt-scraping.md`:

### Singles (Tips + SGT combined)
```
URL: https://simulatorgolftour.com/sgt-api/courses/course-records
```
- Returns ALL courses with both Tips and SGT single records in one response
- Data attributes per row:
  - `data-course-id` - SGT course ID
  - `data-sort-tips-player`, `data-sort-tips-score`, `data-sort-tips-date`
  - `data-sort-sgt-player`, `data-sort-sgt-score`, `data-sort-sgt-date`
- Player info: profile URL (`/profile/Username`), country flag (`fi-xx`), avatar, date

### 2-Man Scramble (Tips)
```
URL: https://simulatorgolftour.com/sgt-api/courses/course-team-records/TCRT1
```
- `TCRT1` = Tips Course Record Team (2-man)
- Shows two players per record

### 4-Man Scramble (Tips)
```
URL: https://simulatorgolftour.com/sgt-api/courses/course-team-records/TCRT2
```
- `TCRT2` = Tips Course Record Team (4-man)
- Shows four players per record

### API Key Pattern (Hypothesis)
| Player Mode | Tips Tee | SGT Tee |
|-------------|----------|---------|
| Single | `CRTips` | `CR` |
| 2-Man Scramble | `TCRT1` | `TCR1` (?) |
| 4-Man Scramble | `TCRT2` | `TCR2` (?) |
| Alt-Shot | TBD | TBD |

> **Note**: Auto-putt endpoints not yet discovered. May be separate URLs or query params.

---

## Phase 1: Research (COMPLETED)

### Findings

- [x] **1.1** Identified SGT API endpoints for singles and team formats
- [x] **1.2** Singles endpoint returns both Tips and SGT in one call (efficient!)
- [x] **1.3** Player identification: Username + Profile URL (`/profile/Username`)
- [x] **1.4** Team records show individual player profiles (not team IDs)

### Open Questions (for future phases)
- What are the auto-putt endpoints?
- What are the SGT-tee team record endpoints?
- What is the alt-shot endpoint?

---

## Phase 2: Database Design

### Design Principles

1. **Simple flat `record_modes` table** - all discriminators as columns, no over-normalization
2. **`players` table** - all players we encounter from SGT
3. **Flexible team structure** via `teams` + `team_members` (for future team modes)
4. **One record per course per mode** - `course_records` links everything together

### New Tables

#### `record_modes`
Single flat table defining all record mode configurations. Each row represents a unique combination of tee type, player format, and putting mode.

```sql
CREATE TABLE record_modes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Discriminators (for filtering/grouping)
  tee_type TEXT NOT NULL,             -- 'tips' | 'sgt'
  player_format TEXT NOT NULL,        -- 'single' | '2-man-scramble' | '4-man-scramble' | 'alt-shot'
  putting_mode TEXT NOT NULL,         -- 'putting' | 'autoputt'
  
  -- Team info
  is_team INTEGER NOT NULL DEFAULT 0, -- 0 = single, 1 = team mode
  team_size INTEGER NOT NULL DEFAULT 1, -- 1 for single, 2 or 4 for teams
  
  -- SGT API info
  sgt_api_url TEXT,                   -- Full URL to scrape (null if unknown)
  
  -- Display
  display_name TEXT NOT NULL,         -- 'Tips Single', 'SGT 2-Man Scramble', etc.
  short_name TEXT NOT NULL,           -- 'Tips', 'SGT 2M', etc.
  
  -- Status
  is_active INTEGER NOT NULL DEFAULT 0, -- 1 = we actively scrape this mode
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tee_type, player_format, putting_mode)
);

-- Seed data
INSERT INTO record_modes (tee_type, player_format, putting_mode, is_team, team_size, sgt_api_url, display_name, short_name, is_active) VALUES
  -- Phase 1: Active (singles with putting)
  ('tips', 'single', 'putting', 0, 1, 'https://simulatorgolftour.com/sgt-api/courses/course-records', 'Tips Single', 'Tips', 1),
  ('sgt', 'single', 'putting', 0, 1, 'https://simulatorgolftour.com/sgt-api/courses/course-records', 'SGT Single', 'SGT', 1),
  
  -- Future: Team modes (putting)
  ('tips', '2-man-scramble', 'putting', 1, 2, 'https://simulatorgolftour.com/sgt-api/courses/course-team-records/TCRT1', 'Tips 2-Man Scramble', 'Tips 2M', 0),
  ('tips', '4-man-scramble', 'putting', 1, 4, 'https://simulatorgolftour.com/sgt-api/courses/course-team-records/TCRT2', 'Tips 4-Man Scramble', 'Tips 4M', 0),
  ('sgt', '2-man-scramble', 'putting', 1, 2, NULL, 'SGT 2-Man Scramble', 'SGT 2M', 0),
  ('sgt', '4-man-scramble', 'putting', 1, 4, NULL, 'SGT 4-Man Scramble', 'SGT 4M', 0),
  ('tips', 'alt-shot', 'putting', 1, 2, NULL, 'Tips Alt-Shot', 'Tips AS', 0),
  ('sgt', 'alt-shot', 'putting', 1, 2, NULL, 'SGT Alt-Shot', 'SGT AS', 0),
  
  -- Future: Auto-putt variants
  ('tips', 'single', 'autoputt', 0, 1, NULL, 'Tips Single (Auto)', 'Tips A', 0),
  ('sgt', 'single', 'autoputt', 0, 1, NULL, 'SGT Single (Auto)', 'SGT A', 0);

CREATE INDEX idx_record_modes_active ON record_modes(is_active);
CREATE INDEX idx_record_modes_tee ON record_modes(tee_type);
```

#### `players`
Stores unique player information scraped from SGT.

```sql
CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sgt_username TEXT NOT NULL UNIQUE,  -- Primary identifier (from /profile/Username)
  display_name TEXT NOT NULL,         -- Display name (may differ from username)
  country_code TEXT,                  -- e.g., 'us', 'se', 'gb', 'kr'
  avatar_url TEXT,                    -- Full URL to avatar image
  first_seen_at TEXT NOT NULL,        -- ISO timestamp
  last_seen_at TEXT NOT NULL,         -- ISO timestamp
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_players_display_name ON players(display_name);
CREATE INDEX idx_players_country ON players(country_code);
```

#### `teams`
Stores team compositions. References record_mode to know what type of team (2-man, 4-man, etc.)

```sql
CREATE TABLE teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_mode_id INTEGER NOT NULL REFERENCES record_modes(id),
  team_hash TEXT NOT NULL UNIQUE,     -- Hash of sorted player IDs for deduplication
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_mode ON teams(record_mode_id);
```

#### `team_members`
Links players to teams. Supports any team size.

```sql
CREATE TABLE team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id),
  position INTEGER NOT NULL DEFAULT 1, -- Order in team display (1, 2, 3, 4)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, player_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_player ON team_members(player_id);
```

#### `course_records`
Main table storing all course records. Each record references either a player (singles) or a team (team modes).

```sql
CREATE TABLE course_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id),
  record_mode_id INTEGER NOT NULL REFERENCES record_modes(id),
  
  -- For singles: player_id is set, team_id is NULL
  -- For teams: team_id is set, player_id is NULL
  player_id INTEGER REFERENCES players(id),
  team_id INTEGER REFERENCES teams(id),
  
  score TEXT NOT NULL,              -- e.g., '-15', 'E', '+2'
  score_numeric INTEGER NOT NULL,   -- Numeric value for sorting (-15, 0, 2)
  record_date TEXT,                 -- Date record was set (from SGT, e.g., '2023-06-01')
  
  -- Metadata
  scraped_at TEXT NOT NULL,         -- When this record was last scraped
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(course_id, record_mode_id),  -- One record per course per mode
  CHECK (
    (player_id IS NOT NULL AND team_id IS NULL) OR 
    (player_id IS NULL AND team_id IS NOT NULL)
  )
);

CREATE INDEX idx_course_records_course ON course_records(course_id);
CREATE INDEX idx_course_records_mode ON course_records(record_mode_id);
CREATE INDEX idx_course_records_player ON course_records(player_id);
CREATE INDEX idx_course_records_team ON course_records(team_id);
CREATE INDEX idx_course_records_score ON course_records(score_numeric);
```

#### `scrape_runs`
Track scraping history for debugging and monitoring.

```sql
CREATE TABLE scrape_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL,             -- 'running' | 'completed' | 'failed'
  record_modes_scraped TEXT,        -- JSON array of record_mode_ids scraped
  courses_processed INTEGER DEFAULT 0,
  records_found INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  players_created INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Drizzle Schema

```typescript
// src/db/schema.ts additions

import { sql, relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Record Modes - flat configuration table
export const recordModes = sqliteTable("record_modes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teeType: text("tee_type").notNull(),           // 'tips' | 'sgt'
  playerFormat: text("player_format").notNull(), // 'single' | '2-man-scramble' | etc.
  puttingMode: text("putting_mode").notNull(),   // 'putting' | 'autoputt'
  isTeam: integer("is_team", { mode: "boolean" }).notNull().default(false),
  teamSize: integer("team_size").notNull().default(1),
  sgtApiUrl: text("sgt_api_url"),
  displayName: text("display_name").notNull(),
  shortName: text("short_name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Players
export const players = sqliteTable("players", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sgtUsername: text("sgt_username").notNull().unique(),
  displayName: text("display_name").notNull(),
  countryCode: text("country_code"),
  avatarUrl: text("avatar_url"),
  firstSeenAt: text("first_seen_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Teams
export const teams = sqliteTable("teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  recordModeId: integer("record_mode_id").notNull().references(() => recordModes.id),
  teamHash: text("team_hash").notNull().unique(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const teamMembers = sqliteTable("team_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id").notNull().references(() => teams.id),
  playerId: integer("player_id").notNull().references(() => players.id),
  position: integer("position").notNull().default(1),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Course Records
export const courseRecords = sqliteTable("course_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").notNull().references(() => courses.id),
  recordModeId: integer("record_mode_id").notNull().references(() => recordModes.id),
  playerId: integer("player_id").references(() => players.id),
  teamId: integer("team_id").references(() => teams.id),
  score: text("score").notNull(),
  scoreNumeric: integer("score_numeric").notNull(),
  recordDate: text("record_date"),
  scrapedAt: text("scraped_at").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Scrape Tracking
export const scrapeRuns = sqliteTable("scrape_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  status: text("status").notNull(),
  recordModesScraped: text("record_modes_scraped"),
  coursesProcessed: integer("courses_processed").default(0),
  recordsFound: integer("records_found").default(0),
  recordsCreated: integer("records_created").default(0),
  recordsUpdated: integer("records_updated").default(0),
  playersCreated: integer("players_created").default(0),
  errorMessage: text("error_message"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const recordModesRelations = relations(recordModes, ({ many }) => ({
  courseRecords: many(courseRecords),
  teams: many(teams),
}));

export const playersRelations = relations(players, ({ many }) => ({
  courseRecords: many(courseRecords),
  teamMemberships: many(teamMembers),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  recordMode: one(recordModes, {
    fields: [teams.recordModeId],
    references: [recordModes.id],
  }),
  members: many(teamMembers),
  courseRecords: many(courseRecords),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  player: one(players, {
    fields: [teamMembers.playerId],
    references: [players.id],
  }),
}));

export const courseRecordsRelations = relations(courseRecords, ({ one }) => ({
  course: one(courses, {
    fields: [courseRecords.courseId],
    references: [courses.id],
  }),
  recordMode: one(recordModes, {
    fields: [courseRecords.recordModeId],
    references: [recordModes.id],
  }),
  player: one(players, {
    fields: [courseRecords.playerId],
    references: [players.id],
  }),
  team: one(teams, {
    fields: [courseRecords.teamId],
    references: [teams.id],
  }),
}));
```

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        record_modes                              │
├─────────────────────────────────────────────────────────────────┤
│ id                                                               │
│ tee_type         ('tips' | 'sgt')                               │
│ player_format    ('single' | '2-man-scramble' | '4-man-scramble' | 'alt-shot') │
│ putting_mode     ('putting' | 'autoputt')                       │
│ is_team          (0 or 1)                                       │
│ team_size        (1, 2, or 4)                                   │
│ sgt_api_url      (URL to scrape)                                │
│ display_name     ('Tips Single', 'SGT 2-Man Scramble', etc.)    │
│ is_active        (1 = we scrape this)                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
            ▼                 │                 ▼
┌───────────────────┐         │       ┌───────────────────┐
│      players      │         │       │       teams       │
├───────────────────┤         │       ├───────────────────┤
│ id                │         │       │ id                │
│ sgt_username (UK) │         │       │ record_mode_id ───┼──► record_modes
│ display_name      │         │       │ team_hash (UK)    │
│ country_code      │         │       └─────────┬─────────┘
│ avatar_url        │         │                 │
└─────────┬─────────┘         │                 │
          │                   │       ┌─────────┴─────────┐
          │                   │       │   team_members    │
          │                   │       ├───────────────────┤
          │                   │       │ team_id ──────────┼──► teams
          ├───────────────────┼───────│ player_id ────────┼──► players
          │                   │       │ position          │
          │                   │       └───────────────────┘
          │                   │
          │                   ▼
          │         ┌───────────────────────┐
          │         │    course_records     │
          │         ├───────────────────────┤
          │         │ id                    │
          └────────►│ player_id             │ (for singles)
                    │ team_id               │ (for teams)
     courses ◄──────│ course_id             │
                    │ record_mode_id ───────┼──► record_modes
                    │ score                 │
                    │ score_numeric         │
                    │ record_date           │
                    │ scraped_at            │
                    │                       │
                    │ UNIQUE(course_id, record_mode_id)  │
                    └───────────────────────┘
```

### Summary

**6 new tables total:**

| Table | Purpose | Phase 1 Usage |
|-------|---------|---------------|
| `record_modes` | Configuration of all mode types | ✅ 10 rows seeded |
| `players` | All SGT players we've seen | ✅ Populated by scraper |
| `teams` | Team compositions | ⏳ Future (team modes) |
| `team_members` | Links players to teams | ⏳ Future (team modes) |
| `course_records` | The actual records (one per course per mode) | ✅ Populated by scraper |
| `scrape_runs` | Scraping history/monitoring | ✅ Created per scrape |

**Phase 1 data flow:**
1. Scraper fetches SGT API → parses HTML
2. For each course with a record:
   - Upsert player to `players` table
   - Upsert record to `course_records` (referencing player and record_mode)
3. Record scrape stats in `scrape_runs`

### Deliverables
- [ ] Migration file created (`src/db/migrations/000X_course_records.sql`)
- [ ] Drizzle schema added to `src/db/schema.ts`
- [ ] `record_modes` seeded with 10 known modes
- [ ] Relations defined for all tables
- [ ] Test insert/query with sample data

---

## Phase 3: Scraper Implementation

### Scope (Phase 1)

Only scraping **singles records** (Tips + SGT tees) with **normal putting**.

Key insight: The SGT singles endpoint returns **both Tips and SGT records** in a single response, making this very efficient - we only need **ONE API call** to get all singles data.

### File Structure

```
src/
├── scraper/
│   ├── index.ts                    # Main scraper orchestration
│   ├── singles-scraper.ts          # Singles record scraping (Tips + SGT)
│   ├── team-scraper.ts             # Team record scraping (future)
│   ├── html-parser.ts              # Cheerio parsing utilities
│   ├── player-service.ts           # Player upsert logic
│   └── types.ts                    # Scraper-specific types
```

### Types

```typescript
// src/scraper/types.ts

export interface ScrapedSinglesRow {
  sgtCourseId: string;
  courseName: string;
  
  // Tips record (may be null if no record exists)
  tipsRecord: ScrapedRecord | null;
  
  // SGT record (may be null if no record exists)
  sgtRecord: ScrapedRecord | null;
}

export interface ScrapedRecord {
  playerUsername: string;      // From /profile/Username link
  playerDisplayName: string;   // Display text
  countryCode: string | null;  // e.g., 'kr', 'us', 'se'
  avatarUrl: string | null;    // Full URL or null
  score: string;               // '-15', 'E', '+2'
  scoreNumeric: number;        // -15, 0, 2
  recordDate: string | null;   // '2023-06-01' or null
}

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
```

### HTML Parser

```typescript
// src/scraper/html-parser.ts

import * as cheerio from "cheerio";

export function parseSinglesResponse(html: string): ScrapedSinglesRow[] {
  const $ = cheerio.load(html);
  const rows: ScrapedSinglesRow[] = [];
  
  $("table.course-records-table tbody tr").each((_, element) => {
    const $row = $(element);
    
    const sgtCourseId = $row.attr("data-course-id");
    const courseName = $row.find("td.course-name").text().trim();
    
    // Parse Tips record (if exists)
    const tipsRecord = parseRecordFromRow($, $row, "tips");
    
    // Parse SGT record (if exists)
    const sgtRecord = parseRecordFromRow($, $row, "sgt");
    
    if (sgtCourseId) {
      rows.push({
        sgtCourseId,
        courseName,
        tipsRecord,
        sgtRecord,
      });
    }
  });
  
  return rows;
}

function parseRecordFromRow(
  $: cheerio.CheerioAPI,
  $row: cheerio.Cheerio,
  type: "tips" | "sgt"
): ScrapedRecord | null {
  // Check data attributes for quick null check
  const playerAttr = $row.attr(`data-sort-${type}-player`);
  if (!playerAttr) return null;
  
  const scoreAttr = $row.attr(`data-sort-${type}-score`);
  const dateAttr = $row.attr(`data-sort-${type}-date`);
  
  // Find the player cell (tips-player or sgt-player class)
  const $playerCell = $row.find(`td.${type}-player`);
  if ($playerCell.find("button.attempt-button").length > 0 && !$playerCell.find("a").length) {
    // This is an "ATTEMPT" button only row - no record exists
    return null;
  }
  
  // Extract player info
  const $profileLink = $playerCell.find("a[href^='/profile/']");
  const profileHref = $profileLink.attr("href") || "";
  const playerUsername = profileHref.replace("/profile/", "");
  const playerDisplayName = $profileLink.text().trim();
  
  // Extract country code from flag class (e.g., "fi-kr" -> "kr")
  const flagClass = $playerCell.find(".player-flag").attr("class") || "";
  const countryMatch = flagClass.match(/fi-([a-z]{2})/);
  const countryCode = countryMatch ? countryMatch[1] : null;
  
  // Extract avatar URL
  const avatarLazyUrl = $playerCell.find("img").attr("data-lazyloadurl");
  const avatarUrl = avatarLazyUrl 
    ? `https://simulatorgolftour.com${avatarLazyUrl}` 
    : null;
  
  // Parse score
  const score = scoreAttr || "E";
  const scoreNumeric = parseScore(score);
  
  return {
    playerUsername,
    playerDisplayName,
    countryCode,
    avatarUrl,
    score,
    scoreNumeric,
    recordDate: dateAttr || null,
  };
}

export function parseScore(scoreText: string): number {
  if (!scoreText || scoreText === "E") return 0;
  return parseInt(scoreText, 10);
}
```

### Singles Scraper

```typescript
// src/scraper/singles-scraper.ts

import axios from "axios";
import { parseSinglesResponse } from "./html-parser";
import { upsertPlayer } from "./player-service";
import { db } from "../db/db";
import { courseRecords, courses, recordModes } from "../db/schema";
import { eq, and } from "drizzle-orm";
import logger from "../logger";
import type { ScrapedSinglesRow, ScrapedRecord, ScrapeResult } from "./types";

const SINGLES_API_URL = "https://simulatorgolftour.com/sgt-api/courses/course-records";

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
    logger.info("Fetching singles records from SGT...");
    const response = await axios.get(SINGLES_API_URL);
    const html = response.data;
    
    // Parse all rows
    const rows = parseSinglesResponse(html);
    logger.info(`Parsed ${rows.length} course rows from SGT`);
    
    // Get record mode IDs for Tips and SGT singles
    const tipsModeId = await getRecordModeId("tips", "single", "putting");
    const sgtModeId = await getRecordModeId("sgt", "single", "putting");
    
    if (!tipsModeId || !sgtModeId) {
      throw new Error("Record modes not found in database. Run migrations and seed data first.");
    }
    
    // Process each row
    for (const row of rows) {
      result.rowsProcessed++;
      
      try {
        // Find our course by SGT ID
        const course = await findCourseBySgtId(row.sgtCourseId);
        if (!course) {
          // Course not in our DB - skip (this is expected for courses we don't track)
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
    logger.info(`Scrape complete: ${result.recordsCreated} created, ${result.recordsUpdated} updated`);
    
  } catch (error) {
    const msg = `Scrape failed: ${error}`;
    logger.error(msg);
    result.errors.push(msg);
  }
  
  return result;
}

async function processRecord(
  courseId: number,
  recordModeId: number,
  record: ScrapedRecord,
  result: ScrapeResult
): Promise<void> {
  // Upsert player
  const playerResult = await upsertPlayer(record);
  if (playerResult.created) result.playersCreated++;
  else result.playersUpdated++;
  
  // Upsert course record
  const recordResult = await upsertCourseRecord(
    courseId,
    recordModeId,
    playerResult.playerId,
    record
  );
  if (recordResult.created) result.recordsCreated++;
  else if (recordResult.updated) result.recordsUpdated++;
}

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

async function findCourseBySgtId(sgtId: string) {
  return db.query.courses.findFirst({
    where: eq(courses.sgtId, sgtId),
    columns: { id: true, name: true },
  });
}

async function upsertCourseRecord(
  courseId: number,
  recordModeId: number,
  playerId: number,
  record: ScrapedRecord
): Promise<{ created: boolean; updated: boolean }> {
  const now = new Date().toISOString();
  
  // Check if record exists
  const existing = await db.query.courseRecords.findFirst({
    where: and(
      eq(courseRecords.courseId, courseId),
      eq(courseRecords.recordModeId, recordModeId)
    ),
  });
  
  if (existing) {
    // Update if player or score changed
    if (existing.playerId !== playerId || existing.score !== record.score) {
      await db.update(courseRecords)
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
    // Just update scraped_at timestamp
    await db.update(courseRecords)
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
  });
  
  return { created: true, updated: false };
}
```

### Player Service

```typescript
// src/scraper/player-service.ts

import { db } from "../db/db";
import { players } from "../db/schema";
import { eq } from "drizzle-orm";
import type { ScrapedRecord } from "./types";

interface UpsertPlayerResult {
  playerId: number;
  created: boolean;
}

export async function upsertPlayer(record: ScrapedRecord): Promise<UpsertPlayerResult> {
  const now = new Date().toISOString();
  
  // Check if player exists
  const existing = await db.query.players.findFirst({
    where: eq(players.sgtUsername, record.playerUsername),
  });
  
  if (existing) {
    // Update last_seen and any changed fields
    await db.update(players)
      .set({
        displayName: record.playerDisplayName,
        countryCode: record.countryCode,
        avatarUrl: record.avatarUrl,
        lastSeenAt: now,
        updatedAt: now,
      })
      .where(eq(players.id, existing.id));
    
    return { playerId: existing.id, created: false };
  }
  
  // Create new player
  const result = await db.insert(players).values({
    sgtUsername: record.playerUsername,
    displayName: record.playerDisplayName,
    countryCode: record.countryCode,
    avatarUrl: record.avatarUrl,
    firstSeenAt: now,
    lastSeenAt: now,
  }).returning({ id: players.id });
  
  return { playerId: result[0].id, created: true };
}
```

### Orchestration

```typescript
// src/scraper/index.ts

import { db } from "../db/db";
import { scrapeRuns } from "../db/schema";
import { scrapeSinglesRecords } from "./singles-scraper";
import { eq } from "drizzle-orm";
import logger from "../logger";

export async function runRecordsScrape(): Promise<{
  runId: number;
  success: boolean;
  summary: string;
}> {
  const now = new Date().toISOString();
  
  // Create scrape run record
  const [run] = await db.insert(scrapeRuns).values({
    startedAt: now,
    status: "running",
    recordModesScraped: JSON.stringify(["tips-single-putting", "sgt-single-putting"]),
  }).returning({ id: scrapeRuns.id });
  
  const runId = run.id;
  logger.info(`Started scrape run #${runId}`);
  
  try {
    // Run singles scraper
    const result = await scrapeSinglesRecords();
    
    // Update scrape run with results
    await db.update(scrapeRuns).set({
      completedAt: new Date().toISOString(),
      status: result.success ? "completed" : "failed",
      coursesProcessed: result.rowsProcessed,
      recordsFound: result.tipsRecordsFound + result.sgtRecordsFound,
      recordsCreated: result.recordsCreated,
      recordsUpdated: result.recordsUpdated,
      playersCreated: result.playersCreated,
      errorMessage: result.errors.length > 0 ? result.errors.join("; ") : null,
    }).where(eq(scrapeRuns.id, runId));
    
    const summary = `Run #${runId}: ${result.recordsCreated} created, ${result.recordsUpdated} updated, ${result.playersCreated} new players`;
    logger.info(summary);
    
    return { runId, success: result.success, summary };
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    await db.update(scrapeRuns).set({
      completedAt: new Date().toISOString(),
      status: "failed",
      errorMessage: errorMsg,
    }).where(eq(scrapeRuns.id, runId));
    
    logger.error(`Scrape run #${runId} failed: ${errorMsg}`);
    return { runId, success: false, summary: `Failed: ${errorMsg}` };
  }
}
```

### API Endpoint

```typescript
// In routes.ts - add this endpoint

.post("/api/admin/scrape-records", async ({ set }) => {
  try {
    const result = await runRecordsScrape();
    return result;
  } catch (error) {
    logger.error("Scrape endpoint error:", error);
    set.status = 500;
    return { error: "Scrape failed", details: String(error) };
  }
})

.get("/api/admin/scrape-status", async () => {
  const recentRuns = await db.query.scrapeRuns.findMany({
    orderBy: (runs, { desc }) => [desc(runs.startedAt)],
    limit: 10,
  });
  return { runs: recentRuns };
})
```

### Deliverables
- [ ] Types defined
- [ ] HTML parser implemented and tested
- [ ] Singles scraper implemented
- [ ] Player upsert logic
- [ ] Orchestration with run tracking
- [ ] API endpoints added
- [ ] Logging throughout
- [ ] Manual test with subset of data

---

## Phase 4: API Design

### Phase 1 Endpoints (Singles Only)

#### Get Course Records
Returns records for a specific course from our local database.

```
GET /api/courses/:id/records

Response: {
  courseId: number,
  courseName: string,
  tipsRecord: SingleRecord | null,
  sgtRecord: SingleRecord | null,
  lastScrapedAt: string | null
}

SingleRecord: {
  player: PlayerInfo,
  score: string,
  scoreNumeric: number,
  recordDate: string | null
}

PlayerInfo: {
  id: number,
  username: string,
  displayName: string,
  countryCode: string | null,
  avatarUrl: string | null
}
```

#### Get Player Leaderboard
Shows players ranked by total number of course records held.

```
GET /api/records/leaderboard
Query params:
  - teeType: 'tips' | 'sgt' | 'all' (default: 'all')
  - limit: number (default: 50, max: 200)
  - offset: number (default: 0)
  
Response: {
  entries: PlayerLeaderboardEntry[],
  total: number,
  filters: { teeType: string }
}

PlayerLeaderboardEntry: {
  rank: number,
  player: PlayerInfo,
  tipsRecords: number,    // Count of Tips records held
  sgtRecords: number,     // Count of SGT records held
  totalRecords: number    // tipsRecords + sgtRecords
}
```

#### Get Player Profile
Shows all records held by a specific player.

```
GET /api/players/:id

Response: {
  player: PlayerInfo,
  records: PlayerCourseRecord[],
  summary: {
    tipsRecords: number,
    sgtRecords: number,
    totalRecords: number
  }
}

PlayerCourseRecord: {
  course: {
    id: number,
    name: string,
    location: string,
    sgtId: string
  },
  recordType: 'tips' | 'sgt',
  score: string,
  scoreNumeric: number,
  recordDate: string | null
}
```

#### Get Player by Username
Lookup player by SGT username (for linking from external sources).

```
GET /api/players/by-username/:username

Response: PlayerInfo | { error: "Player not found" }
```

#### Get All Record Modes
Returns available record mode configurations.

```
GET /api/records/modes

Response: {
  modes: RecordMode[],
  activeModes: RecordMode[]  // Only modes we actively scrape
}

RecordMode: {
  id: number,
  teeType: string,         // 'tips' | 'sgt'
  playerFormat: string,    // 'single' | '2-man-scramble' | etc.
  puttingMode: string,     // 'putting' | 'autoputt'
  isTeam: boolean,
  teamSize: number,
  displayName: string,
  shortName: string,
  isActive: boolean
}
```

#### Admin: Trigger Scrape
Manually trigger a scrape run (should be protected in production).

```
POST /api/admin/scrape-records

Response: {
  runId: number,
  success: boolean,
  summary: string
}
```

#### Admin: Get Scrape Status
```
GET /api/admin/scrape-status

Response: {
  lastRun: ScrapeRun | null,
  recentRuns: ScrapeRun[]  // Last 10 runs
}

ScrapeRun: {
  id: number,
  startedAt: string,
  completedAt: string | null,
  status: 'running' | 'completed' | 'failed',
  coursesProcessed: number,
  recordsFound: number,
  recordsCreated: number,
  recordsUpdated: number,
  playersCreated: number,
  errorMessage: string | null
}
```

### Implementation Notes

```typescript
// Example route implementations in routes.ts

.get("/api/courses/:id/records", async ({ params: { id } }) => {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, Number(id)),
    columns: { id: true, name: true },
  });
  
  if (!course) {
    return { error: "Course not found" };
  }
  
  // Get Tips and SGT record mode IDs
  const [tipsMode, sgtMode] = await Promise.all([
    getRecordModeByCode("tips", "single", "putting"),
    getRecordModeByCode("sgt", "single", "putting"),
  ]);
  
  // Fetch records with player info
  const [tipsRecord, sgtRecord] = await Promise.all([
    getRecordWithPlayer(course.id, tipsMode.id),
    getRecordWithPlayer(course.id, sgtMode.id),
  ]);
  
  return {
    courseId: course.id,
    courseName: course.name,
    tipsRecord: tipsRecord ? formatRecord(tipsRecord) : null,
    sgtRecord: sgtRecord ? formatRecord(sgtRecord) : null,
    lastScrapedAt: tipsRecord?.scrapedAt || sgtRecord?.scrapedAt || null,
  };
})

.get("/api/records/leaderboard", async ({ query }) => {
  const teeType = query.teeType || "all";
  const limit = Math.min(Number(query.limit) || 50, 200);
  const offset = Number(query.offset) || 0;
  
  // This query aggregates records per player
  // Using the flat record_modes table makes this simpler!
  const leaderboard = await db.execute(sql`
    SELECT 
      p.id,
      p.sgt_username,
      p.display_name,
      p.country_code,
      p.avatar_url,
      COUNT(CASE WHEN rm.tee_type = 'tips' THEN 1 END) as tips_records,
      COUNT(CASE WHEN rm.tee_type = 'sgt' THEN 1 END) as sgt_records,
      COUNT(*) as total_records
    FROM players p
    JOIN course_records cr ON cr.player_id = p.id
    JOIN record_modes rm ON rm.id = cr.record_mode_id
    WHERE rm.player_format = 'single'
      AND rm.putting_mode = 'putting'
      ${teeType !== "all" ? sql`AND rm.tee_type = ${teeType}` : sql``}
    GROUP BY p.id
    ORDER BY total_records DESC, tips_records DESC
    LIMIT ${limit} OFFSET ${offset}
  `);
  
  // ... format and return
})

// Helper function
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
```

### Deliverables
- [ ] Course records endpoint (`GET /api/courses/:id/records`)
- [ ] Player leaderboard endpoint (`GET /api/records/leaderboard`)
- [ ] Player profile endpoint (`GET /api/players/:id`)
- [ ] Player lookup by username (`GET /api/players/by-username/:username`)
- [ ] Record modes endpoint (`GET /api/records/modes`)
- [ ] Admin scrape trigger (`POST /api/admin/scrape-records`)
- [ ] Admin scrape status (`GET /api/admin/scrape-status`)
- [ ] Response types defined
- [ ] Error handling

---

## Phase 5: Frontend Implementation

### Phase 1 Scope

Focus on **singles records only** (no team views yet):
- Player leaderboard page
- Player profile page
- Enhanced course records view (from local DB)

### New Routes

```typescript
// App.tsx additions
<Route path="records" element={<RecordsPage />} />
<Route path="records/player/:playerId" element={<PlayerProfilePage />} />
```

### Page Mockups

#### RecordsPage (`/records`)
Main leaderboard showing players ranked by total course records.

```
┌────────────────────────────────────────────────────────────────┐
│ Course Record Leaderboard                                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tees: [All ▾] [Tips] [SGT]                                    │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ #   Player              Tips    SGT    Total             │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ 1   🇸🇪 Bomberhilde       156     142    298              │  │
│ │ 2   🇰🇷 Bobchung           98     124    222              │  │
│ │ 3   🇺🇸 k4rn1v00l          87      95    182              │  │
│ │ 4   🇬🇧 Wilks306           76      82    158              │  │
│ │ 5   🇨🇦 themooks           65      71    136              │  │
│ │     ...                                                   │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ Showing 1-50 of 1,247 players         [< Prev] [Next >]        │
│                                                                 │
│ Last updated: Dec 3, 2024 14:30 UTC                            │
└────────────────────────────────────────────────────────────────┘
```

#### PlayerProfilePage (`/records/player/:playerId`)
Shows all course records held by a specific player.

```
┌────────────────────────────────────────────────────────────────┐
│ ← Back to Leaderboard                                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────┐                                                    │
│  │ Avatar │  Bomberhilde                                       │
│  │  🇸🇪    │  156 Tips Records | 142 SGT Records               │
│  └────────┘                                                    │
│                                                                 │
│  [View on SGT ↗]                                               │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│ Course Records                      Filter: [All ▾] [Tips] [SGT]│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Course                    Type   Score    Date           │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ A-Ga-Ming Sundance        Tips   -11      2023-02-18     │  │
│ │ Abacoa Golf Club          Tips   -12      2023-02-18     │  │
│ │ Aberdeen Golf Club        Tips   -14      2023-02-19     │  │
│ │ ...                                                       │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│ Showing 1-50 of 156 records          [< Prev] [Next >]         │
└────────────────────────────────────────────────────────────────┘
```

#### Enhanced Course Page Records Tab
Update the existing `CourseRecordsView` to show records from our local database.

```
┌────────────────────────────────────────────────────────────────┐
│ Course Records                                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Tips Record                           SGT Record                │
│ ┌─────────────────────────┐          ┌─────────────────────────┐│
│ │ 🇸🇪 Bomberhilde          │          │ 🇰🇷 Bobchung             ││
│ │                         │          │                         ││
│ │ Score: -14              │          │ Score: -13              ││
│ │ Date: 2023-02-19        │          │ Date: 2022-01-19        ││
│ │                         │          │                         ││
│ │ [View Profile]          │          │ [View Profile]          ││
│ └─────────────────────────┘          └─────────────────────────┘│
│                                                                 │
│ [Attempt Tips Record ↗]              [Attempt SGT Record ↗]    │
│                                                                 │
│ Last updated: 2 hours ago                                      │
└────────────────────────────────────────────────────────────────┘
```

### Component Structure

```
frontend/src/
├── pages/
│   ├── RecordsPage.tsx              # Main leaderboard
│   └── PlayerProfilePage.tsx        # Individual player view
├── components/
│   ├── records/
│   │   ├── PlayerLeaderboard.tsx    # Leaderboard table
│   │   ├── PlayerLeaderboardRow.tsx # Single row with player info
│   │   ├── PlayerHeader.tsx         # Profile header with avatar
│   │   ├── PlayerRecordsList.tsx    # List of player's records
│   │   ├── TeeTypeFilter.tsx        # Tips/SGT/All filter
│   │   └── RecordCard.tsx           # Single record display
│   └── CourseRecordsView.tsx        # Updated to use local DB
├── api/
│   └── useApi.ts                    # Add new API functions
```

### Types

```typescript
// types.ts additions

export interface Player {
  id: number;
  username: string;
  displayName: string;
  countryCode: string | null;
  avatarUrl: string | null;
}

export interface PlayerLeaderboardEntry {
  rank: number;
  player: Player;
  tipsRecords: number;
  sgtRecords: number;
  totalRecords: number;
}

export interface PlayerLeaderboardResponse {
  entries: PlayerLeaderboardEntry[];
  total: number;
  filters: {
    teeType: 'all' | 'tips' | 'sgt';
  };
}

export interface PlayerCourseRecord {
  course: {
    id: number;
    name: string;
    location: string;
    sgtId: string;
  };
  recordType: 'tips' | 'sgt';
  score: string;
  scoreNumeric: number;
  recordDate: string | null;
}

export interface PlayerProfile {
  player: Player;
  records: PlayerCourseRecord[];
  summary: {
    tipsRecords: number;
    sgtRecords: number;
    totalRecords: number;
  };
}

export interface CourseRecordsResponse {
  courseId: number;
  courseName: string;
  tipsRecord: SingleRecord | null;
  sgtRecord: SingleRecord | null;
  lastScrapedAt: string | null;
}

export interface SingleRecord {
  player: Player;
  score: string;
  scoreNumeric: number;
  recordDate: string | null;
}
```

### API Functions

```typescript
// api/useApi.ts additions

export const fetchRecordsLeaderboard = (params?: {
  teeType?: 'all' | 'tips' | 'sgt';
  limit?: number;
  offset?: number;
}) =>
  api.get<PlayerLeaderboardResponse>("/records/leaderboard", { params })
    .then((res) => res.data);

export const fetchPlayerProfile = (playerId: number) =>
  api.get<PlayerProfile>(`/players/${playerId}`)
    .then((res) => res.data);

export const fetchCourseRecordsLocal = (courseId: number) =>
  api.get<CourseRecordsResponse>(`/courses/${courseId}/records`)
    .then((res) => res.data);
```

### Deliverables
- [ ] RecordsPage with player leaderboard
- [ ] PlayerProfilePage with records list
- [ ] TeeTypeFilter component
- [ ] PlayerLeaderboard component with pagination
- [ ] PlayerHeader component
- [ ] RecordCard component
- [ ] Updated CourseRecordsView to use local data
- [ ] API functions added
- [ ] Types defined
- [ ] Navigation link in Layout
- [ ] Responsive design

---

## Phase 6: Navigation & Integration

### Header Navigation Update
Add "Records" link to main navigation in Layout.tsx.

```typescript
// Layout.tsx - add to nav
<Link to="/records" className="text-white hover:text-purple-200">
  Records
</Link>
```

### Cross-linking
- From course page → player profile (click on record holder)
- From player profile → course page (click on course name)
- From records leaderboard → player profile (click on player)

### Deliverables
- [ ] "Records" link added to navigation
- [ ] Cross-links implemented
- [ ] Back navigation works correctly

---

## Implementation Checklist

### Phase 1: Research ✅ COMPLETED
- [x] Document SGT API endpoints
- [x] Understand HTML structure
- [x] Confirm player identification (username from profile URL)

### Phase 2: Database
- [ ] Create migration file with all new tables
- [ ] Add Drizzle schema definitions to `src/db/schema.ts`
- [ ] Run migration (`bun run migrate`)
- [ ] Seed `record_modes` table with known configurations
- [ ] Test schema with sample data via Drizzle Studio

### Phase 3: Scraper
- [ ] Create `src/scraper/` directory structure
- [ ] Implement types.ts
- [ ] Implement html-parser.ts
- [ ] Implement player-service.ts
- [ ] Implement singles-scraper.ts
- [ ] Implement index.ts (orchestration)
- [ ] Add API endpoints (trigger + status)
- [ ] Test with live SGT data
- [ ] Run initial full scrape

### Phase 4: API
- [ ] GET /api/courses/:id/records
- [ ] GET /api/records/leaderboard
- [ ] GET /api/players/:id
- [ ] GET /api/players/by-username/:username
- [ ] GET /api/records/types
- [ ] POST /api/admin/scrape-records
- [ ] GET /api/admin/scrape-status
- [ ] Test all endpoints

### Phase 5: Frontend
- [ ] Add types to types.ts
- [ ] Add API functions to useApi.ts
- [ ] Create RecordsPage.tsx
- [ ] Create PlayerProfilePage.tsx
- [ ] Create PlayerLeaderboard component
- [ ] Create TeeTypeFilter component
- [ ] Create RecordCard component
- [ ] Update CourseRecordsView to use local data
- [ ] Add routes to App.tsx
- [ ] Responsive testing

### Phase 6: Integration
- [ ] Add "Records" to navigation
- [ ] Implement cross-links
- [ ] Final testing
- [ ] Update AGENTS.md with new endpoints

---

## Answered Questions

Based on research in `docs/sgt-scraping.md`:

1. **How are scramble teams displayed on SGT?** 
   - Both player names shown separately with individual profile links
   - No separate team name/ID

2. **What happens when a record is broken?**
   - SGT shows only current record holder per course/type
   - We store one record per course per record_type

3. **Player profile URL structure on SGT?**
   - Format: `/profile/Username` (case-sensitive username)

4. **Rate limiting behavior?**
   - Not yet tested extensively
   - Being conservative with single request for all singles data

## Open Questions (for future phases)

1. What are the auto-putting record endpoints?
2. What are the SGT-tee team record endpoints (2-man, 4-man)?
3. What is the alt-shot endpoint?
4. How often does SGT update their data?

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| SGT changes HTML structure | High | Version parser, monitor for parse failures |
| SGT rate limits us | Medium | Single request gets all singles data (efficient!) |
| Player username changes | Low | Use username as identifier; update on scrape |
| Course ID mismatch | Medium | Match by sgtId; skip unknown courses |

---

## Future Enhancements (Phase 2+)

### Near-term
- [ ] Add team record scraping (2-man, 4-man scramble)
- [ ] Add auto-putt record scraping
- [ ] Add alt-shot record scraping
- [ ] Historical record tracking (detect when records change)

### Long-term
- [ ] Record progression charts per player
- [ ] Player comparison tool
- [ ] "Closest to breaking record" feature
- [ ] Course difficulty ranking based on record scores
- [ ] Player statistics (avg score, best course, etc.)

---

## Scraping Schedule

Recommended schedule for production:
- **Frequency**: 2x per week (e.g., Monday and Thursday mornings)
- **Method**: Cron job or manual trigger
- **Monitoring**: Check `scrape_runs` table for failures

```bash
# Example cron (runs at 6 AM UTC on Mon and Thu)
0 6 * * 1,4 curl -X POST http://localhost:3000/api/admin/scrape-records
```

