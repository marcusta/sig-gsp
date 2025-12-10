const urlBase =
  window.location.hostname === "app.swedenindoorgolf.se" ? "/mycal" : "";

export interface CarryData {
  BallSpeed: number;
  VLA: number;
  HLA: number;
  BackSpin: number;
  SpinAxis: number;
  Carry: number;
  Offline: number;
}

export async function getCarryDataFromServer(
  ballSpeed: number,
  spin: number,
  vla: number
): Promise<CarryData> {
  try {
    const response = await fetch(
      `${urlBase}/api/trajectory?ballSpeed=${ballSpeed}&spin=${spin}&vla=${vla}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching trajectory:", error);
    throw error;
  }
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

export async function suggestShot(
  targetCarry: number,
  material: string,
  upDownLie: number = 0,
  rightLeftLie: number = 0,
  elevation: number = 0,
  altitude: number = 0
): Promise<ShotSuggestion> {
  try {
    const response = await fetch(`${urlBase}/api/suggestShot`, {
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
      throw new Error("Failed to get shot suggestion");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting shot suggestion:", error);
    throw error;
  }
}

export interface CalculateCarryResponse {
  material: string;
  rawSpin: number;
  rawVLA: number;
  rawSpeed: number;
  carryRaw: number;
  carryModified: number;
  envCarry: number;
  offlineDeviation: number;
  speedModified: number;
  vlaModified: number;
  spinModified: number;
  speedPenalty: number;
  spinPenalty: number;
  vlaPenalty: number;
}

export interface CalculateCarryRequest {
  ballSpeed: number;
  spin: number;
  vla: number;
  material: string;
  upDownLie?: number;
  rightLeftLie?: number;
  elevation?: number;
  altitude?: number;
}

export async function calculateCarry({
  ballSpeed,
  spin,
  vla,
  material,
  upDownLie = 0,
  rightLeftLie = 0,
  elevation = 0,
  altitude = 0,
}: CalculateCarryRequest): Promise<CalculateCarryResponse> {
  try {
    const response = await fetch(`${urlBase}/api/calculate-carry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ballSpeed,
        spin,
        vla,
        material,
        upDownLie,
        rightLeftLie,
        elevation,
        altitude,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to calculate carry");
    }

    return await response.json();
  } catch (error) {
    console.error("Error calculating carry:", error);
    throw error;
  }
}

export interface ShotAnalyzerRequest {
  club: string;
  material: string;
  upDownLie: number;
  rightLeftLie: number;
  altitude: number;
  elevation: number;
  increments: number;
}

export interface ShotIncrementResult {
  power: number;
  ballSpeed: number;
  spin: number;
  vla: number;
  rawCarry: number;
  estimatedCarry: number;
  envCarry: number;
  offlineDeviation: number;
  modifiers: {
    speedPenalty: number;
    spinPenalty: number;
    vlaPenalty: number;
  };
}

export interface ShotAnalyzerResponse {
  request: ShotAnalyzerRequest;
  results: (ShotIncrementResult | null)[];
}

export async function analyzeClubShot(
  club: string,
  material: string,
  upDownLie: number = 0,
  rightLeftLie: number = 0,
  elevation: number = 0,
  altitude: number = 0
): Promise<ShotAnalyzerResponse> {
  const request: ShotAnalyzerRequest = {
    club,
    material,
    upDownLie,
    rightLeftLie,
    altitude,
    elevation,
    increments: 5, // Fixed at 5 increments to match current implementation
  };

  const response = await fetch(`${urlBase}/api/analyze-club-shot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze shot");
  }

  return response.json();
}

export interface ClubInfo {
  name: string;
}

// Cache for clubs and materials
let clubsCache: ClubInfo[] | null = null;
let materialsCache: MaterialInfo[] | null = null;

export async function getClubs(): Promise<ClubInfo[]> {
  // Return cached data if available
  if (clubsCache) {
    return clubsCache;
  }

  const response = await fetch(`${urlBase}/api/clubs`);

  if (!response.ok) {
    throw new Error("Failed to fetch clubs");
  }

  const clubs = await response.json();
  clubsCache = clubs; // Store in cache
  return clubs;
}

export interface MaterialInfo {
  name: string;
  title: string;
}

export async function getMaterials(): Promise<MaterialInfo[]> {
  // Return cached data if available
  if (materialsCache) {
    return materialsCache;
  }

  const response = await fetch(`${urlBase}/api/materials`);

  if (!response.ok) {
    throw new Error("Failed to fetch materials");
  }

  const materials = await response.json();
  materialsCache = materials; // Store in cache
  return materials;
}
