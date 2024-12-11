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
    isPar3: undefined,
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
    staleTime: 5 * 60 * 1000,
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

  const handleAdvancedFilterChange = (newFilters: AdvancedFilters) => {
    setAdvancedFilters(newFilters);
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
      (!advancedFilters.onlyEighteenHoles || course.holes === 18) &&
      (advancedFilters.isPar3 === undefined ||
        course.isPar3 === advancedFilters.isPar3);

    return textFilter && advancedFilter;
  });

  const sortedCourses = sortCourses(
    filteredCourses || [],
    sortOption,
    sortOrder
  );

  console.log("filteredCourses", filteredCourses);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading courses</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Golf Courses</h1>
          <p className="text-slate-400">
            {filteredCourses?.length || 0} courses available
          </p>
        </div>
        <Button
          variant="outline"
          className="text-white"
          onClick={() => setShowAdvancedFilter(true)}
        >
          <FilterIcon className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Filter courses"
          value={filterText}
          onChange={handleFilterChange}
          className="flex-grow p-2 border border-gray-300 rounded bg-background text-foreground"
        />
        <select
          id="sortOption"
          value={sortOption}
          onChange={handleSortChange}
          className="p-2 border rounded bg-background text-foreground"
        >
          <option value="alphabetical">Alphabetical</option>
          <option value="updatedDate">Last Update Time</option>
          <option value="longestTee">Longest Tee Length</option>
          <option value="par3Tee">Par 3 Tee Length</option>
          <option value="altitude">Altitude</option>
          <option value="difficulty">Difficulty</option>
          <option value="rating">Rating</option>
        </select>
        <Button onClick={handleSortOrderChange}>
          {sortOrder === "asc" ? "Asc" : "Desc"}
        </Button>
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

function sortCourses(courses: Course[], sortOption: string, sortOrder: string) {
  const sortFunctions: Record<string, (a: Course, b: Course) => number> = {
    rating: (a: Course, b: Course) => {
      const aTeeBox = a.teeBoxes.sort((a, b) => b.length - a.length)[0];
      const bTeeBox = b.teeBoxes.sort((a, b) => b.length - a.length)[0];

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

      return aRating - bRating;
    },
    updatedDate: (a: Course, b: Course) => {
      return (
        new Date(a.updatedDate).getTime() - new Date(b.updatedDate).getTime()
      );
    },
    longestTee: (a: Course, b: Course) => {
      return (
        Math.max(...a.teeBoxes.map((t: TeeBox) => t.length)) -
        Math.max(...b.teeBoxes.map((t: TeeBox) => t.length))
      );
    },
    par3Tee: (a: Course, b: Course) => {
      const aPar3 =
        a.teeBoxes.find((t: TeeBox) => t.name === "Par3")?.length ||
        Math.max(...a.teeBoxes.map((t: TeeBox) => t.length));
      const bPar3 =
        b.teeBoxes.find((t: TeeBox) => t.name === "Par3")?.length ||
        Math.max(...b.teeBoxes.map((t: TeeBox) => t.length));
      return aPar3 - bPar3;
    },
    altitude: (a: Course, b: Course) => {
      return a.altitude - b.altitude;
    },
    difficulty: (a: Course, b: Course) => {
      const aGrade = gradeTeeBox(a.teeBoxes[0], a.altitude, a.par); // Grading the longest teebox
      const bGrade = gradeTeeBox(b.teeBoxes[0], b.altitude, b.par);
      return aGrade - bGrade;
    },
    alphabetical: (a: Course, b: Course) => {
      return a.name.localeCompare(b.name);
    },
  };

  const sortFunc = sortFunctions[sortOption];
  const multiplier = sortOrder === "asc" ? 1 : -1;
  const fixAscDesc = (a: Course, b: Course) => sortFunc(a, b) * multiplier;
  return [...courses].sort(fixAscDesc);
}
