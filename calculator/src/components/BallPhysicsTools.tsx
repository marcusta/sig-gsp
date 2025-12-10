import { BallPhysicsCalculator } from "./BallPhysicsCalculator";
import { ClubShotAnalyzer } from "./ClubShotAnalyzer";
import { PuttCalculator } from "./PuttCalculator";
import { PuttingDiagram } from "./PuttingDiagram";
import { ShotSuggester } from "./ShotSuggester";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { UnitToggle } from "./UnitToggle";

export function BallPhysicsTools() {
  const [currentTab, setCurrentTab] = useState("shot-suggester");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { value: "calculator", label: "Ball Physics" },
    { value: "club-analyzer", label: "Club Analysis" },
    { value: "shot-suggester", label: "Shot Suggester" },
    { value: "putting", label: "Putting" },
    { value: "putting-diagram", label: "Putting Diagram" },
  ];

  return (
    <div className="w-full">
      {/* Mobile Menu */}
      <div className="sm:hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <span className="flex-1 text-center text-white">
              {tabs.find((tab) => tab.value === currentTab)?.label}
            </span>

            <UnitToggle />
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute z-50 w-full bg-slate-800 border-b border-white/10 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors
                  ${
                    currentTab === tab.value
                      ? "bg-slate-700 text-white"
                      : "text-slate-200"
                  }`}
                onClick={() => {
                  setCurrentTab(tab.value);
                  setIsMenuOpen(false);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Mobile Content */}
        <div className="p-4">
          {currentTab === "calculator" && <BallPhysicsCalculator />}
          {currentTab === "club-analyzer" && <ClubShotAnalyzer />}
          {currentTab === "shot-suggester" && <ShotSuggester />}
          {currentTab === "putting" && <PuttCalculator />}
          {currentTab === "putting-diagram" && <PuttingDiagram />}
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:block">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <div className="flex items-center mb-4 bg-slate-800 rounded-md">
            <div className="flex-1">
              <TabsList className="w-full bg-transparent">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-slate-600 data-[state=active]:text-white text-slate-300"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="border-l border-slate-700 px-2">
              <UnitToggle />
            </div>
          </div>

          <TabsContent value="calculator">
            <BallPhysicsCalculator />
          </TabsContent>
          <TabsContent value="club-analyzer">
            <ClubShotAnalyzer />
          </TabsContent>
          <TabsContent value="shot-suggester">
            <ShotSuggester />
          </TabsContent>
          <TabsContent value="putting">
            <PuttCalculator />
          </TabsContent>
          <TabsContent value="putting-diagram">
            <PuttingDiagram />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
