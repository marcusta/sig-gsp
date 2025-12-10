import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Plus, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { convertMetersToYards, convertYardsToMeters } from "@/types/units";
import { suggestShot, getMaterials, type MaterialInfo } from "@/api";
import { useUnit } from "../contexts/UnitContext";

interface ShotSuggestion {
  club: string;
  estimatedCarry: number;
  rawCarry: number;
  offlineDeviation: number;
}

interface QuickSelectButtonProps {
  value: number;
  onClick: (value: number) => void;
  label: string;
}

function QuickSelectButton({ value, onClick, label }: QuickSelectButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="px-2 py-1 h-8"
      onClick={() => onClick(value)}
    >
      {label}
    </Button>
  );
}

interface NumberInputWithControlsProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  increment: number;
  quickSelectValues?: Array<{ value: number; label: string }>;
}

function NumberInputWithControls({
  id,
  value,
  onChange,
  increment,
  quickSelectValues,
}: NumberInputWithControlsProps) {
  const handleIncrement = (amount: number) => {
    const currentValue = parseFloat(value) || 0;
    onChange((currentValue + amount).toString());
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 h-11">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-background h-11"
        />
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleIncrement(-increment)}
            className="h-11 aspect-square"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleIncrement(increment)}
            className="h-11 aspect-square"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {quickSelectValues && (
        <div className="flex gap-1 flex-wrap">
          {quickSelectValues.map(({ value, label }) => (
            <QuickSelectButton
              key={value}
              value={value}
              onClick={(v) => onChange(v.toString())}
              label={label}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ShotSuggester() {
  const { unitSystem } = useUnit();
  const [targetCarry, setTargetCarry] = useState<string>("");
  const [suggestions, setSuggestions] = useState<ShotSuggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upDownLie, setUpDownLie] = useState<string>("0");
  const [rightLeftLie, setRightLeftLie] = useState<string>("0");
  const [altitude, setAltitude] = useState<string>("0");
  const [elevationDiff, setElevationDiff] = useState<string>("0");
  const [material, setMaterial] = useState<string>("");
  const [materials, setMaterials] = useState<MaterialInfo[]>([]);

  // Load materials on mount
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const materialList = await getMaterials();
        setMaterials(materialList);
        // Set default material if none selected
        if (!material && materialList.length > 0) {
          setMaterial(materialList[0].name);
        }
      } catch (err) {
        console.error("Failed to load materials:", err);
        setError("Failed to load materials");
      }
    };

    loadMaterials();
  }, [material, materials]); // Empty dependency array since we're caching

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const targetDistance =
        unitSystem === "imperial"
          ? convertYardsToMeters(parseFloat(targetCarry))
          : parseFloat(targetCarry);

      const elevationDiffMeters =
        unitSystem === "imperial"
          ? convertYardsToMeters(parseFloat(elevationDiff) || 0)
          : parseFloat(elevationDiff) || 0;

      if (isNaN(targetDistance)) {
        throw new Error("Please enter a valid target distance");
      }

      const suggestion = await suggestShot(
        targetDistance,
        material,
        parseFloat(upDownLie) || 0,
        parseFloat(rightLeftLie) || 0,
        elevationDiffMeters,
        parseFloat(altitude) || 0
      );

      setSuggestions([
        {
          club: suggestion.clubName,
          estimatedCarry: suggestion.estimatedCarry,
          rawCarry: suggestion.rawCarry,
          offlineDeviation: suggestion.offlineAimAdjustment,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 min-h-[600px] max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {/* First row */}
          <div>
            <div className="h-8 flex items-center">
              <Label htmlFor="target-carry">Target Carry</Label>
            </div>
            <NumberInputWithControls
              id="target-carry"
              value={targetCarry}
              onChange={setTargetCarry}
              increment={5}
              quickSelectValues={[
                { value: 100, label: "100" },
                { value: 150, label: "150" },
                { value: 200, label: "200" },
              ]}
            />
          </div>

          <div>
            <div className="h-8 flex items-center">
              <Label htmlFor="material">Lie/Material</Label>
            </div>
            <Select
              value={material}
              onValueChange={(value) => setMaterial(value)}
            >
              <SelectTrigger className="bg-background h-11">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((mat) => (
                  <SelectItem key={mat.name} value={mat.name}>
                    {mat.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Second row */}
          <div>
            <div className="h-8 flex items-center gap-2">
              <Label htmlFor="updown-lie">Up/Down Slope</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Positive = uphill lie
                    <br />
                    Negative = downhill lie
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <NumberInputWithControls
              id="updown-lie"
              value={upDownLie}
              onChange={setUpDownLie}
              increment={1}
              quickSelectValues={[
                { value: -5, label: "-5°" },
                { value: 0, label: "0°" },
                { value: 5, label: "+5°" },
              ]}
            />
          </div>

          <div>
            <div className="h-8 flex items-center gap-2">
              <Label htmlFor="rightleft-lie">Right/Left Slope</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Positive = right slope
                    <br />
                    Negative = left slope
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <NumberInputWithControls
              id="rightleft-lie"
              value={rightLeftLie}
              onChange={setRightLeftLie}
              increment={1}
              quickSelectValues={[
                { value: -5, label: "-5°" },
                { value: 0, label: "0°" },
                { value: 5, label: "+5°" },
              ]}
            />
          </div>

          <div>
            <div className="h-8 flex items-center gap-2">
              <Label htmlFor="altitude">Altitude (feet)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Height above sea level.
                    <br />
                    Shots travel ~1% further per 500ft of altitude
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <NumberInputWithControls
              id="altitude"
              value={altitude}
              onChange={setAltitude}
              increment={500}
              quickSelectValues={[
                { value: 0, label: "0" },
                { value: 1000, label: "1000" },
                { value: 2000, label: "2000" },
              ]}
            />
          </div>

          <div>
            <div className="h-8 flex items-center gap-2">
              <Label htmlFor="elevation-diff">Elevation diff.</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Height difference between ball and target.
                    <br />
                    Positive = uphill, Negative = downhill
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <NumberInputWithControls
              id="elevation-diff"
              value={elevationDiff}
              onChange={setElevationDiff}
              increment={1}
              quickSelectValues={[
                { value: -10, label: "-10" },
                { value: 0, label: "0" },
                { value: 10, label: "+10" },
              ]}
            />
          </div>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full h-12 text-lg"
        >
          {loading ? "Calculating..." : "Get Shot Suggestions"}
        </Button>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {suggestions && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Suggested Shot:</h3>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg bg-background/50 space-y-2"
                >
                  <p className="text-lg">
                    Plays as:{" "}
                    {(unitSystem === "imperial"
                      ? convertMetersToYards(suggestion.rawCarry)
                      : suggestion.rawCarry
                    ).toFixed(1)}{" "}
                    {unitSystem === "imperial" ? "yards" : "meters"}
                  </p>
                  {suggestion.offlineDeviation !== 0 && (
                    <p className="text-lg">
                      Aim{" "}
                      {(unitSystem === "imperial"
                        ? convertMetersToYards(
                            Math.abs(suggestion.offlineDeviation)
                          )
                        : Math.abs(suggestion.offlineDeviation)
                      ).toFixed(1)}{" "}
                      {unitSystem === "imperial" ? "yards" : "meters"}{" "}
                      {suggestion.offlineDeviation < 0 ? "left" : "right"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
