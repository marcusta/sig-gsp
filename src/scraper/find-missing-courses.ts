import fs from "fs";
import path from "path";
import { parseSinglesResponse } from "./html-parser";
import { db } from "../db/db";
import { courses } from "../db/schema";
import { eq } from "drizzle-orm";

async function findMissingCourses() {
  // Parse local HTML file
  const filename = path.join(
    __dirname,
    "..",
    "..",
    "sgt-data",
    "course-records.html"
  );
  const html = fs.readFileSync(filename, "utf8");
  const rows = parseSinglesResponse(html);

  // Find Bomberhilde's Tips records
  const bomberTips = rows.filter(
    (row) =>
      row.tipsRecord !== null &&
      row.tipsRecord.playerUsername === "Bomberhilde"
  );

  console.log(`Bomberhilde has ${bomberTips.length} Tips records in HTML\n`);

  // Check which courses are missing from our DB
  const missingCourses: { sgtId: string; name: string }[] = [];
  const foundCourses: { sgtId: string; name: string }[] = [];

  for (const row of bomberTips) {
    const course = await db.query.courses.findFirst({
      where: eq(courses.sgtId, row.sgtCourseId),
      columns: { id: true, name: true },
    });

    if (!course) {
      missingCourses.push({ sgtId: row.sgtCourseId, name: row.courseName });
    } else {
      foundCourses.push({ sgtId: row.sgtCourseId, name: row.courseName });
    }
  }

  console.log(`Found in DB: ${foundCourses.length}`);
  console.log(`Missing from DB: ${missingCourses.length}\n`);

  if (missingCourses.length > 0) {
    console.log("Missing courses:");
    missingCourses.forEach((c) => console.log(`  - ${c.name} (SGT ID: ${c.sgtId})`));
  }
}

findMissingCourses().then(() => process.exit(0));

