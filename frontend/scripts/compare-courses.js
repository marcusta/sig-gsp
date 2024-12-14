import fs from 'fs';
import path from 'path';

function loadSgtCoursesFromJsonFile() {
  const filename = "./courses-sgt.json";
  const fileContent = fs.readFileSync(filename, 'utf8');
  const courses = JSON.parse(fileContent);
  return courses;
}

function loadSigCourseNamesFromJsonFile() {
  const filename = "./courses-sig.json";
  const fileContent = fs.readFileSync(filename, 'utf8');
  const courses = JSON.parse(fileContent);
  return courses.map((course) => course.name);
}



function compareCourseLists() {
  const sgtCourses = loadSgtCoursesFromJsonFile();
  const sgtCourseNames = sgtCourses.map((course) => course.Name);
  const sigCourseNames = loadSigCourseNamesFromJsonFile();

  // convert sgtCourseNames to a map of course name to course name
  const sgtCourseNamesMap = sgtCourses.reduce((acc, course) => {
    acc[course.Name.toLowerCase()] = course;
    return acc;
  }, {});

  const sigCourseNamesMap = sigCourseNames.reduce((acc, courseName) => {
    acc[courseName.toLowerCase()] = courseName;
    return acc;
  }, {}); 

  function compareSigToSgt() {
    for (const courseName of sigCourseNames) {
      if (!sgtCourseNamesMap[courseName.toLowerCase()]) {
        const course = sigCourseNamesMap[courseName.toLowerCase()];
        console.log(courseName);
      }
    }  
  }

  function compareSgtToSig() {
    for (const courseName of sgtCourseNames) {
    if (!sigCourseNamesMap[courseName.toLowerCase()]) {
      const course = sgtCourseNamesMap[courseName.toLowerCase()];
      console.log(courseName);
      }
    }  
  }

  compareSigToSgt();
  console.log("--------------------------------");
  compareSgtToSig();

}

compareCourseLists();
