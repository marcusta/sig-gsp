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
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            Record Broken
          </Badge>
        );
      case "IMPROVED":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            Self Improved
          </Badge>
        );
      case "INITIAL":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
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
        className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors"
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
            {getChangeIcon(change.changeType)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {getChangeLabel(change.changeType)}
              <Badge
                className={
                  change.recordType === "tips"
                    ? "bg-slate-600 text-white text-[10px]"
                    : "bg-blue-600 text-white text-[10px]"
                }
              >
                {change.recordType.toUpperCase()}
              </Badge>
              <span className="text-slate-500 text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(change.detectedAt)}
              </span>
            </div>

            {/* Player info */}
            <div className="mb-2">
              <span
                className="font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer"
                onClick={() => navigate(`/records/player/${change.newPlayer.id}`)}
              >
                {getCountryFlag(change.newPlayer.countryCode)}
                {change.newPlayer.displayName}
              </span>
              {change.changeType === "BROKEN" && change.previousPlayer && (
                <span className="text-slate-400">
                  {" "}
                  takes the record from{" "}
                  <span
                    className="text-slate-300 hover:text-white cursor-pointer"
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
                <span className="text-slate-400"> improved their own record</span>
              )}
              {change.changeType === "INITIAL" && (
                <span className="text-slate-400"> set the first record</span>
              )}
            </div>

            {/* Course */}
            <div className="flex items-center gap-2 text-sm">
              <Link
                to={`/course/${change.courseId}`}
                className="text-white hover:text-emerald-400 transition-colors font-medium"
              >
                {change.courseName}
              </Link>
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {change.courseLocation}
              </span>
            </div>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 text-right">
            <div className={`text-2xl font-bold ${getScoreColor(change.newScore)}`}>
              {formatScore(change.newScore)}
            </div>
            {change.previousScore && (
              <div className="text-xs text-slate-500">
                was {formatScore(change.previousScore)}
              </div>
            )}
            {change.scoreImprovement !== null && change.scoreImprovement > 0 && (
              <div className="text-xs text-emerald-400">
                -{change.scoreImprovement} improvement
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/records")}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Leaderboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Record Activity
          </h1>
          <p className="text-slate-400">
            Recent course record changes and updates
          </p>
        </div>

        {/* Stats */}
        {data?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {data.stats.totalChanges}
              </div>
              <div className="text-xs text-slate-400 uppercase">
                Total Changes
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {data.stats.brokenRecords}
              </div>
              <div className="text-xs text-slate-400 uppercase">
                Records Broken
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {data.stats.improvedRecords}
              </div>
              <div className="text-xs text-slate-400 uppercase">
                Self Improved
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {data.stats.initialRecords}
              </div>
              <div className="text-xs text-slate-400 uppercase">
                First Records
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select
            value={daysBack}
            onValueChange={(v) => {
              setDaysBack(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="7" className="text-white hover:bg-slate-700">
                Last 7 days
              </SelectItem>
              <SelectItem value="14" className="text-white hover:bg-slate-700">
                Last 14 days
              </SelectItem>
              <SelectItem value="30" className="text-white hover:bg-slate-700">
                Last 30 days
              </SelectItem>
              <SelectItem value="90" className="text-white hover:bg-slate-700">
                Last 90 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activity List */}
        {isLoading ? (
          <div className="text-center text-slate-400 py-12">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">
            Failed to load activity
          </div>
        ) : data?.changes.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            No record changes in this period
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {data?.changes.map(renderActivityItem)}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
              <div className="text-sm text-slate-400">
                Showing {page * ITEMS_PER_PAGE + 1} -{" "}
                {page * ITEMS_PER_PAGE + (data?.changes.length || 0)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(data?.changes.length || 0) < ITEMS_PER_PAGE}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
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


