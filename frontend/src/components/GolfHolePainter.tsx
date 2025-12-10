import React, { useEffect, useRef, useState, useCallback } from "react";
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

// Hazard type information for tooltips
const HAZARD_INFO: Record<
  string,
  { title: string; description: string; color: string; icon: string }
> = {
  "water-yellow": {
    title: "Yellow Stakes",
    description: "Water hazard - can play as it lies",
    color: "#ca8a04",
    icon: "🟡",
  },
  "water-red": {
    title: "Red Stakes",
    description: "Lateral water - must take relief",
    color: "#dc2626",
    icon: "🔴",
  },
  "inner-oob": {
    title: "Out of Bounds",
    description: "Internal OOB - stroke & distance",
    color: "#f5f5f4",
    icon: "⚪",
  },
  "perimeter-oob": {
    title: "Course Boundary",
    description: "Out of bounds - stroke & distance",
    color: "#a8a29e",
    icon: "◻️",
  },
};

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { unitSystem } = useUnits();

  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    type: string;
  }>({ visible: false, x: 0, y: 0, type: "" });

  const [activeElement, setActiveElement] = useState<SVGElement | null>(null);

  // Highlight a hazard element
  const highlightElement = useCallback((element: SVGElement) => {
    element.style.filter = "brightness(1.4) drop-shadow(0 0 6px rgba(255,255,255,0.5))";
    element.style.strokeWidth = "4";
  }, []);

  // Remove highlight from element
  const unhighlightElement = useCallback((element: SVGElement) => {
    element.style.filter = "";
    element.style.strokeWidth = "2";
    // Perimeter OOB has thinner stroke
    if (element.getAttribute("data-hazard-type") === "perimeter-oob") {
      element.style.strokeWidth = "1";
    }
  }, []);

  // Handle mouse enter on hazard
  const handleHazardEnter = useCallback(
    (e: MouseEvent) => {
      const target = e.target as SVGElement;
      const hazardType = target.getAttribute("data-hazard-type");
      if (!hazardType || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        type: hazardType,
      });

      if (activeElement && activeElement !== target) {
        unhighlightElement(activeElement);
      }
      highlightElement(target);
      setActiveElement(target);
    },
    [activeElement, highlightElement, unhighlightElement]
  );

  // Handle mouse leave on hazard
  const handleHazardLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
    if (activeElement) {
      unhighlightElement(activeElement);
      setActiveElement(null);
    }
  }, [activeElement, unhighlightElement]);

  // Handle touch on hazard (mobile)
  const handleHazardTouch = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      const target = e.target as SVGElement;
      const hazardType = target.getAttribute("data-hazard-type");
      if (!hazardType || !containerRef.current) return;

      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();

      // Toggle tooltip on tap
      if (activeElement === target && tooltip.visible) {
        setTooltip((prev) => ({ ...prev, visible: false }));
        unhighlightElement(target);
        setActiveElement(null);
      } else {
        if (activeElement && activeElement !== target) {
          unhighlightElement(activeElement);
        }
        setTooltip({
          visible: true,
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
          type: hazardType,
        });
        highlightElement(target);
        setActiveElement(target);
      }
    },
    [activeElement, tooltip.visible, highlightElement, unhighlightElement]
  );

  // Close tooltip when tapping elsewhere
  const handleContainerClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains("hazard-area") && tooltip.visible) {
        setTooltip((prev) => ({ ...prev, visible: false }));
        if (activeElement) {
          unhighlightElement(activeElement);
          setActiveElement(null);
        }
      }
    },
    [tooltip.visible, activeElement, unhighlightElement]
  );

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
    const perimeterOOB = courseData.pOOB || null;

    if (svgRef.current !== null && selectedTee && selectedPin) {
      const svgElement = generateSVG(
        selectedTee,
        selectedPin,
        aimPoint1,
        aimPoint2,
        greenCenterPoint,
        altitudeEffect,
        hazards,
        perimeterOOB,
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

  // Attach event listeners to hazard elements after SVG is rendered
  useEffect(() => {
    if (!svgRef.current) return;

    const hazardElements = svgRef.current.querySelectorAll(".hazard-area");
    const handlers: Array<{
      el: Element;
      type: string;
      handler: EventListener;
    }> = [];

    hazardElements.forEach((el) => {
      // Desktop hover
      el.addEventListener("mouseenter", handleHazardEnter as EventListener);
      el.addEventListener("mouseleave", handleHazardLeave as EventListener);
      // Mobile touch
      el.addEventListener("touchstart", handleHazardTouch as EventListener, {
        passive: false,
      });

      handlers.push(
        { el, type: "mouseenter", handler: handleHazardEnter as EventListener },
        { el, type: "mouseleave", handler: handleHazardLeave as EventListener },
        { el, type: "touchstart", handler: handleHazardTouch as EventListener }
      );
    });

    // Cleanup
    return () => {
      handlers.forEach(({ el, type, handler }) => {
        el.removeEventListener(type, handler);
      });
    };
  }, [
    courseData,
    selectedHoleNumber,
    handleHazardEnter,
    handleHazardLeave,
    handleHazardTouch,
  ]);

  // Get tooltip info
  const tooltipInfo = HAZARD_INFO[tooltip.type];

  return (
    <div
      ref={containerRef}
      className="rounded-b-lg lg:rounded-lg p-2 sm:p-4 overflow-hidden w-full h-[calc(100vh-220px)] min-h-[350px] max-h-[500px] lg:h-[600px] lg:max-h-none relative border border-amber-900/20"
      style={{
        background: `
          radial-gradient(ellipse 120% 100% at 20% 10%, hsla(50, 85%, 70%, 0.08) 0%, hsla(50, 85%, 70%, 0) 45%),
          radial-gradient(circle at 80% 90%, hsla(155, 40%, 18%, 0.15) 0%, hsla(155, 40%, 12%, 0) 60%),
          linear-gradient(145deg, hsl(150, 35%, 8%) 0%, hsl(152, 33%, 10%) 35%, hsl(149, 28%, 7%) 70%, hsl(152, 30%, 9%) 100%)
        `,
      }}
      onClick={handleContainerClick}
      onTouchEnd={handleContainerClick}
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

      {/* Hazard tooltip */}
      {tooltip.visible && tooltipInfo && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%) translateY(-12px)",
          }}
        >
          <div
            className="px-3 py-2 rounded-lg shadow-xl border border-amber-900/30 backdrop-blur-sm min-w-[160px]"
            style={{
              background: `
                linear-gradient(145deg,
                  hsla(150, 30%, 12%, 0.95) 0%,
                  hsla(152, 28%, 10%, 0.95) 100%
                )
              `,
            }}
          >
            {/* Colored indicator bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
              style={{ backgroundColor: tooltipInfo.color }}
            />
            {/* Content */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base">{tooltipInfo.icon}</span>
              <div>
                <div
                  className="text-sm font-semibold tracking-wide"
                  style={{ color: tooltipInfo.color }}
                >
                  {tooltipInfo.title}
                </div>
                <div className="text-xs text-amber-100/70">
                  {tooltipInfo.description}
                </div>
              </div>
            </div>
          </div>
          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid hsla(150, 30%, 12%, 0.95)",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default GolfHolePainter;
