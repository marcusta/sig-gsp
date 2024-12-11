import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "@/types";
import {
  useUnits,
  convertDistance,
  convertAltitude,
  getDistanceUnit,
  getAltitudeUnit,
} from "@/contexts/UnitContext";
import LazyLoad from "./LazyLoad";
import { Skeleton } from "@/components/ui/skeleton";

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

const CourseCard: React.FC<{ course: Course; onClick: () => void }> = ({
  course,
  onClick,
}) => {
  const { unitSystem } = useUnits();
  const [imageLoaded, setImageLoaded] = useState(false);

  const getImageUrl = (sgtSplashUrl: string | null | undefined): string => {
    const baseUrl = "https://simulatorgolftour.com";
    return sgtSplashUrl
      ? `${baseUrl}${sgtSplashUrl}`
      : `${baseUrl}/public/home/tour-bg.jpg`;
  };

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer shadow-lg"
      style={{ minHeight: "400px" }}
    >
      <CardHeader>
        <CardTitle>{course.name}</CardTitle>
        <p className="text-sm italic text-muted-foreground">
          {course.location} by <b>{course.designer}</b>
          <br />
          {course.isPar3
            ? `${course.holes} par 3 holes`
            : `${course.holes} holes par ${course.par}`}{" "}
          at {convertAltitude(course.altitude / 3.28084, unitSystem).toFixed(0)}
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
  );
};

const CourseCardView: React.FC<CardViewProps> = ({ courses }) => {
  const navigate = useNavigate();

  const handleCardClick = (id: number) => {
    navigate(`/course/${id}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <LazyLoad key={course.id}>
          <CourseCard
            course={course}
            onClick={() => handleCardClick(course.id)}
          />
        </LazyLoad>
      ))}
    </div>
  );
};

export default CourseCardView;
