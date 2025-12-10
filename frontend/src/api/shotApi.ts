/**
 * Shot Calculator API
 * Calls the backend at app.swedenindoorgolf.se/mycal/api
 */

const API_BASE = "https://app.swedenindoorgolf.se/mycal";

export interface MaterialInfo {
  name: string;
  title: string;
}

export interface ShotSuggestion {
  ballSpeed: number;
  rawBallSpeed: number;
  spin: number;
  rawSpin: number;
  vla: number;
  rawCarry: number;
  estimatedCarry: number;
  clubName: string;
  offlineAimAdjustment: number;
}

export interface SuggestShotRequest {
  targetCarry: number;
  material: string;
  upDownLie?: number;
  rightLeftLie?: number;
  elevation?: number;
  altitude?: number;
}

// Cache for materials
let materialsCache: MaterialInfo[] | null = null;

export async function getMaterials(): Promise<MaterialInfo[]> {
  if (materialsCache) {
    return materialsCache;
  }

  const response = await fetch(`${API_BASE}/api/materials`);

  if (!response.ok) {
    throw new Error("Failed to fetch materials");
  }

  const materials = await response.json();
  materialsCache = materials;
  return materials;
}

export async function suggestShot(
  targetCarry: number,
  material: string,
  upDownLie: number = 0,
  rightLeftLie: number = 0,
  elevation: number = 0,
  altitude: number = 0
): Promise<ShotSuggestion> {
  const response = await fetch(`${API_BASE}/api/suggestShot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      targetCarry,
      material,
      upDownLie,
      rightLeftLie,
      elevation,
      altitude,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Failed to get shot suggestion");
  }

  return response.json();
}
