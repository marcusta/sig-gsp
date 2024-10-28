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

const GolfCourseViewer: React.FC<{ course: CourseWithData }> = ({ course }) => {
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
      <Card className="text-white bg-opacity-20 bg-green-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold">{course.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm">
                {course.location}, by <b>{course.designer}</b>
              </p>
              <p className="text-sm">
                {course.holes} holes par {totalPar}, Rating/Slope{" "}
                {teeTypeRating}
              </p>
              <p className="text-sm">
                Altitude: {courseAltitude.toFixed(0)}m,{" "}
                {(courseAltitude * 3.28084).toFixed(0)}
                ft ({((2 * (courseAltitude * 3.28084)) / 1000).toFixed(1)}%)
              </p>
            </div>
            <div className="flex space-x-2">
              <Select
                onValueChange={setSelectedTeeType}
                value={selectedTeeType}
              >
                <SelectTrigger className="w-[150px] bg-white bg-opacity-80 text-green-800">
                  <SelectValue placeholder="Select tee" />
                </SelectTrigger>
                <SelectContent>
                  {course.teeBoxes
                    .sort((a, b) => b.length - a.length)
                    .filter(
                      (tee, index, self) =>
                        index === self.findIndex((t) => t.name === tee.name)
                    )
                    .map((tee) => (
                      <SelectItem key={tee.name} value={tee.name}>
                        {tee.name} - {tee.length.toFixed(0)}m
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setSelectedPinDay} value={selectedPinDay}>
                <SelectTrigger className="w-[150px] bg-white bg-opacity-80 text-green-800">
                  <SelectValue placeholder="Select pin day" />
                </SelectTrigger>
                <SelectContent>
                  {courseData.Holes[0].Pins.map((pin) => (
                    <SelectItem key={pin.Day} value={pin.Day}>
                      {pin.Day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  ? "bg-green-600 text-white"
                  : "bg-white text-green-800 hover:bg-green-100"
              }`}
              onClick={() => setCurrentHoleNumber(hole.HoleNumber)}
            >
              {hole.HoleNumber} | Par {hole.Par} |{" "}
              {hole.Tees.find(
                (t) => t.TeeType === selectedTeeType
              )?.Distance.toFixed(0)}
              m
            </div>
          ))}
        </div>
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Hole {currentHoleNumber}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-full">
              <GolfHolePainter
                courseData={courseData}
                selectedHoleNumber={currentHoleNumber}
                selectedTeeType={selectedTeeType}
                selectedPinDay={selectedPinDay}
              />
              <div className="absolute top-2 left-2 z-10">
                <div className="min-w-[300px] grid grid-cols-2 gap-1 text-sm p-4 rounded-lg border border-green-800 bg-white bg-opacity-90 shadow-lg">
                  <span className="font-semibold">Par:</span>
                  <span>{holePar}</span>
                  <span className="font-semibold">Index:</span>
                  <span>{holeIndex}</span>
                  <span className="font-semibold">Distance:</span>
                  <span>
                    {holeDistance.toFixed(0)}m ({holePlaysAsDistance.toFixed(0)}
                    m)
                  </span>
                  <span className="font-semibold">Elevation:</span>
                  <span>{holeElevation.toFixed(1)}m</span>
                  <span className="font-semibold">Tee-to-pin:</span>
                  <span>
                    {distance3D(
                      currentTee.Position!,
                      currentPin.Position!
                    ).toFixed(0)}
                    m (
                    {calculatePlaysAsDistance(
                      distance3D(currentTee.Position!, currentPin.Position!),
                      holeElevation,
                      getAltitude(courseData)
                    ).toFixed(0)}
                    m)
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
