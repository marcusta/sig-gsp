import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "@/types";

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

const CourseCardView: React.FC<CardViewProps> = ({ courses }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleCardClick = (id: number) => {
    navigate(`/course/${id}`); // Navigate to CoursePage with the course ID
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <Card
          key={course.id}
          onClick={() => handleCardClick(course.id)}
          className="cursor-pointer shadow-lg"
        >
          {" "}
          {/* Add onClick handler */}
          <CardHeader>
            <CardTitle>{course.name}</CardTitle>
            <p className="text-sm italic text-muted-foreground">
              {course.location} by <b>{course.designer}</b>
              <br />
              {course.isPar3
                ? `${course.holes} par 3 holes`
                : `${course.holes} holes par ${course.par}`}{" "}
              at {course.altitude} ft
              {course.opcdVersion && (
                <span className="text-xs text-muted-foreground">
                  , {course.opcdVersion}
                </span>
              )}
              <br />
            </p>
          </CardHeader>
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
                      {tee.length.toFixed(0)}m, {tee.rating}/{tee.slope}
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CourseCardView;
