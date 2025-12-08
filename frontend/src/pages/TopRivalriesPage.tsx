import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchTopRivalries } from "@/api/useApi";
import { TopRivalry } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Swords, Trophy } from "lucide-react";

export default function TopRivalriesPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<string>("30");

  const { data, isLoading } = useQuery({
    queryKey: ["topRivalries", period],
    queryFn: () => fetchTopRivalries(period === "all" ? undefined : Number(period)),
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Swords className="h-8 w-8 text-emerald-400" />
            <h1 className="text-4xl font-black text-white">Top Rivalries</h1>
          </div>
          <p className="text-slate-400 text-lg">
            The fiercest battles on the course - players who keep stealing records from each other
          </p>
        </div>

        {/* Period Filter */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-slate-400 text-sm font-medium">Time Period:</span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rivalries List */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading rivalries...</div>
        ) : data?.rivalries && data.rivalries.length > 0 ? (
          <div className="space-y-6">
            {data.rivalries.map((rivalry: TopRivalry, index: number) => (
              <div
                key={`${rivalry.player1.id}-${rivalry.player2.id}`}
                className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
              >
                {/* Rivalry Header */}
                <div className="px-6 py-4 bg-slate-800/70 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-black text-slate-600">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">
                          Total Record Exchanges
                        </div>
                        <div className="text-2xl font-black text-white">
                          {rivalry.totalExchanges}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Players Face-Off */}
                <div className="px-6 py-6">
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                    {/* Player 1 */}
                    <div className="flex items-start justify-end gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/records/player/${rivalry.player1.id}`)}
                          className="font-bold text-xl text-white hover:text-emerald-400 transition-colors"
                        >
                          {rivalry.player1.displayName}
                        </button>
                        {getCountryFlag(rivalry.player1.countryCode)}
                      </div>
                      <div className="flex flex-col items-end">
                        {rivalry.player1.avatarUrl ? (
                          <img
                            src={rivalry.player1.avatarUrl}
                            alt=""
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/50"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-emerald-500/20 text-white ring-2 ring-emerald-500/50">
                            {rivalry.player1.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="text-sm text-slate-500 mt-2">
                          @{rivalry.player1.username}
                        </div>
                        <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20">
                          <Trophy className="h-5 w-5 text-emerald-400" />
                          <span className="text-2xl font-black text-emerald-400">
                            {rivalry.player1Wins}
                          </span>
                          <span className="text-sm text-slate-400">wins</span>
                        </div>
                      </div>
                    </div>

                    {/* VS Badge */}
                    <div className="flex flex-col items-center gap-2">
                      <Swords className="h-8 w-8 text-red-400" />
                      <span className="text-xs font-bold text-slate-500 uppercase">VS</span>
                    </div>

                    {/* Player 2 */}
                    <div className="flex items-start justify-start gap-3">
                      <div className="flex flex-col items-start">
                        {rivalry.player2.avatarUrl ? (
                          <img
                            src={rivalry.player2.avatarUrl}
                            alt=""
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500/50"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-blue-500/20 text-white ring-2 ring-blue-500/50">
                            {rivalry.player2.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="text-sm text-slate-500 mt-2">
                          @{rivalry.player2.username}
                        </div>
                        <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20">
                          <Trophy className="h-5 w-5 text-blue-400" />
                          <span className="text-2xl font-black text-blue-400">
                            {rivalry.player2Wins}
                          </span>
                          <span className="text-sm text-slate-400">wins</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getCountryFlag(rivalry.player2.countryCode)}
                        <button
                          onClick={() => navigate(`/records/player/${rivalry.player2.id}`)}
                          className="font-bold text-xl text-white hover:text-blue-400 transition-colors"
                        >
                          {rivalry.player2.displayName}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Exchanges */}
                  {rivalry.recentCourses.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                      <div className="text-xs text-slate-500 font-semibold mb-3 uppercase">
                        Recent Exchanges
                      </div>
                      <div className="space-y-2">
                        {rivalry.recentCourses.map((course, idx) => (
                          <div
                            key={`${course.courseId}-${idx}`}
                            className={`flex items-center justify-between text-sm px-3 py-2 rounded ${
                              course.winner === 1
                                ? "bg-emerald-500/10 border-l-2 border-emerald-500/50"
                                : "bg-blue-500/10 border-l-2 border-blue-500/50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {course.winner === 1 ? (
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-blue-400" />
                              )}
                              <span
                                className={
                                  course.winner === 1 ? "text-emerald-400" : "text-blue-400"
                                }
                              >
                                {course.winner === 1
                                  ? rivalry.player1.displayName
                                  : rivalry.player2.displayName}
                              </span>
                              <span className="text-slate-500">took</span>
                              <Link
                                to={`/courses/${course.courseId}`}
                                className="text-slate-300 hover:text-white transition-colors"
                              >
                                {course.courseName}
                              </Link>
                              <Badge
                                className={`text-[10px] px-1.5 py-0 ${
                                  course.recordType === "tips"
                                    ? "bg-slate-200/20 text-slate-200"
                                    : "bg-blue-500/20 text-blue-400"
                                }`}
                              >
                                {course.recordType.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatTimeAgo(course.detectedAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Swords className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <p className="text-lg font-semibold">No rivalries found</p>
            <p className="text-sm text-slate-500 mt-2">
              No record exchanges in the selected time period
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
