import type {
  CourseData,
  Hazard,
  Hole,
  NonTeeType,
  Pin,
  Position,
  Tee,
  TeeBox,
} from "@/types";

export interface AvailableTee {
  TeeType: string;
  TotalDistance: number;
}

export function calculateAltitudeEffect(
  courseData: CourseData | number
): number {
  const altitudeFeet =
    typeof courseData === "number" ? courseData : getAltitude(courseData);
  const altitudeEffect = 1 - (0.02 * altitudeFeet) / 1000;
  return altitudeEffect;
}

export function getTotalPar(courseData: CourseData): number {
  return courseData.Holes.reduce((sum, hole) => sum + hole.Par, 0);
}

export function getAltitude(courseData: CourseData): number {
  return courseData.altitudeV2 || courseData.altitude || 0;
}

export function getAltitudeInMeters(courseData: CourseData): number {
  const altitude = getAltitude(courseData);
  return altitude / 3.28084;
}

export function getHole(courseData: CourseData, holeNumber: number): Hole {
  return courseData.Holes[holeNumber - 1];
}

export function getTee(
  courseData: CourseData,
  holeNumber: number,
  teeType: string
): Tee | null {
  const hole = getHole(courseData, holeNumber);
  const tee = hole.Tees.find((tee) => tee.TeeType === teeType);
  return tee || null;
}

export function getPin(
  courseData: CourseData,
  holeNumber: number,
  pinDay: string
): Pin | null {
  const hole = getHole(courseData, holeNumber);
  const pin = hole.Pins.find((pin) => pin.Day === pinDay);
  return pin || null;
}

export function getAimOrGreenPoint(
  courseData: CourseData,
  holeNumber: number,
  pointType: NonTeeType
): Tee | null {
  return getTee(courseData, holeNumber, pointType);
}

export function getAvailableTees(courseData: CourseData): AvailableTee[] {
  return courseData.Holes[0].Tees.filter((tee) => tee.Position !== null)
    .map((tee) => ({
      TeeType: tee.TeeType,
      TotalDistance: courseData.Holes.reduce((sum, hole) => {
        const teebox = hole.Tees.find((t) => t.TeeType === tee.TeeType);
        return sum + (teebox ? teebox.Distance : 0);
      }, 0),
    }))
    .filter(
      (tee) =>
        tee.TeeType !== "AimPoint1" &&
        tee.TeeType !== "AimPoint2" &&
        tee.TeeType !== "GreenCenterPoint"
    )
    .sort((a, b) => b.TotalDistance - a.TotalDistance);
}

export function distance3D(point1: Position, point2: Position): number {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) +
      Math.pow(point1.y - point2.y, 2) +
      Math.pow(point1.z - point2.z, 2)
  );
}

export function calculateAdjustedDistance3D(
  point1: Position,
  point2: Position,
  altitudeEffect: number
): number {
  const distance = distance3D(point1, point2);
  const elevationChange = calculateElevationChange(point1, point2);
  return calculatePlaysAsDistance(distance, elevationChange, altitudeEffect);
}

export function calculateElevationChange(
  point1: Position,
  point2: Position
): number {
  return point2.y - point1.y;
}

export function calculatePlaysAsDistance(
  distance: number,
  elevationChange: number,
  altitudeInFeet: number
): number {
  const altitudeEffect = calculateAltitudeEffect(altitudeInFeet);
  const elevationAdjustdedDistance = distance + elevationChange;
  const altitudeAdjustedDistance = elevationAdjustdedDistance * altitudeEffect;
  return altitudeAdjustedDistance;
}

export function calculatePlaysAsDistanceByEffect(
  distance: number,
  elevationChange: number,
  altitudeEffect: number
): number {
  return (distance + elevationChange) * altitudeEffect;
}

export function getHazards(
  courseData: CourseData,
  holeNumber: number
): Hazard[] {
  const holePoints = [
    getTee(courseData, holeNumber, "AimPoint1"),
    getTee(courseData, holeNumber, "AimPoint2"),
    getTee(courseData, holeNumber, "GreenCenterPoint"),
    getPin(courseData, holeNumber, "Day1"),
  ];
  const hazards = courseData.Hazards.filter((hazard) =>
    isHazardNearHole(hazard, holePoints)
  );
  return hazards;
}

export function isHazardNearHole(
  hazard: Hazard,
  holePoints: (Tee | Pin | null)[]
): boolean {
  const MAX_DISTANCE = 100;

  for (const point of holePoints) {
    if (!point || !point.Position) continue;

    for (const coord of hazard.coords) {
      const distance = distance3D(point.Position, coord);
      if (distance <= MAX_DISTANCE) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculates the difficulty grade for a given tee box.
 *
 * @param teeBox - The TeeBox object containing course metrics.
 * @param altitude - Altitude in feet.
 * @param par - The par value for the course (e.g., 72).
 * @returns A difficulty grade between 1 and 20.
 */
export function gradeTeeBox(
  teeBox: TeeBox,
  altitude: number,
  par: number
): number {
  const { rating, slope, length } = teeBox;

  // 1. Altitude Adjustment: Reduce length by 2% per 1000 feet
  const altitudeAdjustmentFactor = 1 - 0.02 * (altitude / 1000);
  const adjustedLength = length * altitudeAdjustmentFactor;

  // 2. Normalization

  // Normalize Course Rating (Assuming typical range 67-78)
  const minRating = 67;
  const maxRating = 78;
  const normalizedRating = (rating - minRating) / (maxRating - minRating);
  const clampedNormalizedRating = Math.min(Math.max(normalizedRating, 0), 1);

  // Normalize Slope (Assuming typical range 55-155)
  const minSlope = 55;
  const maxSlope = 155;
  const normalizedSlope = (slope - minSlope) / (maxSlope - minSlope);
  const clampedNormalizedSlope = Math.min(Math.max(normalizedSlope, 0), 1);

  // Normalize Length
  // Define expected length range based on par
  // These multipliers (e.g., 70 and 110) can be adjusted based on typical course data
  const expectedLengthMin = par * 70; // e.g., par 72 -> 5040 feet
  const expectedLengthMax = par * 110; // e.g., par 72 -> 7920 feet

  let normalizedLength =
    (adjustedLength - expectedLengthMin) /
    (expectedLengthMax - expectedLengthMin);

  // If adjustedLength is less than expectedLengthMin, set normalizedLength to 0
  // If greater than expectedLengthMax, set to 1
  normalizedLength = Math.min(Math.max(normalizedLength, 0), 1);

  // 3. Weighting
  // Assign weights to each normalized factor based on their importance
  const weightRating = 0.3;
  const weightSlope = 0.3;
  const weightLength = 0.4;

  // 4. Calculate Weighted Score
  const weightedScore =
    clampedNormalizedRating * weightRating +
    clampedNormalizedSlope * weightSlope +
    normalizedLength * weightLength;

  // 5. Scale to 1-20
  // Ensure weightedScore is between 0 and 1
  const clampedWeightedScore = Math.min(Math.max(weightedScore, 0), 1);
  const grade = Math.round(clampedWeightedScore * 9) + 1; // Scale to 1-20

  return grade;
}

export function getTeeTypeRating(
  courseData: CourseData,
  teeType: string
): string {
  switch (teeType.toLowerCase()) {
    case "green":
      return courseData.GreenSR;
    case "blue":
      return courseData.BlueSR;
    case "yellow":
      return courseData.YellowSR;
    case "red":
      return courseData.RedSR;
    case "white":
      return courseData.WhiteSR;
    case "black":
      return courseData.BlackSR;
    case "junior":
      return courseData.JuniorSR;
    case "par3":
      return courseData.PAR3SR;
    default:
      return "0/0";
  }
}
