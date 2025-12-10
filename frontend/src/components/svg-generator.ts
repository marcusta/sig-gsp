import {
  convertAltitude,
  convertDistance,
  getAltitudeUnit,
  getDistanceUnit,
} from "@/contexts/UnitContext";
import type { Hazard, OobDefinition, Pin, Position, Tee } from "@/types";
import { calculatePlaysAsDistanceByEffect, distance3D } from "./course-data";

// Masters-inspired color palette - warm ambers and muted greens
const SVG_COLORS = {
  // Tee marker - muted dark with slight warmth
  tee: {
    fill: "#2d3a35", // Dark muted green-gray
    stroke: "#4a5c54",
  },
  // Pin/flag - muted red (matches bg-red-800/70)
  pin: {
    fill: "#991b1b", // Muted red
    glow: "rgba(153, 27, 27, 0.4)",
  },
  // Shot path - warm amber accent
  path: {
    stroke: "#b4846c", // Muted amber-brown
    strokeWidth: "2",
  },
  // Green area - muted emerald (matches bg-emerald-800/70)
  green: {
    fill: "#166534", // Deep emerald
    fillOpacity: "0.6",
    stroke: "#15803d",
    strokeOpacity: "0.4",
  },
  // Water hazards - Yellow stakes (can play as it lies)
  waterYellow: {
    fill: "#134e4a", // Dark teal
    fillOpacity: "0.45",
    stroke: "#ca8a04", // Yellow-600 for yellow stakes
    strokeOpacity: "0.8",
  },
  // Water hazards - Red stakes (must take relief, noAIL)
  waterRed: {
    fill: "#172554", // Darker blue tint
    fillOpacity: "0.5",
    stroke: "#dc2626", // Red-600 for red stakes
    strokeOpacity: "0.8",
  },
  // Inner OOB areas - distinct from water
  innerOOB: {
    fill: "#44403c", // Stone-700
    fillOpacity: "0.4",
    stroke: "#f5f5f4", // White stakes
    strokeOpacity: "0.7",
    strokeDasharray: "4 3", // Dashed for OOB
  },
  // Perimeter OOB boundary
  perimeterOOB: {
    stroke: "#a8a29e", // Stone-400
    strokeOpacity: "0.3",
    strokeDasharray: "6 4",
  },
  // Aim points - warm amber
  aimPoint: {
    fill: "#d97706", // Amber-600
    stroke: "#b45309",
  },
  // Text - warm amber tints (matches text-amber-100/80)
  text: {
    primary: "#fef3c7", // amber-100
    secondary: "#fde68a", // amber-200
    muted: "rgba(254, 243, 199, 0.7)", // amber-100/70
  },
};

export function generateSVG(
  selectedTee: Tee,
  selectedPin: Pin,
  aimPoint1: Tee | null,
  aimPoint2: Tee | null,
  greenCenterPoint: Tee | null,
  altitudeEffect: number,
  hazards: Hazard[],
  perimeterOOB: OobDefinition | null,
  isMetric: boolean
): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", "0 0 800 600");
  svg.style.maxWidth = "100%";
  svg.style.maxHeight = "100%";

  const clipPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "clipPath"
  );
  clipPath.setAttribute("id", "panel-clip");
  const clipRect = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  clipRect.setAttribute("x", "0");
  clipRect.setAttribute("y", "0");
  clipRect.setAttribute("width", "800");
  clipRect.setAttribute("height", "600");
  clipPath.appendChild(clipRect);
  svg.appendChild(clipPath);

  const mainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  mainGroup.setAttribute("clip-path", "url(#panel-clip)");
  svg.appendChild(mainGroup);

  const positions = [
    selectedTee,
    selectedPin,
    aimPoint1,
    aimPoint2,
    greenCenterPoint,
  ]
    .filter(
      (point): point is Tee | Pin => point !== null && point.Position !== null
    )
    .map((point) => ({ x: point.Position!.x, z: point.Position!.z }));

  const { minX, maxX, minZ, maxZ } = calculateBoundaries(positions);
  const { transformX, transformZ, scale } = createTransformFunctions(
    minX,
    maxX,
    minZ,
    maxZ
  );

  const rotation = calculateRotation(
    selectedTee.Position!,
    selectedPin.Position
  );
  mainGroup.setAttribute("transform", `rotate(${rotation} 400 300)`);

  // Draw perimeter OOB boundary first (background layer)
  if (perimeterOOB && perimeterOOB.coords.length > 0) {
    drawPerimeterOOB(mainGroup, perimeterOOB, transformX, transformZ);
  }

  // Separate hazards by type
  const innerOOBHazards = hazards.filter((h) => h.innerOOB);
  const waterHazards = hazards.filter((h) => !h.innerOOB);

  // Draw inner OOB areas
  drawInnerOOBHazards(mainGroup, innerOOBHazards, transformX, transformZ);

  // Draw water hazards (with noAIL distinction)
  drawWaterHazards(mainGroup, waterHazards, transformX, transformZ);

  drawTee(mainGroup, selectedTee, transformX, transformZ);
  drawPin(mainGroup, selectedPin, transformX, transformZ);

  // Draw aimpoints
  if (aimPoint1 && aimPoint1.Position) {
    drawAimPoint(mainGroup, aimPoint1.Position, transformX, transformZ);
  }
  if (aimPoint2 && aimPoint2.Position) {
    drawAimPoint(mainGroup, aimPoint2.Position, transformX, transformZ);
  }

  drawPath(
    svg,
    mainGroup,
    selectedTee,
    selectedPin,
    aimPoint1,
    aimPoint2,
    transformX,
    transformZ,
    altitudeEffect,
    scale,
    rotation,
    isMetric
  );
  drawGreenArea(mainGroup, greenCenterPoint, transformX, transformZ);

  return svg;
}

// Helper functions
function calculateBoundaries(positions: { x: number; z: number }[]): {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
} {
  const padding = 50;
  const minX = Math.min(...positions.map((p) => p.x)) - padding;
  const maxX = Math.max(...positions.map((p) => p.x)) + padding;
  const minZ = Math.min(...positions.map((p) => p.z)) - padding;
  const maxZ = Math.max(...positions.map((p) => p.z)) + padding;
  return { minX, maxX, minZ, maxZ };
}

function createTransformFunctions(
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number
): {
  transformX: (x: number) => number;
  transformZ: (z: number) => number;
  scale: number;
} {
  const width = 800;
  const height = 600;
  const xRange = maxX - minX;
  const zRange = maxZ - minZ;
  const scale = Math.min(width / xRange, height / zRange) * 0.8;

  return {
    transformX: (x: number) =>
      (x - minX) * scale + (width - xRange * scale) / 2,
    transformZ: (z: number) =>
      height - ((z - minZ) * scale + (height - zRange * scale) / 2),
    scale: scale,
  };
}

function calculateRotation(
  teePosition: Position,
  pinPosition: Position
): number {
  const angle = Math.atan2(
    pinPosition.z - teePosition.z,
    pinPosition.x - teePosition.x
  );
  return ((angle * 180) / Math.PI - 90) % 360;
}

function drawTee(
  svg: SVGElement,
  selectedTee: Tee,
  transformX: (x: number) => number,
  transformZ: (z: number) => number
): void {
  const teeCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  teeCircle.setAttribute("cx", transformX(selectedTee.Position!.x).toString());
  teeCircle.setAttribute("cy", transformZ(selectedTee.Position!.z).toString());
  teeCircle.setAttribute("r", "6");
  teeCircle.setAttribute("fill", SVG_COLORS.tee.fill);
  teeCircle.setAttribute("stroke", SVG_COLORS.tee.stroke);
  teeCircle.setAttribute("stroke-width", "1.5");
  svg.appendChild(teeCircle);
}

function drawPin(
  svg: SVGElement,
  selectedPin: Pin,
  transformX: (x: number) => number,
  transformZ: (z: number) => number
): void {
  const cx = transformX(selectedPin.Position.x).toString();
  const cy = transformZ(selectedPin.Position.z).toString();

  // Glow effect behind pin
  const pinGlow = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  pinGlow.setAttribute("cx", cx);
  pinGlow.setAttribute("cy", cy);
  pinGlow.setAttribute("r", "8");
  pinGlow.setAttribute("fill", SVG_COLORS.pin.glow);
  svg.appendChild(pinGlow);

  // Main pin circle
  const pinCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  pinCircle.setAttribute("cx", cx);
  pinCircle.setAttribute("cy", cy);
  pinCircle.setAttribute("r", "4");
  pinCircle.setAttribute("fill", SVG_COLORS.pin.fill);
  svg.appendChild(pinCircle);
}

function drawPath(
  svg: SVGSVGElement,
  mainGroup: SVGGElement,
  selectedTee: Tee,
  selectedPin: Pin,
  aimPoint1: Tee | null,
  aimPoint2: Tee | null,
  transformX: (x: number) => number,
  transformZ: (z: number) => number,
  altitudeEffect: number,
  scale: number,
  rotation: number,
  isMetric: boolean
): void {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  let pathData = `M ${transformX(selectedTee.Position!.x)} ${transformZ(
    selectedTee.Position!.z
  )}`;
  let lastPoint = selectedTee.Position!;

  if (aimPoint1 && aimPoint1.Position) {
    lastPoint = drawLineWithDistance(
      svg,
      lastPoint,
      aimPoint1.Position,
      "",
      transformX,
      transformZ,
      altitudeEffect,
      scale,
      rotation,
      isMetric
    );
    pathData += ` L ${transformX(aimPoint1.Position.x)} ${transformZ(
      aimPoint1.Position.z
    )}`;
  }
  if (aimPoint2 && aimPoint2.Position) {
    lastPoint = drawLineWithDistance(
      svg,
      lastPoint,
      aimPoint2.Position,
      "",
      transformX,
      transformZ,
      altitudeEffect,
      scale,
      rotation,
      isMetric
    );
    pathData += ` L ${transformX(aimPoint2.Position.x)} ${transformZ(
      aimPoint2.Position.z
    )}`;
  }
  drawLineWithDistance(
    svg,
    lastPoint,
    selectedPin.Position,
    "",
    transformX,
    transformZ,
    altitudeEffect,
    scale,
    rotation,
    isMetric
  );
  pathData += ` L ${transformX(selectedPin.Position.x)} ${transformZ(
    selectedPin.Position.z
  )}`;

  path.setAttribute("d", pathData);
  path.setAttribute("stroke", SVG_COLORS.path.stroke);
  path.setAttribute("stroke-width", SVG_COLORS.path.strokeWidth);
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-dasharray", "8 4");
  path.setAttribute("fill", "none");
  path.setAttribute("id", "golf-hole-path");
  mainGroup.appendChild(path);
}

function drawLineWithDistance(
  svg: SVGSVGElement,
  point1: Position,
  point2: Position,
  label: string,
  transformX: (x: number) => number,
  transformZ: (z: number) => number,
  altitudeEffect: number,
  scale: number,
  rotation: number,
  isMetric: boolean
): Position {
  const dist = distance3D(point1, point2);
  const elevationChange = point2.y - point1.y;
  const playsAsDistance = calculatePlaysAsDistanceByEffect(
    dist,
    elevationChange,
    altitudeEffect
  );

  const x1 = transformX(point1.x);
  const y1 = transformZ(point1.z);
  const x2 = transformX(point2.x);
  const y2 = transformZ(point2.z);

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const rotatedMid = rotatePoint(midX, midY, rotation, 400, 300);

  const distanceValue = isMetric ? dist : convertDistance(dist, "imperial");
  const playsAsValue = isMetric
    ? playsAsDistance
    : convertDistance(playsAsDistance, "imperial");
  const elevationValue = isMetric
    ? elevationChange
    : convertAltitude(elevationChange, "imperial");
  const distUnit = getDistanceUnit(isMetric ? "metric" : "imperial");
  const altUnit = getAltitudeUnit(isMetric ? "metric" : "imperial");

  const elevationText = `${
    elevationValue > 0 ? "+" : ""
  }${elevationValue.toFixed(1)}${altUnit}`;

  // Text shadow/outline for better legibility
  const textShadow = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  textShadow.setAttribute("x", rotatedMid.x.toString());
  textShadow.setAttribute("y", rotatedMid.y.toString());
  textShadow.setAttribute("font-size", Math.max(13, 16 / scale).toString());
  textShadow.setAttribute("font-family", "system-ui, -apple-system, sans-serif");
  textShadow.setAttribute("font-weight", "500");
  textShadow.setAttribute("letter-spacing", "0.025em");
  textShadow.setAttribute("text-anchor", "middle");
  textShadow.setAttribute("dominant-baseline", "middle");
  textShadow.setAttribute("fill", "none");
  textShadow.setAttribute("stroke", "rgba(0,0,0,0.6)");
  textShadow.setAttribute("stroke-width", "3");
  textShadow.setAttribute("stroke-linejoin", "round");

  const tspan1Shadow = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "tspan"
  );
  tspan1Shadow.textContent = `${label}${distanceValue.toFixed(0)}${distUnit} (${elevationText})`;
  tspan1Shadow.setAttribute("x", rotatedMid.x.toString());
  tspan1Shadow.setAttribute("dy", "0em");

  const tspan2Shadow = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "tspan"
  );
  tspan2Shadow.textContent = `Plays as: ${playsAsValue.toFixed(0)}${distUnit}`;
  tspan2Shadow.setAttribute("x", rotatedMid.x.toString());
  tspan2Shadow.setAttribute("dy", "1.3em");

  textShadow.appendChild(tspan1Shadow);
  textShadow.appendChild(tspan2Shadow);
  svg.appendChild(textShadow);

  // Main text
  const tspan1 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "tspan"
  );
  tspan1.textContent = `${label}${distanceValue.toFixed(0)}${distUnit} (${elevationText})`;
  tspan1.setAttribute("x", rotatedMid.x.toString());
  tspan1.setAttribute("dy", "0em");

  const tspan2 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "tspan"
  );
  tspan2.textContent = `Plays as: ${playsAsValue.toFixed(0)}${distUnit}`;
  tspan2.setAttribute("x", rotatedMid.x.toString());
  tspan2.setAttribute("dy", "1.3em");
  tspan2.setAttribute("fill", SVG_COLORS.text.muted);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", rotatedMid.x.toString());
  text.setAttribute("y", rotatedMid.y.toString());
  text.setAttribute("font-size", Math.max(13, 16 / scale).toString());
  text.setAttribute("font-family", "system-ui, -apple-system, sans-serif");
  text.setAttribute("font-weight", "500");
  text.setAttribute("letter-spacing", "0.025em");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.setAttribute("fill", SVG_COLORS.text.primary);
  text.appendChild(tspan1);
  text.appendChild(tspan2);

  svg.appendChild(text);

  return point2;
}

function rotatePoint(
  x: number,
  y: number,
  angle: number,
  cx: number,
  cy: number
): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = x - cx;
  const dy = y - cy;
  const xRot = dx * cos - dy * sin + cx;
  const yRot = dx * sin + dy * cos + cy;
  return { x: xRot, y: yRot };
}

function drawGreenArea(
  svg: SVGElement,
  greenCenterPoint: Tee | null,
  transformX: (x: number) => number,
  transformZ: (z: number) => number
): void {
  if (greenCenterPoint && greenCenterPoint.Position) {
    const greenCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    greenCircle.setAttribute(
      "cx",
      transformX(greenCenterPoint.Position.x).toString()
    );
    greenCircle.setAttribute(
      "cy",
      transformZ(greenCenterPoint.Position.z).toString()
    );
    greenCircle.setAttribute("r", "30");
    greenCircle.setAttribute("fill", SVG_COLORS.green.fill);
    greenCircle.setAttribute("fill-opacity", SVG_COLORS.green.fillOpacity);
    greenCircle.setAttribute("stroke", SVG_COLORS.green.stroke);
    greenCircle.setAttribute("stroke-opacity", SVG_COLORS.green.strokeOpacity);
    greenCircle.setAttribute("stroke-width", "2");
    svg.appendChild(greenCircle);
  }
}

function drawWaterHazards(
  svg: SVGElement,
  hazards: Hazard[],
  transformX: (x: number) => number,
  transformZ: (z: number) => number
): void {
  hazards.forEach((hazard, index) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let pathData = "";

    hazard.coords.forEach((coord, idx) => {
      const x = transformX(coord.x);
      const z = transformZ(coord.z);
      pathData += idx === 0 ? `M ${x} ${z}` : ` L ${x} ${z}`;
    });

    pathData += " Z";
    path.setAttribute("d", pathData);

    // Use different colors based on whether you can play "as it lies"
    // noAIL = true means red stakes (must take relief)
    // noAIL = false means yellow stakes (can play as it lies)
    const colors = hazard.noAIL ? SVG_COLORS.waterRed : SVG_COLORS.waterYellow;
    const hazardType = hazard.noAIL ? "water-red" : "water-yellow";

    path.setAttribute("fill", colors.fill);
    path.setAttribute("fill-opacity", colors.fillOpacity);
    path.setAttribute("stroke", colors.stroke);
    path.setAttribute("stroke-opacity", colors.strokeOpacity);
    path.setAttribute("stroke-width", "2");

    // Add data attributes for interactivity
    path.setAttribute("data-hazard-type", hazardType);
    path.setAttribute("data-hazard-index", index.toString());
    path.setAttribute("class", "hazard-area");
    path.style.cursor = "pointer";
    path.style.transition = "filter 0.15s ease, stroke-width 0.15s ease";

    svg.appendChild(path);
  });
}

function drawInnerOOBHazards(
  svg: SVGElement,
  hazards: Hazard[],
  transformX: (x: number) => number,
  transformZ: (z: number) => number
): void {
  hazards.forEach((hazard, index) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let pathData = "";

    hazard.coords.forEach((coord, idx) => {
      const x = transformX(coord.x);
      const z = transformZ(coord.z);
      pathData += idx === 0 ? `M ${x} ${z}` : ` L ${x} ${z}`;
    });

    pathData += " Z";
    path.setAttribute("d", pathData);
    path.setAttribute("fill", SVG_COLORS.innerOOB.fill);
    path.setAttribute("fill-opacity", SVG_COLORS.innerOOB.fillOpacity);
    path.setAttribute("stroke", SVG_COLORS.innerOOB.stroke);
    path.setAttribute("stroke-opacity", SVG_COLORS.innerOOB.strokeOpacity);
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-dasharray", SVG_COLORS.innerOOB.strokeDasharray);

    // Add data attributes for interactivity
    path.setAttribute("data-hazard-type", "inner-oob");
    path.setAttribute("data-hazard-index", index.toString());
    path.setAttribute("class", "hazard-area");
    path.style.cursor = "pointer";
    path.style.transition = "filter 0.15s ease, stroke-width 0.15s ease";

    svg.appendChild(path);
  });
}

function drawPerimeterOOB(
  svg: SVGElement,
  perimeterOOB: OobDefinition,
  transformX: (x: number) => number,
  transformZ: (z: number) => number
): void {
  if (perimeterOOB.coords.length < 3) return;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  let pathData = "";

  perimeterOOB.coords.forEach((coord, index) => {
    const x = transformX(coord.x);
    const z = transformZ(coord.z);
    pathData += index === 0 ? `M ${x} ${z}` : ` L ${x} ${z}`;
  });

  pathData += " Z";
  path.setAttribute("d", pathData);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", SVG_COLORS.perimeterOOB.stroke);
  path.setAttribute("stroke-opacity", SVG_COLORS.perimeterOOB.strokeOpacity);
  path.setAttribute("stroke-width", "1");
  path.setAttribute("stroke-dasharray", SVG_COLORS.perimeterOOB.strokeDasharray);

  // Add data attributes for interactivity
  path.setAttribute("data-hazard-type", "perimeter-oob");
  path.setAttribute("class", "hazard-area");
  path.style.cursor = "pointer";
  path.style.transition = "filter 0.15s ease, stroke-width 0.15s ease";

  svg.appendChild(path);
}

function drawAimPoint(
  svg: SVGElement,
  position: Position,
  transformX: (x: number) => number,
  transformZ: (z: number) => number
): void {
  const aimPointCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  aimPointCircle.setAttribute("cx", transformX(position.x).toString());
  aimPointCircle.setAttribute("cy", transformZ(position.z).toString());
  aimPointCircle.setAttribute("r", "5");
  aimPointCircle.setAttribute("fill", SVG_COLORS.aimPoint.fill);
  aimPointCircle.setAttribute("stroke", SVG_COLORS.aimPoint.stroke);
  aimPointCircle.setAttribute("stroke-width", "1.5");

  svg.appendChild(aimPointCircle);
}
