import type { CourseData, Tee } from "course-data-types";
import { db } from "db/db";
import { teeBoxes, type NewTeeBox, type TeeBox } from "db/schema";
import { eq } from "drizzle-orm";

export async function createTeeBoxesFromCourseData(
  courseId: number,
  courseData: CourseData
): Promise<TeeBox[]> {
  const tees = teeBoxesFromCourseData(courseData);

  const result: TeeBox[] = [];
  for (const tee of tees) {
    const teeBox = await createTeeBoxFromCourseData(courseId, tee, courseData);
    result.push(teeBox);
  }

  return result;
}

export async function updateTeeBoxesFromCourseData(
  courseId: number,
  courseData: CourseData
) {
  const teeBoxesFromDb = await getTeeBoxes(courseId);
  const tees = teeBoxesFromCourseData(courseData);
  for (const tee of tees) {
    const matchingTeeBox = teeBoxesFromDb.find(
      (teeBox) => teeBox.name === tee.TeeType
    );
    if (matchingTeeBox) {
      await updateTeeBoxFromCourseData(matchingTeeBox, tee, courseData);
    } else {
      await createTeeBoxFromCourseData(courseId, tee, courseData);
    }
  }
}

async function updateTeeBoxFromCourseData(
  teeBox: TeeBox,
  tee: Tee,
  courseData: CourseData
) {
  const { rating, slope } = teeBoxRatingFromCourseData(courseData, teeBox.name);
  teeBox.rating = rating;
  teeBox.slope = slope;
  const length = teeBoxTotalDistanceFromCourseData(courseData, teeBox.name);
  teeBox.length = length;
  await updateTeeBox(teeBox);
}

async function updateTeeBox(teeBox: TeeBox) {
  await db.update(teeBoxes).set(teeBox).where(eq(teeBoxes.id, teeBox.id));
}

async function getTeeBoxes(courseId: number): Promise<TeeBox[]> {
  return db.query.teeBoxes.findMany({
    where: eq(teeBoxes.courseId, courseId),
  });
}

async function createTeeBoxFromCourseData(
  courseId: number,
  tee: Tee,
  courseData: CourseData
): Promise<TeeBox> {
  let totalDistance = teeBoxTotalDistanceFromCourseData(
    courseData,
    tee.TeeType
  );

  const { rating, slope } = teeBoxRatingFromCourseData(courseData, tee.TeeType);

  const newTeeBox: NewTeeBox = {
    courseId,
    name: tee.TeeType,
    rating,
    slope,
    length: totalDistance,
  };

  return (await db.insert(teeBoxes).values(newTeeBox).returning())[0];
}

function teeBoxesFromCourseData(courseData: CourseData): Tee[] {
  const teeBoxes = courseData.Holes.filter((hole) => hole.Enabled)[0].Tees;

  return teeBoxes.filter(
    (tee) =>
      tee.Enabled &&
      tee.Distance > 0 &&
      tee.TeeType !== "GreenCenterPoint" &&
      tee.TeeType.indexOf("AimPoint") === -1
  );
}

function teeBoxTotalDistanceFromCourseData(
  courseData: CourseData,
  teeType: string
): number {
  const teeBoxDistance = courseData.TeeTypeTotalDistance.find(
    (t) => t.TeeType === teeType
  )?.Distance;
  return teeBoxDistance || 0;
}

function teeBoxRatingFromCourseData(
  courseData: CourseData,
  teeType: string
): { rating: number; slope: number } {
  let ratingString;
  if (teeType === "Black") {
    ratingString = courseData.BlackSR;
  }
  if (teeType === "Blue") {
    ratingString = courseData.BlueSR;
  }
  if (teeType === "Green") {
    ratingString = courseData.GreenSR;
  }
  if (teeType === "Red") {
    ratingString = courseData.RedSR;
  }
  if (teeType === "White") {
    ratingString = courseData.WhiteSR;
  }
  if (teeType === "Yellow") {
    ratingString = courseData.YellowSR;
  }
  if (teeType === "Junior") {
    ratingString = courseData.JuniorSR;
  }
  if (teeType === "Par3") {
    ratingString = courseData.PAR3SR;
  }
  if (ratingString && ratingString.indexOf("/") > 0) {
    // format of rating string is "73.8/138" where slope is first part and rating is second part
    const ratingParts = ratingString.split("/");
    const slope = parseFloat(ratingParts[0]);
    const rating = parseFloat(ratingParts[1]);
    return { rating, slope };
  }
  return { rating: 0, slope: 0 };
}
