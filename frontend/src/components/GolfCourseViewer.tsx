import React, { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GolfHolePainter from "./GolfHolePainter";
import { CourseWithData } from "@/types";
import {
  calculateElevationChange,
  calculatePlaysAsDistance,
  distance3D,
  getAltitude,
  getAltitudeInMeters,
  getHole,
  getPin,
  getTee,
} from "./course-data";
import {
  useUnits,
  convertDistance,
  convertAltitude,
  getDistanceUnit,
  getAltitudeUnit,
} from "@/contexts/UnitContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Info } from "lucide-react";

const GolfCourseViewer: React.FC<{
  course: CourseWithData;
  onShowScoreCard: () => void;
}> = ({ course, onShowScoreCard }) => {
  const { unitSystem } = useUnits();
  const longestTee = course.teeBoxes.sort((a, b) => b.length - a.length)[0];
  const courseData = course.gkData;
  const [currentHoleNumber, setCurrentHoleNumber] = useState(1);
  const [selectedTeeType, setSelectedTeeType] = useState<string>(
    longestTee.name
  );
  const [selectedPinDay, setSelectedPinDay] = useState<string>("Friday");
  const [showMetadata, setShowMetadata] = useState(false);
  const [showMobileHoleInfo, setShowMobileHoleInfo] = useState(false);

  // Swipe handling refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const isMultiTouch = useRef<boolean>(false);
  const minSwipeDistance = 80; // Increased from 50
  const maxSwipeTime = 300; // Must complete within 300ms
  const maxVerticalRatio = 0.5; // Vertical movement must be less than 50% of horizontal

  const enabledHoles = courseData.Holes.filter((hole) => hole.Enabled);
  const totalHoles = enabledHoles.length;
  const front9 = enabledHoles.filter((h) => h.HoleNumber <= 9);
  const back9 = enabledHoles.filter((h) => h.HoleNumber > 9);

  const courseAltitude = getAltitudeInMeters(courseData);
  const currentHole = getHole(courseData, currentHoleNumber);
  const holePar = currentHole.Par;
  const holeIndex = currentHole.Index;
  const currentPin = getPin(courseData, currentHoleNumber, selectedPinDay);
  const currentTee = getTee(courseData, currentHoleNumber, selectedTeeType);

  // Navigation functions
  const goToPrevHole = useCallback(() => {
    setCurrentHoleNumber((prev) => {
      const currentIndex = enabledHoles.findIndex((h) => h.HoleNumber === prev);
      if (currentIndex > 0) {
        return enabledHoles[currentIndex - 1].HoleNumber;
      }
      return enabledHoles[enabledHoles.length - 1].HoleNumber; // Wrap to last
    });
  }, [enabledHoles]);

  const goToNextHole = useCallback(() => {
    setCurrentHoleNumber((prev) => {
      const currentIndex = enabledHoles.findIndex((h) => h.HoleNumber === prev);
      if (currentIndex < enabledHoles.length - 1) {
        return enabledHoles[currentIndex + 1].HoleNumber;
      }
      return enabledHoles[0].HoleNumber; // Wrap to first
    });
  }, [enabledHoles]);

  // Swipe handlers - only trigger on fast, horizontal, single-finger swipes
  const onTouchStart = (e: React.TouchEvent) => {
    // Reset all tracking
    touchEndX.current = null;
    touchEndY.current = null;
    isMultiTouch.current = e.touches.length > 1;

    if (e.touches.length === 1) {
      touchStartX.current = e.targetTouches[0].clientX;
      touchStartY.current = e.targetTouches[0].clientY;
      touchStartTime.current = Date.now();
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // If multiple fingers touch at any point, mark as multi-touch
    if (e.touches.length > 1) {
      isMultiTouch.current = true;
    }

    if (e.touches.length === 1) {
      touchEndX.current = e.targetTouches[0].clientX;
      touchEndY.current = e.targetTouches[0].clientY;
    }
  };

  const onTouchEnd = () => {
    // Don't trigger swipe for multi-touch gestures (pinch/zoom)
    if (isMultiTouch.current) {
      isMultiTouch.current = false;
      return;
    }

    if (!touchStartX.current || !touchEndX.current || !touchStartY.current || !touchEndY.current || !touchStartTime.current) {
      return;
    }

    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = Math.abs(touchStartY.current - touchEndY.current);
    const elapsed = Date.now() - touchStartTime.current;

    // Must be a quick gesture
    if (elapsed > maxSwipeTime) return;

    // Must be primarily horizontal (not diagonal panning)
    const absDeltaX = Math.abs(deltaX);
    if (absDeltaX < minSwipeDistance) return;
    if (deltaY > absDeltaX * maxVerticalRatio) return;

    if (deltaX > 0) {
      goToNextHole();
    } else {
      goToPrevHole();
    }
  };

  if (!currentTee || !currentPin) {
    return <div className="text-center py-12 text-amber-100/50">No tee or pin data available</div>;
  }

  const holeDistance = currentTee.Distance;
  const holeElevation = calculateElevationChange(
    currentTee.Position!,
    currentPin.Position
  );
  const holePlaysAsDistance = calculatePlaysAsDistance(
    holeDistance,
    holeElevation,
    getAltitude(courseData)
  );

  const totalPar = courseData.Holes.reduce((sum, hole) => sum + hole.Par, 0);

  // Helper to format hole option label
  const formatHoleLabel = (holeNum: number) => {
    const hole = enabledHoles.find((h) => h.HoleNumber === holeNum);
    if (!hole) return `Hole ${holeNum}`;
    const tee = hole.Tees.find((t) => t.TeeType === selectedTeeType);
    const dist = tee ? convertDistance(tee.Distance, unitSystem).toFixed(0) : "—";
    return `${holeNum} · Par ${hole.Par} · ${dist}${getDistanceUnit(unitSystem)}`;
  };

  // Format elevation with sign
  const formatElevation = (elev: number) => {
    const converted = convertAltitude(elev, unitSystem);
    const sign = converted >= 0 ? "+" : "";
    return `${sign}${converted.toFixed(1)}${getAltitudeUnit(unitSystem)}`;
  };

  return (
    <div className="space-y-2">
      {/* Course Header Card - Compact */}
      <Card className="bg-emerald-950/30 border-amber-900/20">
        <CardContent className="py-3 px-3 sm:px-4">
          {/* Mobile: Stacked, Desktop: Horizontal */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 lg:gap-4">
            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-amber-50 truncate">
                {course.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-amber-100/80">
                <span className="truncate">{course.location}</span>
                <span className="text-amber-100/40">•</span>
                <span>by <b className="text-amber-50">{course.designer}</b></span>
                <span className="text-amber-100/40">•</span>
                <span>{course.holes}h par {totalPar}</span>
                {course.rangeEnabled && (
                  <>
                    <span className="text-amber-100/40">•</span>
                    <span className="text-emerald-400/80">Range</span>
                  </>
                )}
                {/* Tags inline */}
                {course?.attributes && course.attributes.length > 0 && (
                  <>
                    <span className="text-amber-100/40">•</span>
                    {course.attributes.map((attr) => (
                      <Badge
                        key={attr.id}
                        variant="secondary"
                        className="bg-emerald-900/40 hover:bg-emerald-800/50 text-amber-100/80 text-xs py-0 px-1.5 border border-amber-900/20"
                      >
                        {attr.name}
                      </Badge>
                    ))}
                  </>
                )}
              </div>

              {/* Expandable metadata */}
              <button
                onClick={() => setShowMetadata(!showMetadata)}
                className="text-xs text-amber-100/50 hover:text-amber-100/70 flex items-center gap-1 mt-1"
              >
                {showMetadata ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showMetadata ? "Hide details" : "Details"}
              </button>

              {showMetadata && (
                <div className="text-xs text-amber-100/60 mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>Alt: {convertAltitude(courseAltitude, unitSystem).toFixed(0)}{getAltitudeUnit(unitSystem)} ({((2 * (courseAltitude * 3.28084)) / 1000).toFixed(1)}%)</span>
                  <span>Avg Δ: {convertAltitude(course.averageElevationDifference, unitSystem).toFixed(1)}{getAltitudeUnit(unitSystem)}</span>
                  <span>Max ↓: {convertAltitude(course.largestElevationDrop, unitSystem).toFixed(1)}{getAltitudeUnit(unitSystem)}</span>
                  <span>Water: {course.totalWaterHazards}</span>
                  <span>OOB: {course.totalInnerOOB}</span>
                  <span>Islands: {course.islandGreens}</span>
                </div>
              )}
            </div>

            {/* Controls - Horizontal on all sizes */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Select onValueChange={setSelectedTeeType} value={selectedTeeType}>
                <SelectTrigger className="w-[140px] sm:w-[160px] h-8 text-sm bg-transparent border-amber-900/20 text-amber-100 hover:border-amber-700/40">
                  <SelectValue placeholder="Tee" />
                </SelectTrigger>
                <SelectContent className="bg-emerald-950/95 backdrop-blur-sm border-amber-900/30">
                  {course.teeBoxes
                    .sort((a, b) => b.length - a.length)
                    .filter((tee, index, self) => index === self.findIndex((t) => t.name === tee.name))
                    .map((tee) => (
                      <SelectItem
                        key={tee.name}
                        value={tee.name}
                        className="text-amber-100 focus:bg-emerald-800/50 focus:text-amber-50"
                      >
                        {tee.name} - {convertDistance(tee.length, unitSystem).toFixed(0)}{getDistanceUnit(unitSystem)}
                        {tee.rating > 0 && ` · ${tee.rating}/${tee.slope}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setSelectedPinDay} value={selectedPinDay}>
                <SelectTrigger className="w-[100px] h-8 text-sm bg-transparent border-amber-900/20 text-amber-100 hover:border-amber-700/40">
                  <SelectValue placeholder="Pin" />
                </SelectTrigger>
                <SelectContent className="bg-emerald-950/95 backdrop-blur-sm border-amber-900/30">
                  {courseData.Holes[0].Pins.map((pin) => (
                    <SelectItem
                      key={pin.Day}
                      value={pin.Day}
                      className="text-amber-100 focus:bg-emerald-800/50 focus:text-amber-50"
                    >
                      {pin.Day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="secondary"
                size="sm"
                onClick={onShowScoreCard}
                className="h-8 bg-emerald-900/40 border border-amber-900/20 text-amber-100 hover:bg-emerald-800/50 hover:text-amber-50"
              >
                <FileText className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Scorecard</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content - Desktop: sidebar + content, Mobile: just content */}
      <div className="flex gap-3 pb-16 lg:pb-0">
        {/* Desktop Sidebar - Narrower */}
        <div className="hidden lg:block w-[180px] shrink-0">
          <Tabs
            value={currentHoleNumber <= 9 ? "front" : "back"}
            onValueChange={(value) => {
              if (value === "front" && currentHoleNumber > 9) {
                setCurrentHoleNumber(front9[0]?.HoleNumber || 1);
              } else if (value === "back" && currentHoleNumber <= 9) {
                setCurrentHoleNumber(back9[0]?.HoleNumber || 10);
              }
            }}
          >
            <TabsList className="w-full bg-emerald-950/50 border border-amber-900/20">
              {front9.length > 0 && (
                <TabsTrigger
                  value="front"
                  className="flex-1 text-xs text-amber-100/70 data-[state=active]:bg-emerald-800/50 data-[state=active]:text-amber-50"
                >
                  Front 9
                </TabsTrigger>
              )}
              {back9.length > 0 && (
                <TabsTrigger
                  value="back"
                  className="flex-1 text-xs text-amber-100/70 data-[state=active]:bg-emerald-800/50 data-[state=active]:text-amber-50"
                >
                  Back 9
                </TabsTrigger>
              )}
            </TabsList>
            {front9.length > 0 && (
              <TabsContent value="front" className="space-y-1.5 mt-2">
                {front9.map((hole) => {
                  const tee = hole.Tees.find((t) => t.TeeType === selectedTeeType);
                  return (
                    <div
                      key={hole.HoleNumber}
                      className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                        currentHoleNumber === hole.HoleNumber
                          ? "bg-emerald-700/70 text-amber-50 border border-emerald-600/50"
                          : "bg-emerald-950/30 text-amber-100/70 hover:bg-emerald-900/40 hover:text-amber-100 border border-amber-900/20"
                      }`}
                      onClick={() => setCurrentHoleNumber(hole.HoleNumber)}
                    >
                      <span className="font-bold">{hole.HoleNumber}</span>
                      <span className="text-amber-100/60 ml-1">P{hole.Par}</span>
                      <span className="float-right">{convertDistance(tee?.Distance || 0, unitSystem).toFixed(0)}{getDistanceUnit(unitSystem)}</span>
                    </div>
                  );
                })}
              </TabsContent>
            )}
            {back9.length > 0 && (
              <TabsContent value="back" className="space-y-1.5 mt-2">
                {back9.map((hole) => {
                  const tee = hole.Tees.find((t) => t.TeeType === selectedTeeType);
                  return (
                    <div
                      key={hole.HoleNumber}
                      className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                        currentHoleNumber === hole.HoleNumber
                          ? "bg-emerald-700/70 text-amber-50 border border-emerald-600/50"
                          : "bg-emerald-950/30 text-amber-100/70 hover:bg-emerald-900/40 hover:text-amber-100 border border-amber-900/20"
                      }`}
                      onClick={() => setCurrentHoleNumber(hole.HoleNumber)}
                    >
                      <span className="font-bold">{hole.HoleNumber}</span>
                      <span className="text-amber-100/60 ml-1">P{hole.Par}</span>
                      <span className="float-right">{convertDistance(tee?.Distance || 0, unitSystem).toFixed(0)}{getDistanceUnit(unitSystem)}</span>
                    </div>
                  );
                })}
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Hole Content */}
        <Card className="flex-1 bg-emerald-950/30 border-amber-900/20 overflow-hidden">
          {/* Desktop: Horizontal info bar above SVG */}
          <div className="hidden lg:flex items-center justify-between px-4 py-2 border-b border-amber-900/20 bg-emerald-950/50">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevHole}
                className="h-7 w-7 text-amber-100/70 hover:text-amber-50 hover:bg-emerald-800/50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-amber-50 font-semibold">
                Hole {currentHoleNumber}
                <span className="text-amber-100/50 text-sm font-normal ml-1">of {totalHoles}</span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextHole}
                className="h-7 w-7 text-amber-100/70 hover:text-amber-50 hover:bg-emerald-800/50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-amber-100/80">
              <span><b className="text-amber-100">Par {holePar}</b></span>
              <span className="text-amber-100/40">•</span>
              <span>SI {holeIndex}</span>
              <span className="text-amber-100/40">•</span>
              <span>
                {convertDistance(holeDistance, unitSystem).toFixed(0)}{getDistanceUnit(unitSystem)}
                <span className="text-amber-100/50 ml-1">({convertDistance(holePlaysAsDistance, unitSystem).toFixed(0)}{getDistanceUnit(unitSystem)})</span>
              </span>
              <span className="text-amber-100/40">•</span>
              <span>{formatElevation(holeElevation)}</span>
              <span className="text-amber-100/40">•</span>
              <span className="text-amber-100/60">
                3D: {convertDistance(distance3D(currentTee.Position!, currentPin.Position!), unitSystem).toFixed(0)}{getDistanceUnit(unitSystem)}
                <span className="text-amber-100/40 ml-1">({convertDistance(calculatePlaysAsDistance(distance3D(currentTee.Position!, currentPin.Position!), holeElevation, getAltitude(courseData)), unitSystem).toFixed(0)}{getDistanceUnit(unitSystem)})</span>
              </span>
            </div>
          </div>

          {/* Mobile: Minimal header - hole number only, info available via button */}
          <div className="lg:hidden flex items-center justify-between px-3 py-2 border-b border-amber-900/20 bg-emerald-950/50">
            <span className="text-amber-50 font-semibold text-sm">
              Hole {currentHoleNumber} <span className="text-amber-100/50 font-normal">of {totalHoles}</span>
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-100/80">
              <span className="font-semibold text-amber-100">P{holePar}</span>
              <span className="text-amber-100/40">•</span>
              <span>{convertDistance(holeDistance, unitSystem).toFixed(0)}{getDistanceUnit(unitSystem)}</span>
              <span className="text-amber-100/40">•</span>
              <span>{formatElevation(holeElevation)}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileHoleInfo(!showMobileHoleInfo)}
                className="h-6 w-6 ml-1 text-amber-100/70 hover:text-amber-50 hover:bg-emerald-800/50"
              >
                <Info className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Mobile: Expandable detailed info */}
          {showMobileHoleInfo && (
            <div className="lg:hidden px-3 py-2 border-b border-amber-900/20 bg-emerald-950/70 text-xs text-amber-100/80 grid grid-cols-2 gap-x-4 gap-y-1">
              <span>Index: <b className="text-amber-100">{holeIndex}</b></span>
              <span>Plays as: <b className="text-amber-100">{convertDistance(holePlaysAsDistance, unitSystem).toFixed(0)}{getDistanceUnit(unitSystem)}</b></span>
              <span>Tee-to-pin: <b className="text-amber-100">{convertDistance(distance3D(currentTee.Position!, currentPin.Position!), unitSystem).toFixed(0)}{getDistanceUnit(unitSystem)}</b></span>
              <span>3D plays as: <b className="text-amber-100">{convertDistance(calculatePlaysAsDistance(distance3D(currentTee.Position!, currentPin.Position!), holeElevation, getAltitude(courseData)), unitSystem).toFixed(0)}{getDistanceUnit(unitSystem)}</b></span>
            </div>
          )}

          {/* SVG Container */}
          <CardContent className="p-0">
            <div
              className="relative w-full"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <GolfHolePainter
                courseData={courseData}
                selectedHoleNumber={currentHoleNumber}
                selectedTeeType={selectedTeeType}
                selectedPinDay={selectedPinDay}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-sm border-t border-amber-900/30 px-3 py-2 safe-area-pb">
        <div className="flex items-center gap-2 max-w-screen-xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevHole}
            className="h-9 w-9 text-amber-100/70 hover:text-amber-50 hover:bg-emerald-800/50 shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Select
            value={currentHoleNumber.toString()}
            onValueChange={(val) => setCurrentHoleNumber(parseInt(val))}
          >
            <SelectTrigger className="flex-1 h-9 bg-transparent border-amber-900/30 text-amber-100 hover:border-amber-700/40">
              <SelectValue>
                {formatHoleLabel(currentHoleNumber)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-emerald-950/95 backdrop-blur-sm border-amber-900/30 max-h-[60vh]">
              {front9.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-amber-100/50 text-xs uppercase tracking-wider">Front 9</SelectLabel>
                  {front9.map((hole) => (
                    <SelectItem
                      key={hole.HoleNumber}
                      value={hole.HoleNumber.toString()}
                      className="text-amber-100 focus:bg-emerald-800/50 focus:text-amber-50"
                    >
                      {formatHoleLabel(hole.HoleNumber)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              {back9.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-amber-100/50 text-xs uppercase tracking-wider">Back 9</SelectLabel>
                  {back9.map((hole) => (
                    <SelectItem
                      key={hole.HoleNumber}
                      value={hole.HoleNumber.toString()}
                      className="text-amber-100 focus:bg-emerald-800/50 focus:text-amber-50"
                    >
                      {formatHoleLabel(hole.HoleNumber)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextHole}
            className="h-9 w-9 text-amber-100/70 hover:text-amber-50 hover:bg-emerald-800/50 shrink-0"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GolfCourseViewer;
