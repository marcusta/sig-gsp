import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchPlayerProfile,
  fetchPlayerRankHistory,
  fetchPlayerRecordChanges,
  fetchPlayerRivalries,
} from "@/api/useApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRivalryComment } from "@/data/rivalryComments";
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
  MapPin,
  Calendar,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  History,
  Zap,
  Clock,
  Swords,
  Target,
} from "lucide-react";
import type { RecordChangeEvent, PlayerRankSnapshot, Rivalry } from "@/types";

export default function PlayerProfilePage() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("records");
  const [rivalryPeriod, setRivalryPeriod] = useState<number | undefined>(30);

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

  const { data: rivalriesData } = useQuery({
    queryKey: ["playerRivalries", playerId, rivalryPeriod],
    queryFn: () => fetchPlayerRivalries(Number(playerId), rivalryPeriod),
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
    if (scoreNumeric < -5) return "text-emerald-400/80";
    if (scoreNumeric < 0) return "text-emerald-400/70";
    if (scoreNumeric === 0) return "text-amber-100";
    return "text-red-400/80";
  };

  const getRankChangeIndicator = (change: number, size: "sm" | "lg" = "sm") => {
    const iconClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";
    const textClass = size === "lg" ? "text-lg font-bold" : "text-sm font-medium";

    if (change > 0) {
      return (
        <span className={`flex items-center text-emerald-400/80 ${textClass}`}>
          <TrendingUp className={`${iconClass} mr-1`} />
          +{change}
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className={`flex items-center text-red-400/70 ${textClass}`}>
          <TrendingDown className={`${iconClass} mr-1`} />
          {change}
        </span>
      );
    }
    return (
      <span className={`flex items-center text-amber-100/30 ${textClass}`}>
        <Minus className={`${iconClass} mr-1`} />
        0
      </span>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-amber-100/50">Loading player profile...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-red-400/80 mb-4">Player not found</div>
          <Button
            onClick={() => navigate("/records")}
            variant="outline"
            className="bg-transparent border-amber-900/20 text-amber-100/80 hover:bg-slate-800/30 hover:text-amber-50"
          >
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
        className={`flex items-center justify-between py-3 px-4 ${isLatest ? "bg-emerald-950/20" : ""} ${idx !== 0 ? "border-t border-amber-900/15" : ""}`}
      >
        <div className="flex items-center gap-4">
          <div className="text-sm text-amber-100/50 w-24">
            {new Date(snapshot.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-50 font-bold">#{snapshot.overallRank}</span>
            {getRankChangeIndicator(snapshot.rankChange)}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-amber-100/50">
            <span className="text-emerald-400/80 font-medium">
              {snapshot.totalRecords}
            </span>{" "}
            records
          </div>
          {snapshot.recordsGained > 0 && (
            <span className="text-emerald-400/80">+{snapshot.recordsGained}</span>
          )}
          {snapshot.recordsLost > 0 && (
            <span className="text-red-400/70">-{snapshot.recordsLost}</span>
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
        className="flex items-center justify-between py-3 px-4 border-t border-amber-900/15 first:border-t-0"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${isBroken ? "bg-amber-500/20" : isImproved ? "bg-emerald-900/30" : "bg-blue-900/30"}`}
          >
            {isBroken ? (
              <Zap className="h-4 w-4 text-amber-500/80" />
            ) : isImproved ? (
              <TrendingUp className="h-4 w-4 text-emerald-400/80" />
            ) : (
              <Trophy className="h-4 w-4 text-blue-400/80" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={`/course/${change.courseId}`}
                className="text-amber-50 hover:text-emerald-400 font-medium transition-colors"
              >
                {change.courseName}
              </Link>
              <Badge
                className={
                  change.recordType === "tips"
                    ? "bg-slate-400/70 text-slate-800 text-[10px]"
                    : "bg-blue-800/70 text-amber-50/90 text-[10px]"
                }
              >
                {change.recordType.toUpperCase()}
              </Badge>
            </div>
            <div className="text-xs text-amber-100/40 flex items-center gap-1">
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
            <div className="text-xs text-amber-100/40">
              was {formatScore(change.previousScore)}
            </div>
          )}
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
        className="mb-6 text-amber-100/60 hover:text-amber-50 hover:bg-slate-800/30"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Leaderboard
      </Button>

      {/* Player Header */}
      <div className="bg-emerald-950/20 rounded-xl border border-amber-900/20 p-6 mb-8">
        <div className="flex items-start gap-6">
          {player.avatarUrl ? (
            <img
              src={player.avatarUrl}
              alt=""
              className="w-24 h-24 rounded-full object-cover border-4 border-emerald-900/40"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-emerald-900/30 flex items-center justify-center text-3xl text-amber-100 border-4 border-emerald-900/40">
              {player.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getCountryFlag(player.countryCode)}
              <h1 className="text-3xl font-bold text-amber-50">
                {player.displayName}
              </h1>
              {latestSnapshot && latestSnapshot.rankChange !== 0 && (
                <div className="ml-2">
                  {getRankChangeIndicator(latestSnapshot.rankChange, "lg")}
                </div>
              )}
            </div>
            <p className="text-amber-100/50 mb-4">@{player.username}</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl">
              {/* Rank Card */}
              {latestSnapshot && (
                <div className="bg-emerald-950/30 rounded-lg p-3 text-center border border-amber-900/15">
                  <div className="text-2xl font-bold text-amber-50">
                    #{latestSnapshot.overallRank}
                  </div>
                  <div className="text-xs text-amber-200/50 uppercase">Rank</div>
                  <div className="mt-1">
                    {getRankChangeIndicator(latestSnapshot.rankChange)}
                  </div>
                </div>
              )}
              <div className="bg-emerald-950/30 rounded-lg p-3 text-center border border-amber-900/15">
                <div className="text-2xl font-bold text-emerald-400">
                  {summary.totalRecords}
                </div>
                <div className="text-xs text-amber-200/50 uppercase">
                  Total Records
                </div>
                <div
                  className={`text-lg font-bold mt-1 ${summary.totalScore < 0 ? "text-emerald-400/70" : summary.totalScore > 0 ? "text-red-400/70" : "text-amber-100/30"}`}
                >
                  {summary.totalScore > 0 ? "+" : ""}
                  {summary.totalScore}
                </div>
              </div>
              <div className="bg-emerald-950/30 rounded-lg p-3 text-center border border-amber-900/15">
                <div className="text-2xl font-bold text-amber-100/80">
                  {summary.tipsRecords}
                </div>
                <div className="text-xs text-amber-200/50 uppercase">Tips</div>
                <div
                  className={`text-lg font-bold mt-1 ${summary.tipsTotalScore < 0 ? "text-emerald-400/70" : summary.tipsTotalScore > 0 ? "text-red-400/70" : "text-amber-100/30"}`}
                >
                  {summary.tipsTotalScore > 0 ? "+" : ""}
                  {summary.tipsTotalScore}
                </div>
              </div>
              <div className="bg-emerald-950/30 rounded-lg p-3 text-center border border-amber-900/15">
                <div className="text-2xl font-bold text-blue-400/90">
                  {summary.sgtRecords}
                </div>
                <div className="text-xs text-amber-200/50 uppercase">SGT</div>
                <div
                  className={`text-lg font-bold mt-1 ${summary.sgtTotalScore < 0 ? "text-emerald-400/70" : summary.sgtTotalScore > 0 ? "text-red-400/70" : "text-amber-100/30"}`}
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
            className="text-amber-200/50 hover:text-amber-50 transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-emerald-950/30 border border-amber-900/20 mb-6">
          <TabsTrigger
            value="records"
            className="text-amber-100/60 data-[state=active]:bg-emerald-800/70 data-[state=active]:text-amber-50"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Course Records ({records.length})
          </TabsTrigger>
          <TabsTrigger
            value="rivalries"
            className="text-amber-100/60 data-[state=active]:bg-emerald-800/70 data-[state=active]:text-amber-50"
          >
            <Swords className="h-4 w-4 mr-2" />
            Rivalries ({rivalriesData?.rivalries.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="text-amber-100/60 data-[state=active]:bg-emerald-800/70 data-[state=active]:text-amber-50"
          >
            <Zap className="h-4 w-4 mr-2" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="text-amber-100/60 data-[state=active]:bg-emerald-800/70 data-[state=active]:text-amber-50"
          >
            <History className="h-4 w-4 mr-2" />
            Rank History
          </TabsTrigger>
        </TabsList>

        {/* Records Tab */}
        <TabsContent value="records">
          <div className="bg-emerald-950/20 rounded-xl border border-amber-900/20 overflow-hidden">
            <div className="divide-y divide-amber-900/15">
              {records.map((record, idx) => (
                <div
                  key={`${record.course.id}-${record.recordType}-${idx}`}
                  className="px-6 py-4 hover:bg-emerald-900/15 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <Link
                          to={`/course/${record.course.id}`}
                          className="font-medium text-amber-50 hover:text-emerald-400 transition-colors"
                        >
                          {record.course.name}
                        </Link>
                        <Badge
                          className={
                            record.recordType === "tips"
                              ? "bg-slate-400/70 text-slate-800 text-[10px]"
                              : "bg-blue-800/70 text-amber-50/90 text-[10px]"
                          }
                        >
                          {record.recordType.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-amber-100/40">
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
              <div className="px-6 py-12 text-center text-amber-100/40">
                No course records found
              </div>
            )}
          </div>
        </TabsContent>

        {/* Rivalries Tab */}
        <TabsContent value="rivalries">
          <div className="mb-4">
            <Select
              value={rivalryPeriod?.toString() || "all"}
              onValueChange={(v) =>
                setRivalryPeriod(v === "all" ? undefined : Number(v))
              }
            >
              <SelectTrigger className="w-56 bg-transparent border-amber-900/20 text-amber-100 hover:border-amber-700/40">
                <Clock className="h-4 w-4 mr-2 text-amber-200/50" />
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent className="bg-emerald-950/95 backdrop-blur-sm border-amber-900/30">
                <SelectItem value="7" className="text-amber-100 focus:bg-slate-700/50 focus:text-amber-50">
                  Last 7 days
                </SelectItem>
                <SelectItem
                  value="30"
                  className="text-amber-100 focus:bg-slate-700/50 focus:text-amber-50"
                >
                  Last 30 days
                </SelectItem>
                <SelectItem
                  value="90"
                  className="text-amber-100 focus:bg-slate-700/50 focus:text-amber-50"
                >
                  Last 90 days
                </SelectItem>
                <SelectItem
                  value="all"
                  className="text-amber-100 focus:bg-slate-700/50 focus:text-amber-50"
                >
                  All Time
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-emerald-950/20 rounded-xl border border-amber-900/20 overflow-hidden">
            {rivalriesData?.rivalries && rivalriesData.rivalries.length > 0 ? (
              <div className="divide-y divide-amber-900/15">
                {rivalriesData.rivalries.map((rivalry: Rivalry) => (
                  <div
                    key={rivalry.player.id}
                    className="px-6 py-4 hover:bg-emerald-900/15 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {rivalry.player.avatarUrl ? (
                          <img
                            src={rivalry.player.avatarUrl}
                            alt=""
                            className={`w-12 h-12 rounded-full object-cover ring-2 ${rivalry.balance > 0 ? "ring-emerald-700/50" : rivalry.balance < 0 ? "ring-red-800/50" : "ring-amber-900/30"}`}
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-amber-100 ring-2 ${rivalry.balance > 0 ? "bg-emerald-900/30 ring-emerald-700/50" : rivalry.balance < 0 ? "bg-red-900/30 ring-red-800/50" : "bg-slate-800/30 ring-amber-900/30"}`}>
                            {rivalry.player.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            {getCountryFlag(rivalry.player.countryCode)}
                            <button
                              onClick={() =>
                                navigate(`/records/player/${rivalry.player.id}`)
                              }
                              className="font-semibold text-amber-50 hover:text-emerald-400 transition-colors"
                            >
                              {rivalry.player.displayName}
                            </button>
                          </div>
                          <span className="text-xs text-amber-100/40">
                            @{rivalry.player.username}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {/* Balance Badge */}
                        <div className={`flex items-center justify-end gap-2 mb-2 px-3 py-1 rounded-full ${rivalry.balance > 0 ? "bg-emerald-900/30" : rivalry.balance < 0 ? "bg-red-900/30" : "bg-slate-800/30"}`}>
                          {rivalry.balance > 0 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-emerald-400/80" />
                              <span className="text-xl font-black text-emerald-400">
                                +{rivalry.balance}
                              </span>
                            </>
                          ) : rivalry.balance < 0 ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-400/70" />
                              <span className="text-xl font-black text-red-400/80">
                                {rivalry.balance}
                              </span>
                            </>
                          ) : (
                            <>
                              <Minus className="h-4 w-4 text-amber-100/30" />
                              <span className="text-xl font-black text-amber-100/40">
                                0
                              </span>
                            </>
                          )}
                        </div>
                        {/* Win/Loss Stats */}
                        <div className="flex items-center gap-3 text-sm">
                          <div className="text-center">
                            <div className="text-emerald-400/80 font-bold text-lg">
                              {rivalry.recordsTakenByMe}
                            </div>
                            <div className="text-[10px] text-amber-100/40 uppercase">
                              Won
                            </div>
                          </div>
                          <div className="text-amber-100/20">-</div>
                          <div className="text-center">
                            <div className="text-red-400/70 font-bold text-lg">
                              {rivalry.recordsTakenFromMe}
                            </div>
                            <div className="text-[10px] text-amber-100/40 uppercase">
                              Lost
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rivalry Comment */}
                    <div className="mt-3 mb-3 px-3 py-2 bg-emerald-950/20 rounded-lg border-l-2 border-amber-900/30">
                      <p className="text-sm text-amber-100/60 italic">
                        {getRivalryComment(rivalry.balance, rivalry.player.displayName)}
                      </p>
                    </div>

                    {/* List of courses */}
                    <div className="mt-3 space-y-2">
                      {rivalry.coursesWon.length > 0 && (
                        <div>
                          <div className="text-xs text-emerald-400/80 font-semibold mb-1 px-1 flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            Records Won ({rivalry.coursesWon.length})
                          </div>
                          <div className="space-y-1">
                            {rivalry.coursesWon.map((course, idx) => (
                              <div
                                key={`won-${course.courseId}-${idx}`}
                                className="flex items-center justify-between text-sm bg-emerald-900/20 rounded px-3 py-2 border-l-2 border-emerald-700/50"
                              >
                                <div className="flex items-center gap-2">
                                  <Link
                                    to={`/courses/${course.courseId}`}
                                    className="text-amber-100/70 hover:text-emerald-400 transition-colors"
                                  >
                                    {course.courseName}
                                  </Link>
                                  <Badge
                                    className={`text-[10px] px-1.5 py-0 ${course.recordType === "tips" ? "bg-slate-400/70 text-slate-800" : "bg-blue-800/70 text-amber-50/90"}`}
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
                      {rivalry.coursesLost.length > 0 && (
                        <div>
                          <div className="text-xs text-red-400/70 font-semibold mb-1 px-1 flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Records Lost ({rivalry.coursesLost.length})
                          </div>
                          <div className="space-y-1">
                            {rivalry.coursesLost.map((course, idx) => (
                              <div
                                key={`lost-${course.courseId}-${idx}`}
                                className="flex items-center justify-between text-sm bg-red-900/20 rounded px-3 py-2 border-l-2 border-red-800/50"
                              >
                                <div className="flex items-center gap-2">
                                  <Link
                                    to={`/courses/${course.courseId}`}
                                    className="text-amber-100/70 hover:text-emerald-400 transition-colors"
                                  >
                                    {course.courseName}
                                  </Link>
                                  <Badge
                                    className={`text-[10px] px-1.5 py-0 ${course.recordType === "tips" ? "bg-slate-400/70 text-slate-800" : "bg-blue-800/70 text-amber-50/90"}`}
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
              <div className="px-6 py-12 text-center text-amber-100/40">
                <Swords className="h-12 w-12 mx-auto mb-4 text-amber-100/20" />
                <p className="text-lg font-semibold mb-2 text-amber-100/60">No Rivalries Found</p>
                <p className="text-sm text-amber-100/40">
                  No one has taken any records from {player.displayName} in this
                  time period
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <div className="bg-emerald-950/20 rounded-xl border border-amber-900/20 overflow-hidden">
            {recordChangesData?.changes &&
            recordChangesData.changes.length > 0 ? (
              <div>
                {recordChangesData.changes.map(renderRecordChangeItem)}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-amber-100/40">
                No recent record changes
              </div>
            )}
          </div>
        </TabsContent>

        {/* Rank History Tab */}
        <TabsContent value="history">
          <div className="bg-emerald-950/20 rounded-xl border border-amber-900/20 overflow-hidden">
            {rankHistoryData?.history && rankHistoryData.history.length > 0 ? (
              <div>
                {rankHistoryData.history.map(renderRankHistoryItem)}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-amber-100/40">
                <History className="h-12 w-12 mx-auto mb-4 text-amber-100/20" />
                <p className="text-amber-100/60">No rank history available yet</p>
                <p className="text-sm text-amber-100/40 mt-2">
                  Rank history will appear after the next scrape run
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
