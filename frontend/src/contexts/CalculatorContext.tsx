import React, { createContext, useContext, useState, useCallback } from "react";

interface CourseInfo {
  courseId: number;
  courseName: string;
  altitude: number; // in feet
}

interface PuttingState {
  stimp: number;
  mode: "speedToDistance" | "distanceToSpeed";
  speed: string;
  distance: string;
}

interface SuggesterState {
  targetCarry: string;
  material: string;
  upDownSlope: string;
  rightLeftSlope: string;
  altitude: string;
  elevationDiff: string;
  windSpeed: string;
  windDirection: string;
}

interface CalculatorContextType {
  // Current course context (for navigation back)
  currentCourse: CourseInfo | null;
  setCurrentCourse: (course: CourseInfo | null) => void;

  // Putting calculator state
  putting: PuttingState;
  updatePutting: (updates: Partial<PuttingState>) => void;

  // Shot suggester state
  suggester: SuggesterState;
  updateSuggester: (updates: Partial<SuggesterState>) => void;

  // Helper to set altitude from course
  setAltitudeFromCourse: (altitude: number) => void;
}

const defaultPuttingState: PuttingState = {
  stimp: 11,
  mode: "distanceToSpeed",
  speed: "",
  distance: "",
};

const defaultSuggesterState: SuggesterState = {
  targetCarry: "",
  material: "fairway",
  upDownSlope: "0",
  rightLeftSlope: "0",
  altitude: "0",
  elevationDiff: "0",
  windSpeed: "0",
  windDirection: "0",
};

const CalculatorContext = createContext<CalculatorContextType | undefined>(
  undefined
);

export function CalculatorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentCourse, setCurrentCourse] = useState<CourseInfo | null>(null);
  const [putting, setPutting] = useState<PuttingState>(defaultPuttingState);
  const [suggester, setSuggester] = useState<SuggesterState>(
    defaultSuggesterState
  );

  const updatePutting = useCallback((updates: Partial<PuttingState>) => {
    setPutting((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateSuggester = useCallback((updates: Partial<SuggesterState>) => {
    setSuggester((prev) => ({ ...prev, ...updates }));
  }, []);

  const setAltitudeFromCourse = useCallback((altitude: number) => {
    setSuggester((prev) => ({ ...prev, altitude: Math.round(altitude).toString() }));
  }, []);

  return (
    <CalculatorContext.Provider
      value={{
        currentCourse,
        setCurrentCourse,
        putting,
        updatePutting,
        suggester,
        updateSuggester,
        setAltitudeFromCourse,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error("useCalculator must be used within a CalculatorProvider");
  }
  return context;
}
