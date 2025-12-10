export type DistanceUnit = "meters" | "yards";

export const convertMetersToYards = (meters: number): number =>
  meters * 1.09361;

export const convertYardsToMeters = (yards: number): number => yards / 1.09361;
