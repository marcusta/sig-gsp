import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Switch } from "./ui/switch";
import { useUnits } from "@/contexts/UnitContext";

// Masters broadcast gradient background
const mastersBackground = `
  radial-gradient(ellipse 120% 100% at 20% 10%, hsla(50, 85%, 70%, 0.08) 0%, hsla(50, 85%, 70%, 0) 45%),
  radial-gradient(circle at 80% 90%, hsla(155, 40%, 18%, 0.15) 0%, hsla(155, 40%, 12%, 0) 60%),
  linear-gradient(145deg, hsl(150, 35%, 8%) 0%, hsl(152, 33%, 10%) 35%, hsl(149, 28%, 7%) 70%, hsl(152, 30%, 9%) 100%)
`;

const Layout: React.FC = () => {
  const { unitSystem, setUnitSystem } = useUnits();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: mastersBackground }}
    >
      {/* Film grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{
          boxShadow: "inset 0 0 150px 50px rgba(0,0,0,0.4)",
        }}
      />

      <header className="relative z-10 border-b border-amber-900/15">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <nav className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            {/* Top row on mobile: Logo and unit toggle */}
            <div className="flex justify-between items-center">
              <Link to="/courses">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-50 tracking-tight italic">
                  GSPro Courses
                </h1>
              </Link>
              {/* Unit toggle - visible on mobile in top row */}
              <div className="flex items-center space-x-2 sm:hidden">
                <span className="text-amber-100/60 text-xs">
                  {unitSystem === "imperial" ? "Yds" : "M"}
                </span>
                <Switch
                  checked={unitSystem === "imperial"}
                  onCheckedChange={(checked) =>
                    setUnitSystem(checked ? "imperial" : "metric")
                  }
                />
              </div>
            </div>

            {/* Bottom row on mobile: Navigation tabs */}
            {/* On desktop: Navigation tabs + unit toggle inline */}
            <div className="flex items-center justify-between sm:gap-8">
              <div className="flex gap-1 sm:gap-2">
                <Link
                  to="/courses"
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    isActive("/course")
                      ? "bg-emerald-800/70 text-amber-50 shadow-sm border border-emerald-700/30"
                      : "text-amber-100/70 hover:text-amber-50 hover:bg-slate-700/40"
                  }`}
                >
                  Courses
                </Link>
                <Link
                  to="/records"
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    isActive("/records")
                      ? "bg-emerald-800/70 text-amber-50 shadow-sm border border-emerald-700/30"
                      : "text-amber-100/70 hover:text-amber-50 hover:bg-slate-700/40"
                  }`}
                >
                  Records
                </Link>
              </div>

              {/* Unit toggle - hidden on mobile, visible on desktop */}
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-amber-100/60 text-sm">Imperial</span>
                <Switch
                  checked={unitSystem === "imperial"}
                  onCheckedChange={(checked) =>
                    setUnitSystem(checked ? "imperial" : "metric")
                  }
                />
              </div>
            </div>
          </nav>
        </div>
      </header>
      <main className="relative z-10 container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
