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

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Hole {
  Enabled: boolean;
  HoleNumber: number;
  Par: number;
  Index: number;
  Tees: Tee[];
  Pins: Pin[];
}

export interface Pin {
  Day: Day;
  Position: Position;
}

export enum Day {
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
  Thursday = "Thursday",
}

export interface Tee {
  TeeType: TeeType;
  Enabled: boolean;
  Distance: number;
  Position: Position | null;
}

export enum TeeType {
  AimPoint1 = "AimPoint1",
  AimPoint2 = "AimPoint2",
  Black = "Black",
  Blue = "Blue",
  Green = "Green",
  GreenCenterPoint = "GreenCenterPoint",
  Junior = "Junior",
  Par3 = "Par3",
  Red = "Red",
  White = "White",
  Yellow = "Yellow",
}

export interface OobDefinition {
  pointCount: number;
  coords: Position[];
}
