import React from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseById } from "@/api/useApi";
import GolfCourseViewer from "@/components/GolfCourseViewer";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const CoursePage: React.FC = () => {
  const { courseId } = useParams();
  const location = useLocation();

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

  return (
    <div className="space-y-6">
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
          Back to Courses
        </Link>
      </Button>
      {course ? <GolfCourseViewer course={course} /> : null}
    </div>
  );
};

export default CoursePage;
