import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const sqlite = new Database("./data/gspro-prod-new.db");

// Enable WAL mode for better concurrent read/write performance
// WAL allows readers to not block writers and vice versa
sqlite.exec("PRAGMA journal_mode = WAL;");

// Optimize synchronous mode for WAL - NORMAL is safe with WAL
sqlite.exec("PRAGMA synchronous = NORMAL;");

export const db = drizzle(sqlite, { schema });
