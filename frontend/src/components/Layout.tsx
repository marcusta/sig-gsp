import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Switch } from "./ui/switch";
import { useUnits } from "@/contexts/UnitContext";

const Layout: React.FC = () => {
  const { unitSystem, setUnitSystem } = useUnits();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#1A1D29]">
      <header className="bg-[#1F2937] border-b border-[#374151]">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link to="/courses">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  GSPro Courses
                </h1>
              </Link>
              <div className="flex gap-2">
                <Link
                  to="/courses"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive("/course")
                      ? "bg-[#2D6A4F] text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-[#374151]"
                  }`}
                >
                  Courses
                </Link>
                <Link
                  to="/records"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive("/records")
                      ? "bg-[#2D6A4F] text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-[#374151]"
                  }`}
                >
                  Records
                </Link>
              </div>
            </div>
            <ul className="flex items-center space-x-6">
              <li className="flex items-center space-x-2">
                <span className="text-slate-300 text-sm">Imperial</span>
                <Switch
                  checked={unitSystem === "imperial"}
                  onCheckedChange={(checked) =>
                    setUnitSystem(checked ? "imperial" : "metric")
                  }
                />
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
