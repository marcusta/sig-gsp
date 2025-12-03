-- Course Records Feature Migration
-- Adds tables for tracking SGT course records, players, and teams

-- Record Modes: flat configuration table for all record type combinations
CREATE TABLE record_modes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tee_type TEXT NOT NULL,
  player_format TEXT NOT NULL,
  putting_mode TEXT NOT NULL,
  is_team INTEGER NOT NULL DEFAULT 0,
  team_size INTEGER NOT NULL DEFAULT 1,
  sgt_api_url TEXT,
  display_name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tee_type, player_format, putting_mode)
);

-- Seed record_modes with known configurations
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

-- Players: stores unique player information from SGT
CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sgt_username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  country_code TEXT,
  avatar_url TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_players_display_name ON players(display_name);
CREATE INDEX idx_players_country ON players(country_code);

-- Teams: stores team compositions (for future team modes)
CREATE TABLE teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_mode_id INTEGER NOT NULL REFERENCES record_modes(id),
  team_hash TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_mode ON teams(record_mode_id);

-- Team Members: links players to teams
CREATE TABLE team_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id),
  position INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, player_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_player ON team_members(player_id);

-- Course Records: main table storing all course records
CREATE TABLE course_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id),
  record_mode_id INTEGER NOT NULL REFERENCES record_modes(id),
  player_id INTEGER REFERENCES players(id),
  team_id INTEGER REFERENCES teams(id),
  score TEXT NOT NULL,
  score_numeric INTEGER NOT NULL,
  record_date TEXT,
  scraped_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, record_mode_id)
);

CREATE INDEX idx_course_records_course ON course_records(course_id);
CREATE INDEX idx_course_records_mode ON course_records(record_mode_id);
CREATE INDEX idx_course_records_player ON course_records(player_id);
CREATE INDEX idx_course_records_team ON course_records(team_id);
CREATE INDEX idx_course_records_score ON course_records(score_numeric);

-- Scrape Runs: track scraping history for monitoring
CREATE TABLE scrape_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL,
  record_modes_scraped TEXT,
  courses_processed INTEGER DEFAULT 0,
  records_found INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  players_created INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

