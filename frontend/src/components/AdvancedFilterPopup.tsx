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

export const MIN_PAR = 0;
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
  };

  const handleOk = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleClearAll = () => {
    setLocalFilters(DEFAULT_ADVANCED_FILTERS);
    onFilterChange(DEFAULT_ADVANCED_FILTERS);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4">Teebox Length</Label>
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
            <div className="col-span-1 text-right">
              {localFilters.teeboxLength[0]} - {localFilters.teeboxLength[1]}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4">Altitude</Label>
            <RangeSlider
              className="col-span-3"
              min={MIN_ALTITUDE}
              max={MAX_ALTITUDE}
              step={100}
              value={localFilters.altitude}
              onValueChange={(value) => handleSliderChange("altitude", value)}
            />
            <div className="col-span-1 text-right">
              {localFilters.altitude[0]} - {localFilters.altitude[1]}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4">Par</Label>
            <RangeSlider
              className="col-span-3"
              min={MIN_PAR}
              max={MAX_PAR}
              step={1}
              value={localFilters.par}
              onValueChange={(value) => handleSliderChange("par", value)}
            />
            <div className="col-span-1 text-right">
              {localFilters.par[0]} - {localFilters.par[1]}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="only-eighteen-holes"
              checked={localFilters.onlyEighteenHoles}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="only-eighteen-holes">Only 18-hole courses</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is-par3"
              checked={localFilters.isPar3}
              onCheckedChange={handlePar3SwitchChange}
            />
            <Label htmlFor="is-par3">Only Par 3 courses</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="range-enabled"
              checked={localFilters.rangeEnabled}
              onCheckedChange={handleRangeEnabledChange}
            />
            <Label htmlFor="range-enabled">Has Driving Range</Label>
          </div>
          <div className="space-y-2">
            <Label>Course Attributes</Label>
            <Select onValueChange={handleAttributeSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select attributes..." />
              </SelectTrigger>
              <SelectContent>
                {attributes
                  .filter(
                    (attr) => !localFilters.selectedAttributes.includes(attr.id)
                  )
                  .map((attr) => (
                    <SelectItem key={attr.id} value={attr.id.toString()}>
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
                  <Badge key={attrId} variant="secondary">
                    {attr.name}
                    <button
                      onClick={() => handleRemoveAttribute(attrId)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleClearAll}>
            Clear All
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="outline" onClick={handleApply}>
              Apply
            </Button>
            <Button onClick={handleOk}>OK</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFilterPopup;
