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
import { useQuery } from "@tanstack/react-query";
import { fetchCourseRecords } from "@/api/useApi";
import { CourseRecordsView } from "./CourseRecordsView";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

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
  const [view, setView] = React.useState<"scorecard" | "records">("scorecard");
  const [recordType, setRecordType] = React.useState<"CR" | "CRTips">("CR");

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  React.useEffect(() => {
    console.log("View changed to:", view);
  }, [view]);

  const {
    data: recordsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courseRecords", data.sgtId, recordType],
    queryFn: () => {
      console.log("Fetching records for:", data.sgtId, recordType);
      return fetchCourseRecords(data.sgtId, recordType);
    },
    enabled: view === "records" && !!data.sgtId,
  });

  console.log("Query state:", {
    view,
    sgtId: data.sgtId,
    recordType,
    enabled: view === "records" && !!data.sgtId,
    isLoading,
    error,
    hasData: !!recordsData,
  });

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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card text-card-foreground rounded-lg p-4 max-w-[95vw] max-h-[95vh] overflow-auto relative shadow-2xl border border-border/20">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <h2 className="text-lg font-bold mb-1">{data.courseName}</h2>
        <p className="text-xs text-muted-foreground mb-3">{data.location}</p>

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "scorecard" | "records")}
          className="mb-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
            <TabsTrigger value="records">Course Records</TabsTrigger>
          </TabsList>
        </Tabs>

        {view === "scorecard" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs">
                      Designer: {courseDetails.designer}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    <div className="text-xs">
                      Updated:{" "}
                      {new Date(courseDetails.updatedDate).toLocaleDateString()}
                    </div>
                  </div>
                  {courseDetails.attributes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {courseDetails.attributes.map((attr) => (
                        <Badge key={attr.id} className="text-xs py-0 px-2">
                          {attr.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Mountain className="h-3 w-3" />
                    <span className="text-xs">
                      Altitude:{" "}
                      {convertAltitude(
                        courseDetails.altitude / 3.28084,
                        unitSystem
                      ).toFixed(0)}
                      {getDistanceUnit(unitSystem)}
                    </span>
                  </div>
                  <div className="text-xs">
                    Largest Drop:{" "}
                    {convertDistance(
                      courseDetails.largestElevationDrop,
                      unitSystem
                    ).toFixed(0)}
                    {getDistanceUnit(unitSystem)}
                  </div>
                  <div className="text-xs">
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
                    className="rounded-md object-cover h-24 w-full"
                  />
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse bg-card text-sm">
                <thead>
                  <tr>
                    <th className="border border-border px-2 py-1 bg-muted text-muted-foreground text-xs">
                      Hole
                    </th>
                    <th className="border border-border px-2 py-1 bg-muted text-muted-foreground text-xs">
                      Par
                    </th>
                    <th className="border border-border px-2 py-1 bg-muted text-muted-foreground text-xs">
                      Index
                    </th>
                    {data.teeBoxes.map((tee) => (
                      <th
                        key={tee.name}
                        className={`border border-border px-2 py-1 ${getTeeColor(
                          tee.name
                        )} ${getTextColor(tee.name)} text-xs`}
                      >
                        {tee.name}
                        <div className="text-[10px] font-normal">
                          {tee.rating} / {tee.slope}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {Array.from({ length: numberOfHoles }, (_, i) => i + 1).map(
                    (holeNumber) => (
                      <tr
                        key={holeNumber}
                        className={holeNumber % 2 === 0 ? "bg-muted/50" : ""}
                      >
                        <td className="border border-border px-2 py-1 text-center font-medium">
                          {holeNumber}
                        </td>
                        <td className="border border-border px-2 py-1 text-center">
                          {data.teeBoxes[0].holes[holeNumber - 1].par}
                        </td>
                        <td className="border border-border px-2 py-1 text-center">
                          {data.teeBoxes[0].holes[holeNumber - 1].index}
                        </td>
                        {data.teeBoxes.map((tee) => (
                          <td
                            key={tee.name}
                            className={`border border-border px-2 py-1 text-center ${getTeeColor(
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
                  <tr className="font-bold text-xs">
                    <td className="border border-border px-2 py-1 text-center bg-muted">
                      Total
                    </td>
                    <td className="border border-border px-2 py-1 text-center bg-muted">
                      {data.teeBoxes[0].totalPar}
                    </td>
                    <td className="border border-border px-2 py-1 text-center bg-muted">
                      -
                    </td>
                    {data.teeBoxes.map((tee) => (
                      <td
                        key={tee.name}
                        className={`border border-border px-2 py-1 text-center ${getTeeColor(
                          tee.name
                        )} ${getTextColor(tee.name)}`}
                      >
                        {convertDistance(tee.totalLength, unitSystem).toFixed(
                          0
                        )}
                        {getDistanceUnit(unitSystem)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            {courseDetails.description && (
              <>
                <Separator className="my-2" />
                <div className="mb-4">
                  <h3 className="text-xs font-medium mb-1">Description</h3>
                  <p className="text-xs text-muted-foreground">
                    {courseDetails.description}
                  </p>
                </div>
              </>
            )}
          </>
        ) : (
          <CourseRecordsView
            data={recordsData}
            isLoading={isLoading}
            error={error}
            recordType={recordType}
            onRecordTypeChange={setRecordType}
            sgtId={data.sgtId}
          />
        )}
      </div>
    </div>
  );
};
