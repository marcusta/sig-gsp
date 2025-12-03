import type {
  Course,
  CourseAttributeOption,
  CourseData,
  CourseRecords,
  CourseRecordsResponse,
  CourseRecordType,
  CourseWithData,
  LeaderboardResponse,
  PlayerProfileResponse,
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

export const fetchCourseRecords = (
  sgtId: string,
  recordType: CourseRecordType
) =>
  api
    .get<CourseRecords>(`/course-records/${sgtId}/${recordType}`)
    .then((res) => res.data);

// Course Records from local DB
export const fetchStoredCourseRecords = (courseId: number) =>
  api
    .get<CourseRecordsResponse>(`/courses/${courseId}/records`)
    .then((res) => res.data);

// Get available years for filtering
export const fetchRecordYears = () =>
  api.get<{ years: string[] }>("/records/years").then((res) => res.data);

// Leaderboard
export const fetchLeaderboard = (
  teeType: string = "all",
  year: string = "all",
  limit: number = 50,
  offset: number = 0
) =>
  api
    .get<LeaderboardResponse>("/records/leaderboard", {
      params: { teeType, year, limit, offset },
    })
    .then((res) => res.data);

// Player Profile
export const fetchPlayerProfile = (playerId: number) =>
  api.get<PlayerProfileResponse>(`/players/${playerId}`).then((res) => res.data);
