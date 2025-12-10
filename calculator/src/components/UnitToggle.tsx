import { cn } from "@/lib/utils";
import { useUnit } from "@/contexts/UnitContext";

interface UnitToggleProps {
  className?: string;
}

export function UnitToggle({ className }: UnitToggleProps) {
  const { unitSystem, setUnitSystem } = useUnit();

  return (
    <div
      className={cn(
        "relative inline-flex h-8 rounded-full bg-slate-700 w-[130px] cursor-pointer",
        className
      )}
      onClick={() =>
        setUnitSystem(unitSystem === "metric" ? "imperial" : "metric")
      }
    >
      <div
        className={cn(
          "absolute top-1 h-6 w-[60px] rounded-full bg-slate-600 transition-transform duration-200 ease-in-out",
          unitSystem === "metric" ? "left-1" : "translate-x-[66px]"
        )}
      />
      <div className="relative flex w-full items-center justify-between px-2 text-sm font-medium text-slate-200">
        <span className={cn("z-10", unitSystem === "metric" && "text-white")}>
          Meters
        </span>
        <span className={cn("z-10", unitSystem === "imperial" && "text-white")}>
          Yards
        </span>
      </div>
    </div>
  );
}
