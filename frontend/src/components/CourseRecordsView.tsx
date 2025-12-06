import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { CourseRecords, RecordChangeEvent } from "@/types";
import { Badge } from "./ui/badge";
import { fetchCourseRecordHistory } from "@/api/useApi";
import {
  ChevronDown,
  ChevronUp,
  History,
  Zap,
  TrendingUp,
  Trophy,
} from "lucide-react";

interface CourseRecordsViewProps {
  data: CourseRecords | undefined;
  isLoading: boolean;
  error: Error | null;
  recordType: "CR" | "CRTips";
  onRecordTypeChange: (type: "CR" | "CRTips") => void;
  sgtId: string;
  courseId?: number;
}

export const CourseRecordsView: React.FC<CourseRecordsViewProps> = ({
  data,
  isLoading,
  error,
  recordType,
  onRecordTypeChange,
  sgtId,
  courseId,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  // Fetch record history if courseId is available
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["courseRecordHistory", courseId, recordType],
    queryFn: () =>
      fetchCourseRecordHistory(
        courseId!,
        recordType === "CR" ? "sgt" : "tips"
      ),
    enabled: !!courseId && showHistory,
  });

  const HeaderSection = () => (
    <div className="flex justify-between items-center border-b pb-4">
      <div className="flex items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Course Records</h3>
          <p className="text-sm text-muted-foreground">
            Best scores from {recordType === "CR" ? "SGT" : "Tips"} tees
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const url = `https://simulatorgolftour.com/event-register/course-record/${
              recordType === "CR" ? "sgt" : "tips"
            }/${sgtId}`;
            window.open(url, "_blank", "noopener,noreferrer");
          }}
        >
          Attempt
        </Button>
      </div>
      <div className="space-x-2">
        <Button
          size="sm"
          variant={recordType === "CR" ? "default" : "outline"}
          onClick={() => onRecordTypeChange("CR")}
        >
          SGT
        </Button>
        <Button
          size="sm"
          variant={recordType === "CRTips" ? "default" : "outline"}
          onClick={() => onRecordTypeChange("CRTips")}
        >
          Tips
        </Button>
      </div>
    </div>
  );

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "BROKEN":
        return <Zap className="h-3 w-3 text-yellow-500" />;
      case "IMPROVED":
        return <TrendingUp className="h-3 w-3 text-emerald-400" />;
      case "INITIAL":
        return <Trophy className="h-3 w-3 text-blue-400" />;
      default:
        return null;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Last day";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString();
  };

  const renderHistoryItem = (change: RecordChangeEvent) => (
    <div
      key={change.id}
      className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg"
    >
      <div className="flex items-center gap-2">
        {getChangeIcon(change.changeType)}
        <div>
          <div className="text-sm font-medium">{change.newPlayer.displayName}</div>
          <div className="text-xs text-muted-foreground">
            {formatTimeAgo(change.detectedAt)}
            {change.changeType === "BROKEN" && change.previousPlayer && (
              <span className="ml-1">
                (from {change.previousPlayer.displayName})
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <Badge variant="secondary" className="text-xs">
          {change.newScore}
        </Badge>
        {change.previousScore && change.changeType !== "INITIAL" && (
          <div className="text-[10px] text-muted-foreground">
            was {change.previousScore}
          </div>
        )}
      </div>
    </div>
  );

  const baseContainerClasses =
    "min-h-[600px] w-full min-w-[600px] space-y-6 px-4";

  return (
    <div className={baseContainerClasses}>
      <HeaderSection />

      {isLoading && <div className="text-center p-4">Loading records...</div>}

      {error && (
        <div className="text-center text-red-500 p-4">
          Error loading records
        </div>
      )}

      {!isLoading && !error && (!data || !data.entries?.length) && (
        <div className="text-center p-4">No records found</div>
      )}

      {data && data.entries && data.entries.length > 0 && (
        <>
          <div className="space-y-3">
            {data.entries.map((entry, index) => (
              <div
                key={entry.playerName}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-medium text-muted-foreground w-8">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center">
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.playerName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xl text-muted-foreground">
                          {entry.playerName[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <a
                      href={entry.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-medium hover:underline"
                    >
                      {entry.playerName}
                    </a>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <img
                        src={`https://flagcdn.com/w20/${entry.countryCode}.png`}
                        alt={entry.countryCode}
                        className="w-5 h-4"
                      />
                      <span>{entry.attempts} attempts</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Best Score
                  </div>
                  <Badge className="text-base px-3 py-1">
                    {entry.lowScore}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {data.entries.length < 5 && (
            <div className="text-center text-sm text-muted-foreground pt-4">
              Showing all {data.entries.length} players with attempts
            </div>
          )}
        </>
      )}

      {/* Record History Section */}
      {courseId && (
        <div className="border-t pt-4 mt-6">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between py-2"
            onClick={() => setShowHistory(!showHistory)}
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <History className="h-4 w-4" />
              Record History
            </span>
            {showHistory ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showHistory && (
            <div className="mt-4 space-y-2">
              {historyLoading ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  Loading history...
                </div>
              ) : historyData?.history && historyData.history.length > 0 ? (
                historyData.history.map(renderHistoryItem)
              ) : (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No record history available yet
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
