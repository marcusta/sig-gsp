// Quick test to verify bun:sqlite can connect to the database
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./db/schema";

console.log("Opening database...");
const sqlite = new Database("./data/gspro.db");
console.log("Database opened successfully");

const db = drizzle(sqlite, { schema });
console.log("Drizzle initialized");

// Try a simple query
const courseCount = await db.query.courses.findMany({ limit: 1 });
console.log("Course query successful, found:", courseCount.length, "course(s)");

// Try inserting into scrape_runs
console.log("Testing insert...");
const [run] = await db
  .insert(schema.scrapeRuns)
  .values({
    startedAt: new Date().toISOString(),
    status: "test",
    createdAt: new Date().toISOString(),
  })
  .returning({ id: schema.scrapeRuns.id });

console.log("Insert successful, run ID:", run.id);

// Clean up test record
await db.delete(schema.scrapeRuns).where(
  require("drizzle-orm").eq(schema.scrapeRuns.id, run.id)
);
console.log("Cleanup successful");

sqlite.close();
console.log("All tests passed!");

