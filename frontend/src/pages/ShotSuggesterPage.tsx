import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { useUnits } from "@/contexts/UnitContext";
import { useCalculator } from "@/contexts/CalculatorContext";
import { getMaterials, calculateShot } from "@/api/shotApi";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

// Masters-style container background
const mastersBackground = `
  radial-gradient(
    ellipse 120% 100% at 20% 10%,
    hsla(50, 85%, 70%, 0.12) 0%,
    hsla(50, 85%, 70%, 0) 45%
  ),
  radial-gradient(
    circle at 80% 90%,
    hsla(155, 40%, 18%, 0.20) 0%,
    hsla(155, 40%, 12%, 0) 60%
  ),
  linear-gradient(
    145deg,
    hsl(150, 35%, 10%) 0%,
    hsl(152, 33%, 12%) 35%,
    hsl(149, 28%, 9%) 70%,
    hsl(152, 30%, 11%) 100%
  )
`;

const filmGrainStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
};

// Mobile-friendly slider with larger touch target
interface MobileSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

function MobileSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue,
  className,
}: MobileSliderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-center">
        <span className="text-2xl font-semibold text-amber-50">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <SliderPrimitive.Root
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="relative flex w-full select-none items-center py-2"
        style={{ touchAction: "pan-y" }}
      >
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-slate-700/50">
          <SliderPrimitive.Range className="absolute h-full bg-emerald-700/70" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-8 w-8 rounded-full border-2 border-emerald-600 bg-slate-800 shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-xs text-amber-100/40">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  );
}

const materials = getMaterials();

export default function ShotSuggesterPage() {
  const { unitSystem } = useUnits();
  const { currentCourse, suggester, updateSuggester } = useCalculator();

  const {
    targetCarry,
    material,
    rightLeftSlope,
    altitude,
    elevationDiff,
  } = suggester;

  const [showAdvanced, setShowAdvanced] = useState(false);

  const distanceUnit = unitSystem === "imperial" ? "yd" : "m";

  // Slider ranges
  const carryMin = 10;
  const carryMax = 270;
  const elevMin = unitSystem === "imperial" ? -50 : -20;
  const elevMax = unitSystem === "imperial" ? 50 : 20;

  // Parse values for sliders
  const carryValue = parseFloat(targetCarry) || carryMin;
  const altitudeValue = parseFloat(altitude) || 0;
  const rightLeftValue = parseFloat(rightLeftSlope) || 0;
  const elevValue = parseFloat(elevationDiff) || 0;

  // Calculate result in real-time
  const result = useMemo(() => {
    const carryNum = parseFloat(targetCarry);
    if (!carryNum || carryNum < carryMin) return null;

    // Convert to meters for calculation
    const targetMeters = unitSystem === "imperial" ? carryNum / 1.09361 : carryNum;
    const elevationMeters =
      unitSystem === "imperial"
        ? parseFloat(elevationDiff || "0") / 1.09361
        : parseFloat(elevationDiff || "0");

    const shotResult = calculateShot(
      targetMeters,
      material,
      parseFloat(rightLeftSlope) || 0,
      elevationMeters,
      parseFloat(altitude) || 0
    );

    // Convert back to display units
    const playsAs = unitSystem === "imperial"
      ? shotResult.playsAs * 1.09361
      : shotResult.playsAs;
    const aimAmount = unitSystem === "imperial"
      ? Math.abs(shotResult.offlineAimAdjustment) * 1.09361
      : Math.abs(shotResult.offlineAimAdjustment);

    return {
      playsAs,
      aimAdjust:
        shotResult.offlineAimAdjustment !== 0
          ? {
              direction: shotResult.offlineAimAdjustment < 0 ? "left" : "right",
              amount: aimAmount,
            }
          : undefined,
    };
  }, [targetCarry, material, rightLeftSlope, elevationDiff, altitude, unitSystem]);

  // Set altitude from course if available and not already set
  useMemo(() => {
    if (currentCourse && currentCourse.altitude > 0 && altitude === "0") {
      updateSuggester({ altitude: Math.round(currentCourse.altitude).toString() });
    }
  }, [currentCourse]);

  const handleClear = () => {
    updateSuggester({
      targetCarry: carryMin.toString(),
      rightLeftSlope: "0",
      elevationDiff: "0",
    });
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center pt-4">
      {/* Navigation Header */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        {currentCourse ? (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-amber-100/70 hover:text-amber-50 hover:bg-emerald-900/30 -ml-2 h-8 px-2"
          >
            <Link
              to={`/course/${currentCourse.courseId}`}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">{currentCourse.courseName}</span>
            </Link>
          </Button>
        ) : (
          <div />
        )}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-amber-100/70 hover:text-amber-50 hover:bg-emerald-900/30 h-8 px-2"
        >
          <Link to="/putting" className="flex items-center gap-1">
            <Circle className="h-4 w-4" />
            <span className="text-sm">Putting</span>
          </Link>
        </Button>
      </div>

      <div
        className="w-full max-w-md rounded-xl p-5 relative shadow-2xl border border-slate-600/30"
        style={{ background: mastersBackground }}
      >
        {/* Film grain overlay */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none opacity-[0.035] mix-blend-overlay"
          style={filmGrainStyle}
        />
        {/* Vignette effect */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: "inset 0 0 80px 20px rgba(0,0,0,0.3)" }}
        />

        {/* Content */}
        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-xl font-semibold tracking-wide text-amber-50">
              Shot Suggester
            </h1>
            {currentCourse && (
              <p className="text-xs tracking-wider uppercase text-amber-200/50 mt-1">
                {currentCourse.courseName}
              </p>
            )}
          </div>

          {/* Target Carry */}
          <div className="space-y-2">
            <Label className="text-amber-100/80 text-sm">
              Target Carry
            </Label>
            <MobileSlider
              value={carryValue}
              onChange={(v) => updateSuggester({ targetCarry: v.toString() })}
              min={carryMin}
              max={carryMax}
              step={1}
              formatValue={(v) => `${v} ${distanceUnit}`}
            />
          </div>

          {/* Material */}
          <div className="space-y-2">
            <Label className="text-amber-100/80 text-sm">Lie / Material</Label>
            <Select
              value={material}
              onValueChange={(v) => updateSuggester({ material: v })}
            >
              <SelectTrigger className="h-12 bg-slate-800/40 border-amber-900/30 text-amber-50 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-amber-900/30">
                {materials.map((mat) => (
                  <SelectItem
                    key={mat.name}
                    value={mat.name}
                    className="text-amber-100/90 focus:bg-slate-700 focus:text-amber-50 text-base py-3"
                  >
                    {mat.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Side Slope - visible by default */}
          <div className="space-y-2">
            <Label className="text-amber-100/80 text-sm">
              Side Slope (+ = ball above feet)
            </Label>
            <MobileSlider
              value={rightLeftValue}
              onChange={(v) => updateSuggester({ rightLeftSlope: v.toString() })}
              min={-20}
              max={20}
              step={0.5}
              formatValue={(v) => `${v > 0 ? "+" : ""}${v}°`}
            />
          </div>

          {/* Result Display - Always visible */}
          {result && (
            <div className="p-5 rounded-lg bg-emerald-900/30 border border-emerald-800/40 space-y-3">
              <div className="text-center">
                <p className="text-amber-100/60 text-xs uppercase tracking-wider mb-1">
                  Plays as
                </p>
                <p className="text-3xl font-semibold text-amber-50">
                  {result.playsAs.toFixed(0)} {distanceUnit}
                </p>
              </div>
              {result.aimAdjust && result.aimAdjust.amount >= 0.5 && (
                <div className="text-center pt-3 border-t border-emerald-800/30">
                  <p className="text-amber-100/60 text-xs uppercase tracking-wider mb-1">
                    Aim adjustment
                  </p>
                  <p className="text-xl text-amber-50">
                    {result.aimAdjust.amount.toFixed(1)} {distanceUnit}{" "}
                    {result.aimAdjust.direction}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Advanced Section Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/30 border border-amber-900/20 text-amber-100/60 hover:text-amber-100/80 transition-colors"
          >
            <span className="text-sm">Advanced (altitude & elevation)</span>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-6 pt-2">
              {/* Altitude */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-amber-100/80 text-sm">Altitude (ft)</Label>
                  {currentCourse && currentCourse.altitude > 0 && (
                    <span className="text-xs text-emerald-400/70">
                      Course: {Math.round(currentCourse.altitude)} ft
                    </span>
                  )}
                </div>
                <MobileSlider
                  value={altitudeValue}
                  onChange={(v) => updateSuggester({ altitude: v.toString() })}
                  min={0}
                  max={5000}
                  step={100}
                  formatValue={(v) => `${v} ft`}
                />
              </div>

              {/* Elevation Diff */}
              <div className="space-y-2">
                <Label className="text-amber-100/80 text-sm">
                  Elevation to target (+ = uphill)
                </Label>
                <MobileSlider
                  value={elevValue}
                  onChange={(v) => updateSuggester({ elevationDiff: v.toString() })}
                  min={elevMin}
                  max={elevMax}
                  step={1}
                  formatValue={(v) => `${v > 0 ? "+" : ""}${v} ${distanceUnit}`}
                />
              </div>
            </div>
          )}

          {/* Clear Button */}
          <Button
            onClick={handleClear}
            variant="outline"
            className="w-full h-11 bg-slate-800/40 text-amber-100/70 border-amber-900/30 hover:bg-slate-700/50 hover:text-amber-50"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
