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
        hazards
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
  }, [courseData, selectedHoleNumber, selectedTeeType, selectedPinDay]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        top: "-50px",
      }}
    >
      <svg ref={svgRef} />
    </div>
  );
};

export default GolfHolePainter;
