import React from "react";
import { Button } from "./ui/button";
import { CourseRecords } from "@/types";
import { Badge } from "./ui/badge";

interface CourseRecordsViewProps {
  data: CourseRecords | undefined;
  isLoading: boolean;
  error: Error | null;
  recordType: "CR" | "CRTips";
  onRecordTypeChange: (type: "CR" | "CRTips") => void;
  sgtId: string;
}

export const CourseRecordsView: React.FC<CourseRecordsViewProps> = ({
  data,
  isLoading,
  error,
  recordType,
  onRecordTypeChange,
  sgtId,
}) => {
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
    </div>
  );
};
