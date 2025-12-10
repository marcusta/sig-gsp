import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { fetchRecordActivity } from "@/api/useApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Trophy,
  Zap,
  TrendingUp,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { RecordChangeEvent } from "@/types";

const ITEMS_PER_PAGE = 30;

export default function ActivityPage() {
  const navigate = useNavigate();
  const [daysBack, setDaysBack] = useState("30");
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["recordActivity", daysBack, page],
    queryFn: () =>
      fetchRecordActivity(ITEMS_PER_PAGE, page * ITEMS_PER_PAGE, Number(daysBack)),
  });

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "BROKEN":
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case "IMPROVED":
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case "INITIAL":
        return <Trophy className="h-4 w-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getChangeLabel = (changeType: string) => {
    switch (changeType) {
      case "BROKEN":
        return (
          <Badge className="bg-yellow-600/30 text-yellow-400 border border-yellow-600/40 text-[10px] sm:text-xs">
            Record Broken
          </Badge>
        );
      case "IMPROVED":
        return (
          <Badge className="bg-emerald-700/30 text-emerald-400 border border-emerald-600/40 text-[10px] sm:text-xs">
            Self Improved
          </Badge>
        );
      case "INITIAL":
        return (
          <Badge className="bg-blue-700/30 text-blue-400 border border-blue-600/40 text-[10px] sm:text-xs">
            First Record
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCountryFlag = (countryCode: string | null) => {
    if (!countryCode) return null;
    return (
      <span
        className={`fi fi-${countryCode.toLowerCase()} mr-1`}
        title={countryCode.toUpperCase()}
      />
    );
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Last day";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatScore = (score: string) => {
    const num = parseInt(score, 10);
    if (isNaN(num) || num === 0) return "E";
    return num > 0 ? `+${num}` : score;
  };

  const getScoreColor = (score: string) => {
    const num = parseInt(score, 10);
    if (isNaN(num) || num === 0) return "text-white";
    if (num < -10) return "text-emerald-400";
    if (num < 0) return "text-green-400";
    return "text-red-400";
  };

  const renderActivityItem = (change: RecordChangeEvent) => {
    return (
      <div
        key={change.id}
        className="px-3 sm:px-4 py-3 sm:py-4 hover:bg-emerald-900/15 transition-colors"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-950/50 flex items-center justify-center">
            {getChangeIcon(change.changeType)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1.5 sm:mb-2">
              {getChangeLabel(change.changeType)}
              <Badge
                className={
                  change.recordType === "tips"
                    ? "bg-slate-400/70 text-slate-800 text-[10px] px-2 py-0"
                    : "bg-blue-800/70 text-amber-50/90 text-[10px] px-2 py-0"
                }
              >
                {change.recordType.toUpperCase()}
              </Badge>
              <span className="text-amber-100/40 text-[10px] sm:text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(change.detectedAt)}
              </span>
            </div>

            {/* Player info */}
            <div className="mb-1.5 sm:mb-2 text-sm">
              <span
                className="font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer"
                onClick={() => navigate(`/records/player/${change.newPlayer.id}`)}
              >
                {getCountryFlag(change.newPlayer.countryCode)}
                {change.newPlayer.displayName}
              </span>
              {change.changeType === "BROKEN" && change.previousPlayer && (
                <span className="text-amber-100/50">
                  {" "}
                  takes the record from{" "}
                  <span
                    className="text-amber-100/70 hover:text-amber-50 cursor-pointer"
                    onClick={() =>
                      navigate(`/records/player/${change.previousPlayer!.id}`)
                    }
                  >
                    {getCountryFlag(change.previousPlayer.countryCode)}
                    {change.previousPlayer.displayName}
                  </span>
                </span>
              )}
              {change.changeType === "IMPROVED" && (
                <span className="text-amber-100/50"> improved their own record</span>
              )}
              {change.changeType === "INITIAL" && (
                <span className="text-amber-100/50"> set the first record</span>
              )}
            </div>

            {/* Course */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-xs sm:text-sm">
              <Link
                to={`/course/${change.courseId}`}
                className="text-amber-50 hover:text-emerald-400 transition-colors font-medium"
              >
                {change.courseName}
              </Link>
              <span className="text-amber-100/40 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {change.courseLocation}
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 text-right">
            <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(change.newScore)}`}>
              {formatScore(change.newScore)}
            </div>
            {change.previousScore && (
              <div className="text-[10px] sm:text-xs text-amber-100/40">
                was {formatScore(change.previousScore)}
              </div>
            )}
            {change.scoreImprovement !== null && change.scoreImprovement > 0 && (
              <div className="text-[10px] sm:text-xs text-emerald-400">
                -{change.scoreImprovement} improvement
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/records")}
        className="mb-4 sm:mb-6 text-amber-100/60 hover:text-amber-50 hover:bg-slate-800/30"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Leaderboard
      </Button>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-amber-50 mb-1 sm:mb-2 tracking-tight">
          Record Activity
        </h1>
        <p className="text-sm sm:text-base text-amber-100/60">
          Recent course record changes and updates
        </p>
      </div>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-emerald-950/20 rounded-xl border border-amber-900/20 p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-amber-50">
              {data.stats.totalChanges}
            </div>
            <div className="text-[10px] sm:text-xs text-amber-100/40 uppercase tracking-wider">
              Total Changes
            </div>
          </div>
          <div className="bg-emerald-950/20 rounded-xl border border-amber-900/20 p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-yellow-400">
              {data.stats.brokenRecords}
            </div>
            <div className="text-[10px] sm:text-xs text-amber-100/40 uppercase tracking-wider">
              Records Broken
            </div>
          </div>
          <div className="bg-emerald-950/20 rounded-xl border border-amber-900/20 p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">
              {data.stats.improvedRecords}
            </div>
            <div className="text-[10px] sm:text-xs text-amber-100/40 uppercase tracking-wider">
              Self Improved
            </div>
          </div>
          <div className="bg-emerald-950/20 rounded-xl border border-amber-900/20 p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-400">
              {data.stats.initialRecords}
            </div>
            <div className="text-[10px] sm:text-xs text-amber-100/40 uppercase tracking-wider">
              First Records
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 sm:mb-6">
        <Select
          value={daysBack}
          onValueChange={(v) => {
            setDaysBack(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-40 sm:w-48 bg-transparent border-amber-900/20 text-amber-100 hover:border-amber-700/40">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent className="bg-emerald-950/95 backdrop-blur-sm border-amber-900/30">
            <SelectItem value="7" className="text-amber-100 focus:bg-slate-700/50 focus:text-amber-50">
              Last 7 days
            </SelectItem>
            <SelectItem value="14" className="text-amber-100 focus:bg-slate-700/50 focus:text-amber-50">
              Last 14 days
            </SelectItem>
            <SelectItem value="30" className="text-amber-100 focus:bg-slate-700/50 focus:text-amber-50">
              Last 30 days
            </SelectItem>
            <SelectItem value="90" className="text-amber-100 focus:bg-slate-700/50 focus:text-amber-50">
              Last 90 days
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity List */}
      <div className="bg-emerald-950/20 rounded-xl border border-amber-900/20 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-amber-100/50">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400/80">
            Failed to load activity
          </div>
        ) : data?.changes.length === 0 ? (
          <div className="p-8 text-center text-amber-100/50">
            No record changes in this period
          </div>
        ) : (
          <>
            <div className="divide-y divide-amber-900/15">
              {data?.changes.map(renderActivityItem)}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-amber-900/20 bg-emerald-950/30">
              <div className="text-xs sm:text-sm text-amber-100/50">
                Showing {page * ITEMS_PER_PAGE + 1} -{" "}
                {page * ITEMS_PER_PAGE + (data?.changes.length || 0)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="bg-transparent border-amber-900/20 text-amber-100/70 hover:bg-slate-700/40 hover:text-amber-50 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(data?.changes.length || 0) < ITEMS_PER_PAGE}
                  className="bg-transparent border-amber-900/20 text-amber-100/70 hover:bg-slate-700/40 hover:text-amber-50 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



