import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  fetchLeaderboardWithPeriod,
  fetchRecordYears,
  fetchRecordMovers,
} from "@/api/useApi";
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
  Trophy,
  Medal,
  Award,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Flame,
  Snowflake,
  Swords,
} from "lucide-react";

const ITEMS_PER_PAGE = 50;

export default function RecordsPage() {
  const navigate = useNavigate();
  const [teeType, setTeeType] = useState("all");
  const [year, setYear] = useState("all");
  const [period, setPeriod] = useState("week");
  const [page, setPage] = useState(0);

  // Fetch available years
  const { data: yearsData } = useQuery({
    queryKey: ["recordYears"],
    queryFn: fetchRecordYears,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Enhanced leaderboard with period-based rank changes
  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard-with-period", teeType, year, period, page],
    queryFn: () =>
      fetchLeaderboardWithPeriod(
        teeType,
        year,
        period,
        ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
      ),
  });

  // Fetch movers (top gainers/losers)
  const { data: moversData } = useQuery({
    queryKey: ["recordMovers"],
    queryFn: () => fetchRecordMovers(7, 5),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <span className="flex items-center text-emerald-400 text-xs font-medium">
          <TrendingUp className="h-3 w-3 mr-0.5" />
          {change}
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className="flex items-center text-red-400 text-xs font-medium">
          <TrendingDown className="h-3 w-3 mr-0.5" />
          {Math.abs(change)}
        </span>
      );
    }
    return (
      <span className="flex items-center text-slate-500 text-xs">
        <Minus className="h-3 w-3" />
      </span>
    );
  };

  const getCountryFlag = (countryCode: string | null) => {
    if (!countryCode) return null;
    return (
      <span
        className={`fi fi-${countryCode.toLowerCase()} mr-2`}
        title={countryCode.toUpperCase()}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Course Record Leaderboard
            </h1>
            <p className="text-slate-400">
              Players ranked by total course records{" "}
              {year !== "all" ? `set in ${year}` : "held"}
              {" · "}Movement over last {period === "day" ? "day" : period === "week" ? "week" : "month"}
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link to="/records/rivalries">
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
              >
                <Swords className="h-4 w-4 mr-2" />
                Top Rivalries
              </Button>
            </Link>
            <Link to="/records/activity">
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
              >
                <Activity className="h-4 w-4 mr-2" />
                View Activity Feed
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Leaderboard */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Select
                value={teeType}
                onValueChange={(v) => {
                  setTeeType(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Filter by tee type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="all"
                    className="text-white hover:bg-slate-700"
                  >
                    All Records
                  </SelectItem>
                  <SelectItem
                    value="tips"
                    className="text-white hover:bg-slate-700"
                  >
                    Tips Only
                  </SelectItem>
                  <SelectItem
                    value="sgt"
                    className="text-white hover:bg-slate-700"
                  >
                    SGT Only
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={year}
                onValueChange={(v) => {
                  setYear(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="all"
                    className="text-white hover:bg-slate-700"
                  >
                    All Time
                  </SelectItem>
                  {yearsData?.years.map((y) => (
                    <SelectItem
                      key={y}
                      value={y}
                      className="text-white hover:bg-slate-700"
                    >
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={period}
                onValueChange={(v) => {
                  setPeriod(v);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                  <TrendingUp className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Movement period" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="day"
                    className="text-white hover:bg-slate-700"
                  >
                    Last Day
                  </SelectItem>
                  <SelectItem
                    value="week"
                    className="text-white hover:bg-slate-700"
                  >
                    Last Week
                  </SelectItem>
                  <SelectItem
                    value="month"
                    className="text-white hover:bg-slate-700"
                  >
                    Last Month
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400">Loading...</div>
              ) : error ? (
                <div className="p-8 text-center text-red-400">
                  Failed to load leaderboard
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-900/70 border-b border-slate-600">
                          <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-20">
                            Rank
                          </th>
                          <th className="px-4 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Player
                          </th>
                          <th className="px-4 py-4 text-center w-24">
                            <span className="text-slate-900 bg-gradient-to-r from-slate-200 to-slate-300 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">
                              TIPS
                            </span>
                          </th>
                          <th className="px-4 py-4 text-center w-24">
                            <span className="text-white bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">
                              SGT
                            </span>
                          </th>
                          <th className="px-4 py-4 text-center w-28">
                            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                              Total
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {data?.entries.map((entry) => (
                          <tr
                            key={entry.player.id}
                            className={`hover:bg-emerald-900/20 cursor-pointer transition-all duration-150 ${entry.rank <= 3 ? "bg-slate-800/30" : ""}`}
                            onClick={() =>
                              navigate(`/records/player/${entry.player.id}`)
                            }
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${entry.rank === 1 ? "bg-yellow-500/20" : entry.rank === 2 ? "bg-slate-400/20" : entry.rank === 3 ? "bg-amber-600/20" : ""}`}>
                                  {getRankIcon(entry.rank)}
                                  {entry.rank > 3 && (
                                    <span className="font-mono text-sm text-slate-500">
                                      {entry.rank}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  {entry.rank <= 3 && (
                                    <span className="font-mono text-sm font-bold text-white">
                                      {entry.rank}
                                    </span>
                                  )}
                                  {getRankChangeIndicator(entry.rankChange)}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {entry.player.avatarUrl ? (
                                  <img
                                    src={entry.player.avatarUrl}
                                    alt=""
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-600"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-sm font-bold text-white ring-2 ring-slate-600">
                                    {entry.player.displayName
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    {getCountryFlag(entry.player.countryCode)}
                                    <span className="font-semibold text-white">
                                      {entry.player.displayName}
                                    </span>
                                    {entry.recordsChange > 0 && (
                                      <Badge className="ml-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0">
                                        +{entry.recordsChange}
                                      </Badge>
                                    )}
                                    {entry.recordsChange < 0 && (
                                      <Badge className="ml-1 bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1.5 py-0">
                                        {entry.recordsChange}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    @{entry.player.username}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {entry.tipsRecords > 0 ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="font-bold text-slate-200 text-lg tabular-nums">
                                    {entry.tipsRecords}
                                  </span>
                                  <span
                                    className={`text-xs tabular-nums ${entry.tipsTotalScore < 0 ? "text-emerald-500/70" : entry.tipsTotalScore > 0 ? "text-red-400/70" : "text-slate-500"}`}
                                  >
                                    {entry.tipsTotalScore > 0 ? "+" : ""}
                                    {entry.tipsTotalScore}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-700">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {entry.sgtRecords > 0 ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="font-bold text-blue-400 text-lg tabular-nums">
                                    {entry.sgtRecords}
                                  </span>
                                  <span
                                    className={`text-xs tabular-nums ${entry.sgtTotalScore < 0 ? "text-emerald-500/70" : entry.sgtTotalScore > 0 ? "text-red-400/70" : "text-slate-500"}`}
                                  >
                                    {entry.sgtTotalScore > 0 ? "+" : ""}
                                    {entry.sgtTotalScore}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-700">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-black text-emerald-400 text-2xl tabular-nums">
                                  {entry.totalRecords}
                                </span>
                                <span
                                  className={`text-xs tabular-nums ${entry.totalScore < 0 ? "text-emerald-500/70" : entry.totalScore > 0 ? "text-red-400/70" : "text-slate-500"}`}
                                >
                                  {entry.totalScore > 0 ? "+" : ""}
                                  {entry.totalScore}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 bg-slate-900/30">
                    <div className="text-sm text-slate-400">
                      Showing {page * ITEMS_PER_PAGE + 1} -{" "}
                      {page * ITEMS_PER_PAGE + (data?.entries.length || 0)}
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
                        disabled={(data?.entries.length || 0) < ITEMS_PER_PAGE}
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

          {/* Sidebar - Top Movers */}
          <div className="lg:col-span-1 space-y-6">
            {/* Hot - Recent Gainers */}
            <div className="bg-gradient-to-br from-orange-950/30 to-slate-800/50 rounded-xl border border-orange-900/30 overflow-hidden">
              <div className="px-4 py-3 border-b border-orange-900/30 bg-gradient-to-r from-orange-900/20 to-transparent">
                <h3 className="text-sm font-bold text-orange-100 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Hot This Week
                </h3>
                <p className="text-xs text-orange-200/50">Most records gained</p>
              </div>
              <div className="divide-y divide-orange-900/20">
                {moversData?.gainers.slice(0, 5).map((mover, idx) => (
                  <div
                    key={mover.player.id}
                    className="px-4 py-2.5 hover:bg-orange-900/20 cursor-pointer transition-colors"
                    onClick={() => navigate(`/records/player/${mover.player.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-orange-400/60 text-xs font-bold w-4">
                          {idx + 1}
                        </span>
                        <span className="text-white text-sm font-medium truncate max-w-[130px]">
                          {mover.player.displayName}
                        </span>
                      </div>
                      <span className="text-emerald-400 text-sm font-black tabular-nums bg-emerald-500/10 px-2 py-0.5 rounded">
                        +{mover.recordsGained}
                      </span>
                    </div>
                  </div>
                ))}
                {(!moversData?.gainers || moversData.gainers.length === 0) && (
                  <div className="px-4 py-6 text-center text-orange-200/40 text-sm">
                    No recent activity
                  </div>
                )}
              </div>
            </div>

            {/* Cold - Recent Losers */}
            <div className="bg-gradient-to-br from-blue-950/30 to-slate-800/50 rounded-xl border border-blue-900/30 overflow-hidden">
              <div className="px-4 py-3 border-b border-blue-900/30 bg-gradient-to-r from-blue-900/20 to-transparent">
                <h3 className="text-sm font-bold text-blue-100 flex items-center gap-2">
                  <Snowflake className="h-4 w-4 text-blue-400" />
                  Records Lost
                </h3>
                <p className="text-xs text-blue-200/50">
                  Most records broken this week
                </p>
              </div>
              <div className="divide-y divide-blue-900/20">
                {moversData?.losers.slice(0, 5).map((mover, idx) => (
                  <div
                    key={mover.player.id}
                    className="px-4 py-2.5 hover:bg-blue-900/20 cursor-pointer transition-colors"
                    onClick={() => navigate(`/records/player/${mover.player.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-blue-400/60 text-xs font-bold w-4">
                          {idx + 1}
                        </span>
                        <span className="text-white text-sm font-medium truncate max-w-[130px]">
                          {mover.player.displayName}
                        </span>
                      </div>
                      <span className="text-red-400 text-sm font-black tabular-nums bg-red-500/10 px-2 py-0.5 rounded">
                        -{mover.recordsLost}
                      </span>
                    </div>
                  </div>
                ))}
                {(!moversData?.losers || moversData.losers.length === 0) && (
                  <div className="px-4 py-6 text-center text-blue-200/40 text-sm">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
