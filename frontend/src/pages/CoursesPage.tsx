import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/api/useApi";
import CourseCardView from "@/components/CourseCardView";
import AdvancedFilterPopup, {
  MIN_PAR,
  MAX_PAR,
} from "@/components/AdvancedFilterPopup";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "lucide-react";
import { AdvancedFilters, type Course, type TeeBox } from "@/types";
import { gradeTeeBox } from "@/components/course-data";

const CoursesPage: React.FC = () => {
  const [filterText, setFilterText] = useState("");
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    teeboxLength: [0, 8000],
    altitude: [0, 10000],
    difficulty: [0, 20],
    par: [MIN_PAR, MAX_PAR],
    onlyEighteenHoles: false,
  });

  const [sortOption, setSortOption] = useState<
    | "alphabetical"
    | "updatedDate"
    | "longestTee"
    | "par3Tee"
    | "altitude"
    | "difficulty"
    | "rating"
  >("alphabetical");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const {
    data: courses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as typeof sortOption);
  };

  const handleSortOrderChange = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const sortCourses = (coursesList: Course[]) => {
    return [...coursesList].sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      switch (sortOption) {
        case "updatedDate":
          return (
            multiplier *
            (new Date(a.updatedDate).getTime() -
              new Date(b.updatedDate).getTime())
          );
        case "longestTee":
          return (
            multiplier *
            (Math.max(...a.tees.map((t: TeeBox) => t.length)) -
              Math.max(...b.tees.map((t: TeeBox) => t.length)))
          );
        case "par3Tee":
          const aPar3 =
            a.tees.find((t: TeeBox) => t.name === "Par3")?.length ||
            Math.max(...a.tees.map((t: TeeBox) => t.length));
          const bPar3 =
            b.tees.find((t: TeeBox) => t.name === "Par3")?.length ||
            Math.max(...b.tees.map((t: TeeBox) => t.length));
          return multiplier * (aPar3 - bPar3);
        case "altitude":
          return multiplier * (a.altitude - b.altitude);
        case "difficulty":
          const aGrade = gradeTeeBox(a.tees[0], a.altitude, a.par); // Grading the longest teebox
          const bGrade = gradeTeeBox(b.tees[0], b.altitude, b.par);
          return multiplier * (aGrade - bGrade);
        case "rating":
          const aTeeBox = a.tees.sort((a, b) => b.length - a.length)[0];
          const bTeeBox = b.tees.sort((a, b) => b.length - a.length)[0];

          // Check for invalid rating or slope for aTeeBox and set default values if broken
          const aRating =
            aTeeBox.rating > 160 || aTeeBox.slope > 83
              ? 90 + 30 // default values for broken data
              : aTeeBox.rating + aTeeBox.slope;

          // Check for invalid rating or slope for bTeeBox and set default values if broken
          const bRating =
            bTeeBox.rating > 160 || bTeeBox.slope > 83
              ? 90 + 30 // default values for broken data
              : bTeeBox.rating + bTeeBox.slope;

          return multiplier * (aRating - bRating);

        case "alphabetical":
        default:
          return multiplier * a.name.localeCompare(b.name);
      }
    });
  };

  const filteredCourses = courses?.filter((course) => {
    const textFilter =
      course.name.toLowerCase().includes(filterText.toLowerCase()) ||
      course.location.toLowerCase().includes(filterText.toLowerCase()) ||
      course.holes.toString().includes(filterText) ||
      course.designer.toLowerCase().includes(filterText.toLowerCase());

    if (!course.teeBoxes || course.teeBoxes.length === 0) {
      return false;
    }

    const advancedFilter =
      course.teeBoxes[0].length >= advancedFilters.teeboxLength[0] &&
      course.teeBoxes[0].length <= advancedFilters.teeboxLength[1] &&
      course.altitude >= advancedFilters.altitude[0] &&
      course.altitude <= advancedFilters.altitude[1] &&
      course.grade >= advancedFilters.difficulty[0] &&
      course.grade <= advancedFilters.difficulty[1] &&
      course.par >= advancedFilters.par[0] &&
      course.par <= advancedFilters.par[1] &&
      (!advancedFilters.onlyEighteenHoles || course.holes === 18);

    return textFilter && advancedFilter;
  });

  console.log("filteredCourses", filteredCourses);
  const sortedCourses = sortCourses(filteredCourses || []);
  const handleAdvancedFilterChange = (newFilters: AdvancedFilters) => {
    setAdvancedFilters(newFilters);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading courses</div>;

  return (
    <div>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Filter courses"
          value={filterText}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded mr-2 flex-grow"
        />
        <Button
          onClick={() => setShowAdvancedFilter(true)}
          className="flex items-center"
        >
          <FilterIcon className="mr-2" />
          Advanced Filter
        </Button>
        <div className="flex items-center">
          <select
            id="sortOption"
            value={sortOption}
            onChange={handleSortChange}
            className="ml-2 p-2 border rounded"
          >
            <option value="alphabetical">Alphabetical</option>
            <option value="updatedDate">Last Update Time</option>
            <option value="longestTee">Longest Tee Length</option>
            <option value="par3Tee">Par 3 Tee Length</option>
            <option value="altitude">Altitude</option>
            <option value="difficulty">Difficulty</option>
            <option value="rating">Rating</option>
          </select>
          <Button onClick={handleSortOrderChange} className="ml-2">
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </Button>
        </div>
      </div>

      <CourseCardView courses={sortedCourses || []} />
      {showAdvancedFilter && (
        <AdvancedFilterPopup
          filters={advancedFilters}
          onFilterChange={handleAdvancedFilterChange}
          onClose={() => setShowAdvancedFilter(false)}
        />
      )}
    </div>
  );
};

export default CoursesPage;
