import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getAvailableStimps } from "@/putting";

interface StimpSelectorProps {
  selectedStimp: number;
  onStimpChange: (stimp: number) => void;
  showLabel?: boolean;
}

export function StimpSelector({
  selectedStimp,
  onStimpChange,
  showLabel = true,
}: StimpSelectorProps) {
  const stimpValues = getAvailableStimps();

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="h-8 flex items-center">
          <Label>Stimp Speed</Label>
        </div>
      )}
      <div className="flex gap-2">
        {stimpValues.map((stimpValue) => (
          <Button
            key={stimpValue}
            variant={selectedStimp === stimpValue ? "default" : "outline"}
            size="sm"
            onClick={() => onStimpChange(stimpValue)}
            className="h-11"
          >
            Stimp {stimpValue}
          </Button>
        ))}
      </div>
    </div>
  );
}
