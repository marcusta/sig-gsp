import React, { useEffect, useRef } from "react";
import type { CourseData } from "@/types";
import { generateSVG } from "./svg-generator";
import {
  calculateAltitudeEffect,
  getAimOrGreenPoint,
  getHazards,
  getPin,
  getTee,
} from "./course-data";
import { useUnits } from "@/contexts/UnitContext";

interface GolfCourseProps {
  courseData: CourseData;
  selectedHoleNumber: number;
  selectedTeeType: string;
  selectedPinDay: string;
}

const GolfHolePainter: React.FC<GolfCourseProps> = ({
  courseData,
  selectedHoleNumber,
  selectedTeeType,
  selectedPinDay,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { unitSystem } = useUnits();

  useEffect(() => {
    if (!courseData) return;
    const selectedTee = getTee(courseData, selectedHoleNumber, selectedTeeType);
    const selectedPin = getPin(courseData, selectedHoleNumber, selectedPinDay);
    const aimPoint1 = getAimOrGreenPoint(
      courseData,
      selectedHoleNumber,
      "AimPoint1"
    );
    const aimPoint2 = getAimOrGreenPoint(
      courseData,
      selectedHoleNumber,
      "AimPoint2"
    );
    const greenCenterPoint = getAimOrGreenPoint(
      courseData,
      selectedHoleNumber,
      "GreenCenterPoint"
    );
    const altitudeEffect = calculateAltitudeEffect(courseData);
    const hazards = getHazards(courseData, selectedHoleNumber);

    if (svgRef.current !== null && selectedTee && selectedPin) {
      const svgElement = generateSVG(
        selectedTee,
        selectedPin,
        aimPoint1,
        aimPoint2,
        greenCenterPoint,
        altitudeEffect,
        hazards,
        unitSystem === "metric"
      );

      // Clear existing content
      while (svgRef.current.firstChild) {
        svgRef.current.removeChild(svgRef.current.firstChild);
      }

      // Append new content
      while (svgElement.firstChild) {
        svgRef.current.appendChild(svgElement.firstChild);
      }

      // Copy attributes
      Array.from(svgElement.attributes).forEach((attr) => {
        svgRef.current!.setAttribute(attr.name, attr.value);
      });
    }
  }, [
    courseData,
    selectedHoleNumber,
    selectedTeeType,
    selectedPinDay,
    unitSystem,
  ]);

  return (
    <div
      className="rounded-b-lg lg:rounded-lg p-2 sm:p-4 overflow-hidden w-full h-[calc(100vh-220px)] min-h-[350px] max-h-[500px] lg:h-[600px] lg:max-h-none relative border border-amber-900/20"
      style={{
        background: `
          radial-gradient(ellipse 120% 100% at 20% 10%, hsla(50, 85%, 70%, 0.08) 0%, hsla(50, 85%, 70%, 0) 45%),
          radial-gradient(circle at 80% 90%, hsla(155, 40%, 18%, 0.15) 0%, hsla(155, 40%, 12%, 0) 60%),
          linear-gradient(145deg, hsl(150, 35%, 8%) 0%, hsl(152, 33%, 10%) 35%, hsl(149, 28%, 7%) 70%, hsl(152, 30%, 9%) 100%)
        `,
      }}
    >
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 rounded-b-lg lg:rounded-lg pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Vignette effect */}
      <div
        className="absolute inset-0 rounded-b-lg lg:rounded-lg pointer-events-none"
        style={{ boxShadow: "inset 0 0 100px 30px rgba(0,0,0,0.4)" }}
      />
      <svg ref={svgRef} className="relative z-10 w-full h-full" />
    </div>
  );
};

export default GolfHolePainter;
