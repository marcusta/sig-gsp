import type { CourseData, Hole } from "course-data-types";
import { db } from "db/db";
import {
  courses,
  courseToTags,
  gkData,
  tags,
  type Course,
  type CourseWithGkData,
  type NewCourse,
} from "db/schema";
import { eq, inArray } from "drizzle-orm";
import { createTeeBoxesFromCourseData } from "teebox-data";

export async function getCourseByName(name: string): Promise<Course> {
  return (await db.query.courses.findFirst({
    where: eq(courses.name, name),
  }))!;
}

export async function getCourses(): Promise<Course[]> {
  return await db.query.courses.findMany();
}

export async function updateParOnCourses(
  courseList: Course[]
): Promise<[string[], string[]]> {
  const failedCourses: string[] = [];
  const successCourses: string[] = [];
  for (const course of courseList) {
    console.log("course to set par for ", course.name);
    const courseData = await db.query.gkData.findFirst({
      where: eq(gkData.courseId, course.id),
    });
    if (!courseData) {
      console.log("course data not found for ", course.name);
      failedCourses.push(course.name);
      continue;
    }
    // sum the par for each hole in the course
    const par = courseData.gkData?.Holes.filter((hole) => hole.Enabled).reduce(
      (sum, hole) => sum + hole.Par,
      0
    );
    course.par = par ?? null;
    course.isPar3 =
      course.holes === 0 || !course.par
        ? false
        : course.par / course.holes === 3;
    console.log(course.name, "course is par3: ", course.isPar3);
    await db
      .update(courses)
      .set({ par, isPar3: course.isPar3 })
      .where(eq(courses.id, course.id));
    successCourses.push(course.name);
  }
  return [failedCourses, successCourses];
}

export async function insertCourse(course: NewCourse): Promise<Course> {
  return (await db.insert(courses).values(course).returning())[0];
}

export async function createCourseFromCourseData(
  courseName: string,
  courseData: CourseData
): Promise<Course> {
  const newCourse: NewCourse = {
    name: courseName,
    location: courseData.Location || "-",
    holes: courseData.Holes.filter((hole) => hole.Enabled).length,
    designer: courseData.Designer || "-",
    country: courseData.Location || "USA",
    altitude: courseData.altitudeV2 || courseData.altitude || 0,
    alternateName: "",
    difficulty: 3,
    graphics: 3,
    golfQuality: 3,
    grade: 3,
    description: courseData.CourseInfo,
    addedDate: "",
    updatedDate: "",
    opcdName: "",
    opcdVersion: "",
    sgtId: "",
    sgtSplashUrl: "",
    sgtYoutubeUrl: "",
    par: courseData.par,
  };

  newCourse.par = calculatePar(courseData);
  const course = await insertCourse(newCourse);
  await createTeeBoxesFromCourseData(course.id, courseData);
  await saveCourseData(course.id, courseData);
  return course;
}

export async function getCourse(id: number): Promise<CourseWithGkData> {
  return (await db.query.courses.findFirst({
    where: eq(courses.id, id),
    with: { teeBoxes: true, gkData: true },
  }))! as CourseWithGkData;
}

export function calculatePar(courseData: CourseData) {
  return courseData.Holes.filter((hole) => hole.Enabled).reduce(
    (sum, hole) => sum + hole.Par,
    0
  );
}

export async function updateCourseTags(
  courseId: number,
  courseData: CourseData
) {
  // Define the keyword mapping
  const keywordFlags = {
    BeginnerFriendly: courseData.KeywordBeginnerFriendly,
    Coastal: courseData.KeywordCoastal,
    Desert: courseData.KeywordDesert,
    Fantasy: courseData.KeywordFantasy,
    Heathland: courseData.KeywordHeathland,
    Historic: courseData.KeywordHistoric,
    Links: courseData.KeywordLinks,
    LowPoly: courseData.KeywordLowPoly,
    MajorVenue: courseData.KeywordMajorVenue,
    Mountain: courseData.KeywordMountain,
    Parkland: courseData.KeywordParkland,
    TourStop: courseData.KeywordTourStop,
    Training: courseData.KeywordTraining,
    Tropical: courseData.KeywordTropical,
  };

  // Get tag names from flags that are true
  const tagNames = Object.entries(keywordFlags)
    .filter(([_, value]) => value === true)
    .map(([key]) => key);

  // Add any additional tags from KeywordsString
  if (courseData.KeywordsString) {
    const additionalTags = courseData.KeywordsString.split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && !tagNames.includes(tag));
    tagNames.push(...additionalTags);
  }

  if (tagNames.length === 0) return;

  // Get existing tags
  const existingTags = await db.query.tags.findMany({
    where: inArray(tags.name, tagNames),
  });

  // Create map of existing tag names to ids
  const tagNameToId = new Map(existingTags.map((tag) => [tag.name, tag.id]));

  // Create any missing tags
  const missingTagNames = tagNames.filter((name) => !tagNameToId.has(name));
  if (missingTagNames.length > 0) {
    const newTags = await db
      .insert(tags)
      .values(missingTagNames.map((name) => ({ name })))
      .returning();

    newTags.forEach((tag) => tagNameToId.set(tag.name, tag.id));
  }

  // Get existing course-tag relations
  const existingRelations = await db.query.courseToTags.findMany({
    where: eq(courseToTags.courseId, courseId),
  });
  const existingTagIds = new Set(existingRelations.map((rel) => rel.tagId));

  // Create new relations for tags that aren't already related
  const newRelations = Array.from(tagNameToId.values())
    .filter((tagId) => !existingTagIds.has(tagId))
    .map((tagId) => ({
      courseId,
      tagId,
    }));

  if (newRelations.length > 0) {
    await db.insert(courseToTags).values(newRelations);
  }
}

export async function updateCourseFromCourseData(
  courseId: number,
  courseData: CourseData
) {
  const par = calculatePar(courseData);
  const course = await getCourse(courseId);
  const courseAttribs = {
    location: courseData.Location || course.location || "-",
    holes: courseData.Holes.filter((hole) => hole.Enabled).length,
    designer: courseData.Designer || course.designer || "-",
    country: courseData.Location || course.country || "USA",
    altitude: courseData.altitudeV2 || courseData.altitude || 0,
  };
  course.par = par;
  course.averageElevationDifference =
    calculateAverageElevationDifference(courseData);
  course.largestElevationDrop = calculateLargestElevationDrop(courseData);
  course.totalHazards = calculateTotalHazards(courseData);
  course.islandGreens = calculateIslandGreens(courseData);
  course.totalInnerOOB = calculateTotalInnerOOB(courseData);
  course.totalWaterHazards =
    course.totalHazards - course.islandGreens - course.totalInnerOOB;
  course.rangeEnabled = courseData.HasRange || false;

  await updateCourse({
    ...course,
    ...courseAttribs,
  });

  await saveCourseData(courseId, courseData);
}

function calculateTotalHazards(courseData: CourseData) {
  return courseData.Hazards.length;
}

function calculateIslandGreens(courseData: CourseData) {
  return courseData.Hazards.filter((hazard) => hazard.islandGreen === true)
    .length;
}

function calculateTotalInnerOOB(courseData: CourseData) {
  return courseData.Hazards.filter((hazard) => hazard.innerOOB === true).length;
}

function calculateAverageElevationDifference(courseData: CourseData) {
  let totalElevationDifference = 0;
  let totalHoles = 0;
  for (const hole of courseData.Holes) {
    totalElevationDifference += Math.abs(
      calculateTeeToGreenElevationDifference(hole)
    );
    totalHoles++;
  }
  return Math.round(totalElevationDifference / totalHoles);
}

function calculateLargestElevationDrop(courseData: CourseData) {
  let largestElevationDrop = 0;
  for (const hole of courseData.Holes) {
    const elevationDrop = calculateTeeToGreenElevationDifference(hole);
    if (elevationDrop > largestElevationDrop) {
      largestElevationDrop = elevationDrop;
    }
  }
  return Math.round(largestElevationDrop);
}

function calculateTeeToGreenElevationDifference(hole: Hole) {
  const greenPointY = getGreenY(hole);
  let maxElevationDifference = 0;
  for (const tee of hole.Tees) {
    if (
      tee.TeeType === "GreenCenterPoint" ||
      tee.TeeType.startsWith("AimPoint")
    ) {
      continue;
    }
    const teeY = tee.Position?.y;
    if (!teeY) {
      continue;
    }
    const yDistance = teeY - greenPointY;
    if (yDistance > maxElevationDifference) {
      maxElevationDifference = yDistance;
    }
  }
  return maxElevationDifference;
}

function getGreenY(hole: Hole) {
  for (const pin of hole.Pins) {
    if (pin.Position && pin.Position.y) {
      return pin.Position.y;
    }
  }
  for (const tee of hole.Tees) {
    if (tee.TeeType === "GreenCenterPoint" && tee.Position?.y) {
      return tee.Position.y;
    }
  }
  return 0;
}

export async function saveCourseData(courseId: number, courseData: CourseData) {
  await db
    .insert(gkData)
    .values({
      courseId,
      gkData: courseData,
    })
    .onConflictDoUpdate({
      target: gkData.courseId,
      set: { gkData: courseData },
    });
}

export async function updateCourse(course: Course) {
  return db.update(courses).set(course).where(eq(courses.id, course.id));
}
