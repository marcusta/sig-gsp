import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Course, CourseWithData, ScoreCardData } from "@/types";
import {
  useUnits,
  convertDistance,
  convertAltitude,
  getDistanceUnit,
  getAltitudeUnit,
} from "@/contexts/UnitContext";
import LazyLoad from "./LazyLoad";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Youtube } from "lucide-react";
import { Button } from "./ui/button";
import { ScoreCard } from "./ScoreCard";
import { useQuery } from "@tanstack/react-query";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { fetchCourseById } from "@/api/useApi";

interface CardViewProps {
  courses: Course[];
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

const getTextColor = (teeName: string): string => {
  const name = teeName.toLowerCase();
  // Most muted backgrounds need light text now
  if (name.includes("white")) return "text-slate-800";
  if (name.includes("yellow") || name.includes("gold")) return "text-slate-900";
  return "text-amber-50/90";
};

const transformToScoreCardData = (
  courseData: CourseWithData
): ScoreCardData => {
  // Get all enabled holes
  const enabledHoles = courseData.gkData.Holes.filter((h) => h.Enabled);

  // Transform tee boxes
  const teeBoxes = courseData.teeBoxes.map((tee) => {
    // Find corresponding holes data for this tee
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

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const { unitSystem } = useUnits();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);

  const { data: courseData } = useQuery<CourseWithData>({
    queryKey: ["course", course.id],
    queryFn: () => fetchCourseById(course.id),
    enabled: showScoreCard,
  });

  const scoreCardData = courseData
    ? transformToScoreCardData(courseData)
    : null;

  const getImageUrl = (sgtSplashUrl: string | null | undefined): string => {
    const baseUrl = "https://simulatorgolftour.com";
    return sgtSplashUrl
      ? `${baseUrl}${sgtSplashUrl}`
      : `${baseUrl}/public/home/tour-bg.jpg`;
  };

  const handleScoreCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowScoreCard(true);
  };

  const handleYouTubeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowYouTube(true);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowScoreCard(false);
        setShowYouTube(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      <div
        className="cursor-pointer relative rounded-lg overflow-hidden shadow-2xl border border-slate-600/30"
        style={{
          minHeight: "400px",
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
          className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay z-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Vignette effect */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            boxShadow: "inset 0 0 60px 15px rgba(0,0,0,0.25)",
          }}
        />

        <div className="absolute top-2 right-2 z-30 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleScoreCardClick}
            className="h-8 w-8 bg-slate-800/60 backdrop-blur-sm border border-amber-900/30 text-amber-100/90 hover:bg-slate-700/70 hover:text-amber-50"
          >
            <FileText className="h-4 w-4" />
          </Button>
          {course.sgtYoutubeUrl && (
            <Button
              variant="secondary"
              size="icon"
              onClick={handleYouTubeClick}
              className="h-8 w-8 bg-slate-800/60 backdrop-blur-sm border border-amber-900/30 text-amber-100/90 hover:bg-slate-700/70 hover:text-amber-50"
            >
              <Youtube className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="relative z-10 p-4">
          <h3 className="text-lg font-semibold tracking-wide text-amber-50">{course.name}</h3>
          <p className="text-xs text-amber-100/50 leading-relaxed italic mt-1">
            {course.location} by <span className="font-medium text-amber-100/70">{course.designer}</span>
            <br />
            {course.isPar3
              ? `${course.holes} par 3 holes`
              : `${course.holes} holes par ${course.par}`}{" "}
            at{" "}
            {convertAltitude(course.altitude / 3.28084, unitSystem).toFixed(0)}
            {getAltitudeUnit(unitSystem)}
            {course.opcdVersion && (
              <span className="text-xs text-amber-200/40">
                , {course.opcdVersion}
              </span>
            )}
          </p>
        </div>

        <div className="relative w-full h-48 overflow-hidden z-10">
          {!imageLoaded && (
            <div className="absolute inset-0">
              <Skeleton className="w-full h-full bg-slate-700/50" />
            </div>
          )}
          <img
            src={getImageUrl(course.sgtSplashUrl)}
            alt={`${course.name} splash`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Image overlay for film look */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 p-4 pt-3">
          <div className="flex flex-wrap gap-2">
            {course.teeBoxes &&
              course.teeBoxes
                .sort((a, b) => b.length - a.length)
                .filter(
                  (tee, index, self) =>
                    index === self.findIndex((t) => t.name === tee.name)
                )
                .map((tee, index) => (
                  <div
                    key={index}
                    className={`text-xs px-2 py-1 rounded-md backdrop-blur-[1px] ${getTeeColor(
                      tee.name
                    )} ${getTextColor(tee.name)}`}
                  >
                    {convertDistance(tee.length, unitSystem).toFixed(0)}
                    {getDistanceUnit(unitSystem)}, {tee.rating}/{tee.slope}
                  </div>
                ))}
          </div>
        </div>
      </div>

      {showScoreCard && scoreCardData && (
        <div onClick={(e) => e.preventDefault()}>
          <ScoreCard
            data={scoreCardData}
            onClose={() => setShowScoreCard(false)}
          />
        </div>
      )}

      {showYouTube && course.sgtYoutubeUrl && (
        <div onClick={(e) => e.preventDefault()}>
          <YouTubeEmbed
            url={course.sgtYoutubeUrl}
            onClose={() => setShowYouTube(false)}
          />
        </div>
      )}
    </>
  );
};

const CourseCardView: React.FC<CardViewProps> = ({ courses }) => {
  const location = useLocation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <Link
          key={course.id}
          to={`/course/${course.id}`}
          state={{ search: location.search }}
        >
          <LazyLoad>
            <CourseCard course={course} />
          </LazyLoad>
        </Link>
      ))}
    </div>
  );
};

export default CourseCardView;
