import React, { useState, useEffect } from "react";
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
import { useSearchParams } from "react-router-dom";

const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  teeboxLength: [0, 8000],
  altitude: [0, 10000],
  difficulty: [0, 20],
  par: [MIN_PAR, MAX_PAR],
  onlyEighteenHoles: false,
  isPar3: undefined,
  rangeEnabled: undefined,
};

const CoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filterText, setFilterText] = useState(
    searchParams.get("search") || ""
  );
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [sortOption, setSortOption] = useState<
    | "alphabetical"
    | "updatedDate"
    | "longestTee"
    | "par3Tee"
    | "altitude"
    | "difficulty"
    | "rating"
    | "par"
    | "largestElevationDrop"
    | "elevationDifference"
    | "waterHazards"
    | "innerOOB"
    | "islandGreens"
  >((searchParams.get("sort") as any) || "alphabetical");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("order") as "asc" | "desc") || "asc"
  );

  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(
    () => {
      try {
        const savedFilters = searchParams.get("advanced");
        return savedFilters
          ? JSON.parse(decodeURIComponent(savedFilters))
          : DEFAULT_ADVANCED_FILTERS;
      } catch {
        return DEFAULT_ADVANCED_FILTERS;
      }
    }
  );

  useEffect(() => {
    const params: Record<string, string> = {};

    if (filterText) params.search = filterText;
    if (sortOption !== "alphabetical") params.sort = sortOption;
    if (sortOrder !== "asc") params.order = sortOrder;

    if (
      JSON.stringify(advancedFilters) !==
      JSON.stringify(DEFAULT_ADVANCED_FILTERS)
    ) {
      params.advanced = encodeURIComponent(JSON.stringify(advancedFilters));
    }

    setSearchParams(params);
  }, [filterText, sortOption, sortOrder, advancedFilters, setSearchParams]);

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

    const firstTeeLength =
      course.teeBoxes?.find((tee) => tee?.length > 0)?.length || 0;

    const advancedFilter =
      ((advancedFilters.teeboxLength[0] ===
        DEFAULT_ADVANCED_FILTERS.teeboxLength[0] &&
        advancedFilters.teeboxLength[1] ===
          DEFAULT_ADVANCED_FILTERS.teeboxLength[1]) ||
        (firstTeeLength >= advancedFilters.teeboxLength[0] &&
          firstTeeLength <= advancedFilters.teeboxLength[1])) &&
      ((advancedFilters.altitude[0] === DEFAULT_ADVANCED_FILTERS.altitude[0] &&
        advancedFilters.altitude[1] === DEFAULT_ADVANCED_FILTERS.altitude[1]) ||
        (course.altitude >= advancedFilters.altitude[0] &&
          course.altitude <= advancedFilters.altitude[1])) &&
      ((advancedFilters.difficulty[0] ===
        DEFAULT_ADVANCED_FILTERS.difficulty[0] &&
        advancedFilters.difficulty[1] ===
          DEFAULT_ADVANCED_FILTERS.difficulty[1]) ||
        (course.grade >= advancedFilters.difficulty[0] &&
          course.grade <= advancedFilters.difficulty[1])) &&
      ((advancedFilters.par[0] === DEFAULT_ADVANCED_FILTERS.par[0] &&
        advancedFilters.par[1] === DEFAULT_ADVANCED_FILTERS.par[1]) ||
        (course.par >= advancedFilters.par[0] &&
          course.par <= advancedFilters.par[1])) &&
      (!advancedFilters.onlyEighteenHoles || course.holes === 18) &&
      (advancedFilters.isPar3 === undefined ||
        course.isPar3 === advancedFilters.isPar3) &&
      (advancedFilters.rangeEnabled === undefined ||
        course.rangeEnabled === advancedFilters.rangeEnabled);

    return textFilter && advancedFilter;
  });

  const sortedCourses = sortCourses(
    filteredCourses || [],
    sortOption,
    sortOrder
  );

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
          <option value="rating">Course Rating</option>
          <option value="largestElevationDrop">Largest Elevation Drop</option>
          <option value="elevationDifference">
            Average Elevation Difference
          </option>
          <option value="waterHazards">Water Hazards</option>
          <option value="innerOOB">Inner OOB</option>
          <option value="islandGreens">Island Greens</option>
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
    largestElevationDrop: (a: Course, b: Course) => {
      return a.largestElevationDrop - b.largestElevationDrop;
    },
    elevationDifference: (a: Course, b: Course) => {
      return a.averageElevationDifference - b.averageElevationDifference;
    },
    waterHazards: (a: Course, b: Course) => {
      return a.totalWaterHazards - b.totalWaterHazards;
    },
    innerOOB: (a: Course, b: Course) => {
      return a.totalInnerOOB - b.totalInnerOOB;
    },
    islandGreens: (a: Course, b: Course) => {
      return a.islandGreens - b.islandGreens;
    },
  };

  const sortFunc = sortFunctions[sortOption];
  const multiplier = sortOrder === "asc" ? 1 : -1;
  const fixAscDesc = (a: Course, b: Course) => sortFunc(a, b) * multiplier;
  return [...courses].sort(fixAscDesc);
}
