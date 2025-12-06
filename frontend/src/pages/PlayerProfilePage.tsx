import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchPlayerProfile,
  fetchPlayerRankHistory,
  fetchPlayerRecordChanges,
} from "@/api/useApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Trophy,
  MapPin,
  Calendar,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  History,
  Zap,
  Clock,
} from "lucide-react";
import type { RecordChangeEvent, PlayerRankSnapshot } from "@/types";

export default function PlayerProfilePage() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("records");

  const { data, isLoading, error } = useQuery({
    queryKey: ["player", playerId],
    queryFn: () => fetchPlayerProfile(Number(playerId)),
    enabled: !!playerId,
  });

  const { data: rankHistoryData } = useQuery({
    queryKey: ["playerRankHistory", playerId],
    queryFn: () => fetchPlayerRankHistory(Number(playerId), 30),
    enabled: !!playerId,
  });

  const { data: recordChangesData } = useQuery({
    queryKey: ["playerRecordChanges", playerId],
    queryFn: () => fetchPlayerRecordChanges(Number(playerId), 50),
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

  const getRankChangeIndicator = (change: number, size: "sm" | "lg" = "sm") => {
    const iconClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";
    const textClass = size === "lg" ? "text-lg font-bold" : "text-sm font-medium";

    if (change > 0) {
      return (
        <span className={`flex items-center text-emerald-400 ${textClass}`}>
          <TrendingUp className={`${iconClass} mr-1`} />
          +{change}
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className={`flex items-center text-red-400 ${textClass}`}>
          <TrendingDown className={`${iconClass} mr-1`} />
          {change}
        </span>
      );
    }
    return (
      <span className={`flex items-center text-slate-500 ${textClass}`}>
        <Minus className={`${iconClass} mr-1`} />
        0
      </span>
    );
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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

  // Get latest rank change from history
  const latestSnapshot = rankHistoryData?.history?.[0];

  const renderRankHistoryItem = (snapshot: PlayerRankSnapshot, idx: number) => {
    const isLatest = idx === 0;
    return (
      <div
        key={snapshot.date}
        className={`flex items-center justify-between py-3 px-4 ${isLatest ? "bg-slate-700/30" : ""} ${idx !== 0 ? "border-t border-slate-700/50" : ""}`}
      >
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-400 w-24">
            {new Date(snapshot.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">#{snapshot.overallRank}</span>
            {getRankChangeIndicator(snapshot.rankChange)}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-slate-400">
            <span className="text-emerald-400 font-medium">
              {snapshot.totalRecords}
            </span>{" "}
            records
          </div>
          {snapshot.recordsGained > 0 && (
            <span className="text-emerald-400">+{snapshot.recordsGained}</span>
          )}
          {snapshot.recordsLost > 0 && (
            <span className="text-red-400">-{snapshot.recordsLost}</span>
          )}
        </div>
      </div>
    );
  };

  const renderRecordChangeItem = (change: RecordChangeEvent) => {
    const isBroken = change.changeType === "BROKEN";
    const isImproved = change.changeType === "IMPROVED";

    return (
      <div
        key={change.id}
        className="flex items-center justify-between py-3 px-4 border-t border-slate-700/50 first:border-t-0"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${isBroken ? "bg-yellow-500/20" : isImproved ? "bg-emerald-500/20" : "bg-blue-500/20"}`}
          >
            {isBroken ? (
              <Zap className="h-4 w-4 text-yellow-500" />
            ) : isImproved ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <Trophy className="h-4 w-4 text-blue-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={`/course/${change.courseId}`}
                className="text-white hover:text-emerald-400 font-medium"
              >
                {change.courseName}
              </Link>
              <Badge
                className={
                  change.recordType === "tips"
                    ? "bg-slate-600 text-white text-[10px]"
                    : "bg-blue-600 text-white text-[10px]"
                }
              >
                {change.recordType.toUpperCase()}
              </Badge>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(change.detectedAt)}
              {change.previousPlayer && (
                <span className="ml-2">
                  from {change.previousPlayer.displayName}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-bold ${getScoreColor(parseInt(change.newScore, 10) || 0)}`}>
            {formatScore(change.newScore)}
          </div>
          {change.previousScore && (
            <div className="text-xs text-slate-500">
              was {formatScore(change.previousScore)}
            </div>
          )}
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
                <h1 className="text-3xl font-bold text-white">
                  {player.displayName}
                </h1>
                {latestSnapshot && latestSnapshot.rankChange !== 0 && (
                  <div className="ml-2">
                    {getRankChangeIndicator(latestSnapshot.rankChange, "lg")}
                  </div>
                )}
              </div>
              <p className="text-slate-400 mb-4">@{player.username}</p>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl">
                {/* Rank Card */}
                {latestSnapshot && (
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">
                      #{latestSnapshot.overallRank}
                    </div>
                    <div className="text-xs text-slate-400 uppercase">Rank</div>
                    <div className="mt-1">
                      {getRankChangeIndicator(latestSnapshot.rankChange)}
                    </div>
                  </div>
                )}
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {summary.totalRecords}
                  </div>
                  <div className="text-xs text-slate-400 uppercase">
                    Total Records
                  </div>
                  <div
                    className={`text-lg font-bold mt-1 ${summary.totalScore < 0 ? "text-red-400" : summary.totalScore > 0 ? "text-blue-400" : "text-slate-400"}`}
                  >
                    {summary.totalScore > 0 ? "+" : ""}
                    {summary.totalScore}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-slate-300">
                    {summary.tipsRecords}
                  </div>
                  <div className="text-xs text-slate-400 uppercase">Tips</div>
                  <div
                    className={`text-lg font-bold mt-1 ${summary.tipsTotalScore < 0 ? "text-red-400" : summary.tipsTotalScore > 0 ? "text-blue-400" : "text-slate-400"}`}
                  >
                    {summary.tipsTotalScore > 0 ? "+" : ""}
                    {summary.tipsTotalScore}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {summary.sgtRecords}
                  </div>
                  <div className="text-xs text-slate-400 uppercase">SGT</div>
                  <div
                    className={`text-lg font-bold mt-1 ${summary.sgtTotalScore < 0 ? "text-red-400" : summary.sgtTotalScore > 0 ? "text-blue-400" : "text-slate-400"}`}
                  >
                    {summary.sgtTotalScore > 0 ? "+" : ""}
                    {summary.sgtTotalScore}
                  </div>
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 border border-slate-700 mb-6">
            <TabsTrigger
              value="records"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Course Records ({records.length})
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              Recent Activity
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <History className="h-4 w-4 mr-2" />
              Rank History
            </TabsTrigger>
          </TabsList>

          {/* Records Tab */}
          <TabsContent value="records">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
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
                      <div
                        className={`text-2xl font-bold ${getScoreColor(record.scoreNumeric)}`}
                      >
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
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              {recordChangesData?.changes &&
              recordChangesData.changes.length > 0 ? (
                <div>
                  {recordChangesData.changes.map(renderRecordChangeItem)}
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-slate-400">
                  No recent record changes
                </div>
              )}
            </div>
          </TabsContent>

          {/* Rank History Tab */}
          <TabsContent value="history">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              {rankHistoryData?.history && rankHistoryData.history.length > 0 ? (
                <div>
                  {rankHistoryData.history.map(renderRankHistoryItem)}
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-slate-400">
                  <History className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                  <p>No rank history available yet</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Rank history will appear after the next scrape run
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
