import React, { useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseById } from "@/api/useApi";
import GolfCourseViewer from "@/components/GolfCourseViewer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Target, Circle } from "lucide-react";
import { ScoreCard } from "@/components/ScoreCard";
import { CourseWithData, ScoreCardData } from "@/types";
import { useCalculator } from "@/contexts/CalculatorContext";

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

const CoursePage: React.FC = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showScoreCard, setShowScoreCard] = useState(false);
  const { setCurrentCourse, setAltitudeFromCourse } = useCalculator();

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

  if (isLoading) return <div className="text-center py-12 text-amber-100/50">Loading course...</div>;
  if (error) return <div className="text-center py-12 text-red-400/70">Error loading course data</div>;
  if (!course) return null;

  const scoreCardData = transformToScoreCardData(course);

  const handleNavigateToSuggester = () => {
    setCurrentCourse({
      courseId: course.id,
      courseName: course.name,
      altitude: course.altitude,
    });
    setAltitudeFromCourse(course.altitude);
    navigate("/suggester");
  };

  const handleNavigateToPutting = () => {
    setCurrentCourse({
      courseId: course.id,
      courseName: course.name,
      altitude: course.altitude,
    });
    navigate("/putting");
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-amber-100/70 hover:text-amber-50 hover:bg-emerald-900/30 -ml-2 h-8 px-2"
        >
          <Link
            to={`/courses${previousSearch}`}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="whitespace-nowrap text-sm">Back to Courses</span>
          </Link>
        </Button>

        {/* Calculator navigation */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNavigateToSuggester}
            className="text-amber-100/70 hover:text-amber-50 hover:bg-emerald-900/30 h-8 px-2"
          >
            <Target className="h-4 w-4 mr-1" />
            <span className="text-sm">Shot</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNavigateToPutting}
            className="text-amber-100/70 hover:text-amber-50 hover:bg-emerald-900/30 h-8 px-2"
          >
            <Circle className="h-4 w-4 mr-1" />
            <span className="text-sm">Putt</span>
          </Button>
        </div>
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
