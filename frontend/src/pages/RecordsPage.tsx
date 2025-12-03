import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchLeaderboard, fetchRecordYears } from "@/api/useApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Medal, Award, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const ITEMS_PER_PAGE = 50;

export default function RecordsPage() {
  const navigate = useNavigate();
  const [teeType, setTeeType] = useState("all");
  const [year, setYear] = useState("all");
  const [page, setPage] = useState(0);

  // Fetch available years
  const { data: yearsData } = useQuery({
    queryKey: ["recordYears"],
    queryFn: fetchRecordYears,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard", teeType, year, page],
    queryFn: () => fetchLeaderboard(teeType, year, ITEMS_PER_PAGE, page * ITEMS_PER_PAGE),
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Course Record Leaderboard
          </h1>
          <p className="text-slate-400">
            Players ranked by total course records {year !== "all" ? `set in ${year}` : "held"}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={teeType} onValueChange={(v) => { setTeeType(v); setPage(0); }}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Filter by tee type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white hover:bg-slate-700">All Records</SelectItem>
              <SelectItem value="tips" className="text-white hover:bg-slate-700">Tips Only</SelectItem>
              <SelectItem value="sgt" className="text-white hover:bg-slate-700">SGT Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={(v) => { setYear(v); setPage(0); }}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
              <Calendar className="h-4 w-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all" className="text-white hover:bg-slate-700">All Time</SelectItem>
              {yearsData?.years.map((y) => (
                <SelectItem key={y} value={y} className="text-white hover:bg-slate-700">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">Failed to load leaderboard</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-700">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-16">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Player</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">
                        <span className="text-black bg-slate-300 px-2 py-0.5 rounded text-[10px]">TIPS</span>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">
                        <span className="text-white bg-blue-600 px-2 py-0.5 rounded text-[10px]">SGT</span>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {data?.entries.map((entry) => (
                      <tr
                        key={entry.player.id}
                        className="hover:bg-slate-700/30 cursor-pointer transition-colors"
                        onClick={() => navigate(`/records/player/${entry.player.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getRankIcon(entry.rank)}
                            <span className={`font-mono text-sm ${entry.rank <= 3 ? "font-bold text-white" : "text-slate-400"}`}>
                              {entry.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {entry.player.avatarUrl ? (
                              <img
                                src={entry.player.avatarUrl}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white">
                                {entry.player.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center">
                                {getCountryFlag(entry.player.countryCode)}
                                <span className="font-medium text-white">{entry.player.displayName}</span>
                              </div>
                              <span className="text-xs text-slate-500">@{entry.player.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {entry.tipsRecords > 0 ? (
                            <div className="flex flex-col items-center">
                              <Badge variant="secondary" className="bg-slate-600 text-white font-mono">
                                {entry.tipsRecords}
                              </Badge>
                              <span className={`text-sm font-semibold ${entry.tipsTotalScore < 0 ? "text-red-400" : entry.tipsTotalScore > 0 ? "text-blue-400" : "text-slate-400"}`}>
                                {entry.tipsTotalScore > 0 ? "+" : ""}{entry.tipsTotalScore}
                              </span>
                              {entry.tipsAvgScore !== null && (
                                <span className="text-[10px] text-slate-500">
                                  avg {entry.tipsAvgScore > 0 ? "+" : ""}{entry.tipsAvgScore}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {entry.sgtRecords > 0 ? (
                            <div className="flex flex-col items-center">
                              <Badge className="bg-blue-600 text-white font-mono">
                                {entry.sgtRecords}
                              </Badge>
                              <span className={`text-sm font-semibold ${entry.sgtTotalScore < 0 ? "text-red-400" : entry.sgtTotalScore > 0 ? "text-blue-400" : "text-slate-400"}`}>
                                {entry.sgtTotalScore > 0 ? "+" : ""}{entry.sgtTotalScore}
                              </span>
                              {entry.sgtAvgScore !== null && (
                                <span className="text-[10px] text-slate-500">
                                  avg {entry.sgtAvgScore > 0 ? "+" : ""}{entry.sgtAvgScore}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-emerald-400 text-lg">{entry.totalRecords}</span>
                            <span className={`text-sm font-semibold ${entry.totalScore < 0 ? "text-red-400" : entry.totalScore > 0 ? "text-blue-400" : "text-slate-400"}`}>
                              {entry.totalScore > 0 ? "+" : ""}{entry.totalScore}
                            </span>
                            {entry.totalAvgScore !== null && (
                              <span className="text-[10px] text-slate-500">
                                avg {entry.totalAvgScore > 0 ? "+" : ""}{entry.totalAvgScore}
                              </span>
                            )}
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
                  Showing {page * ITEMS_PER_PAGE + 1} - {page * ITEMS_PER_PAGE + (data?.entries.length || 0)}
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
    </div>
  );
}

