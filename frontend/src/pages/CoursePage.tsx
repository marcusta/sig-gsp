import React, { useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseById } from "@/api/useApi";
import GolfCourseViewer from "@/components/GolfCourseViewer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { ScoreCard } from "@/components/ScoreCard";
import { CourseWithData, ScoreCardData } from "@/types";

// Reuse the transform function from CourseCardView
const transformToScoreCardData = (
  courseData: CourseWithData
): ScoreCardData => {
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

const CoursePage: React.FC = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const [showScoreCard, setShowScoreCard] = useState(false);

  // Get the search params from the previous location state or default to empty string
  const previousSearch = location.state?.search || "";

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourseById(Number(courseId)),
    enabled: !!courseId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading course data</div>;
  if (!course) return null;

  const scoreCardData = transformToScoreCardData(course);

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          asChild
          variant="ghost"
          className="text-white hover:text-white/80"
        >
          <Link
            to={`/courses${previousSearch}`}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="whitespace-nowrap">Back to Courses</span>
          </Link>
        </Button>
      </div>

      <GolfCourseViewer
        course={course}
        onShowScoreCard={() => setShowScoreCard(true)}
      />

      {showScoreCard && (
        <ScoreCard
          data={scoreCardData}
          onClose={() => setShowScoreCard(false)}
        />
      )}
    </div>
  );
};

export default CoursePage;
