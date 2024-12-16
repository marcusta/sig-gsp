import axios from "axios";
import * as cheerio from "cheerio";

export interface LeaderboardEntry {
  playerName: string;
  attempts: number;
  lowScore: string;
  avatarUrl: string | null;
  countryCode: string | null;
  profileUrl: string;
}

export interface LeaderboardData {
  courseName: string;
  teeType: string;
  entries: LeaderboardEntry[];
}

export async function scrapeLeaderboard(
  sgtId: string,
  teeType: "CR" | "CRTips"
): Promise<LeaderboardData> {
  const url = `https://simulatorgolftour.com/sgt-api/courses/course-record-leaderboard/${sgtId}/${teeType}`;

  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);

  const courseName = $("h5.text-sgt-white").text().trim();
  const teeTypeText = $("p.text-sgt-light").text().trim();

  const entries: LeaderboardEntry[] = [];

  $("table.course-records-table tbody tr").each((_, element) => {
    const $row = $(element);

    const playerName = $row.find("a").text().trim();
    const attempts = parseInt($row.find("td").eq(1).text().trim(), 10);
    const lowScore = $row.find("td.low-score").text().trim();
    const avatarUrl = ($row.find("img").data("lazyloadurl") as string) || null;
    const countryCode =
      $row
        .find(".player-flag")
        .attr("class")
        ?.match(/fi-([a-z]{2})/)?.[1] || null;
    const profileUrl = $row.find("a").attr("href") || "";

    entries.push({
      playerName,
      attempts,
      lowScore,
      avatarUrl: avatarUrl ? `https://simulatorgolftour.com${avatarUrl}` : null,
      countryCode,
      profileUrl: `https://simulatorgolftour.com${profileUrl}`,
    });
  });

  return {
    courseName,
    teeType: teeTypeText,
    entries,
  };
}
