/**
 * HTML parsing utilities for SGT course records pages
 */

import * as cheerio from "cheerio";
import type { ScrapedRecord, ScrapedSinglesRow } from "./types";

/**
 * Parse the singles course records HTML response from SGT
 * This page contains both Tips and SGT records for all courses
 */
export function parseSinglesResponse(html: string): ScrapedSinglesRow[] {
  const $ = cheerio.load(html);
  const rows: ScrapedSinglesRow[] = [];

  $("table.course-records-table tbody tr").each((_, element) => {
    const $row = $(element);

    const sgtCourseId = $row.attr("data-course-id")?.trim();
    if (!sgtCourseId) return;

    const courseName = $row.find("td.course-name").first().text().trim();

    // Parse Tips record from data attributes
    const tipsRecord = parseRecordFromDataAttrs($row, "tips");

    // Parse SGT record from data attributes
    const sgtRecord = parseRecordFromDataAttrs($row, "sgt");

    rows.push({
      sgtCourseId,
      courseName,
      tipsRecord,
      sgtRecord,
    });
  });

  return rows;
}

/**
 * Parse a record from the row's data attributes and HTML
 */
function parseRecordFromDataAttrs(
  $row: cheerio.Cheerio<cheerio.AnyNode>,
  type: "tips" | "sgt"
): ScrapedRecord | null {
  const $ = cheerio.load($row.html() || "");

  // Check data attributes for quick existence check
  const playerAttr = $row.attr(`data-sort-${type}-player`);
  const scoreAttr = $row.attr(`data-sort-${type}-score`);
  const dateAttr = $row.attr(`data-sort-${type}-date`);

  // If no player attribute or it's empty, no record exists
  if (!playerAttr || playerAttr.trim() === "") {
    return null;
  }

  // Find the player cell based on type
  // Tips records come first, then SGT records in the table
  const cellClass = type === "tips" ? "tips-player" : "sgt-player";
  const $playerCell = $row.find(`td.${cellClass}`);

  // If this is just an "ATTEMPT" button, no record exists
  if (
    $playerCell.find("button.attempt-button").length > 0 &&
    $playerCell.find("a[href^='/profile/']").length === 0
  ) {
    return null;
  }

  // Extract player info from the profile link
  const $profileLink = $playerCell.find("a[href^='/profile/']").first();
  const profileHref = $profileLink.attr("href") || "";
  const playerUsername = profileHref.replace("/profile/", "").trim();
  const playerDisplayName = $profileLink.text().trim() || playerUsername;

  if (!playerUsername) {
    return null;
  }

  // Extract country code from flag class (e.g., "fi-kr" -> "kr")
  const flagDiv = $playerCell.find(".player-flag");
  const flagClass = flagDiv.attr("class") || "";
  const countryMatch = flagClass.match(/fi-([a-z]{2})/);
  const countryCode = countryMatch ? countryMatch[1] : null;

  // Extract avatar URL from lazy load attribute
  const $avatar = $playerCell.find("img[data-lazyloadurl]");
  const avatarPath = $avatar.attr("data-lazyloadurl");
  const avatarUrl =
    avatarPath && avatarPath.trim() !== ""
      ? `https://simulatorgolftour.com${avatarPath}`
      : null;

  // Parse score
  const score = scoreAttr?.trim() || "E";
  const scoreNumeric = parseScore(score);

  // Parse date
  const recordDate = dateAttr?.trim() || null;

  return {
    playerUsername,
    playerDisplayName,
    countryCode,
    avatarUrl,
    score,
    scoreNumeric,
    recordDate,
  };
}

/**
 * Parse a score string to a numeric value
 * 'E' -> 0, '-15' -> -15, '+2' -> 2
 */
export function parseScore(scoreText: string): number {
  if (!scoreText || scoreText.toUpperCase() === "E") {
    return 0;
  }
  const parsed = parseInt(scoreText, 10);
  return isNaN(parsed) ? 0 : parsed;
}

