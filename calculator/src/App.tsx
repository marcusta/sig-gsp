import { BallPhysicsTools } from "@/components/BallPhysicsTools";
import { UnitProvider } from "./contexts/UnitContext";

export default function App() {
  return (
    <UnitProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Top Navigation Bar */}
        <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
          <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  <img
                    src="./golfball-small.png"
                    alt="GSPro Helpbot"
                    className="w-6 h-6 inline-block mr-2"
                  />
                  GSPro Helpbot
                </h1>
              </div>
              <div className="text-blue-300 text-xs sm:text-sm">v0.5beta</div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl border border-white/10 overflow-hidden">
            <BallPhysicsTools />
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 text-center text-slate-400 text-xs sm:text-sm">
          © 2025 Fandorm's Tools for GSPro. All rights reserved.
        </footer>
      </div>
    </UnitProvider>
  );
}
