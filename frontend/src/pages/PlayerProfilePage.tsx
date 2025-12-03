import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPlayerProfile } from "@/api/useApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, MapPin, Calendar, ExternalLink } from "lucide-react";

export default function PlayerProfilePage() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["player", playerId],
    queryFn: () => fetchPlayerProfile(Number(playerId)),
    enabled: !!playerId,
  });

  const getCountryFlag = (countryCode: string | null) => {
    if (!countryCode) return null;
    return (
      <span
        className={`fi fi-${countryCode.toLowerCase()} mr-2`}
        title={countryCode.toUpperCase()}
      />
    );
  };

  const formatScore = (score: string) => {
    const num = parseInt(score, 10);
    if (isNaN(num) || num === 0) return "E";
    return num > 0 ? `+${num}` : score;
  };

  const getScoreColor = (scoreNumeric: number) => {
    if (scoreNumeric < -10) return "text-emerald-400";
    if (scoreNumeric < -5) return "text-green-400";
    if (scoreNumeric < 0) return "text-lime-400";
    if (scoreNumeric === 0) return "text-white";
    return "text-red-400";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <div className="text-white">Loading player profile...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">Player not found</div>
          <Button onClick={() => navigate("/records")} variant="outline">
            Back to Leaderboard
          </Button>
        </div>
      </div>
    );
  }

  const { player, records, summary } = data;

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

        {/* Player Header */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-8">
          <div className="flex items-start gap-6">
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt=""
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-600 flex items-center justify-center text-3xl text-white border-4 border-emerald-500/30">
                {player.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getCountryFlag(player.countryCode)}
                <h1 className="text-3xl font-bold text-white">{player.displayName}</h1>
              </div>
              <p className="text-slate-400 mb-4">@{player.username}</p>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 max-w-lg">
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{summary.totalRecords}</div>
                  <div className="text-xs text-slate-400 uppercase">Total Records</div>
                  <div className={`text-lg font-bold mt-1 ${summary.totalScore < 0 ? "text-red-400" : summary.totalScore > 0 ? "text-blue-400" : "text-slate-400"}`}>
                    {summary.totalScore > 0 ? "+" : ""}{summary.totalScore}
                  </div>
                  {summary.totalAvgScore !== null && (
                    <div className="text-xs text-slate-500">
                      avg {summary.totalAvgScore > 0 ? "+" : ""}{summary.totalAvgScore}
                    </div>
                  )}
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-slate-300">{summary.tipsRecords}</div>
                  <div className="text-xs text-slate-400 uppercase">Tips</div>
                  <div className={`text-lg font-bold mt-1 ${summary.tipsTotalScore < 0 ? "text-red-400" : summary.tipsTotalScore > 0 ? "text-blue-400" : "text-slate-400"}`}>
                    {summary.tipsTotalScore > 0 ? "+" : ""}{summary.tipsTotalScore}
                  </div>
                  {summary.tipsAvgScore !== null && (
                    <div className="text-xs text-slate-500">
                      avg {summary.tipsAvgScore > 0 ? "+" : ""}{summary.tipsAvgScore}
                    </div>
                  )}
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">{summary.sgtRecords}</div>
                  <div className="text-xs text-slate-400 uppercase">SGT</div>
                  <div className={`text-lg font-bold mt-1 ${summary.sgtTotalScore < 0 ? "text-red-400" : summary.sgtTotalScore > 0 ? "text-blue-400" : "text-slate-400"}`}>
                    {summary.sgtTotalScore > 0 ? "+" : ""}{summary.sgtTotalScore}
                  </div>
                  {summary.sgtAvgScore !== null && (
                    <div className="text-xs text-slate-500">
                      avg {summary.sgtAvgScore > 0 ? "+" : ""}{summary.sgtAvgScore}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <a
              href={`https://simulatorgolftour.com/profile/${player.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Records List */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Course Records ({records.length})
            </h2>
          </div>
          
          <div className="divide-y divide-slate-700/50">
            {records.map((record, idx) => (
              <div
                key={`${record.course.id}-${record.recordType}-${idx}`}
                className="px-6 py-4 hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Link
                        to={`/course/${record.course.id}`}
                        className="font-medium text-white hover:text-emerald-400 transition-colors"
                      >
                        {record.course.name}
                      </Link>
                      <Badge
                        className={
                          record.recordType === "tips"
                            ? "bg-slate-600 text-white text-[10px]"
                            : "bg-blue-600 text-white text-[10px]"
                        }
                      >
                        {record.recordType.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {record.course.location}
                      </span>
                      {record.recordDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(record.recordDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(record.scoreNumeric)}`}>
                    {formatScore(record.score)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {records.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-400">
              No course records found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

