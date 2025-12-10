import React, { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { FileText, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

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

  // Swipe handling refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

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

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      goToNextHole();
    } else if (isRightSwipe) {
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

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card className="bg-emerald-950/30 border-amber-900/20">
        <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 px-3 sm:px-6">
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-amber-50">
            {course.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 sm:pt-4 px-3 sm:px-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
              {/* Essential info */}
              <div className="text-amber-100/80 space-y-0.5">
                <p className="text-sm">
                  {course.location}, by <b className="text-amber-50">{course.designer}</b>
                </p>
                <p className="text-sm">
                  {course.holes} holes par {totalPar}
                  {course.rangeEnabled && <span className="text-emerald-400/80"> · Range</span>}
                </p>
                
                {/* Expandable metadata toggle */}
                <button 
                  onClick={() => setShowMetadata(!showMetadata)}
                  className="text-xs text-amber-100/50 hover:text-amber-100/70 flex items-center gap-1 mt-1"
                >
                  {showMetadata ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {showMetadata ? "Hide details" : "Show details"}
                </button>
                
                {/* Collapsible metadata */}
                {showMetadata && (
                  <div className="text-xs text-amber-100/60 mt-2 space-y-0.5 pl-1 border-l border-amber-900/30">
                    <p>
                      Altitude: {convertAltitude(courseAltitude, unitSystem).toFixed(0)}{getAltitudeUnit(unitSystem)} ({((2 * (courseAltitude * 3.28084)) / 1000).toFixed(1)}%)
                    </p>
                    <p>
                      Avg. Elevation Diff: {convertAltitude(course.averageElevationDifference, unitSystem).toFixed(1)}{getAltitudeUnit(unitSystem)}
                    </p>
                    <p>
                      Largest Drop: {convertAltitude(course.largestElevationDrop, unitSystem).toFixed(1)}{getAltitudeUnit(unitSystem)}
                    </p>
                    <p>
                      Water Hazards: {course.totalWaterHazards} | Inner OOB: {course.totalInnerOOB} | Island Greens: {course.islandGreens}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Controls */}
              <div className="flex items-center justify-start lg:justify-end">
                <div className="w-full lg:w-auto space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select
                      onValueChange={setSelectedTeeType}
                      value={selectedTeeType}
                    >
                      <SelectTrigger className="w-full sm:w-[180px] bg-transparent border-amber-900/20 text-amber-100 hover:border-amber-700/40">
                        <SelectValue placeholder="Select tee" />
                      </SelectTrigger>
                      <SelectContent className="bg-emerald-950/95 backdrop-blur-sm border-amber-900/30">
                        {course.teeBoxes
                          .sort((a, b) => b.length - a.length)
                          .filter(
                            (tee, index, self) =>
                              index ===
                              self.findIndex((t) => t.name === tee.name)
                          )
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
                    <Select
                      onValueChange={setSelectedPinDay}
                      value={selectedPinDay}
                    >
                      <SelectTrigger className="w-full sm:w-[140px] bg-transparent border-amber-900/20 text-amber-100 hover:border-amber-700/40">
                        <SelectValue placeholder="Select pin day" />
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
                  </div>
                  <Button
                    variant="secondary"
                    onClick={onShowScoreCard}
                    className="w-full sm:w-auto bg-emerald-900/40 border border-amber-900/20 text-amber-100 hover:bg-emerald-800/50 hover:text-amber-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Scorecard
                  </Button>
                </div>
              </div>
            </div>

            {course?.attributes && course.attributes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {course.attributes.map((attr) => (
                  <Badge
                    key={attr.id}
                    variant="secondary"
                    className="bg-emerald-900/40 hover:bg-emerald-800/50 text-amber-100/80 text-xs py-0.5 px-2 border border-amber-900/20"
                  >
                    {attr.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main content grid - sidebar hidden on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pb-20 lg:pb-0">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:block lg:col-span-1">
          <Tabs
            value={currentHoleNumber <= 9 ? "front" : "back"}
            onValueChange={(value) => {
              // When switching tabs, go to first hole of that nine
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
                  className="flex-1 text-amber-100/70 data-[state=active]:bg-emerald-800/50 data-[state=active]:text-amber-50"
                >
                  Front 9
                </TabsTrigger>
              )}
              {back9.length > 0 && (
                <TabsTrigger
                  value="back"
                  className="flex-1 text-amber-100/70 data-[state=active]:bg-emerald-800/50 data-[state=active]:text-amber-50"
                >
                  Back 9
                </TabsTrigger>
              )}
            </TabsList>
            {front9.length > 0 && (
              <TabsContent value="front" className="space-y-2 mt-3">
                {front9.map((hole) => (
                  <div
                    key={hole.HoleNumber}
                    className={`px-4 py-2 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${
                      currentHoleNumber === hole.HoleNumber
                        ? "bg-emerald-700/70 text-amber-50 border border-emerald-600/50"
                        : "bg-emerald-950/30 text-amber-100/70 hover:bg-emerald-900/40 hover:text-amber-100 border border-amber-900/20"
                    }`}
                    onClick={() => setCurrentHoleNumber(hole.HoleNumber)}
                  >
                    {hole.HoleNumber} | Par {hole.Par} |{" "}
                    {convertDistance(
                      hole.Tees.find((t) => t.TeeType === selectedTeeType)
                        ?.Distance || 0,
                      unitSystem
                    ).toFixed(0)}
                    {getDistanceUnit(unitSystem)}
                  </div>
                ))}
              </TabsContent>
            )}
            {back9.length > 0 && (
              <TabsContent value="back" className="space-y-2 mt-3">
                {back9.map((hole) => (
                  <div
                    key={hole.HoleNumber}
                    className={`px-4 py-2 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${
                      currentHoleNumber === hole.HoleNumber
                        ? "bg-emerald-700/70 text-amber-50 border border-emerald-600/50"
                        : "bg-emerald-950/30 text-amber-100/70 hover:bg-emerald-900/40 hover:text-amber-100 border border-amber-900/20"
                    }`}
                    onClick={() => setCurrentHoleNumber(hole.HoleNumber)}
                  >
                    {hole.HoleNumber} | Par {hole.Par} |{" "}
                    {convertDistance(
                      hole.Tees.find((t) => t.TeeType === selectedTeeType)
                        ?.Distance || 0,
                      unitSystem
                    ).toFixed(0)}
                    {getDistanceUnit(unitSystem)}
                  </div>
                ))}
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Hole Detail Card */}
        <Card className="lg:col-span-3 bg-emerald-950/30 border-amber-900/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevHole}
                className="text-amber-100/70 hover:text-amber-50 hover:bg-emerald-800/50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-amber-50 text-center">
                Hole {currentHoleNumber}
                <span className="text-amber-100/50 text-sm font-normal ml-2">
                  of {totalHoles}
                </span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextHole}
                className="text-amber-100/70 hover:text-amber-50 hover:bg-emerald-800/50"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className="relative w-full h-full"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="lg:absolute lg:top-2 lg:left-2 z-10 p-4 lg:p-0">
                <div className="min-w-[300px] grid grid-cols-2 gap-1 text-sm p-4 rounded-lg border border-amber-900/30 bg-emerald-950/95 backdrop-blur-sm text-amber-100/80 shadow-lg">
                  <span className="font-semibold text-amber-100">Par:</span>
                  <span>{holePar}</span>
                  <span className="font-semibold text-amber-100">Index:</span>
                  <span>{holeIndex}</span>
                  <span className="font-semibold text-amber-100">Distance:</span>
                  <span>
                    {convertDistance(holeDistance, unitSystem).toFixed(0)}
                    {getDistanceUnit(unitSystem)} (
                    {convertDistance(holePlaysAsDistance, unitSystem).toFixed(
                      0
                    )}
                    {getDistanceUnit(unitSystem)})
                  </span>
                  <span className="font-semibold text-amber-100">Elevation:</span>
                  <span>
                    {convertAltitude(holeElevation, unitSystem).toFixed(1)}
                    {getAltitudeUnit(unitSystem)}
                  </span>
                  <span className="font-semibold text-amber-100">Tee-to-pin:</span>
                  <span>
                    {convertDistance(
                      distance3D(currentTee.Position!, currentPin.Position!),
                      unitSystem
                    ).toFixed(0)}
                    {getDistanceUnit(unitSystem)} (
                    {convertDistance(
                      calculatePlaysAsDistance(
                        distance3D(currentTee.Position!, currentPin.Position!),
                        holeElevation,
                        getAltitude(courseData)
                      ),
                      unitSystem
                    ).toFixed(0)}
                    {getDistanceUnit(unitSystem)})
                  </span>
                </div>
              </div>
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

      {/* Mobile Sticky Bottom Bar - visible only on mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-sm border-t border-amber-900/30 px-4 py-3 safe-area-pb">
        <div className="flex items-center justify-between gap-3 max-w-screen-xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevHole}
            className="text-amber-100/70 hover:text-amber-50 hover:bg-emerald-800/50 shrink-0"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Select
            value={currentHoleNumber.toString()}
            onValueChange={(val) => setCurrentHoleNumber(parseInt(val))}
          >
            <SelectTrigger className="flex-1 bg-transparent border-amber-900/30 text-amber-100 hover:border-amber-700/40">
              <SelectValue>
                {formatHoleLabel(currentHoleNumber)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-emerald-950/95 backdrop-blur-sm border-amber-900/30 max-h-[60vh]">
              {front9.length > 0 && (
                <SelectGroup>
                  <SelectLabel className="text-amber-100/50 text-xs uppercase tracking-wider">
                    Front 9
                  </SelectLabel>
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
                  <SelectLabel className="text-amber-100/50 text-xs uppercase tracking-wider">
                    Back 9
                  </SelectLabel>
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
            className="text-amber-100/70 hover:text-amber-50 hover:bg-emerald-800/50 shrink-0"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GolfCourseViewer;
