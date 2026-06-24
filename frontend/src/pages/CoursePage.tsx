import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseById, fetchCourseRecords } from "@/api/useApi";
import GolfCourseViewer from "@/components/GolfCourseViewer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Target, Circle } from "lucide-react";
import { ScoreCard } from "@/components/ScoreCard";
import { CourseRecordsView } from "@/components/CourseRecordsView";
import { CourseWithData, CourseRecordType, ScoreCardData } from "@/types";
import { useCalculator } from "@/contexts/CalculatorContext";
import { getSgtSplashUrl } from "@/lib/sgt-assets";

// Reuse the transform function from CourseCardView
const transformToScoreCardData = (
  courseData: CourseWithData
): ScoreCardData => {
  // skeleton courses have no gkData
  const enabledHoles = courseData.gkData?.Holes.filter((h) => h.Enabled) ?? [];

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
  const [searchParams] = useSearchParams();
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [recordType, setRecordType] = useState<CourseRecordType>("CR");
  const { setCurrentCourse, setAltitudeFromCourse, putting, updatePutting } = useCalculator();

  const { stimp } = putting;

  // Get the search params from the previous location state or default to empty string
  const previousSearch = location.state?.search || "";

  // Restore stimp from URL param on mount
  useEffect(() => {
    const stimpParam = searchParams.get("stimp");
    if (stimpParam) {
      const stimpValue = parseInt(stimpParam, 10);
      if ([10, 11, 12, 13].includes(stimpValue) && stimpValue !== stimp) {
        updatePutting({ stimp: stimpValue });
      }
    }
  }, []); // Only run on mount

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourseById(Number(courseId)),
    enabled: !!courseId,
  });

  // A skeleton course is manifest-only: it has an sgtId and records on SGT but
  // no GKD/hole/tee data yet (holes === 0, gkData null).
  const isSkeleton = !!course && (!course.gkData || course.holes === 0);
  const sgtId = course?.sgtId ?? "";

  const {
    data: recordsData,
    isLoading: recordsLoading,
    error: recordsError,
  } = useQuery({
    queryKey: ["courseRecords", sgtId, recordType],
    queryFn: () => fetchCourseRecords(sgtId, recordType),
    enabled: isSkeleton && !!sgtId,
  });

  if (isLoading) return <div className="text-center py-12 text-amber-100/50">Loading course...</div>;
  if (error) return <div className="text-center py-12 text-red-400/70">Error loading course data</div>;
  if (!course) return null;

  const backButton = (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className="text-amber-100/70 hover:text-amber-50 hover:bg-emerald-900/30 -ml-2 h-8 px-2"
    >
      <Link to={`/courses${previousSearch}`} className="flex items-center gap-1">
        <ChevronLeft className="h-4 w-4" />
        <span className="whitespace-nowrap text-sm">Back to Courses</span>
      </Link>
    </Button>
  );

  if (isSkeleton) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-wrap items-center justify-between">{backButton}</div>

        <div className="overflow-hidden rounded-lg border border-slate-700/40 bg-slate-950/30">
          <div className="relative h-48 w-full overflow-hidden sm:h-64">
            <img
              src={getSgtSplashUrl(course.sgtSplashUrl)}
              alt={`${course.name} splash`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-wide text-amber-50">
                  {course.name}
                </h1>
                <span className="rounded-md border border-amber-700/40 bg-amber-900/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200/80">
                  Records only
                </span>
              </div>
              {course.location && (
                <p className="mt-1 text-sm italic text-amber-100/70">
                  {course.location}
                  {course.country ? `, ${course.country}` : ""}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4 p-4 sm:p-6">
            <div className="rounded-md border border-amber-900/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-100/70">
              Full course data not yet available — this course has records on SGT
              but its hole, tee, and scorecard data haven't been ingested yet.
            </div>

            {(course.designer || course.par > 0 || course.description) && (
              <div className="space-y-1 text-sm text-amber-100/70">
                {course.designer && (
                  <p>
                    <span className="text-amber-200/55">Designer:</span>{" "}
                    {course.designer}
                  </p>
                )}
                {course.par > 0 && (
                  <p>
                    <span className="text-amber-200/55">Par:</span> {course.par}
                  </p>
                )}
                {course.description && (
                  <p className="italic text-amber-100/55">{course.description}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {sgtId && (
          <div className="overflow-x-auto rounded-lg border border-slate-700/40 bg-slate-950/30 py-4">
            <CourseRecordsView
              data={recordsData}
              isLoading={recordsLoading}
              error={recordsError as Error | null}
              recordType={recordType}
              onRecordTypeChange={setRecordType}
              sgtId={sgtId}
              courseId={course.id}
            />
          </div>
        )}
      </div>
    );
  }

  const scoreCardData = transformToScoreCardData(course);

  const handleNavigateToSuggester = () => {
    setCurrentCourse({
      courseId: course.id,
      courseName: course.name,
      altitude: course.altitude,
    });
    setAltitudeFromCourse(course.altitude);
    navigate(`/suggester?course=${course.id}&stimp=${stimp}`);
  };

  const handleNavigateToPutting = () => {
    setCurrentCourse({
      courseId: course.id,
      courseName: course.name,
      altitude: course.altitude,
    });
    navigate(`/putting?course=${course.id}&stimp=${stimp}`);
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
