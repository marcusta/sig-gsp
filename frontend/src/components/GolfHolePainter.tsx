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
      className={`
        bg-slate-800/50 
        rounded-lg 
        p-4 
        overflow-hidden 
        w-full 
        h-[400px] 
        lg:h-[600px] 
        relative
      `}
    >
      <svg ref={svgRef} className="text-slate-200 w-full h-full" />
    </div>
  );
};

export default GolfHolePainter;
