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

// Muted, desaturated tee colors for filmic integration
const getTeeColor = (teeName: string): string => {
  const name = teeName.toLowerCase();
  if (name.includes("green")) return "bg-emerald-800/70";
  if (name.includes("par3")) return "bg-slate-600/70";
  if (name.includes("junior")) return "bg-amber-700/70";
  if (name.includes("black")) return "bg-zinc-800/80";
  if (name.includes("yellow") || name.includes("gold")) return "bg-yellow-600/70";
  if (name.includes("blue")) return "bg-blue-800/70";
  if (name.includes("white")) return "bg-slate-400/70";
  if (name.includes("red")) return "bg-red-800/70";
  return "bg-slate-600/70"; // default color
};

// Transparent cells to allow gradient to show through
const getTeeCellColor = (_teeName: string): string => {
  return "bg-transparent";
};

const getTextColor = (teeName: string): string => {
  const name = teeName.toLowerCase();
  // Most muted backgrounds need light text now
  if (name.includes("white")) return "text-slate-800";
  if (name.includes("yellow") || name.includes("gold")) return "text-slate-900";
  return "text-amber-50/90";
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
      <div
        className="text-card-foreground rounded-lg p-4 max-w-[95vw] max-h-[95vh] overflow-auto relative shadow-2xl border border-slate-600/30"
        style={{
          background: `
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
    `,
        }}
      >
        {/* Film grain overlay */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Vignette effect */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            boxShadow: "inset 0 0 80px 20px rgba(0,0,0,0.3)",
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <h2 className="text-lg font-semibold mb-1 tracking-wide text-amber-50">{data.courseName}</h2>
        <p className="text-xs text-amber-200/50 mb-3 tracking-wider uppercase">{data.location}</p>

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "scorecard" | "records")}
          className="mb-4"
        >
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/40 backdrop-blur-sm border border-slate-700/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_2px_4px_rgba(0,0,0,0.3)]">
            <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
            <TabsTrigger value="records">Course Records</TabsTrigger>
          </TabsList>
        </Tabs>

        {view === "scorecard" ? (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left side - Scorecard table */}
            <div className="flex-shrink-0">
              <div className="overflow-x-auto rounded-lg shadow-lg border border-amber-900/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                <table className="border-collapse text-sm">
                  <thead>
                    <tr>
                      {/* Index columns - translucent with backdrop blur */}
                      <th className="px-2 py-1.5 bg-slate-800/50 backdrop-blur-[2px] text-amber-100/90 text-xs font-semibold border-b border-amber-900/30 w-12">
                        Hole
                      </th>
                      <th className="px-2 py-1.5 bg-slate-800/50 backdrop-blur-[2px] text-amber-100/90 text-xs font-semibold border-b border-amber-900/30 w-10">
                        Par
                      </th>
                      <th className="px-2 py-1.5 bg-slate-800/50 backdrop-blur-[2px] text-amber-100/90 text-xs font-semibold border-b border-r border-amber-900/30 w-12">
                        Index
                      </th>
                      {/* Tee columns - translucent colored headers */}
                      {data.teeBoxes.map((tee, idx) => (
                        <th
                          key={tee.name}
                          className={`px-2 py-1.5 ${getTeeColor(
                            tee.name
                          )} backdrop-blur-[2px] ${getTextColor(
                            tee.name
                          )} text-xs font-bold border-b border-amber-900/40 ${
                            idx < data.teeBoxes.length - 1
                              ? "border-r border-black/20"
                              : ""
                          }`}
                        >
                          <div className="font-bold whitespace-nowrap">
                            {tee.name}
                          </div>
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
                          className="hover:bg-slate-700/20 transition-colors"
                        >
                          {/* Index columns - translucent with warm tint */}
                          <td className="px-2 py-1 text-center font-bold text-amber-50 bg-slate-800/40 backdrop-blur-[1px] border-b border-slate-700/30">
                            {holeNumber}
                          </td>
                          <td className="px-2 py-1 text-center text-amber-100/80 bg-slate-800/40 backdrop-blur-[1px] border-b border-slate-700/30">
                            {data.teeBoxes[0].holes[holeNumber - 1].par}
                          </td>
                          <td className="px-2 py-1 text-center text-amber-100/50 bg-slate-800/40 backdrop-blur-[1px] border-b border-r border-slate-700/30">
                            {data.teeBoxes[0].holes[holeNumber - 1].index}
                          </td>
                          {/* Tee columns - subtle tinted backgrounds */}
                          {data.teeBoxes.map((tee, idx) => (
                            <td
                              key={tee.name}
                              className={`px-2 py-1 text-center ${getTeeCellColor(
                                tee.name
                              )} ${getCellTextColor(
                                tee.name
                              )} border-b border-slate-700/30 ${
                                idx < data.teeBoxes.length - 1
                                  ? "border-r border-slate-700/20"
                                  : ""
                              }`}
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
                    {/* Total row - translucent with subtle gold accent */}
                    <tr className="font-bold text-xs border-t border-amber-700/40">
                      <td className="px-2 py-1.5 text-center bg-slate-700/50 backdrop-blur-[2px] text-amber-100 font-bold">
                        Total
                      </td>
                      <td className="px-2 py-1.5 text-center bg-slate-700/50 backdrop-blur-[2px] text-amber-100 font-bold">
                        {data.teeBoxes[0].totalPar}
                      </td>
                      <td className="px-2 py-1.5 text-center bg-slate-700/50 backdrop-blur-[2px] text-amber-100/60 border-r border-amber-900/30">
                        -
                      </td>
                      {data.teeBoxes.map((tee, idx) => (
                        <td
                          key={tee.name}
                          className={`px-2 py-1.5 text-center ${getTeeColor(
                            tee.name
                          )} backdrop-blur-[2px] ${getTextColor(tee.name)} font-bold ${
                            idx < data.teeBoxes.length - 1
                              ? "border-r border-black/20"
                              : ""
                          }`}
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
            </div>

            {/* Right side - Course info panel */}
            <div className="flex-1 min-w-[280px] max-w-[340px] space-y-4">
              {/* Course image */}
              {data.sgtSplashUrl && (
                <div className="rounded-lg overflow-hidden shadow-lg border border-amber-900/30">
                  <img
                    src={`https://simulatorgolftour.com${data.sgtSplashUrl}`}
                    alt={data.courseName}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}

              {/* Course details card */}
              <div className="rounded-lg bg-slate-800/30 backdrop-blur-sm border border-amber-900/20 p-3 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-amber-200/50" />
                    <span className="text-xs text-amber-100/80">
                      {courseDetails.designer}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-amber-200/50" />
                    <span className="text-xs text-amber-100/80">
                      {new Date(courseDetails.updatedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Separator className="bg-amber-900/30" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mountain className="h-3.5 w-3.5 text-amber-200/50" />
                    <span className="text-xs text-amber-100/80">
                      {convertAltitude(
                        courseDetails.altitude / 3.28084,
                        unitSystem
                      ).toFixed(0)}
                      {getDistanceUnit(unitSystem)} altitude
                    </span>
                  </div>
                  <div className="text-xs text-amber-100/60 pl-5">
                    {convertDistance(
                      courseDetails.largestElevationDrop,
                      unitSystem
                    ).toFixed(0)}
                    {getDistanceUnit(unitSystem)} max drop
                  </div>
                  <div className="text-xs text-amber-100/60 pl-5">
                    Range: {courseDetails.rangeEnabled ? "Yes" : "No"}
                  </div>
                </div>

                {courseDetails.attributes.length > 0 && (
                  <>
                    <Separator className="bg-amber-900/30" />
                    <div className="flex flex-wrap gap-1">
                      {courseDetails.attributes.map((attr) => (
                        <Badge
                          key={attr.id}
                          variant="secondary"
                          className="text-[10px] py-0 px-2 bg-emerald-900/50 text-amber-100/80 border border-emerald-800/30"
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
                <div className="rounded-lg bg-slate-800/20 backdrop-blur-sm border border-amber-900/20 p-3">
                  <p className="text-xs text-amber-100/50 leading-relaxed italic">
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
