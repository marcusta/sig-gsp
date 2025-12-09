import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { RangeSlider } from "./ui/rangeslider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { AdvancedFilters } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseAttributes } from "@/api/useApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

export const MIN_PAR = 27;
export const MAX_PAR = 80;
export const MIN_TEEBOX_LENGTH = 0;
export const MAX_TEEBOX_LENGTH = 8000;
export const MIN_ALTITUDE = 0;
export const MAX_ALTITUDE = 10000;
export const MIN_DIFFICULTY = 0;
export const MAX_DIFFICULTY = 20;

export const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  teeboxLength: [MIN_TEEBOX_LENGTH, MAX_TEEBOX_LENGTH],
  altitude: [MIN_ALTITUDE, MAX_ALTITUDE],
  difficulty: [MIN_DIFFICULTY, MAX_DIFFICULTY],
  par: [MIN_PAR, MAX_PAR],
  onlyEighteenHoles: false,
  isPar3: undefined,
  rangeEnabled: undefined,
  selectedAttributes: [],
};

export function countActiveFilters(filters: AdvancedFilters): number {
  let count = 0;

  if (filters.teeboxLength[0] !== MIN_TEEBOX_LENGTH || filters.teeboxLength[1] !== MAX_TEEBOX_LENGTH) count++;
  if (filters.altitude[0] !== MIN_ALTITUDE || filters.altitude[1] !== MAX_ALTITUDE) count++;
  if (filters.difficulty[0] !== MIN_DIFFICULTY || filters.difficulty[1] !== MAX_DIFFICULTY) count++;
  if (filters.par[0] !== MIN_PAR || filters.par[1] !== MAX_PAR) count++;
  if (filters.onlyEighteenHoles) count++;
  if (filters.isPar3 !== undefined) count++;
  if (filters.rangeEnabled !== undefined) count++;
  if (filters.selectedAttributes && filters.selectedAttributes.length > 0) count += filters.selectedAttributes.length;

  return count;
}

interface AdvancedFilterPopupProps {
  filters: AdvancedFilters;
  onFilterChange: (filters: AdvancedFilters) => void;
  onClose: () => void;
}

const AdvancedFilterPopup: React.FC<AdvancedFilterPopupProps> = ({
  filters,
  onFilterChange,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>({
    ...filters,
    selectedAttributes: filters.selectedAttributes || [],
  });

  const { data: attributes = [] } = useQuery({
    queryKey: ["courseAttributes"],
    queryFn: fetchCourseAttributes,
  });

  const handleSliderChange = (key: keyof AdvancedFilters, value: number[]) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setLocalFilters((prev) => ({ ...prev, onlyEighteenHoles: checked }));
  };

  const handlePar3SwitchChange = (checked: boolean) => {
    setLocalFilters((prev) => ({ ...prev, isPar3: checked }));
  };

  const handleRangeEnabledChange = (checked: boolean) => {
    setLocalFilters((prev) => ({ ...prev, rangeEnabled: checked }));
  };

  const handleAttributeSelect = (attributeId: string) => {
    const id = parseInt(attributeId);
    setLocalFilters((prev) => ({
      ...prev,
      selectedAttributes: [...prev.selectedAttributes, id],
    }));
  };

  const handleRemoveAttribute = (attributeId: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      selectedAttributes: prev.selectedAttributes.filter(
        (id) => id !== attributeId
      ),
    }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleClearAll = () => {
    setLocalFilters(DEFAULT_ADVANCED_FILTERS);
    onFilterChange(DEFAULT_ADVANCED_FILTERS);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[425px] border-slate-600/30 shadow-2xl"
        style={{
          background: `
            radial-gradient(
              ellipse 120% 100% at 20% 10%,
              hsla(50, 85%, 70%, 0.12) 0%,
              hsla(50, 85%, 70%, 0) 45%
            ),
            radial-gradient(
              circle at 80% 90%,
              hsla(155, 40%, 18%, 0.20) 0%,
              hsla(155, 40%, 12%, 0) 60%
            ),
            linear-gradient(
              145deg,
              hsl(150, 35%, 10%) 0%,
              hsl(152, 33%, 12%) 35%,
              hsl(149, 28%, 9%) 70%,
              hsl(152, 30%, 11%) 100%
            )
          `,
        }}
      >
        {/* Film grain overlay */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Vignette effect */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            boxShadow: "inset 0 0 60px 15px rgba(0,0,0,0.25)",
          }}
        />

        <DialogHeader className="relative z-10">
          <DialogTitle className="text-lg font-semibold tracking-wide text-amber-50">Advanced Filters</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 relative z-10">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4 text-amber-100/80">Teebox Length</Label>
            <RangeSlider
              className="col-span-3"
              min={MIN_TEEBOX_LENGTH}
              max={MAX_TEEBOX_LENGTH}
              step={100}
              value={localFilters.teeboxLength}
              onValueChange={(value) =>
                handleSliderChange("teeboxLength", value)
              }
            />
            <div className="col-span-1 text-right text-amber-100/60 text-sm">
              {localFilters.teeboxLength[0]} - {localFilters.teeboxLength[1]}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4 text-amber-100/80">Altitude</Label>
            <RangeSlider
              className="col-span-3"
              min={MIN_ALTITUDE}
              max={MAX_ALTITUDE}
              step={100}
              value={localFilters.altitude}
              onValueChange={(value) => handleSliderChange("altitude", value)}
            />
            <div className="col-span-1 text-right text-amber-100/60 text-sm">
              {localFilters.altitude[0]} - {localFilters.altitude[1]}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4 text-amber-100/80">
              Par
              {localFilters.isPar3 && (
                <span className="ml-2 text-xs text-amber-200/50">(using Par 3 filter)</span>
              )}
            </Label>
            <RangeSlider
              className="col-span-3"
              min={MIN_PAR}
              max={MAX_PAR}
              step={1}
              value={localFilters.par}
              onValueChange={(value) => handleSliderChange("par", value)}
              disabled={localFilters.isPar3}
            />
            <div className="col-span-1 text-right text-amber-100/60 text-sm">
              {localFilters.par[0]} - {localFilters.par[1]}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="only-eighteen-holes"
              checked={localFilters.onlyEighteenHoles}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="only-eighteen-holes" className="text-amber-100/80">Only 18-hole courses</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is-par3"
              checked={localFilters.isPar3}
              onCheckedChange={handlePar3SwitchChange}
            />
            <Label htmlFor="is-par3" className="text-amber-100/80">Only Par 3 courses</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="range-enabled"
              checked={localFilters.rangeEnabled}
              onCheckedChange={handleRangeEnabledChange}
            />
            <Label htmlFor="range-enabled" className="text-amber-100/80">Has Driving Range</Label>
          </div>
          <div className="space-y-2">
            <Label className="text-amber-100/80">Course Attributes</Label>
            <Select onValueChange={handleAttributeSelect}>
              <SelectTrigger className="bg-slate-800/40 backdrop-blur-sm border-amber-900/30 text-amber-100 focus:ring-amber-700/30">
                <SelectValue placeholder="Select attributes..." className="text-amber-200/40" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-sm border-amber-900/30">
                {attributes
                  .filter(
                    (attr) => !localFilters.selectedAttributes.includes(attr.id)
                  )
                  .map((attr) => (
                    <SelectItem key={attr.id} value={attr.id.toString()} className="text-amber-100/80 focus:bg-slate-700/50 focus:text-amber-50">
                      {attr.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {localFilters.selectedAttributes.map((attrId) => {
                const attr = attributes.find((a) => a.id === attrId);
                if (!attr) return null;
                return (
                  <Badge key={attrId} variant="secondary" className="text-[10px] py-0.5 px-2 bg-emerald-900/50 text-amber-100/80 border border-emerald-800/30">
                    {attr.name}
                    <button
                      onClick={() => handleRemoveAttribute(attrId)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-between relative z-10">
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="bg-slate-800/40 backdrop-blur-sm border-amber-900/30 text-amber-100/90 hover:bg-slate-700/50 hover:text-amber-50"
          >
            Reset
          </Button>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-slate-800/40 backdrop-blur-sm border-amber-900/30 text-amber-100/90 hover:bg-slate-700/50 hover:text-amber-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="bg-emerald-800/70 hover:bg-emerald-700/70 border-emerald-700/50 text-amber-50"
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFilterPopup;
