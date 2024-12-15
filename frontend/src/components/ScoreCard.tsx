import React from "react";
import { X, CalendarDays, Mountain, User } from "lucide-react";
import { Button } from "./ui/button";
import { ScoreCardData } from "@/types";
import {
  useUnits,
  convertDistance,
  getDistanceUnit,
  convertAltitude,
} from "@/contexts/UnitContext";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface ScoreCardProps {
  data: ScoreCardData;
  onClose: () => void;
}

const getTeeColor = (teeName: string): string => {
  const name = teeName.toLowerCase();
  if (name.includes("green")) return "bg-green-400";
  if (name.includes("par3")) return "bg-gray-400";
  if (name.includes("junior")) return "bg-orange-400";
  if (name.includes("black")) return "bg-black";
  if (name.includes("yellow")) return "bg-yellow-200";
  if (name.includes("blue")) return "bg-blue-500";
  if (name.includes("white")) return "bg-gray-100";
  if (name.includes("red")) return "bg-red-500";
  return "bg-gray-300"; // default color
};

const getTextColor = (teeName: string): string => {
  const name = teeName.toLowerCase();
  if (name.includes("black") || name.includes("blue")) return "text-white";
  return "text-black";
};

export const ScoreCard: React.FC<ScoreCardProps> = ({ data, onClose }) => {
  const { unitSystem } = useUnits();
  const courseDetails = data.courseDetails;

  if (!data.teeBoxes.length) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card text-card-foreground rounded-lg p-6">
          <p>No scorecard data available</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  const numberOfHoles = data.teeBoxes[0].holes.length;

  console.log("attributes", courseDetails.attributes);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card text-card-foreground rounded-lg p-6 max-w-[90vw] max-h-[90vh] overflow-auto relative shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <h2 className="text-xl font-bold mb-2">{data.courseName}</h2>
        <p className="text-sm text-muted-foreground mb-4">{data.location}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  Designer: {courseDetails.designer}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <div className="text-sm">
                  <div>
                    Updated:{" "}
                    {new Date(courseDetails.updatedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {courseDetails.attributes.length > 0 && (
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-2">
                    {courseDetails.attributes.map((attr) => (
                      <Badge key={attr.id}>{attr.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mountain className="h-4 w-4" />
                <span className="text-sm">
                  Altitude:{" "}
                  {convertAltitude(
                    courseDetails.altitude / 3.28084,
                    unitSystem
                  ).toFixed(0)}
                  {getDistanceUnit(unitSystem)}
                </span>
              </div>
              <div className="text-sm">
                Largest Drop:{" "}
                {convertDistance(
                  courseDetails.largestElevationDrop,
                  unitSystem
                ).toFixed(0)}
                {getDistanceUnit(unitSystem)}
              </div>
              <div className="text-sm">
                Practice Range:{" "}
                {courseDetails.rangeEnabled ? "Available" : "Not Available"}
              </div>
            </div>
          </div>

          {data.sgtSplashUrl && (
            <div className="flex justify-center">
              <img
                src={`https://simulatorgolftour.com${data.sgtSplashUrl}`}
                alt={data.courseName}
                className="rounded-md object-cover h-32 w-full"
              />
            </div>
          )}
        </div>

        {courseDetails.description && (
          <>
            <Separator className="my-4" />
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">
                {courseDetails.description}
              </p>
            </div>
          </>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bg-card">
            <thead>
              <tr>
                <th className="border border-border px-3 py-2 bg-muted text-muted-foreground">
                  Hole
                </th>
                <th className="border border-border px-3 py-2 bg-muted text-muted-foreground">
                  Par
                </th>
                <th className="border border-border px-3 py-2 bg-muted text-muted-foreground">
                  Index
                </th>
                {data.teeBoxes.map((tee) => (
                  <th
                    key={tee.name}
                    className={`border border-border px-3 py-2 ${getTeeColor(
                      tee.name
                    )} ${getTextColor(tee.name)}`}
                  >
                    {tee.name}
                    <div className="text-xs font-normal">
                      {tee.rating} / {tee.slope}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: numberOfHoles }, (_, i) => i + 1).map(
                (holeNumber) => (
                  <tr
                    key={holeNumber}
                    className={holeNumber % 2 === 0 ? "bg-muted/50" : ""}
                  >
                    <td className="border border-border px-3 py-2 text-center font-medium">
                      {holeNumber}
                    </td>
                    <td className="border border-border px-3 py-2 text-center">
                      {data.teeBoxes[0].holes[holeNumber - 1].par}
                    </td>
                    <td className="border border-border px-3 py-2 text-center">
                      {data.teeBoxes[0].holes[holeNumber - 1].index}
                    </td>
                    {data.teeBoxes.map((tee) => (
                      <td
                        key={tee.name}
                        className={`border border-border px-3 py-2 text-center ${getTeeColor(
                          tee.name
                        )} ${getTextColor(tee.name)}`}
                      >
                        {convertDistance(
                          tee.holes[holeNumber - 1].length,
                          unitSystem
                        ).toFixed(0)}
                      </td>
                    ))}
                  </tr>
                )
              )}
              <tr className="font-bold">
                <td className="border border-border px-3 py-2 text-center bg-muted">
                  Total
                </td>
                <td className="border border-border px-3 py-2 text-center bg-muted">
                  {data.teeBoxes[0].totalPar}
                </td>
                <td className="border border-border px-3 py-2 text-center bg-muted">
                  -
                </td>
                {data.teeBoxes.map((tee) => (
                  <td
                    key={tee.name}
                    className={`border border-border px-3 py-2 text-center ${getTeeColor(
                      tee.name
                    )} ${getTextColor(tee.name)}`}
                  >
                    {convertDistance(tee.totalLength, unitSystem).toFixed(0)}
                    {getDistanceUnit(unitSystem)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
