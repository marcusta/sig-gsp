import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
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
  getTeeTypeRating,
} from "./course-data";
import {
  useUnits,
  convertDistance,
  convertAltitude,
  getDistanceUnit,
  getAltitudeUnit,
} from "@/contexts/UnitContext";

const GolfCourseViewer: React.FC<{ course: CourseWithData }> = ({ course }) => {
  const { unitSystem } = useUnits();
  const longestTee = course.teeBoxes.sort((a, b) => b.length - a.length)[0];
  const courseData = course.gkData;
  const [currentHoleNumber, setCurrentHoleNumber] = useState(1);
  const [selectedTeeType, setSelectedTeeType] = useState<string>(
    longestTee.name
  );
  const [selectedPinDay, setSelectedPinDay] = useState<string>("Friday");

  const courseAltitude = getAltitudeInMeters(courseData);
  const currentHole = getHole(courseData, currentHoleNumber);
  const holePar = currentHole.Par;
  const holeIndex = currentHole.Index;
  const currentPin = getPin(courseData, currentHoleNumber, selectedPinDay);
  const currentTee = getTee(courseData, currentHoleNumber, selectedTeeType);

  if (!currentTee || !currentPin) {
    return <div>No tee or pin data available</div>;
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

  const teeTypeRating = getTeeTypeRating(courseData, selectedTeeType);

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-white">
            {course.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-slate-200">
              <p className="text-sm">
                {course.location}, by <b>{course.designer}</b>
              </p>
              <p className="text-sm">
                {course.holes} holes par {totalPar}, Rating/Slope{" "}
                {teeTypeRating}
              </p>
              <p className="text-sm">
                Altitude:{" "}
                {convertAltitude(courseAltitude, unitSystem).toFixed(0)}
                {getAltitudeUnit(unitSystem)} (
                {((2 * (courseAltitude * 3.28084)) / 1000).toFixed(1)}%)
              </p>
              <p className="text-sm">
                Driving Range: {course.rangeEnabled ? "Yes" : "No"}
              </p>
            </div>
            <div className="text-slate-200">
              <p className="text-sm">
                Avg. Elevation Diff:{" "}
                {convertAltitude(
                  course.averageElevationDifference,
                  unitSystem
                ).toFixed(1)}
                {getAltitudeUnit(unitSystem)}
              </p>
              <p className="text-sm">
                Largest Drop:{" "}
                {convertAltitude(
                  course.largestElevationDrop,
                  unitSystem
                ).toFixed(1)}
                {getAltitudeUnit(unitSystem)}
              </p>
              <p className="text-sm">
                Water Hazards: {course.totalWaterHazards} | Inner OOB:{" "}
                {course.totalInnerOOB}
              </p>
              <p className="text-sm">Island Greens: {course.islandGreens}</p>
            </div>
            <div className="flex items-center justify-end space-x-4">
              <div className="flex space-x-2">
                <Select
                  onValueChange={setSelectedTeeType}
                  value={selectedTeeType}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select tee" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {course.teeBoxes
                      .sort((a, b) => b.length - a.length)
                      .filter(
                        (tee, index, self) =>
                          index === self.findIndex((t) => t.name === tee.name)
                      )
                      .map((tee) => (
                        <SelectItem
                          key={tee.name}
                          value={tee.name}
                          className="text-slate-200"
                        >
                          {tee.name} -{" "}
                          {convertDistance(tee.length, unitSystem).toFixed(0)}
                          {getDistanceUnit(unitSystem)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={setSelectedPinDay}
                  value={selectedPinDay}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select pin day" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {courseData.Holes[0].Pins.map((pin) => (
                      <SelectItem
                        key={pin.Day}
                        value={pin.Day}
                        className="text-slate-200"
                      >
                        {pin.Day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 space-y-2">
          {courseData.Holes.filter((hole) => hole.Enabled).map((hole) => (
            <div
              key={hole.HoleNumber}
              className={`px-4 py-2 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-colors ${
                currentHoleNumber === hole.HoleNumber
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 border border-slate-700"
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
        </div>
        <Card className="md:col-span-3 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              Hole {currentHoleNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full h-full">
              <GolfHolePainter
                courseData={courseData}
                selectedHoleNumber={currentHoleNumber}
                selectedTeeType={selectedTeeType}
                selectedPinDay={selectedPinDay}
              />
              <div className="absolute top-2 left-2 z-10">
                <div className="min-w-[300px] grid grid-cols-2 gap-1 text-sm p-4 rounded-lg border border-slate-600 bg-slate-900/95 text-slate-200 shadow-lg">
                  <span className="font-semibold">Par:</span>
                  <span>{holePar}</span>
                  <span className="font-semibold">Index:</span>
                  <span>{holeIndex}</span>
                  <span className="font-semibold">Distance:</span>
                  <span>
                    {convertDistance(holeDistance, unitSystem).toFixed(0)}
                    {getDistanceUnit(unitSystem)} (
                    {convertDistance(holePlaysAsDistance, unitSystem).toFixed(
                      0
                    )}
                    {getDistanceUnit(unitSystem)})
                  </span>
                  <span className="font-semibold">Elevation:</span>
                  <span>
                    {convertAltitude(holeElevation, unitSystem).toFixed(1)}
                    {getAltitudeUnit(unitSystem)}
                  </span>
                  <span className="font-semibold">Tee-to-pin:</span>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GolfCourseViewer;
