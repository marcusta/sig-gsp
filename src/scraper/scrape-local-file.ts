import fs from "fs";
import path from "path";
import { parseSinglesResponse } from "./html-parser";
import { type ScrapedSinglesRow } from "./types";

export async function scrapeLocalFile(): Promise<ScrapedSinglesRow[]> {
  const filename = path.join(
    __dirname,
    "..",
    "..",
    "sgt-data",
    "course-records.html"
  );
  const html = fs.readFileSync(filename, "utf8");
  const rows = parseSinglesResponse(html);
  //console.log(`Parsed ${rows.length} course rows from local file`);
  return rows;
}

scrapeLocalFile().then((rows) => {
  const bomberRows = rows.filter((row) => {
    if (row.tipsRecord === null) return false;
    return row.tipsRecord.playerUsername === "Bomberhilde";
  });
  console.log("Hello : ", bomberRows);
  console.log(bomberRows.length);
});
