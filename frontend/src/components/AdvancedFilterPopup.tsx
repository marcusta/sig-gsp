import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { RangeSlider } from "./ui/rangeslider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { AdvancedFilters } from "@/types";

export const MIN_PAR = 0;
export const MAX_PAR = 80;

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
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);

  const handleSliderChange = (key: keyof AdvancedFilters, value: number[]) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setLocalFilters((prev) => ({ ...prev, onlyEighteenHoles: checked }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleOk = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleClearAll = () => {
    const clearedFilters: AdvancedFilters = {
      teeboxLength: [0, 8000],
      altitude: [0, 10000],
      difficulty: [0, 20],
      par: [MIN_PAR, MAX_PAR],
      onlyEighteenHoles: false,
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
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
              min={0}
              max={8000}
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
              min={0}
              max={10000}
              step={100}
              value={localFilters.altitude}
              onValueChange={(value) => handleSliderChange("altitude", value)}
            />
            <div className="col-span-1 text-right">
              {localFilters.altitude[0]} - {localFilters.altitude[1]}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-4">Difficulty</Label>
            <RangeSlider
              className="col-span-3"
              min={0}
              max={20}
              step={1}
              value={localFilters.difficulty}
              onValueChange={(value) => handleSliderChange("difficulty", value)}
            />
            <div className="col-span-1 text-right">
              {localFilters.difficulty[0]} - {localFilters.difficulty[1]}
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
