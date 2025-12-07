/**
 * Player service for upserting players from scraped data
 */

import { db } from "../db/db";
import { players } from "../db/schema";
import { eq } from "drizzle-orm";
import type { ScrapedRecord, UpsertPlayerResult } from "./types";

// Type for player cache (username -> player id)
type PlayerCache = Map<string, number>;

// Transaction type from drizzle
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Upsert a player using transaction and pre-loaded cache
 * - Uses transaction for atomic commits
 * - Eliminates the SELECT query by using the cache
 */
export async function upsertPlayerWithCacheTx(
  tx: Transaction,
  record: ScrapedRecord,
  playerCache: PlayerCache
): Promise<UpsertPlayerResult> {
  const now = new Date().toISOString();

  // Check cache for existing player (Phase 2 - no DB query needed)
  const existingId = playerCache.get(record.playerUsername);

  if (existingId !== undefined) {
    // Update existing player with latest info using transaction
    await tx
      .update(players)
      .set({
        displayName: record.playerDisplayName,
        countryCode: record.countryCode,
        avatarUrl: record.avatarUrl,
        lastSeenAt: now,
        updatedAt: now,
      })
      .where(eq(players.id, existingId));

    return { playerId: existingId, created: false };
  }

  // Create new player using transaction
  const result = await tx
    .insert(players)
    .values({
      sgtUsername: record.playerUsername,
      displayName: record.playerDisplayName,
      countryCode: record.countryCode,
      avatarUrl: record.avatarUrl,
      firstSeenAt: now,
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: players.id });

  const newPlayerId = result[0].id;

  // Add to cache so subsequent lookups for this player work correctly
  playerCache.set(record.playerUsername, newPlayerId);

  return { playerId: newPlayerId, created: true };
}

/**
 * Upsert a player from scraped record data using pre-loaded cache (Phase 2 optimization)
 * Eliminates the SELECT query by using the cache for player lookup
 * @deprecated Use upsertPlayerWithCacheTx for transaction support
 */
export async function upsertPlayerWithCache(
  record: ScrapedRecord,
  playerCache: PlayerCache
): Promise<UpsertPlayerResult> {
  const now = new Date().toISOString();

  // Check cache for existing player (Phase 2 - no DB query needed)
  const existingId = playerCache.get(record.playerUsername);

  if (existingId !== undefined) {
    // Update existing player with latest info
    await db
      .update(players)
      .set({
        displayName: record.playerDisplayName,
        countryCode: record.countryCode,
        avatarUrl: record.avatarUrl,
        lastSeenAt: now,
        updatedAt: now,
      })
      .where(eq(players.id, existingId));

    return { playerId: existingId, created: false };
  }

  // Create new player
  const result = await db
    .insert(players)
    .values({
      sgtUsername: record.playerUsername,
      displayName: record.playerDisplayName,
      countryCode: record.countryCode,
      avatarUrl: record.avatarUrl,
      firstSeenAt: now,
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: players.id });

  const newPlayerId = result[0].id;

  // Add to cache so subsequent lookups for this player work correctly
  playerCache.set(record.playerUsername, newPlayerId);

  return { playerId: newPlayerId, created: true };
}

/**
 * Upsert a player from scraped record data (original version without cache)
 * Creates new player if not exists, updates existing player's info
 */
export async function upsertPlayer(
  record: ScrapedRecord
): Promise<UpsertPlayerResult> {
  const now = new Date().toISOString();

  // Check if player exists
  const existing = await db.query.players.findFirst({
    where: eq(players.sgtUsername, record.playerUsername),
  });

  if (existing) {
    // Update existing player with latest info
    await db
      .update(players)
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
  const result = await db
    .insert(players)
    .values({
      sgtUsername: record.playerUsername,
      displayName: record.playerDisplayName,
      countryCode: record.countryCode,
      avatarUrl: record.avatarUrl,
      firstSeenAt: now,
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: players.id });

  return { playerId: result[0].id, created: true };
}

