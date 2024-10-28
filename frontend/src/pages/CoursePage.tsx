import React from "react";
import { useParams } from "react-router-dom"; // Import useParams
import { useQuery } from "@tanstack/react-query";
import { fetchCourseById } from "@/api/useApi";
import GolfCourseViewer from "@/components/GolfCourseViewer";

const CoursePage: React.FC = () => {
  const { courseId } = useParams(); // Get courseId from URL params

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

  return course ? <GolfCourseViewer course={course} /> : null;
};

export default CoursePage;
