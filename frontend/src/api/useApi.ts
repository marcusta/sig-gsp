import type {
  Course,
  CourseAttributeOption,
  CourseData,
  CourseRecordHistoryResponse,
  CourseRecords,
  CourseRecordsResponse,
  CourseRecordType,
  CourseWithData,
  LeaderboardResponse,
  LeaderboardWithChangesResponse,
  LeaderboardWithPeriodResponse,
  PaginatedCoursesResponse,
  PlayerProfileResponse,
  PlayerRankHistoryResponse,
  PlayerRecordChangesResponse,
  RecordActivityResponse,
  RecordMoversResponse,
  RivalriesResponse,
  TopRivalriesResponse,
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

export const fetchCoursesPaginated = (
  page: number = 1,
  limit: number = 24,
  search: string = "",
  thin: boolean = true
) =>
  api
    .get<PaginatedCoursesResponse>("/courses/paginated", {
      params: { page, limit, search, thin },
    })
    .then((res) => res.data);

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
  api
    .get<PlayerProfileResponse>(`/players/${playerId}`)
    .then((res) => res.data);

// ============================================================================
// Ranking History & Tracking API
// ============================================================================

// Enhanced leaderboard with rank changes
export const fetchLeaderboardWithChanges = (
  teeType: string = "all",
  year: string = "all",
  limit: number = 50,
  offset: number = 0
) =>
  api
    .get<LeaderboardWithChangesResponse>("/records/leaderboard-with-changes", {
      params: { teeType, year, limit, offset },
    })
    .then((res) => res.data);

// Leaderboard with custom time period comparison
export const fetchLeaderboardWithPeriod = (
  teeType: string = "all",
  year: string = "all",
  period: string = "week",
  limit: number = 50,
  offset: number = 0
) =>
  api
    .get<LeaderboardWithPeriodResponse>("/records/leaderboard-with-period", {
      params: { teeType, year, period, limit, offset },
    })
    .then((res) => res.data);

// Recent record changes (activity feed)
export const fetchRecordActivity = (
  limit: number = 50,
  offset: number = 0,
  daysBack: number = 30
) =>
  api
    .get<RecordActivityResponse>("/records/activity", {
      params: { limit, offset, daysBack },
    })
    .then((res) => res.data);

// Player rank history over time
export const fetchPlayerRankHistory = (playerId: number, limit: number = 30) =>
  api
    .get<PlayerRankHistoryResponse>(`/players/${playerId}/rank-history`, {
      params: { limit },
    })
    .then((res) => res.data);

// Player's record change activity
export const fetchPlayerRecordChanges = (
  playerId: number,
  limit: number = 50
) =>
  api
    .get<PlayerRecordChangesResponse>(`/players/${playerId}/record-changes`, {
      params: { limit },
    })
    .then((res) => res.data);

// Course record history
export const fetchCourseRecordHistory = (
  courseId: number,
  recordType?: "tips" | "sgt"
) =>
  api
    .get<CourseRecordHistoryResponse>(`/courses/${courseId}/record-history`, {
      params: recordType ? { recordType } : {},
    })
    .then((res) => res.data);

// Top gainers and losers
export const fetchRecordMovers = (daysBack: number = 7, limit: number = 10) =>
  api
    .get<RecordMoversResponse>("/records/movers", {
      params: { daysBack, limit },
    })
    .then((res) => res.data);

// Player rivalries (who took records from this player)
export const fetchPlayerRivalries = (playerId: number, daysBack?: number) =>
  api
    .get<RivalriesResponse>(`/players/${playerId}/rivalries`, {
      params: daysBack ? { daysBack } : {},
    })
    .then((res) => res.data);

// Top rivalries (pairs of players with most record exchanges)
export const fetchTopRivalries = (daysBack?: number, limit?: number) =>
  api
    .get<TopRivalriesResponse>("/records/top-rivalries", {
      params: { daysBack, limit },
    })
    .then((res) => res.data);
