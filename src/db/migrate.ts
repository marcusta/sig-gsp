import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

export async function migrateDatabase() {
  console.log("Migrating database");
  const sqlite = new Database("./data/gspro.db");
  const db = drizzle(sqlite);
  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("Database migrated");
  } catch (error) {
    console.error("Error migrating database", error);
  }
}

migrateDatabase();
