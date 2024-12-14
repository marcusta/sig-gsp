import React from "react";
import { Outlet } from "react-router-dom";
import { Switch } from "./ui/switch";
import { useUnits } from "@/contexts/UnitContext";

const Layout: React.FC = () => {
  const { unitSystem, setUnitSystem } = useUnits();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/10 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 tracking-tight">
              GSPro Courses delivered by SGT
            </h1>
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
