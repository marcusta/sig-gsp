/**
 * Speed ↔ Distance Mapping for GSPro Putting
 * Provides interpolation between known data points
 */

export interface SpeedDistanceData {
  speed: number; // Ball speed in mph
  distance: number; // Total length in meters
}

export interface StimpData {
  [key: number]: SpeedDistanceData[];
}

const speedDistanceTables: StimpData = {
  10: [
    { speed: 1.8, distance: 0.7 },
    { speed: 2.6, distance: 1.4 },
    { speed: 3.5, distance: 2.3 },
    { speed: 4.3, distance: 3.3 },
    { speed: 5.4, distance: 4.8 },
    { speed: 6.6, distance: 6.6 },
    { speed: 7.4, distance: 7.9 },
    { speed: 8.5, distance: 9.8 },
    { speed: 10.2, distance: 12.8 },
    { speed: 11.5, distance: 15.2 },
    { speed: 12.2, distance: 16.5 },
  ],
  11: [
    { speed: 2.4, distance: 1.3 },
    { speed: 3.2, distance: 2.1 },
    { speed: 3.6, distance: 2.7 },
    { speed: 3.9, distance: 3.1 },
    { speed: 5.3, distance: 5.1 },
    { speed: 5.5, distance: 5.3 },
    { speed: 6.0, distance: 6.2 },
    { speed: 6.1, distance: 6.3 },
    { speed: 6.7, distance: 7.2 },
    { speed: 7.1, distance: 7.9 },
    { speed: 7.3, distance: 8.4 },
    { speed: 7.5, distance: 8.7 },
    { speed: 7.9, distance: 9.4 },
    { speed: 8.0, distance: 9.6 },
    { speed: 8.5, distance: 10.4 },
    { speed: 8.8, distance: 10.9 },
    { speed: 9.5, distance: 12.3 },
    { speed: 9.8, distance: 12.9 },
    { speed: 10.0, distance: 13.2 },
    { speed: 10.7, distance: 14.6 },
    { speed: 11.1, distance: 15.4 },
    { speed: 11.6, distance: 16.3 },
  ],
  12: [
    { speed: 1.5, distance: 0.6 },
    { speed: 2.2, distance: 1.3 },
    { speed: 3.1, distance: 2.4 },
    { speed: 4.1, distance: 3.6 },
    { speed: 4.3, distance: 4.0 },
    { speed: 4.9, distance: 4.8 },
    { speed: 5.3, distance: 5.5 },
    { speed: 5.7, distance: 6.1 },
    { speed: 5.8, distance: 6.3 },
    { speed: 6.3, distance: 7.2 },
    { speed: 6.9, distance: 8.2 },
    { speed: 7.7, distance: 9.7 },
    { speed: 8.3, distance: 10.9 },
    { speed: 8.7, distance: 11.5 },
    { speed: 9.2, distance: 12.5 },
    { speed: 9.8, distance: 13.8 },
    { speed: 10.4, distance: 14.9 },
    { speed: 11.4, distance: 16.9 },
    { speed: 12.5, distance: 19.1 },
  ],
  13: [
    { speed: 1.8, distance: 1.0 },
    { speed: 2.1, distance: 1.2 },
    { speed: 2.6, distance: 1.9 },
    { speed: 5.4, distance: 6.1 },
    { speed: 5.8, distance: 6.7 },
    { speed: 7.5, distance: 9.9 },
    { speed: 8.8, distance: 12.4 },
    { speed: 8.9, distance: 12.6 },
    { speed: 9.5, distance: 13.8 },
    { speed: 9.7, distance: 14.2 },
    { speed: 11.0, distance: 17.1 },
    { speed: 11.7, distance: 18.6 },
  ],
};

// Sort all tables by speed
Object.keys(speedDistanceTables).forEach((stimp) => {
  speedDistanceTables[Number(stimp)].sort((a, b) => a.speed - b.speed);
});

const DEFAULT_STIMP = 11;

function linearInterpolate(
  x: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): number {
  if (Math.abs(x1 - x0) < 1e-9) return y0;
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

export function getDistanceForSpeed(
  speed: number,
  stimp: number = DEFAULT_STIMP
): number {
  const table = speedDistanceTables[stimp];
  if (!table) {
    throw new Error(`No data available for stimp ${stimp}`);
  }

  if (speed <= table[0].speed) return table[0].distance;

  if (speed >= table[table.length - 1].speed) {
    const lastPoint = table[table.length - 1];
    const secondLastPoint = table[table.length - 2];
    return linearInterpolate(
      speed,
      secondLastPoint.speed,
      secondLastPoint.distance,
      lastPoint.speed,
      lastPoint.distance
    );
  }

  for (let i = 0; i < table.length - 1; i++) {
    const curr = table[i];
    const next = table[i + 1];
    if (speed >= curr.speed && speed <= next.speed) {
      return linearInterpolate(
        speed,
        curr.speed,
        curr.distance,
        next.speed,
        next.distance
      );
    }
  }

  return 0;
}

export function getSpeedForDistance(
  distance: number,
  stimp: number = DEFAULT_STIMP
): number {
  const table = speedDistanceTables[stimp];
  if (!table) {
    throw new Error(`No data available for stimp ${stimp}`);
  }

  if (distance <= table[0].distance) return table[0].speed;

  if (distance >= table[table.length - 1].distance) {
    const lastPoint = table[table.length - 1];
    const secondLastPoint = table[table.length - 2];
    return linearInterpolate(
      distance,
      secondLastPoint.distance,
      secondLastPoint.speed,
      lastPoint.distance,
      lastPoint.speed
    );
  }

  for (let i = 0; i < table.length - 1; i++) {
    const curr = table[i];
    const next = table[i + 1];
    if (distance >= curr.distance && distance <= next.distance) {
      return linearInterpolate(
        distance,
        curr.distance,
        curr.speed,
        next.distance,
        next.speed
      );
    }
  }

  return 0;
}

export function getAvailableStimps(): number[] {
  return Object.keys(speedDistanceTables)
    .map(Number)
    .sort((a, b) => a - b);
}
