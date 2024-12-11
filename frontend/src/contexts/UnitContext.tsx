import React, { createContext, useContext, useState } from "react";

export type UnitSystem = "metric" | "imperial";

interface UnitContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
    const stored = localStorage.getItem("unitSystem");
    return (stored as UnitSystem) || "metric";
  });

  const setUnitSystem = (system: UnitSystem) => {
    setUnitSystemState(system);
    localStorage.setItem("unitSystem", system);
  };

  return (
    <UnitContext.Provider value={{ unitSystem, setUnitSystem }}>
      {children}
    </UnitContext.Provider>
  );
};

export function useUnits() {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error("useUnits must be used within a UnitProvider");
  }
  return context;
}

export const convertDistance = (meters: number, unitSystem: UnitSystem) => {
  return unitSystem === "metric" ? meters : Math.round(meters * 1.09361);
};

export const convertAltitude = (meters: number, unitSystem: UnitSystem) => {
  return unitSystem === "metric" ? meters : Math.round(meters * 3.28084);
};

export const getDistanceUnit = (unitSystem: UnitSystem) => {
  return unitSystem === "metric" ? "m" : "yd";
};

export const getAltitudeUnit = (unitSystem: UnitSystem) => {
  return unitSystem === "metric" ? "m" : "ft";
};
