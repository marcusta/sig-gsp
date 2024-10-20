import { db } from "db/db";
import { courses, type NewCourse } from "db/schema";
import { eq } from "drizzle-orm";

const course: NewCourse = {
  name: "Test Course",
  description: "Test Description",
  location: "Test Location",
  holes: 18,
  par: 72,
};

// db.insert(courses).values(course).then(console.log);

// const courseData: CourseData = wolfcreek as CourseData;
/*
const gkDatas: NewGkData = {
  courseId: 1,
  gkData: courseData,
};
db.insert(gkData).values(gkDatas).then(console.log);*/

const result = await db.query.courses.findFirst({
  with: { gkData: true },
  where: eq(courses.id, 1),
});

console.log(result?.gkData?.gkData?.Holes.length);
