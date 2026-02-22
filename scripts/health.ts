import { Database } from "bun:sqlite";

const dbPath = process.env.DB_PATH || "./data/gspro.db";
const db = new Database(dbPath, { readonly: true });

console.log(`Validating database at ${dbPath}...`);

try {
  db.query("SELECT 1").get();

  const tables = db
    .query("SELECT name FROM sqlite_master WHERE type='table'")
    .all() as { name: string }[];

  const tableNames = tables.map((t) => t.name);

  const requiredTables = [
    "courses",
    "tee_boxes",
    "gk_data",
    "tags",
    "course_to_tags",
    "record_modes",
    "players",
    "teams",
    "team_members",
    "course_records",
    "scrape_runs",
    "course_record_history",
    "player_rank_snapshots",
  ];

  const missing: string[] = [];
  for (const table of requiredTables) {
    if (!tableNames.includes(table)) {
      missing.push(table);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required tables: ${missing.join(", ")}`);
  }

  console.log(`All ${requiredTables.length} required tables present`);
  db.close();
  process.exit(0);
} catch (error) {
  console.error("Validation failed:", error);
  db.close();
  process.exit(1);
}
