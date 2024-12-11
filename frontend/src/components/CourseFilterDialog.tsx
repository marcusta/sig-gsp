import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RangeSlider } from "@/components/ui/rangeslider";

interface CourseFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    minLength: number;
    maxLength: number;
    // Add other filter properties as needed
  };
  setFilters: React.Dispatch<
    React.SetStateAction<CourseFilterDialogProps["filters"]>
  >;
}

export function CourseFilterDialog({
  open,
  onOpenChange,
  filters,
  setFilters,
}: CourseFilterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Course Length Range</Label>
            <div className="pt-4">
              <RangeSlider
                min={4000}
                max={8000}
                step={100}
                value={[filters.minLength, filters.maxLength]}
                onValueChange={([min, max]) =>
                  setFilters({
                    ...filters,
                    minLength: min,
                    maxLength: max,
                  })
                }
                className="w-full"
              />
            </div>
          </div>
          {/* ... rest of the dialog content ... */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
