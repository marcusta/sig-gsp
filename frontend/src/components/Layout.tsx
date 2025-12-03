import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Switch } from "./ui/switch";
import { useUnits } from "@/contexts/UnitContext";

const Layout: React.FC = () => {
  const { unitSystem, setUnitSystem } = useUnits();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/10 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link to="/courses">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 tracking-tight">
                  GSPro Courses
                </h1>
              </Link>
              <div className="flex gap-4">
                <Link
                  to="/courses"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/course")
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Courses
                </Link>
                <Link
                  to="/records"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/records")
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Records
                </Link>
              </div>
            </div>
            <ul className="flex items-center space-x-6">
              <li className="flex items-center space-x-2">
                <span className="text-white text-sm">Imperial</span>
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
