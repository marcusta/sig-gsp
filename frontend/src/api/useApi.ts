import type {
  Course,
  CourseAttributeOption,
  CourseData,
  CourseWithData,
  UploadResponse,
} from "@/types";
import axios from "axios";

const basePath = import.meta.env.PROD ? "/gsp/" : "/";
const api = axios.create({ baseURL: `${basePath}api` });

export const fetchCourseData = () =>
  api.get<CourseData>("/courses/10/gkd").then((res) => res.data);

export const uploadJsonContent = (jsonContent: string) =>
  api
    .post<UploadResponse>("/coursefile", jsonContent, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);

// New function to fetch the list of courses
export const fetchCourses = () =>
  api.get<Course[]>("/courses").then((res) => res.data);

// New function to fetch a course by ID
export const fetchCourseById = (id: number) =>
  api.get<CourseWithData>(`/courses/${id}`).then((res) => res.data);

export const fetchCourseAttributes = () =>
  api
    .get<CourseAttributeOption[]>("/course-attributes")
    .then((res) => res.data);
