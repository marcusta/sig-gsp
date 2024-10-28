import type { Hazard, Pin, Position, Tee } from "@/types";
import { calculatePlaysAsDistanceByEffect, distance3D } from "./course-data";

export function generateSVG(
  selectedTee: Tee,
  selectedPin: Pin,
  aimPoint1: Tee | null,
  aimPoint2: Tee | null,
  greenCenterPoint: Tee | null,
  altitudeEffect: number,
  hazards: Hazard[]
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

  drawWaterHazards(mainGroup, hazards, transformX, transformZ);
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
    rotation
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
  teeCircle.setAttribute("r", "5");
  teeCircle.setAttribute("fill", "#000000");
  svg.appendChild(teeCircle);
}

function drawPin(
  svg: SVGElement,
  selectedPin: Pin,
  transformX: (x: number) => number,
  transformZ: (z: number) => number
): void {
  const pinCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  pinCircle.setAttribute("cx", transformX(selectedPin.Position.x).toString());
  pinCircle.setAttribute("cy", transformZ(selectedPin.Position.z).toString());
  pinCircle.setAttribute("r", "3");
  pinCircle.setAttribute("fill", "#FF0000");
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
  rotation: number
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
      rotation
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
      rotation
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
    rotation
  );
  pathData += ` L ${transformX(selectedPin.Position.x)} ${transformZ(
    selectedPin.Position.z
  )}`;

  path.setAttribute("d", pathData);
  path.setAttribute("stroke", "#000000");
  path.setAttribute("stroke-width", "2");
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
  rotation: number
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

  const elevationText =
    elevationChange > 0
      ? `+${elevationChange.toFixed(1)}m`
      : `${elevationChange.toFixed(1)}m`;

  const tspan1 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "tspan"
  );
  tspan1.textContent = `${label}${dist.toFixed(0)}m (${elevationText})`;
  tspan1.setAttribute("x", rotatedMid.x.toString());
  tspan1.setAttribute("dy", "0em");

  const tspan2 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "tspan"
  );
  tspan2.textContent = `Plays as: ${playsAsDistance.toFixed(0)}m`;
  tspan2.setAttribute("x", rotatedMid.x.toString());
  tspan2.setAttribute("dy", "1.2em");

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", rotatedMid.x.toString());
  text.setAttribute("y", rotatedMid.y.toString());
  text.setAttribute("font-size", Math.max(10, 12 / scale).toString());
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.setAttribute("fill", "#000000");
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
    greenCircle.setAttribute("fill", "#90EE90");
    greenCircle.setAttribute("fill-opacity", "0.5");
    svg.appendChild(greenCircle);
  }
}

function drawWaterHazards(
  svg: SVGElement,
  hazards: Hazard[],
  transformX: (x: number) => number,
  transformZ: (z: number) => number
): void {
  hazards.forEach((hazard) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let pathData = "";

    hazard.coords.forEach((coord, index) => {
      const x = transformX(coord.x);
      const z = transformZ(coord.z);
      pathData += index === 0 ? `M ${x} ${z}` : ` L ${x} ${z}`;
    });

    pathData += " Z";
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "#87CEFA");
    path.setAttribute("fill-opacity", "0.5");
    path.setAttribute("stroke", "#4682B4");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);
  });
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
  aimPointCircle.setAttribute("r", "4");
  aimPointCircle.setAttribute("fill", "#FFA500"); // Orange color for visibility

  svg.appendChild(aimPointCircle);
}
