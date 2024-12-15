import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    courseName: courseData.name,
    location: courseData.location,
    teeBoxes: teeBoxes.sort((a, b) => b.totalLength - a.totalLength),
    sgtSplashUrl: courseData.sgtSplashUrl || "",

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
      <Card
        className="cursor-pointer shadow-lg relative"
        style={{ minHeight: "400px" }}
      >
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={handleScoreCardClick}
            className="h-8 w-8"
          >
            <FileText className="h-4 w-4" />
          </Button>
          {course.sgtYoutubeUrl && (
            <Button
              variant="secondary"
              size="icon"
              onClick={handleYouTubeClick}
              className="h-8 w-8"
            >
              <Youtube className="h-4 w-4" />
            </Button>
          )}
        </div>

        <CardHeader>
          <CardTitle>{course.name}</CardTitle>
          <p className="text-sm italic text-muted-foreground">
            {course.location} by <b>{course.designer}</b>
            <br />
            {course.isPar3
              ? `${course.holes} par 3 holes`
              : `${course.holes} holes par ${course.par}`}{" "}
            at{" "}
            {convertAltitude(course.altitude / 3.28084, unitSystem).toFixed(0)}
            {getAltitudeUnit(unitSystem)}
            {course.opcdVersion && (
              <span className="text-xs text-muted-foreground">
                , {course.opcdVersion}
              </span>
            )}
            <br />
          </p>
        </CardHeader>

        <div className="relative w-full h-48 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0">
              <Skeleton className="w-full h-full" />
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
        </div>

        <CardContent className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
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
                    className={`text-sm px-2 py-1 rounded-md inline-block ${getTeeColor(
                      tee.name
                    )} ${getTextColor(tee.name)}`}
                  >
                    {convertDistance(tee.length, unitSystem).toFixed(0)}
                    {getDistanceUnit(unitSystem)}, {tee.rating}/{tee.slope}
                  </div>
                ))}
          </div>
        </CardContent>
      </Card>

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
