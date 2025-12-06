export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Tee {
  TeeType: string;
  Enabled: boolean;
  Distance: number;
  Position: Position | null;
}

export interface Pin {
  Day: string;
  Position: Position;
}

export interface Hole {
  Enabled: boolean;
  HoleNumber: number;
  Par: number;
  Index: number;
  Tees: Tee[];
  Pins: Pin[];
}

export interface Hazard {
  pointCount: number;
  coords: Position[];
  DZpos: Position;
  freeDrop: boolean;
  innerOOB: boolean;
  noAIL: boolean;
  hasDZ: boolean;
  islandGreen: boolean;
}

export interface CourseData {
  gkversion: number;
  CourseName: string;
  Location: string;
  Homage: string;
  Designer: string;
  CourseImageFileName: string;
  ObjectTextureFileName: string;
  DescriptionTxtFileName: string;
  WindDirectionDefault: number;
  WindStrengthDefault: number;
  FairwayFirmnessDefault: number;
  GreenFirmnessDefault: number;
  DefaultStimp: number;
  MaxStimp: number;
  design: boolean;
  region: number;
  KeywordBeginnerFriendly: boolean;
  KeywordCoastal: boolean;
  KeywordDesert: boolean;
  KeywordFantasy: boolean;
  KeywordHeathland: boolean;
  KeywordHistoric: boolean;
  KeywordLinks: boolean;
  KeywordLowPoly: boolean;
  KeywordMajorVenue: boolean;
  KeywordMountain: boolean;
  KeywordParkland: boolean;
  KeywordTourStop: boolean;
  KeywordTraining: boolean;
  KeywordTropical: boolean;
  KeywordsString: string;
  unitOfMeasure: number;
  altitude: number;
  altitudeV2: number;
  BlackSR: string;
  WhiteSR: string;
  GreenSR: string;
  BlueSR: string;
  YellowSR: string;
  RedSR: string;
  JuniorSR: string;
  PAR3SR: string;
  terrainMaterial: number;
  hazardCount: number;
  slope: number;
  par: number;
  teeTypeCount: number;
  pOOB: OobDefinition;
  CourseInfo: string;
  Holes: Hole[];
  Hazards: Hazard[];
  TeeTypeTotalDistance: Tee[];
}

export interface OobDefinition {
  pointCount: number;
  coords: Position[];
}

export type NonTeeType = "AimPoint1" | "AimPoint2" | "GreenCenterPoint";

export interface BaseCourse extends NewCourse {
  id: number;
}

export interface Course extends BaseCourse {
  id: number;
  attributes: CourseAttribute[];
  teeBoxes: TeeBox[];
  largestElevationDrop: number;
  averageElevationDifference: number;
  totalWaterHazards: number;
  totalInnerOOB: number;
  islandGreens: number;
  totalHazards: number;
  rangeEnabled: boolean;
}

export interface NewCourse {
  name: string;
  location: string;
  holes: number;
  par: number;
  grade: number;
  designer: string;
  country: string;
  altitude: number;
  alternateName: string;
  difficulty: number;
  graphics: number;
  golfQuality: number;
  description: string;
  addedDate: string;
  updatedDate: string;
  opcdName: string;
  opcdVersion: string;
  sgtId: string;
  sgtSplashUrl: string | null;
  sgtYoutubeUrl: string;
  isPar3: boolean;
}

export interface CourseWithData extends Course {
  gkData: CourseData;
}

export interface TeeBox {
  teeBoxId: number;
  name: string;
  courseId: number;
  slope: number;
  rating: number;
  length: number;
}

export interface CourseAttribute {
  id: number;
  name: string;
}

export interface CourseAttributeOption {
  id: number;
  name: string;
  count: number;
}

export interface UploadResponse extends CourseWithData {}

export interface AdvancedFilters {
  teeboxLength: [number, number];
  altitude: [number, number];
  difficulty: [number, number];
  par: [number, number];
  onlyEighteenHoles: boolean;
  isPar3: boolean | undefined;
  rangeEnabled: boolean | undefined;
  selectedAttributes: number[];
}

export interface TeeBoxHole {
  number: number;
  par: number;
  index: number;
  length: number;
}

export interface TeeBoxData {
  name: string;
  slope: number;
  rating: number;
  totalLength: number;
  totalPar: number;
  holes: TeeBoxHole[];
}

export interface ScoreCardData {
  courseId: number;
  courseName: string;
  location: string;
  teeBoxes: TeeBoxData[];
  sgtSplashUrl: string;
  courseDetails: CourseDetails;
  sgtId: string;
}

export interface CourseDetails {
  designer: string;
  altitude: number;
  rangeEnabled: boolean;
  largestElevationDrop: number;
  description: string;
  addedDate: string;
  updatedDate: string;
  attributes: CourseAttribute[];
}

export interface CourseRecordEntry {
  playerName: string;
  attempts: number;
  lowScore: string;
  avatarUrl: string | null;
  countryCode: string;
  profileUrl: string;
}

export interface CourseRecords {
  courseName: string;
  teeType: string;
  entries: CourseRecordEntry[];
}

export type CourseRecordType = "CR" | "CRTips";

// New Course Records types (from local DB)
export interface Player {
  id: number;
  username: string;
  displayName: string;
  countryCode: string | null;
  avatarUrl: string | null;
}

export interface StoredCourseRecord {
  score: string;
  scoreNumeric: number;
  recordDate: string | null;
  player: Player | null;
}

export interface CourseRecordsResponse {
  courseId: number;
  courseName: string;
  tipsRecord: StoredCourseRecord | null;
  sgtRecord: StoredCourseRecord | null;
  lastScrapedAt: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  player: Player;
  tipsRecords: number;
  sgtRecords: number;
  totalRecords: number;
  tipsAvgScore: number | null;
  sgtAvgScore: number | null;
  totalAvgScore: number | null;
  tipsTotalScore: number;
  sgtTotalScore: number;
  totalScore: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  filters: {
    teeType: string;
    year: string;
  };
}

export interface PlayerRecord {
  course: {
    id: number;
    name: string;
    location: string;
    sgtId: string | null;
  };
  recordType: string;
  score: string;
  scoreNumeric: number;
  recordDate: string | null;
}

export interface PlayerRecordSummary {
  tipsRecords: number;
  sgtRecords: number;
  totalRecords: number;
  tipsAvgScore: number | null;
  sgtAvgScore: number | null;
  totalAvgScore: number | null;
  tipsTotalScore: number;
  sgtTotalScore: number;
  totalScore: number;
}

export interface PlayerProfileResponse {
  player: Player;
  records: PlayerRecord[];
  summary: PlayerRecordSummary;
}

// ============================================================================
// Ranking History & Tracking Types
// ============================================================================

export interface LeaderboardEntryWithChanges extends LeaderboardEntry {
  rankChange: number; // positive = moved up, negative = moved down
  recordsChange: number; // records gained - records lost
}

export interface LeaderboardWithChangesResponse {
  entries: LeaderboardEntryWithChanges[];
  total: number;
  filters: {
    teeType: string;
    year: string;
  };
}

export interface LeaderboardEntryWithPeriod extends LeaderboardEntryWithChanges {
  previousRank: number | null;
  comparisonPeriod: string; // 'day', 'week', 'month'
  comparisonDays: number;
}

export interface LeaderboardWithPeriodResponse {
  entries: LeaderboardEntryWithPeriod[];
  total: number;
  filters: {
    teeType: string;
    year: string;
    period: string;
  };
}

export interface RecordChangeEvent {
  id: number;
  courseId: number;
  courseName: string;
  courseLocation: string;
  recordType: "tips" | "sgt";
  changeType: "INITIAL" | "BROKEN" | "IMPROVED";
  previousPlayer: {
    id: number;
    username: string;
    displayName: string;
    countryCode: string | null;
  } | null;
  previousScore: string | null;
  newPlayer: {
    id: number;
    username: string;
    displayName: string;
    countryCode: string | null;
  };
  newScore: string;
  scoreImprovement: number | null;
  detectedAt: string;
}

export interface RecordChangeStats {
  totalChanges: number;
  brokenRecords: number;
  improvedRecords: number;
  initialRecords: number;
}

export interface RecordActivityResponse {
  changes: RecordChangeEvent[];
  stats: RecordChangeStats;
  pagination: {
    limit: number;
    offset: number;
  };
}

export interface PlayerRankSnapshot {
  date: string;
  overallRank: number;
  tipsRank: number | null;
  sgtRank: number | null;
  totalRecords: number;
  tipsRecords: number;
  sgtRecords: number;
  rankChange: number;
  recordsGained: number;
  recordsLost: number;
}

export interface PlayerRankHistoryResponse {
  playerId: number;
  history: PlayerRankSnapshot[];
}

export interface PlayerRecordChangesResponse {
  playerId: number;
  changes: RecordChangeEvent[];
}

export interface CourseRecordHistoryResponse {
  courseId: number;
  history: RecordChangeEvent[];
}

export interface RecordMover {
  player: {
    id: number;
    username: string;
    displayName: string;
  };
  recordsGained?: number;
  recordsLost?: number;
}

export interface RecordMoversResponse {
  gainers: RecordMover[];
  losers: RecordMover[];
  period: {
    daysBack: number;
  };
}

export interface RivalryCourse {
  courseId: number;
  courseName: string;
  recordType: string;
  detectedAt: string;
}

export interface Rivalry {
  player: {
    id: number;
    username: string;
    displayName: string;
    countryCode: string | null;
    avatarUrl: string | null;
  };
  recordsTakenFromMe: number; // How many records this rival took from me
  recordsTakenByMe: number; // How many records I took from this rival
  balance: number; // recordsTakenByMe - recordsTakenFromMe (positive = winning)
  coursesLost: RivalryCourse[];
  coursesWon: RivalryCourse[];
}

export interface RivalriesResponse {
  playerId: number;
  rivalries: Rivalry[];
  daysBack?: number;
}


export interface TopRivalryCourse {
  courseId: number;
  courseName: string;
  recordType: string;
  winner: 1 | 2;
  detectedAt: string;
}

export interface TopRivalry {
  player1: {
    id: number;
    username: string;
    displayName: string;
    countryCode: string | null;
    avatarUrl: string | null;
  };
  player2: {
    id: number;
    username: string;
    displayName: string;
    countryCode: string | null;
    avatarUrl: string | null;
  };
  totalExchanges: number;
  player1Wins: number;
  player2Wins: number;
  recentCourses: TopRivalryCourse[];
}

export interface TopRivalriesResponse {
  rivalries: TopRivalry[];
  daysBack?: number;
}
