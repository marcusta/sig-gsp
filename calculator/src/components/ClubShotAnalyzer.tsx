import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import {
  analyzeClubShot,
  type ShotIncrementResult,
  getClubs,
  type ClubInfo,
  getMaterials,
  type MaterialInfo,
} from "@/api";
import { Input } from "@/components/ui/input";
import { useUnit } from "../contexts/UnitContext";
import { convertMetersToYards } from "@/types/units";

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

export function ClubShotAnalyzer() {
  const { unitSystem } = useUnit();
  const [club, setClub] = useState<string>("7 Iron"); // Default to 7 iron
  const [clubs, setClubs] = useState<ClubInfo[]>([]);
  const [material, setMaterial] = useState<string>("fairway");
  const [results, setResults] = useState<(ShotIncrementResult | null)[] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upDownLie, setUpDownLie] = useState<string>("0");
  const [rightLeftLie, setRightLeftLie] = useState<string>("0");
  const [altitude, setAltitude] = useState<string>("0");
  const [elevation, setElevation] = useState<string>("0");
  const [materials, setMaterials] = useState<MaterialInfo[]>([]);

  // Update useEffect to remove dependency
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clubList, materialList] = await Promise.all([
          getClubs(),
          getMaterials(),
        ]);

        setClubs(clubList);
        setMaterials(materialList);

        // Set default club if current selection isn't in the list
        if (!clubList.some((c) => c.name === club)) {
          setClub(clubList[0]?.name ?? "");
        }
        // Set default material if current selection isn't in the list
        if (!materialList.some((m) => m.name === material)) {
          setMaterial(materialList[0]?.name ?? "");
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Failed to load clubs and materials");
      }
    };

    loadData();
  }, []); // Empty dependency array since we're caching

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyzeClubShot(
        club,
        material,
        validateLieInput(upDownLie),
        validateLieInput(rightLeftLie),
        validateLieInput(elevation),
        validateLieInput(altitude)
      );
      setResults(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const validateLieInput = (value: string): number => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const formatDistance = (meters: number): string => {
    const distance =
      unitSystem === "imperial" ? convertMetersToYards(meters) : meters;
    return `${distance.toFixed(1)}${
      unitSystem === "imperial" ? "yards" : "meters"
    }`;
  };

  return (
    <div className="p-4 min-h-[600px] max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {/* First row */}
          <div>
            <div className="h-8 flex items-center">
              <Label htmlFor="club">Club</Label>
            </div>
            <Select value={club} onValueChange={setClub}>
              <SelectTrigger className="bg-background h-11">
                <SelectValue placeholder="Select club" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club.name} value={club.name}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="h-8 flex items-center">
              <Label htmlFor="material">Lie/Material</Label>
            </div>
            <Select value={material} onValueChange={setMaterial}>
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
              <Label htmlFor="elevation">Elevation diff.</Label>
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
              id="elevation"
              value={elevation}
              onChange={setElevation}
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
          {loading ? "Calculating..." : "Calculate Shot Parameters"}
        </Button>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Results section */}
        {results && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              Shot Parameters for {club}:
            </h3>
            <div className="space-y-4">
              {results.map(
                (result, index) =>
                  result && (
                    <div
                      key={index}
                      className="border p-4 rounded-lg bg-background/50 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-semibold">
                          {index === 0
                            ? "Minimum"
                            : index === 1
                            ? "Quarter"
                            : index === 2
                            ? "Half"
                            : index === 3
                            ? "Three-Quarter"
                            : "Maximum"}{" "}
                          Power
                        </h4>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="space-y-2">
                              <div className="space-y-2">
                                <p className="font-semibold">Shot Details:</p>
                                <p>
                                  Ball Speed: {result.ballSpeed.toFixed(1)} mph
                                </p>
                                <p>Spin Rate: {result.spin.toFixed(0)} rpm</p>
                                <p>Launch Angle: {result.vla.toFixed(1)}°</p>
                                <p className="text-red-500">
                                  Carry Reduced by{" "}
                                  {(
                                    (1 -
                                      result.estimatedCarry / result.rawCarry) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </p>
                                {result.offlineDeviation !== 0 && (
                                  <p className="text-yellow-500">
                                    Ball will travel{" "}
                                    {formatDistance(
                                      Math.abs(result.offlineDeviation)
                                    )}{" "}
                                    {result.offlineDeviation > 0
                                      ? "right"
                                      : "left"}{" "}
                                    of target
                                  </p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="space-y-1 mt-2">
                        <p>"Plays as": {formatDistance(result.envCarry)}</p>
                        <p>Raw Carry: {formatDistance(result.rawCarry)}</p>
                        <p>
                          +lie penalty: {formatDistance(result.estimatedCarry)}
                        </p>
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
