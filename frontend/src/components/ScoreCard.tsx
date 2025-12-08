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

// More saturated, vibrant tee colors for better visual impact
const getTeeColor = (teeName: string): string => {
  const name = teeName.toLowerCase();
  if (name.includes("green")) return "bg-emerald-600";
  if (name.includes("par3")) return "bg-slate-500";
  if (name.includes("junior")) return "bg-orange-500";
  if (name.includes("black")) return "bg-gray-900";
  if (name.includes("yellow") || name.includes("gold")) return "bg-yellow-400";
  if (name.includes("blue")) return "bg-blue-600";
  if (name.includes("white")) return "bg-slate-200";
  if (name.includes("red")) return "bg-red-600";
  return "bg-slate-400"; // default color
};

// Lighter version of tee colors for cell backgrounds (data rows)
const getTeeCellColor = (teeName: string): string => {
  const name = teeName.toLowerCase();
  if (name.includes("green")) return "bg-emerald-900/40";
  if (name.includes("par3")) return "bg-slate-700/40";
  if (name.includes("junior")) return "bg-orange-900/40";
  if (name.includes("black")) return "bg-gray-800/50";
  if (name.includes("yellow") || name.includes("gold")) return "bg-yellow-900/30";
  if (name.includes("blue")) return "bg-blue-900/40";
  if (name.includes("white")) return "bg-slate-600/30";
  if (name.includes("red")) return "bg-red-900/40";
  return "bg-slate-700/40"; // default color
};

const getTextColor = (teeName: string): string => {
  const name = teeName.toLowerCase();
  if (name.includes("black") || name.includes("blue") || name.includes("green") || name.includes("red")) return "text-white";
  return "text-gray-900";
};

// Text color for data cells (lighter background needs different treatment)
const getCellTextColor = (_teeName: string): string => {
  return "text-slate-100";
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
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left side - Scorecard table */}
            <div className="flex-shrink-0">
              <div className="overflow-x-auto rounded-lg shadow-lg border border-slate-700/50">
                <table className="border-collapse text-sm">
                  <thead>
                    <tr>
                      {/* Index columns - darker left panel */}
                      <th className="px-2 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold border-b border-slate-600 w-12">
                        Hole
                      </th>
                      <th className="px-2 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold border-b border-slate-600 w-10">
                        Par
                      </th>
                      <th className="px-2 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold border-b border-r-2 border-slate-600 w-12">
                        Index
                      </th>
                      {/* Tee columns - vibrant colored headers */}
                      {data.teeBoxes.map((tee, idx) => (
                        <th
                          key={tee.name}
                          className={`px-2 py-1.5 ${getTeeColor(tee.name)} ${getTextColor(tee.name)} text-xs font-bold border-b border-slate-600 ${idx < data.teeBoxes.length - 1 ? 'border-r border-slate-600/30' : ''}`}
                        >
                          <div className="font-bold whitespace-nowrap">{tee.name}</div>
                          <div className="text-[10px] font-medium opacity-90 whitespace-nowrap">
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
                          className={`${holeNumber % 2 === 0 ? "bg-slate-800/60" : "bg-slate-900/60"} hover:bg-slate-700/50 transition-colors`}
                        >
                          {/* Index columns - consistent dark styling */}
                          <td className="px-2 py-1 text-center font-bold text-slate-200 bg-slate-800/80 border-b border-slate-700/50">
                            {holeNumber}
                          </td>
                          <td className="px-2 py-1 text-center text-slate-300 bg-slate-800/80 border-b border-slate-700/50">
                            {data.teeBoxes[0].holes[holeNumber - 1].par}
                          </td>
                          <td className="px-2 py-1 text-center text-slate-400 bg-slate-800/80 border-b border-r-2 border-slate-700/50">
                            {data.teeBoxes[0].holes[holeNumber - 1].index}
                          </td>
                          {/* Tee columns - subtle tinted backgrounds */}
                          {data.teeBoxes.map((tee, idx) => (
                            <td
                              key={tee.name}
                              className={`px-2 py-1 text-center ${getTeeCellColor(tee.name)} ${getCellTextColor(tee.name)} border-b border-slate-700/30 ${idx < data.teeBoxes.length - 1 ? 'border-r border-slate-700/20' : ''}`}
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
                    {/* Total row - prominent styling */}
                    <tr className="font-bold text-xs border-t-2 border-slate-500">
                      <td className="px-2 py-1.5 text-center bg-slate-700 text-slate-100 font-bold">
                        Total
                      </td>
                      <td className="px-2 py-1.5 text-center bg-slate-700 text-slate-100 font-bold">
                        {data.teeBoxes[0].totalPar}
                      </td>
                      <td className="px-2 py-1.5 text-center bg-slate-700 text-slate-400 border-r-2 border-slate-500">
                        -
                      </td>
                      {data.teeBoxes.map((tee, idx) => (
                        <td
                          key={tee.name}
                          className={`px-2 py-1.5 text-center ${getTeeColor(tee.name)} ${getTextColor(tee.name)} font-bold ${idx < data.teeBoxes.length - 1 ? 'border-r border-slate-600/30' : ''}`}
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

            {/* Right side - Course info panel */}
            <div className="flex-1 min-w-[280px] max-w-[340px] space-y-4">
              {/* Course image */}
              {data.sgtSplashUrl && (
                <div className="rounded-lg overflow-hidden shadow-lg border border-slate-700/50">
                  <img
                    src={`https://simulatorgolftour.com${data.sgtSplashUrl}`}
                    alt={data.courseName}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}

              {/* Course details card */}
              <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-300">
                      {courseDetails.designer}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-300">
                      {new Date(courseDetails.updatedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mountain className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-300">
                      {convertAltitude(
                        courseDetails.altitude / 3.28084,
                        unitSystem
                      ).toFixed(0)}
                      {getDistanceUnit(unitSystem)} altitude
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 pl-5">
                    {convertDistance(
                      courseDetails.largestElevationDrop,
                      unitSystem
                    ).toFixed(0)}
                    {getDistanceUnit(unitSystem)} max drop
                  </div>
                  <div className="text-xs text-slate-300 pl-5">
                    Range: {courseDetails.rangeEnabled ? "Yes" : "No"}
                  </div>
                </div>

                {courseDetails.attributes.length > 0 && (
                  <>
                    <Separator className="bg-slate-700" />
                    <div className="flex flex-wrap gap-1">
                      {courseDetails.attributes.map((attr) => (
                        <Badge
                          key={attr.id}
                          variant="secondary"
                          className="text-[10px] py-0 px-2 bg-slate-700 text-slate-300"
                        >
                          {attr.name}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Description */}
              {courseDetails.description && (
                <div className="rounded-lg bg-slate-800/30 border border-slate-700/50 p-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {courseDetails.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <CourseRecordsView
            data={recordsData}
            isLoading={isLoading}
            error={error}
            recordType={recordType}
            onRecordTypeChange={setRecordType}
            sgtId={data.sgtId}
            courseId={data.courseId}
          />
        )}
      </div>
    </div>
  );
};
