import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses, fetchCourseAttributes } from "@/api/useApi";
import CourseCardView from "@/components/CourseCardView";
import AdvancedFilterPopup, {
  DEFAULT_ADVANCED_FILTERS,
  countActiveFilters,
  MIN_TEEBOX_LENGTH,
  MAX_TEEBOX_LENGTH,
  MIN_ALTITUDE,
  MAX_ALTITUDE,
  MIN_DIFFICULTY,
  MAX_DIFFICULTY,
  MIN_PAR,
  MAX_PAR,
} from "@/components/AdvancedFilterPopup";
import { Button } from "@/components/ui/button";
import { FilterIcon, Search, ArrowUpNarrowWide, ArrowDownWideNarrow, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdvancedFilters, type Course, type TeeBox } from "@/types";
import { gradeTeeBox } from "@/components/course-data";
import { useSearchParams } from "react-router-dom";

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

  const { data: attributes = [] } = useQuery({
    queryKey: ["courseAttributes"],
    queryFn: fetchCourseAttributes,
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

  const clearFilter = (filterKey: string, attributeId?: number) => {
    setAdvancedFilters((prev) => {
      const updated = { ...prev };
      switch (filterKey) {
        case "teeboxLength":
          updated.teeboxLength = [MIN_TEEBOX_LENGTH, MAX_TEEBOX_LENGTH];
          break;
        case "altitude":
          updated.altitude = [MIN_ALTITUDE, MAX_ALTITUDE];
          break;
        case "difficulty":
          updated.difficulty = [MIN_DIFFICULTY, MAX_DIFFICULTY];
          break;
        case "par":
          updated.par = [MIN_PAR, MAX_PAR];
          break;
        case "onlyEighteenHoles":
          updated.onlyEighteenHoles = false;
          break;
        case "isPar3":
          updated.isPar3 = undefined;
          break;
        case "rangeEnabled":
          updated.rangeEnabled = undefined;
          break;
        case "attribute":
          if (attributeId !== undefined) {
            updated.selectedAttributes = prev.selectedAttributes.filter(
              (id) => id !== attributeId
            );
          }
          break;
      }
      return updated;
    });
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
        course.rangeEnabled === advancedFilters.rangeEnabled) &&
      (!advancedFilters.selectedAttributes ||
        advancedFilters.selectedAttributes.length === 0 ||
        advancedFilters.selectedAttributes.every((attrId) =>
          course.attributes.some((attr) => attr.id === attrId)
        ));

    return textFilter && advancedFilter;
  });

  const sortedCourses = sortCourses(
    filteredCourses || [],
    sortOption,
    sortOrder
  );

  // Configurable batch size for lazy loading (you can change the value here)
  const BATCH_SIZE = 10;
  // State to control the number of courses rendered at any given time
  const [visibleCoursesCount, setVisibleCoursesCount] = useState(BATCH_SIZE);
  // Ref for the loader element at the end of the list
  const loaderRef = useRef<HTMLDivElement>(null);

  // New effect: Uses IntersectionObserver to load the next batch of courses when the loader element is visible.
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load the next batch of courses (but do not exceed the available courses)
            setVisibleCoursesCount((prev) =>
              Math.min(prev + BATCH_SIZE, sortedCourses.length)
            );
          }
        });
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    observer.observe(loader);
    return () => {
      observer.disconnect();
    };
  }, [sortedCourses]);

  const activeFilterCount = countActiveFilters(advancedFilters);
  const hasActiveFilters = activeFilterCount > 0;

  if (isLoading) return <div className="text-amber-100/80">Loading...</div>;
  if (error) return <div className="text-red-400/80">Error loading courses</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-amber-50">Golf Courses</h1>
          <p className="text-xs tracking-wider uppercase text-amber-200/50">
            {filteredCourses?.length || 0} courses available
          </p>
        </div>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          className={hasActiveFilters
            ? "bg-emerald-800/70 hover:bg-emerald-700/70 border-emerald-700/50 text-amber-50"
            : "bg-slate-800/40 backdrop-blur-sm border-amber-900/30 text-amber-100/90 hover:bg-slate-700/50 hover:text-amber-50"}
          onClick={() => setShowAdvancedFilter(true)}
        >
          <FilterIcon className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs bg-amber-700/60 text-amber-50 border-none">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/50" />
          <input
            type="text"
            placeholder="Search courses..."
            value={filterText}
            onChange={handleFilterChange}
            className="p-2 pl-9 rounded-lg bg-slate-800/40 backdrop-blur-sm border border-amber-900/30 text-amber-100 placeholder:text-amber-200/40 w-full focus:outline-none focus:border-amber-700/50 focus:ring-1 focus:ring-amber-700/30"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm text-amber-200/50 whitespace-nowrap hidden sm:inline">Sort by:</span>
          <select
            id="sortOption"
            value={sortOption}
            onChange={handleSortChange}
            className="p-2 rounded-lg bg-slate-800/40 backdrop-blur-sm border border-amber-900/30 text-amber-100 flex-1 sm:flex-none min-w-[200px] focus:outline-none focus:border-amber-700/50"
          >
            <option value="alphabetical">Alphabetical</option>
            <option value="updatedDate">Last Update Time</option>
            <option value="difficulty">Difficulty</option>
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
          <Button
            onClick={handleSortOrderChange}
            className="whitespace-nowrap bg-slate-800/40 backdrop-blur-sm border-amber-900/30 text-amber-100/90 hover:bg-slate-700/50 hover:text-amber-50"
            variant="outline"
            size="icon"
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? (
              <ArrowUpNarrowWide className="h-4 w-4" />
            ) : (
              <ArrowDownWideNarrow className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {advancedFilters.teeboxLength[0] !== MIN_TEEBOX_LENGTH ||
          advancedFilters.teeboxLength[1] !== MAX_TEEBOX_LENGTH ? (
            <Badge variant="secondary" className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-emerald-900/50 text-amber-100/80 border border-emerald-800/30">
              Length: {advancedFilters.teeboxLength[0]}-{advancedFilters.teeboxLength[1]}
              <button
                onClick={() => clearFilter("teeboxLength")}
                className="ml-1 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}
          {advancedFilters.altitude[0] !== MIN_ALTITUDE ||
          advancedFilters.altitude[1] !== MAX_ALTITUDE ? (
            <Badge variant="secondary" className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-emerald-900/50 text-amber-100/80 border border-emerald-800/30">
              Altitude: {advancedFilters.altitude[0]}-{advancedFilters.altitude[1]}ft
              <button
                onClick={() => clearFilter("altitude")}
                className="ml-1 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}
          {advancedFilters.difficulty[0] !== MIN_DIFFICULTY ||
          advancedFilters.difficulty[1] !== MAX_DIFFICULTY ? (
            <Badge variant="secondary" className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-emerald-900/50 text-amber-100/80 border border-emerald-800/30">
              Difficulty: {advancedFilters.difficulty[0]}-{advancedFilters.difficulty[1]}
              <button
                onClick={() => clearFilter("difficulty")}
                className="ml-1 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}
          {advancedFilters.par[0] !== MIN_PAR ||
          advancedFilters.par[1] !== MAX_PAR ? (
            <Badge variant="secondary" className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-emerald-900/50 text-amber-100/80 border border-emerald-800/30">
              Par: {advancedFilters.par[0]}-{advancedFilters.par[1]}
              <button
                onClick={() => clearFilter("par")}
                className="ml-1 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ) : null}
          {advancedFilters.onlyEighteenHoles && (
            <Badge variant="secondary" className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-emerald-900/50 text-amber-100/80 border border-emerald-800/30">
              18 holes only
              <button
                onClick={() => clearFilter("onlyEighteenHoles")}
                className="ml-1 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {advancedFilters.isPar3 !== undefined && (
            <Badge variant="secondary" className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-emerald-900/50 text-amber-100/80 border border-emerald-800/30">
              Par 3 courses
              <button
                onClick={() => clearFilter("isPar3")}
                className="ml-1 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {advancedFilters.rangeEnabled !== undefined && (
            <Badge variant="secondary" className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-emerald-900/50 text-amber-100/80 border border-emerald-800/30">
              Has driving range
              <button
                onClick={() => clearFilter("rangeEnabled")}
                className="ml-1 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {advancedFilters.selectedAttributes.map((attrId) => {
            const attr = attributes.find((a) => a.id === attrId);
            if (!attr) return null;
            return (
              <Badge key={attrId} variant="secondary" className="flex items-center gap-1 text-[10px] py-0.5 px-2 bg-emerald-900/50 text-amber-100/80 border border-emerald-800/30">
                {attr.name}
                <button
                  onClick={() => clearFilter("attribute", attrId)}
                  className="ml-1 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <button
            onClick={() => setAdvancedFilters(DEFAULT_ADVANCED_FILTERS)}
            className="text-sm text-amber-200/50 hover:text-amber-100 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Pass only the first "visibleCoursesCount" courses to the CourseCardView */}
      <CourseCardView courses={sortedCourses.slice(0, visibleCoursesCount)} />

      {showAdvancedFilter && (
        <AdvancedFilterPopup
          filters={advancedFilters}
          onFilterChange={handleAdvancedFilterChange}
          onClose={() => setShowAdvancedFilter(false)}
        />
      )}

      {/* Loader element for triggering the Intersection Observer */}
      <div ref={loaderRef} className="h-4" />
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
