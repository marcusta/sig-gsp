/**
 * Shot Calculator - Local calculations using empirical lie penalty data
 */

import {
  getMaterials as getLocalMaterials,
  calculatePlaysAs,
  calculateAimOffset,
  type MaterialInfo,
} from "@/lib/liePenalties";

export type { MaterialInfo };

export interface ShotResult {
  playsAs: number;
  offlineAimAdjustment: number;
}

/**
 * Get available materials/lies
 */
export const getMaterials = getLocalMaterials;

/**
 * Calculate shot suggestion using empirical lie penalty data.
 *
 * @param targetCarry - Target carry distance in meters
 * @param material - Lie/material type
 * @param rightLeftLie - Side slope in degrees (+ = ball above feet)
 * @param elevation - Elevation difference to target in meters (+ = uphill)
 * @param altitude - Course altitude in feet
 * @returns Shot result with plays-as distance and aim adjustment
 */
export function calculateShot(
  targetCarry: number,
  material: string,
  rightLeftLie: number = 0,
  elevation: number = 0,
  altitude: number = 0
): ShotResult {
  // 1. Calculate base plays-as from lie penalty
  let playsAs = calculatePlaysAs(targetCarry, material);

  // 2. Adjust for elevation difference to target
  // Rule of thumb: add ~1m per 1m of uphill elevation
  playsAs += elevation;

  // 3. Adjust for altitude (thin air = ball goes further)
  // Approximately 2% more distance per 1000ft of altitude
  // So we need to swing LESS to achieve same distance
  const altitudeAdjustment = 1 - (altitude / 1000) * 0.02;
  playsAs *= altitudeAdjustment;

  // 4. Calculate aim adjustment for side slope using empirical data
  // Based on plays-as distance, not target distance
  // Positive slope (ball above feet) = aim right for right-hander
  const aimMagnitude = calculateAimOffset(playsAs, rightLeftLie);
  const offlineAimAdjustment = rightLeftLie >= 0 ? aimMagnitude : -aimMagnitude;

  return {
    playsAs,
    offlineAimAdjustment,
  };
}
