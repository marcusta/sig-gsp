/**
 * Player service for upserting players from scraped data
 */

import { db } from "../db/db";
import { players } from "../db/schema";
import { eq } from "drizzle-orm";
import type { ScrapedRecord, UpsertPlayerResult } from "./types";

/**
 * Upsert a player from scraped record data
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

