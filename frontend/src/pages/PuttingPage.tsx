import { useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Target } from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import {
  getDistanceForSpeed,
  getSpeedForDistance,
  getAvailableStimps,
} from "@/lib/putting";
import { useUnits } from "@/contexts/UnitContext";
import { useCalculator } from "@/contexts/CalculatorContext";
import { fetchCourseById } from "@/api/useApi";

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
  disabled?: boolean;
}

function MobileSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  formatValue,
  className,
  disabled,
}: MobileSliderProps) {
  return (
    <div className={cn("space-y-2", disabled && "opacity-50", className)}>
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
        disabled={disabled}
        className="relative flex w-full select-none items-center py-4"
        style={{ touchAction: "none" }}
      >
        {/* Larger invisible touch target behind the track */}
        <div className="absolute inset-x-0 h-12 -top-4" />
        <SliderPrimitive.Track className="relative h-4 w-full grow overflow-hidden rounded-full bg-slate-700/50 cursor-pointer">
          <SliderPrimitive.Range className="absolute h-full bg-emerald-700/70" />
        </SliderPrimitive.Track>
        {/* Larger thumb with pseudo-element for extended touch area */}
        <SliderPrimitive.Thumb className="block h-10 w-10 rounded-full border-2 border-emerald-600 bg-slate-800 shadow-lg ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 before:absolute before:inset-[-12px] before:content-['']" />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-xs text-amber-100/40">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  );
}

export default function PuttingPage() {
  const { unitSystem } = useUnits();
  const { currentCourse, setCurrentCourse, putting, updatePutting } = useCalculator();
  const [searchParams, setSearchParams] = useSearchParams();
  const stimpValues = getAvailableStimps();

  const { stimp, mode, speed, distance, slopeCm } = putting;

  // Restore course context from URL param if missing
  useEffect(() => {
    const courseIdParam = searchParams.get("course");
    if (!currentCourse && courseIdParam) {
      const courseId = parseInt(courseIdParam, 10);
      if (!isNaN(courseId)) {
        fetchCourseById(courseId).then((course) => {
          setCurrentCourse({
            courseId: course.id,
            courseName: course.name,
            altitude: course.altitude,
          });
        }).catch(() => {
          // Course not found, ignore
        });
      }
    }
  }, [currentCourse, searchParams, setCurrentCourse]);

  // Restore stimp from URL param on mount
  useEffect(() => {
    const stimpParam = searchParams.get("stimp");
    if (stimpParam) {
      const stimpValue = parseInt(stimpParam, 10);
      if (stimpValues.includes(stimpValue) && stimpValue !== stimp) {
        updatePutting({ stimp: stimpValue });
      }
    }
  }, []); // Only run on mount

  // Update URL when stimp changes
  const handleStimpChange = (newStimp: number) => {
    updatePutting({ stimp: newStimp });
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("stimp", newStimp.toString());
      return newParams;
    }, { replace: true });
  };

  // Build URL params for navigation links
  const buildLinkParams = () => {
    const params = new URLSearchParams();
    if (currentCourse) params.set("course", currentCourse.courseId.toString());
    params.set("stimp", stimp.toString());
    const paramString = params.toString();
    return paramString ? `?${paramString}` : "";
  };

  // Distance range in meters: 1.5 to 30
  // Speed range: 2 to 20 mph
  const distanceMin = 1.5;
  const distanceMax = 30;
  const speedMin = 2;
  const speedMax = 20;

  // Overshoot distance in meters based on stimp (how far past the hole the ball should roll)
  const getOvershoot = (stimpValue: number): number => {
    if (stimpValue <= 11) return 0.3;
    return 0.2; // stimp 12 and 13
  };

  // Slope adjustment: 1 meter per 8 cm of height difference
  // Uphill (+) = putt plays longer, downhill (-) = putt plays shorter
  const getSlopeAdjustment = (slope: number): number => slope / 8;

  const calculate = useCallback(() => {
    if (mode === "speedToDistance" && speed) {
      let result = getDistanceForSpeed(Number(speed), stimp);
      // Apply slope adjustment (subtract for uphill since speed gives shorter effective distance)
      result = result - getSlopeAdjustment(slopeCm);
      if (unitSystem === "imperial") {
        result = result * 3.28084;
      }
      updatePutting({ distance: Math.max(0, result).toFixed(1) });
    } else if (mode === "distanceToSpeed" && distance) {
      const distanceInMeters =
        unitSystem === "imperial"
          ? Number(distance) / 3.28084
          : Number(distance);
      // Add slope adjustment (uphill needs more speed, so effective distance is longer)
      const effectiveDistance = distanceInMeters + getSlopeAdjustment(slopeCm);
      // Add overshoot to ensure ball passes the hole
      const targetDistance = effectiveDistance + getOvershoot(stimp);
      const result = getSpeedForDistance(targetDistance, stimp);
      updatePutting({ speed: result.toFixed(1) });
    }
  }, [mode, speed, distance, stimp, slopeCm, unitSystem, updatePutting]);

  // Auto-calculate when inputs change
  useEffect(() => {
    const inputValue = mode === "speedToDistance" ? speed : distance;
    if (inputValue && !isNaN(Number(inputValue))) {
      calculate();
    }
  }, [speed, distance, stimp, slopeCm, mode, calculate]);

  const handleClear = () => {
    updatePutting({ speed: "", distance: "", slopeCm: 0 });
  };

  const handleModeChange = (checked: boolean) => {
    updatePutting({
      mode: checked ? "speedToDistance" : "distanceToSpeed",
      speed: "",
      distance: "",
    });
  };

  const distanceUnit = unitSystem === "imperial" ? "ft" : "m";

  // Convert distance range if imperial
  const displayDistanceMin = unitSystem === "imperial" ? distanceMin * 3.28084 : distanceMin;
  const displayDistanceMax = unitSystem === "imperial" ? distanceMax * 3.28084 : distanceMax;

  // Parse current values for sliders
  const speedValue = parseFloat(speed) || speedMin;
  const distanceValue = parseFloat(distance) || displayDistanceMin;

  return (
    <div className="min-h-screen p-4 flex flex-col items-center pt-4">
      {/* Navigation Header */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-amber-100/70 hover:text-amber-50 hover:bg-emerald-900/30 -ml-2 h-8 px-2"
        >
          {currentCourse ? (
            <Link
              to={`/course/${currentCourse.courseId}?stimp=${stimp}`}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">{currentCourse.courseName}</span>
            </Link>
          ) : (
            <Link to="/courses" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Courses</span>
            </Link>
          )}
        </Button>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-amber-100/70 hover:text-amber-50 hover:bg-emerald-900/30 h-8 px-2"
        >
          <Link to={`/suggester${buildLinkParams()}`} className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span className="text-sm">Shot Suggester</span>
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
              Putting Calculator
            </h1>
            <p className="text-xs tracking-wider uppercase text-amber-200/50 mt-1">
              Speed and Distance Reference
            </p>
          </div>

          {/* Stimp Selection */}
          <div className="space-y-2">
            <Label className="text-amber-100/80 text-sm">Green Speed (Stimp)</Label>
            <div className="flex gap-2">
              {stimpValues.map((stimpValue) => (
                <Button
                  key={stimpValue}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStimpChange(stimpValue)}
                  className={`flex-1 h-12 text-base transition-all ${
                    stimp === stimpValue
                      ? "bg-emerald-800/70 text-amber-50 border-emerald-700/50 hover:bg-emerald-800/80"
                      : "bg-slate-800/40 text-amber-100/70 border-amber-900/30 hover:bg-slate-700/50 hover:text-amber-50"
                  }`}
                >
                  {stimpValue}
                </Button>
              ))}
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-amber-900/20">
            <div className="flex items-center gap-3">
              <Switch
                id="mode-toggle"
                checked={mode === "speedToDistance"}
                onCheckedChange={handleModeChange}
                className="data-[state=checked]:bg-emerald-700"
              />
              <Label
                htmlFor="mode-toggle"
                className="text-amber-100/70 text-sm cursor-pointer"
              >
                {mode === "distanceToSpeed"
                  ? "Distance → Speed"
                  : "Speed → Distance"}
              </Label>
            </div>
          </div>

          {/* Input Slider - changes based on mode */}
          {mode === "distanceToSpeed" ? (
            <div className="space-y-2">
              <Label className="text-amber-100/80 text-sm">
                Putt Distance ({distanceUnit})
              </Label>
              <MobileSlider
                value={distanceValue}
                onChange={(v) => updatePutting({ distance: v.toFixed(1) })}
                min={displayDistanceMin}
                max={displayDistanceMax}
                step={0.2}
                formatValue={(v) => `${v.toFixed(1)} ${distanceUnit}`}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-amber-100/80 text-sm">
                Ball Speed (mph)
              </Label>
              <MobileSlider
                value={speedValue}
                onChange={(v) => updatePutting({ speed: v.toFixed(1) })}
                min={speedMin}
                max={speedMax}
                step={0.2}
                formatValue={(v) => `${v.toFixed(1)} mph`}
              />
            </div>
          )}

          {/* Slope Adjustment */}
          <div className="space-y-2">
            <Label className="text-amber-100/80 text-sm">
              Slope ({(slopeCm ?? 0) > 0 ? "uphill" : (slopeCm ?? 0) < 0 ? "downhill" : "flat"})
            </Label>
            <MobileSlider
              value={slopeCm ?? 0}
              onChange={(v) => updatePutting({ slopeCm: v })}
              min={-150}
              max={150}
              step={2}
              formatValue={(v) => {
                if (v === 0) return "0 cm (flat)";
                const sign = v > 0 ? "+" : "";
                const adjustment = Math.abs(v / 8).toFixed(1);
                return `${sign}${v} cm (${v > 0 ? "+" : "-"}${adjustment}m)`;
              }}
            />
          </div>

          {/* Result Display */}
          {((mode === "speedToDistance" && speed && distance) ||
            (mode === "distanceToSpeed" && distance && speed)) && (
            <div className="p-5 rounded-lg bg-emerald-900/30 border border-emerald-800/40">
              <div className="text-center">
                <p className="text-amber-100/60 text-xs uppercase tracking-wider mb-1">
                  {mode === "distanceToSpeed" ? "Required Speed" : "Putt Distance"}
                </p>
                <p className="text-3xl font-semibold text-amber-50">
                  {mode === "distanceToSpeed"
                    ? `${parseFloat(speed).toFixed(1)} mph`
                    : `${parseFloat(distance).toFixed(1)} ${distanceUnit}`}
                </p>
              </div>
            </div>
          )}

          {/* Clear Button */}
          <Button
            onClick={handleClear}
            variant="outline"
            className="w-full h-11 bg-slate-800/40 text-amber-100/80 border-amber-900/30 hover:bg-slate-700/50 hover:text-amber-50"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
