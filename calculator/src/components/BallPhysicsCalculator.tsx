import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateCarry,
  type CalculateCarryResponse,
  getMaterials,
  type MaterialInfo,
} from "@/api";
import { convertMetersToYards } from "@/types/units";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Plus, Minus } from "lucide-react";
import { useUnit } from "../contexts/UnitContext";

// Reuse the same components from other calculators
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
  value: string | number;
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
    const currentValue = parseFloat(value.toString()) || 0;
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

export function BallPhysicsCalculator() {
  const { unitSystem } = useUnit();
  const [speed, setSpeed] = useState<number>(120);
  const [vla, setVLA] = useState<number>(20);
  const [spin, setSpin] = useState<number>(6000);
  const [material, setMaterial] = useState<string>("fairway");
  const [materials, setMaterials] = useState<MaterialInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [upDownLie, setUpDownLie] = useState<string>("0");
  const [rightLeftLie, setRightLeftLie] = useState<string>("0");
  const [altitude, setAltitude] = useState<string>("0");
  const [elevationDiff, setElevationDiff] = useState<string>("0");
  const [result, setResult] = useState<CalculateCarryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const materialList = await getMaterials();
        setMaterials(materialList);
        if (!materialList.some((m) => m.name === material)) {
          setMaterial(materialList[0]?.name ?? "");
        }
      } catch (err) {
        console.error("Failed to load materials:", err);
        setError("Failed to load materials");
      }
    };

    loadMaterials();
  }, []); // Empty dependency array since we're caching

  const handleCalculate = async () => {
    if (speed && vla && spin) {
      setIsLoading(true);
      setError(null);
      try {
        const calculatedResult = await calculateCarry({
          ballSpeed: speed,
          spin,
          vla,
          material,
          upDownLie: parseFloat(upDownLie) || 0,
          rightLeftLie: parseFloat(rightLeftLie) || 0,
          elevation: parseFloat(elevationDiff) || 0,
          altitude: parseFloat(altitude) || 0,
        });
        setResult(calculatedResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setResult(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDistance = (distance: number): string => {
    const convertedDistance =
      unitSystem === "imperial" ? convertMetersToYards(distance) : distance;
    return `${convertedDistance.toFixed(1)} ${
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
              <Label htmlFor="speed">Ball Speed (mph)</Label>
            </div>
            <NumberInputWithControls
              id="speed"
              value={speed}
              onChange={(v) => setSpeed(Number(v))}
              increment={1}
              quickSelectValues={[
                { value: 100, label: "100" },
                { value: 125, label: "125" },
                { value: 150, label: "150" },
              ]}
            />
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
            <div className="h-8 flex items-center">
              <Label htmlFor="vla">Launch Angle (°)</Label>
            </div>
            <NumberInputWithControls
              id="vla"
              value={vla}
              onChange={(v) => setVLA(Number(v))}
              increment={0.5}
              quickSelectValues={[
                { value: 15, label: "15°" },
                { value: 20, label: "20°" },
                { value: 25, label: "25°" },
              ]}
            />
          </div>

          <div>
            <div className="h-8 flex items-center">
              <Label htmlFor="spin">Spin Rate (rpm)</Label>
            </div>
            <NumberInputWithControls
              id="spin"
              value={spin}
              onChange={(v) => setSpin(Number(v))}
              increment={100}
              quickSelectValues={[
                { value: 2000, label: "2k" },
                { value: 4000, label: "4k" },
                { value: 6000, label: "6k" },
                { value: 8000, label: "8k" },
              ]}
            />
          </div>

          {/* Third row */}
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

          {/* Fourth row */}
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
          disabled={isLoading || !speed || !vla || !spin}
          className="w-full h-12 text-lg"
        >
          {isLoading ? "Calculating..." : "Calculate Ball Physics"}
        </Button>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {result && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Results:</h3>
            <div className="border p-4 rounded-lg bg-background/50 space-y-4">
              <div className="space-y-1">
                <p>Raw Carry: {formatDistance(result.carryRaw)}</p>
                <p>+lie penalty: {formatDistance(result.carryModified)}</p>
                <p>+environment: {formatDistance(result.envCarry)}</p>
                {result.offlineDeviation !== 0 && (
                  <p className="text-yellow-500">
                    Ball will travel{" "}
                    {formatDistance(Math.abs(result.offlineDeviation))}{" "}
                    {result.offlineDeviation > 0 ? "right" : "left"} of target
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
