import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Course, CourseWithData, ScoreCardData } from "@/types";
import {
  convertDistance,
  getDistanceUnit,
  useUnits,
} from "@/contexts/UnitContext";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink, FileText, Youtube } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseById } from "@/api/useApi";
import { ScoreCard } from "@/components/ScoreCard";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

interface CourseListViewProps {
  courses: Course[];
}

const transformToScoreCardData = (courseData: CourseWithData): ScoreCardData => {
  const enabledHoles = courseData.gkData.Holes.filter((h) => h.Enabled);

  const teeBoxes = courseData.teeBoxes.map((tee) => {
    const holes = enabledHoles.map((hole) => {
      const teeData = hole.Tees.find(
        (t) => t.TeeType.toLowerCase() === tee.name.toLowerCase() && t.Enabled
      );

      return {
        number: hole.HoleNumber,
        par: hole.Par,
        index: hole.Index,
        length: teeData?.Distance || 0,
      };
    });

    return {
      name: tee.name,
      slope: tee.slope,
      rating: tee.rating,
      totalLength: tee.length,
      totalPar: enabledHoles.reduce((sum, hole) => sum + hole.Par, 0),
      holes,
    };
  });

  return {
    courseId: courseData.id,
    courseName: courseData.name,
    location: courseData.location,
    teeBoxes: teeBoxes.sort((a, b) => b.totalLength - a.totalLength),
    sgtSplashUrl: courseData.sgtSplashUrl || "",
    sgtId: courseData.sgtId,
    courseDetails: {
      designer: courseData.designer,
      altitude: courseData.altitude,
      rangeEnabled: courseData.rangeEnabled,
      largestElevationDrop: courseData.largestElevationDrop,
      description: courseData.description,
      addedDate: courseData.addedDate,
      updatedDate: courseData.updatedDate,
      attributes: courseData.attributes || [],
    },
  };
};

const RecordPill: React.FC<{
  label: "Tips" | "SGT";
  score?: string | null;
  player?: string | null;
}> = ({ label, score, player }) => {
  const hasRecord = Boolean(score);
  return (
    <p className={`text-xs ${hasRecord ? "text-amber-100/85" : "text-amber-100/45"}`}>
      {hasRecord ? `${label} ${score} ${player ? `• ${player}` : ""}` : `${label}: no record`}
    </p>
  );
};

const TeeSummary: React.FC<{ course: Course }> = ({ course }) => {
  const { unitSystem } = useUnits();
  const sortedTeeBoxes = [...(course.teeBoxes || [])].sort(
    (a, b) => b.length - a.length
  );
  const primary = sortedTeeBoxes[0];
  const extraCount = Math.max(sortedTeeBoxes.length - 1, 0);

  if (!primary) {
    return <span className="text-xs text-amber-100/50">No tee data</span>;
  }

  const distance = `${convertDistance(primary.length, unitSystem).toFixed(0)}${getDistanceUnit(
    unitSystem
  )}`;
  const ratingSlope = `${primary.rating}/${primary.slope}`;
  const extra = extraCount > 0 ? `+${extraCount}` : "";

  return (
    <div className="group relative inline-flex justify-center">
      <span
        tabIndex={0}
        className="cursor-help text-xs font-mono text-amber-100/75 outline-none ring-offset-slate-950 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-amber-500/60"
      >
        {`${distance} • ${ratingSlope}${extra ? ` • ${extra}` : ""}`}
      </span>

      <div className="pointer-events-none invisible absolute left-1/2 top-full z-30 mt-2 w-56 -translate-x-1/2 rounded-md border border-slate-700/80 bg-slate-950/95 p-2 text-left opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <p className="text-[11px] uppercase tracking-wide text-amber-200/55">
          Tee Details
        </p>
        <p className="mt-1 text-xs text-amber-100/85">
          {course.holes} holes • par {course.par}
        </p>
        <div className="mt-2 border-t border-slate-700/55 pt-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-amber-200/55">
                <th className="pb-1 text-left font-normal">Tee</th>
                <th className="pb-1 text-right font-normal">Dist</th>
                <th className="pb-1 text-right font-normal">R/S</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeeBoxes.map((tee) => (
                <tr key={`tee-hover-${course.id}-${tee.name}`}>
                  <td className="py-0.5 text-amber-100/90">{tee.name}</td>
                  <td className="py-0.5 text-right font-mono text-amber-100/70">
                    {convertDistance(tee.length, unitSystem).toFixed(0)}
                    {getDistanceUnit(unitSystem)}
                  </td>
                  <td className="py-0.5 text-right font-mono text-amber-100/70">
                    {tee.rating}/{tee.slope}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const RecordAttemptMenu: React.FC<{
  hasSgtId: boolean;
  onAttempt: (type: "sgt" | "tips") => void;
}> = ({ hasSgtId, onAttempt }) => {
  const handleAttemptClick = (
    type: "sgt" | "tips",
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onAttempt(type);
    const details = event.currentTarget.closest("details");
    if (details) {
      details.open = false;
    }
  };

  return (
    <details className="group/details relative">
      <summary
        className={`list-none [&::-webkit-details-marker]:hidden ${
          hasSgtId ? "cursor-pointer" : "cursor-not-allowed opacity-50"
        }`}
        aria-disabled={!hasSgtId}
        onClick={(event) => {
          if (!hasSgtId) {
            event.preventDefault();
          }
        }}
      >
        <span className="inline-flex h-8 items-center gap-1 rounded-md border border-amber-900/30 px-2 text-[11px] text-amber-100/90 hover:bg-slate-800/40">
          Attempt Record
          <ChevronDown className="h-3.5 w-3.5" />
        </span>
      </summary>
      {hasSgtId ? (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-56 rounded-md border border-slate-700/80 bg-slate-950/95 p-1 shadow-xl">
          <button
            type="button"
            onClick={(event) => handleAttemptClick("sgt", event)}
            className="flex w-full flex-col items-start rounded-sm px-2 py-1.5 text-left hover:bg-slate-800/60"
          >
            <span className="text-xs font-medium text-amber-50">Attempt SGT Tees Record</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-200/60">
              <ExternalLink className="h-3 w-3" />
              opens in new tab
            </span>
          </button>
          <button
            type="button"
            onClick={(event) => handleAttemptClick("tips", event)}
            className="mt-1 flex w-full flex-col items-start rounded-sm px-2 py-1.5 text-left hover:bg-slate-800/60"
          >
            <span className="text-xs font-medium text-amber-50">Attempt Tips Tees Record</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-200/60">
              <ExternalLink className="h-3 w-3" />
              opens in new tab
            </span>
          </button>
        </div>
      ) : null}
    </details>
  );
};

const CourseListRow: React.FC<{ course: Course; search: string }> = ({
  course,
  search,
}) => {
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);
  const hasSgtId = Boolean(course.sgtId);

  const { data: courseData } = useQuery<CourseWithData>({
    queryKey: ["course", course.id],
    queryFn: () => fetchCourseById(course.id),
    enabled: showScoreCard,
  });

  const scoreCardData = useMemo(
    () => (courseData ? transformToScoreCardData(courseData) : null),
    [courseData]
  );

  const openRecordAttempt = (type: "sgt" | "tips") => {
    if (!course.sgtId) return;
    const url = `https://simulatorgolftour.com/event-register/course-record/${type}/${course.sgtId}`;
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (!newWindow) {
      window.location.href = url;
    }
  };

  return (
    <>
      <div className="border-b border-slate-700/35 py-3">
        <div className="hidden lg:grid lg:grid-cols-[minmax(320px,1fr)_200px_320px_220px] lg:items-center lg:gap-x-4">
          <div className="min-w-0">
            <Link
              to={`/course/${course.id}`}
              state={{ search }}
              className="block hover:underline"
            >
              <h3 className="truncate text-base font-semibold text-amber-50">
                {course.name}
              </h3>
            </Link>
            <p className="mt-1 text-xs text-amber-200/60">
              {course.holes} holes • par {course.par}
            </p>
          </div>

          <div className="min-w-0 text-center">
            <TeeSummary course={course} />
          </div>

          <div className="flex min-w-0 flex-col items-center gap-0.5 overflow-hidden text-center">
            <RecordPill label="Tips" score={course.tipsRecordScore} player={course.tipsRecordPlayer} />
            <RecordPill label="SGT" score={course.sgtRecordScore} player={course.sgtRecordPlayer} />
          </div>

          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowScoreCard(true)}
              className="h-8 w-8 border-amber-900/30 text-amber-100/90 hover:bg-slate-800/40"
              title="Scorecard"
            >
              <FileText className="h-4 w-4" />
            </Button>
            {course.sgtYoutubeUrl ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowYouTube(true)}
                className="h-8 w-8 border-amber-900/30 text-amber-100/90 hover:bg-slate-800/40"
                title="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </Button>
            ) : null}
            <RecordAttemptMenu
              hasSgtId={hasSgtId}
              onAttempt={openRecordAttempt}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:hidden">
          <div className="min-w-0">
            <Link
              to={`/course/${course.id}`}
              state={{ search }}
              className="block hover:underline"
            >
              <h3 className="truncate text-base font-semibold text-amber-50">
                {course.name}
              </h3>
            </Link>
            <p className="mt-1 text-xs text-amber-200/60">
              {course.holes} holes • par {course.par}
            </p>
          </div>

          <div className="text-xs">
            <TeeSummary course={course} />
          </div>

          <div className="space-y-1">
            <RecordPill label="Tips" score={course.tipsRecordScore} player={course.tipsRecordPlayer} />
            <RecordPill label="SGT" score={course.sgtRecordScore} player={course.sgtRecordPlayer} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowScoreCard(true)}
              className="h-8 w-8 border-amber-900/30 text-amber-100/90 hover:bg-slate-800/40"
              title="Scorecard"
            >
              <FileText className="h-4 w-4" />
            </Button>
            {course.sgtYoutubeUrl ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowYouTube(true)}
                className="h-8 w-8 border-amber-900/30 text-amber-100/90 hover:bg-slate-800/40"
                title="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </Button>
            ) : null}
            <RecordAttemptMenu
              hasSgtId={hasSgtId}
              onAttempt={openRecordAttempt}
            />
          </div>
        </div>
      </div>

      {showScoreCard && scoreCardData ? (
        <div onClick={(e) => e.preventDefault()}>
          <ScoreCard data={scoreCardData} onClose={() => setShowScoreCard(false)} />
        </div>
      ) : null}

      {showYouTube && course.sgtYoutubeUrl ? (
        <div onClick={(e) => e.preventDefault()}>
          <YouTubeEmbed
            url={course.sgtYoutubeUrl}
            onClose={() => setShowYouTube(false)}
          />
        </div>
      ) : null}
    </>
  );
};

const CourseListView: React.FC<CourseListViewProps> = ({ courses }) => {
  const location = useLocation();
  return (
    <div className="rounded-lg border border-slate-700/35 bg-slate-950/20">
      <div className="hidden lg:grid lg:grid-cols-[minmax(320px,1fr)_200px_320px_220px] px-3 py-2 text-[11px] uppercase tracking-wider text-amber-200/50 gap-x-4 border-b border-slate-700/35">
        <span className="text-left">Course</span>
        <span className="text-center">Tee</span>
        <span className="text-center">Records</span>
        <span className="text-right">Actions</span>
      </div>
      {courses.map((course) => (
        <CourseListRow
          key={course.id}
          course={course}
          search={location.search}
        />
      ))}
    </div>
  );
};

export default CourseListView;
