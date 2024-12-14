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

export interface UploadResponse extends CourseWithData {}

export interface AdvancedFilters {
  teeboxLength: [number, number];
  altitude: [number, number];
  difficulty: [number, number];
  par: [number, number];
  onlyEighteenHoles: boolean;
  isPar3: boolean | undefined;
  rangeEnabled: boolean | undefined;
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
  courseName: string;
  location: string;
  altitude: number;
  teeBoxes: TeeBoxData[];
}
