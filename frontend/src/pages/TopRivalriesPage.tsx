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
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Swords className="h-8 w-8 text-emerald-400/80" />
          <h1 className="text-4xl font-black text-amber-50">Top Rivalries</h1>
        </div>
        <p className="text-amber-100/60 text-lg">
          The fiercest battles on the course - players who keep stealing records from each other
        </p>
      </div>

      {/* Period Filter */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-amber-100/50 text-sm font-medium">Time Period:</span>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48 bg-transparent border-amber-900/20 text-amber-100 hover:border-amber-700/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-emerald-950/95 backdrop-blur-sm border-amber-900/30">
            <SelectItem value="7" className="text-amber-100 focus:bg-slate-700/50 focus:text-amber-50">Last 7 days</SelectItem>
            <SelectItem value="30" className="text-amber-100 focus:bg-slate-700/50 focus:text-amber-50">Last 30 days</SelectItem>
            <SelectItem value="90" className="text-amber-100 focus:bg-slate-700/50 focus:text-amber-50">Last 90 days</SelectItem>
            <SelectItem value="all" className="text-amber-100 focus:bg-slate-700/50 focus:text-amber-50">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rivalries List */}
      {isLoading ? (
        <div className="text-center py-12 text-amber-100/50">Loading rivalries...</div>
      ) : data?.rivalries && data.rivalries.length > 0 ? (
        <div className="space-y-6">
          {data.rivalries.map((rivalry: TopRivalry, index: number) => (
            <div
              key={`${rivalry.player1.id}-${rivalry.player2.id}`}
              className="bg-emerald-950/20 rounded-xl border border-amber-900/20 overflow-hidden"
            >
              {/* Rivalry Header */}
              <div className="px-6 py-4 bg-emerald-950/40 border-b border-amber-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-black text-amber-100/30">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="text-sm text-amber-100/40 mb-1">
                        Total Record Exchanges
                      </div>
                      <div className="text-2xl font-black text-amber-50">
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
                        className="font-bold text-xl text-amber-50 hover:text-emerald-400 transition-colors"
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
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-700/50"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-emerald-900/30 text-amber-100 ring-2 ring-emerald-700/50">
                          {rivalry.player1.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-sm text-amber-100/40 mt-2">
                        @{rivalry.player1.username}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/30">
                        <Trophy className="h-5 w-5 text-emerald-400/80" />
                        <span className="text-2xl font-black text-emerald-400">
                          {rivalry.player1Wins}
                        </span>
                        <span className="text-sm text-amber-100/50">wins</span>
                      </div>
                    </div>
                  </div>

                  {/* VS Badge */}
                  <div className="flex flex-col items-center gap-2">
                    <Swords className="h-8 w-8 text-red-400/70" />
                    <span className="text-xs font-bold text-amber-100/30 uppercase">VS</span>
                  </div>

                  {/* Player 2 */}
                  <div className="flex items-start justify-start gap-3">
                    <div className="flex flex-col items-start">
                      {rivalry.player2.avatarUrl ? (
                        <img
                          src={rivalry.player2.avatarUrl}
                          alt=""
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-amber-700/50"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-emerald-950/40 text-amber-100 ring-2 ring-amber-700/50">
                          {rivalry.player2.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-sm text-amber-100/40 mt-2">
                        @{rivalry.player2.username}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/30">
                        <Trophy className="h-5 w-5 text-amber-400/80" />
                        <span className="text-2xl font-black text-amber-400">
                          {rivalry.player2Wins}
                        </span>
                        <span className="text-sm text-amber-100/50">wins</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getCountryFlag(rivalry.player2.countryCode)}
                      <button
                        onClick={() => navigate(`/records/player/${rivalry.player2.id}`)}
                        className="font-bold text-xl text-amber-50 hover:text-amber-400 transition-colors"
                      >
                        {rivalry.player2.displayName}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Exchanges */}
                {rivalry.recentCourses.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-amber-900/15">
                    <div className="text-xs text-amber-100/40 font-semibold mb-3 uppercase">
                      Recent Exchanges
                    </div>
                    <div className="space-y-2">
                      {rivalry.recentCourses.map((course, idx) => (
                        <div
                          key={`${course.courseId}-${idx}`}
                          className={`flex items-center justify-between text-sm px-3 py-2 rounded ${
                            course.winner === 1
                              ? "bg-emerald-900/20 border-l-2 border-emerald-700/50"
                              : "bg-amber-900/20 border-l-2 border-amber-700/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {course.winner === 1 ? (
                              <TrendingUp className="h-4 w-4 text-emerald-400/80" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-amber-400/80" />
                            )}
                            <span
                              className={
                                course.winner === 1 ? "text-emerald-400/80" : "text-amber-400/80"
                              }
                            >
                              {course.winner === 1
                                ? rivalry.player1.displayName
                                : rivalry.player2.displayName}
                            </span>
                            <span className="text-amber-100/40">took</span>
                            <Link
                              to={`/courses/${course.courseId}`}
                              className="text-amber-100/70 hover:text-amber-50 transition-colors"
                            >
                              {course.courseName}
                            </Link>
                            <Badge
                              className={`text-[10px] px-1.5 py-0 ${
                                course.recordType === "tips"
                                  ? "bg-slate-400/70 text-slate-800"
                                  : "bg-blue-800/70 text-amber-50/90"
                              }`}
                            >
                              {course.recordType.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs text-amber-100/40">
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
        <div className="text-center py-12 text-amber-100/40">
          <Swords className="h-12 w-12 mx-auto mb-4 text-amber-100/20" />
          <p className="text-lg font-semibold text-amber-100/60">No rivalries found</p>
          <p className="text-sm text-amber-100/40 mt-2">
            No record exchanges in the selected time period
          </p>
        </div>
      )}
    </div>
  );
}
