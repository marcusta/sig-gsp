import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getDistanceForSpeed, getSpeedForDistance } from "@/putting";
import { Switch } from "@/components/ui/switch";
import { useUnit } from "../contexts/UnitContext";
import { Button } from "@/components/ui/button";
import { StimpSelector } from "./StimpSelector";

export function PuttCalculator() {
  const { unitSystem } = useUnit();
  const [mode, setMode] = useState<"speedToDistance" | "distanceToSpeed">(
    "speedToDistance"
  );
  const [speed, setSpeed] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [stimp, setStimp] = useState<number>(11);

  const handleCalculate = () => {
    if (mode === "speedToDistance" && speed) {
      let result = getDistanceForSpeed(Number(speed), stimp);
      // Convert meters to feet if using imperial
      if (unitSystem === "imperial") {
        result = result * 3.28084;
      }
      setDistance(result.toFixed(2));
    } else if (mode === "distanceToSpeed" && distance) {
      // Convert feet to meters if using imperial
      const distanceInMeters =
        unitSystem === "imperial"
          ? Number(distance) / 3.28084
          : Number(distance);
      const result = getSpeedForDistance(distanceInMeters, stimp);
      setSpeed(result.toFixed(2));
    }
  };

  const handleClear = () => {
    setSpeed("");
    setDistance("");
  };

  return (
    <div className="p-4 min-h-[600px] max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Replace Stimp Selection with new component */}
        <StimpSelector
          selectedStimp={stimp}
          onStimpChange={setStimp}
          showLabel={false}
          />

        {/* Mode Selection */}
        <div>
          <div className="h-8 flex items-center gap-2">
            <Label htmlFor="mode-toggle">Calculation Mode</Label>
          </div>
          <div className="flex items-center gap-2 h-11">
            <Switch
              id="mode-toggle"
              checked={mode === "distanceToSpeed"}
              onCheckedChange={(checked) =>
                setMode(checked ? "distanceToSpeed" : "speedToDistance")
              }
            />
            <Label htmlFor="mode-toggle" className="text-muted-foreground">
              {mode === "speedToDistance"
                ? "Calculate Distance from Speed"
                : "Calculate Speed from Distance"}
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          <div>
            <div className="h-8 flex items-center">
              <Label htmlFor="speed">Ball Speed (mph)</Label>
            </div>
            <Input
              id="speed"
              type="number"
              min="0"
              max="15"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              disabled={mode === "distanceToSpeed"}
              className="bg-background h-11"
            />
          </div>

          <div>
            <div className="h-8 flex items-center">
              <Label htmlFor="distance">
                Distance ({unitSystem === "imperial" ? "feet" : "meters"})
              </Label>
            </div>
            <Input
              id="distance"
              type="number"
              min="0"
              max={unitSystem === "imperial" ? 65 : 20}
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              disabled={mode === "speedToDistance"}
              className="bg-background h-11"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleCalculate} className="flex-1 h-12 text-lg">
            Calculate
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            className="flex-1 h-12 text-lg"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
