import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

export async function migrateDatabase() {
  const dbPath = process.env.DB_PATH || "./data/gspro.db";
  console.log(`Migrating database at ${dbPath}`);
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);
  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("Database migrated");
  } catch (error) {
    console.error("Error migrating database", error);
  }
}

migrateDatabase();
