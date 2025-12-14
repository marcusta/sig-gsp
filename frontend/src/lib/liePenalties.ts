/**
 * Local lie penalty calculations based on empirical testing data.
 * Replaces server API calls for materials and plays-as calculations.
 */

export interface MaterialInfo {
  name: string;
  title: string;
}

// Data points: [targetCarry, playsAs] in meters
// Derived from empirical testing in GSPro

const SAND_DATA: [number, number][] = [
  [6, 12.0],
  [9, 16.0],
  [13, 22.0],
  [18, 29.0],
  [24, 36.0],
  [31, 43.0],
  [37, 50.0],
  [44, 57.0],
  [51, 65.0],
  [61, 73.0],
  [69, 81.0],
  [75, 86.0],
  [82, 92.0],
  [88, 98.0],
  [101, 109.0],
  [110, 118.3],
  [120, 129.0],
  [130, 139.8],
  [140, 150.5],
  [150, 161.3],
  [160, 172.0],
  [180, 193.5],
  [200, 215.1],
  [220, 236.6],
];

const DEEP_ROUGH_DATA: [number, number][] = [
  [12, 16],
  [16, 22],
  [20, 28],
  [29, 42],
  [41, 58],
  [48, 68],
  [59, 80],
  [68, 90],
  [76, 101],
  [85, 110],
  [92, 120],
  [101, 130],
  [108, 140],
  [115, 150],
  [122, 160],
  [128, 170],
  [131, 180],
  [136, 190],
  [139, 200],
  [142, 210],
  [145, 220],
  [148, 231],
];

// Rough data: [targetCarry, playsAs] in meters
// Derived from empirical testing - rough has a smaller penalty than deep rough
const ROUGH_DATA: [number, number][] = [
  [10.7, 11.8],
  [15, 16.6],
  [22.3, 24.7],
  [25.4, 27.8],
  [30, 33.2],
  [37, 41.4],
  [38.1, 42.7],
  [41, 46],
  [47.7, 53.1],
  [50.3, 55.8],
  [55.1, 60.9],
  [56.5, 62.3],
  [58.7, 65.1],
  [60.6, 66.4],
  [61.4, 67.6],
  [64.8, 71.4],
  [72.9, 78.1],
  [72.9, 78.9],
  [75, 81.2],
  [78.3, 84.6],
  [82.8, 88.6],
  [86.3, 91.3],
  [87.5, 93.0],
  [90, 95.4],
  [94.1, 99.5],
  [95.0, 100.3],
  [98.7, 104],
  [100.1, 106.3],
  [104, 110.1],
  [113.4, 118.7],
  [114.2, 119.4],
  [114.6, 120.8],
  [117.6, 123.7],
  [121, 126.7],
  [123.7, 128.8],
  [123.9, 129.8],
  [129.1, 134.8],
  [133.7, 140.7],
  [141.7, 146.9],
  [145.7, 150.4],
  [145.1, 152.5],
  [149, 155.3],
  [152.5, 157.9],
  [157.4, 163.5],
  [161.2, 167.8],
  [163.2, 169.5],
  [168.1, 176.6],
  [172, 181],
  [176.2, 185.4],
  [178.1, 188.6],
  [180.5, 191.6],
  [185.5, 198.3],
  [193.1, 205.4],
  [197.4, 209.8],
  [206, 224.2],
  [218.5, 227.7],
  [226.4, 241.1],
  [241.5, 258],
];

// Side slope aim offset data
// Key: plays-as distance in meters
// Value: [1°, 3°, 5°, 7°, 10°] aim offset in meters
const SIDE_SLOPE_ANGLES = [1, 3, 5, 7, 10];
const SIDE_SLOPE_DATA: { distance: number; offsets: number[] }[] = [
  { distance: 30, offsets: [0.3, 0.8, 1.3, 1.8, 2.6] },
  { distance: 40, offsets: [0.3, 1.0, 1.7, 2.5, 3.5] },
  { distance: 50, offsets: [0.4, 1.3, 2.2, 3.1, 4.4] },
  { distance: 60, offsets: [0.6, 1.7, 2.9, 4.1, 5.8] },
  { distance: 70, offsets: [0.7, 2.0, 3.4, 4.7, 6.8] },
  { distance: 80, offsets: [0.8, 2.3, 3.8, 5.4, 7.8] },
  { distance: 90, offsets: [0.9, 2.8, 4.7, 6.6, 9.5] },
  { distance: 100, offsets: [1.0, 3.1, 5.2, 7.4, 10.6] },
  { distance: 110, offsets: [1.3, 4.0, 6.7, 9.5, 13.6] },
  { distance: 120, offsets: [1.5, 4.4, 7.3, 10.3, 14.8] },
  { distance: 130, offsets: [1.7, 5.1, 8.5, 12.0, 17.2] },
  { distance: 140, offsets: [1.8, 5.5, 9.2, 12.9, 18.5] },
  { distance: 150, offsets: [2.1, 6.3, 10.5, 14.7, 21.2] },
  { distance: 160, offsets: [2.2, 6.7, 11.2, 15.7, 22.6] },
  { distance: 170, offsets: [2.4, 7.1, 11.9, 16.7, 24.0] },
  { distance: 180, offsets: [2.6, 7.7, 12.9, 18.1, 26.0] },
  { distance: 190, offsets: [2.7, 8.2, 13.6, 19.1, 27.5] },
  { distance: 200, offsets: [3.0, 9.1, 15.2, 21.4, 30.7] },
  { distance: 220, offsets: [3.3, 10.0, 16.7, 23.5, 33.7] },
];

// Wind effect data at 4m/s base wind speed
// Based on TARGET carry distance in meters
// Crosswind: lateral offset in meters (pure 90° crosswind)
// Headwind: carry reduction in meters (pure 0° headwind)
// Tailwind: carry increase in meters (pure 180° tailwind)
const WIND_4MS_DATA: {
  distance: number;
  crosswind: number; // lateral offset at 4m/s pure crosswind
  headwind: number; // carry loss at 4m/s pure headwind
  tailwind: number; // carry gain at 4m/s pure tailwind
}[] = [
  { distance: 40, crosswind: 1.5, headwind: 0.5, tailwind: 0.3 },
  { distance: 70, crosswind: 3.5, headwind: 3.5, tailwind: 2 },
  { distance: 100, crosswind: 6, headwind: 6.5, tailwind: 5 },
  { distance: 150, crosswind: 8.5, headwind: 9, tailwind: 8 },
  { distance: 200, crosswind: 10.5, headwind: 11, tailwind: 9 },
  { distance: 252, crosswind: 11, headwind: 11, tailwind: 9.5 },
];

/**
 * Linear interpolation between two points
 */
function lerp(
  x: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number
): number {
  if (x1 === x0) return y0;
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

/**
 * Find plays-as distance using linear interpolation on empirical data.
 * For values outside the measured range, extrapolates using the nearest segment.
 */
function interpolatePlaysAs(
  targetCarry: number,
  data: [number, number][]
): number {
  if (data.length === 0) return targetCarry;
  if (data.length === 1) return data[0][1];

  // Below minimum: extrapolate from first two points
  if (targetCarry <= data[0][0]) {
    const [x0, y0] = data[0];
    const [x1, y1] = data[1];
    return lerp(targetCarry, x0, x1, y0, y1);
  }

  // Above maximum: extrapolate from last two points
  if (targetCarry >= data[data.length - 1][0]) {
    const [x0, y0] = data[data.length - 2];
    const [x1, y1] = data[data.length - 1];
    return lerp(targetCarry, x0, x1, y0, y1);
  }

  // Find bracketing points and interpolate
  for (let i = 0; i < data.length - 1; i++) {
    const [x0, y0] = data[i];
    const [x1, y1] = data[i + 1];
    if (targetCarry >= x0 && targetCarry <= x1) {
      return lerp(targetCarry, x0, x1, y0, y1);
    }
  }

  // Fallback (shouldn't reach here)
  return targetCarry;
}

/**
 * Find bracketing indices for a value in a sorted array.
 * Returns [lowerIndex, upperIndex] for interpolation.
 * For extrapolation, returns appropriate edge indices.
 */
function findBracketingIndices(value: number, arr: number[]): [number, number] {
  if (arr.length < 2) return [0, 0];

  // Below minimum: extrapolate from first two
  if (value <= arr[0]) return [0, 1];

  // Above maximum: extrapolate from last two
  if (value >= arr[arr.length - 1]) return [arr.length - 2, arr.length - 1];

  // Find bracketing indices
  for (let i = 0; i < arr.length - 1; i++) {
    if (value >= arr[i] && value <= arr[i + 1]) {
      return [i, i + 1];
    }
  }

  return [arr.length - 2, arr.length - 1];
}

/**
 * Calculate aim offset using bilinear interpolation on empirical data.
 * Interpolates both on distance and slope angle axes.
 * @param playsAsMeters - The plays-as distance in meters
 * @param slopeAngle - The side slope angle in degrees (absolute value)
 * @returns The aim offset in meters
 */
export function calculateAimOffset(
  playsAsMeters: number,
  slopeAngle: number
): number {
  const absAngle = Math.abs(slopeAngle);
  if (absAngle === 0) return 0;

  const distances = SIDE_SLOPE_DATA.map((d) => d.distance);
  const angles = SIDE_SLOPE_ANGLES;

  // Find bracketing distance indices
  const [dLow, dHigh] = findBracketingIndices(playsAsMeters, distances);
  const d0 = distances[dLow];
  const d1 = distances[dHigh];

  // Find bracketing angle indices
  const [aLow, aHigh] = findBracketingIndices(absAngle, angles);
  const a0 = angles[aLow];
  const a1 = angles[aHigh];

  // Get the four corner values
  const q00 = SIDE_SLOPE_DATA[dLow].offsets[aLow]; // (d0, a0)
  const q01 = SIDE_SLOPE_DATA[dLow].offsets[aHigh]; // (d0, a1)
  const q10 = SIDE_SLOPE_DATA[dHigh].offsets[aLow]; // (d1, a0)
  const q11 = SIDE_SLOPE_DATA[dHigh].offsets[aHigh]; // (d1, a1)

  // Bilinear interpolation
  // First interpolate along the angle axis for both distances
  const r0 = lerp(absAngle, a0, a1, q00, q01); // interpolated at d0
  const r1 = lerp(absAngle, a0, a1, q10, q11); // interpolated at d1

  // Then interpolate along the distance axis
  const result = lerp(playsAsMeters, d0, d1, r0, r1);

  return result;
}

/**
 * Interpolate a single wind effect value for a given distance.
 */
function interpolateWindValue(
  targetCarryMeters: number,
  getValue: (data: (typeof WIND_4MS_DATA)[0]) => number
): number {
  const distances = WIND_4MS_DATA.map((d) => d.distance);
  const [low, high] = findBracketingIndices(targetCarryMeters, distances);

  const d0 = distances[low];
  const d1 = distances[high];
  const v0 = getValue(WIND_4MS_DATA[low]);
  const v1 = getValue(WIND_4MS_DATA[high]);

  return lerp(targetCarryMeters, d0, d1, v0, v1);
}

export interface WindEffect {
  carryAdjustment: number; // meters to add/subtract from plays-as (negative = shorter)
  offlineAdjustment: number; // meters to aim left (negative) or right (positive)
}

/**
 * Calculate wind effects on a shot using empirical data and trigonometry.
 *
 * @param targetCarryMeters - The target carry distance in meters
 * @param windSpeedMs - Wind speed in m/s
 * @param windDirectionDeg - Wind direction: 0° = headwind, 90° = from right, 180° = tailwind, 270° = from left
 * @param isDeepRough - Whether the lie is deep rough (reduces wind effect by 25%)
 * @returns Wind effects on carry and offline
 */
export function calculateWindEffect(
  targetCarryMeters: number,
  windSpeedMs: number,
  windDirectionDeg: number,
  isDeepRough: boolean = false
): WindEffect {
  if (windSpeedMs === 0) {
    return { carryAdjustment: 0, offlineAdjustment: 0 };
  }

  // Convert direction to radians
  const dirRad = (windDirectionDeg * Math.PI) / 180;

  // Decompose wind into components
  // cos(0°) = 1 = full headwind, cos(180°) = -1 = full tailwind
  // sin(90°) = 1 = full crosswind from right, sin(270°) = -1 = full crosswind from left
  const headwindComponent = Math.cos(dirRad); // positive = headwind, negative = tailwind
  const crosswindComponent = Math.sin(dirRad); // positive = from right, negative = from left

  // Get base effects at 4m/s for this distance
  const baseCrosswind = interpolateWindValue(
    targetCarryMeters,
    (d) => d.crosswind
  );
  const baseHeadwind = interpolateWindValue(
    targetCarryMeters,
    (d) => d.headwind
  );
  const baseTailwind = interpolateWindValue(
    targetCarryMeters,
    (d) => d.tailwind
  );

  // Scale by wind speed (data is at 4m/s)
  const windScale = windSpeedMs / 4;

  // Calculate carry adjustment
  let carryAdjustment: number;
  if (headwindComponent > 0) {
    // Headwind - reduces carry
    carryAdjustment = -baseHeadwind * headwindComponent * windScale;
  } else {
    // Tailwind - increases carry
    carryAdjustment = baseTailwind * -headwindComponent * windScale;
  }

  // Calculate offline adjustment (crosswind pushes ball in wind direction)
  // Positive crosswind (from right) pushes ball left = negative offline adjustment
  const offlineAdjustment = -baseCrosswind * crosswindComponent * windScale;

  // Apply deep rough reduction (25% less wind effect due to lower spin)
  const roughMultiplier = isDeepRough ? 0.75 : 1;

  return {
    carryAdjustment: carryAdjustment * roughMultiplier,
    offlineAdjustment: offlineAdjustment * roughMultiplier,
  };
}

/**
 * Calculate plays-as distance for a given target carry and material.
 * @param targetCarryMeters - The desired carry distance in meters
 * @param material - The lie/material type
 * @returns The distance you need to swing for (plays-as) in meters
 */
export function calculatePlaysAs(
  targetCarryMeters: number,
  material: string
): number {
  switch (material) {
    case "sand":
      return interpolatePlaysAs(targetCarryMeters, SAND_DATA);
    case "deep_rough":
      return interpolatePlaysAs(targetCarryMeters, DEEP_ROUGH_DATA);
    case "rough":
      return interpolatePlaysAs(targetCarryMeters, ROUGH_DATA);
    case "fairway":
    case "tee":
    default:
      // No penalty for fairway/tee
      return targetCarryMeters;
  }
}

/**
 * Available materials/lies for the shot suggester
 */
export const MATERIALS: MaterialInfo[] = [
  { name: "fairway", title: "Fairway" },
  { name: "rough", title: "Rough" },
  { name: "deep_rough", title: "Deep Rough" },
  { name: "sand", title: "Sand" },
];

/**
 * Get all available materials (replaces API call)
 */
export function getMaterials(): MaterialInfo[] {
  return MATERIALS;
}
