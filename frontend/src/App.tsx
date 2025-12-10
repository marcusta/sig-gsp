import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Layout from "./components/Layout";
import FormView from "./components/FormView";
import CoursePage from "./pages/CoursePage";
import CoursesPage from "./pages/CoursesPage";
import RecordsPage from "./pages/RecordsPage";
import ActivityPage from "./pages/ActivityPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import TopRivalriesPage from "./pages/TopRivalriesPage";
import PuttingPage from "./pages/PuttingPage";
import ShotSuggesterPage from "./pages/ShotSuggesterPage";
import { UnitProvider } from "@/contexts/UnitContext";
import { CalculatorProvider } from "@/contexts/CalculatorContext";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const basePath = import.meta.env.PROD ? "/gsp/" : "/";
  return (
    <UnitProvider>
      <CalculatorProvider>
        <QueryClientProvider client={queryClient}>
          <Router basename={basePath}>
            <Routes>
            {/* Standalone calculator routes (no navigation) */}
            <Route path="putting" element={<PuttingPage />} />
            <Route path="suggester" element={<ShotSuggesterPage />} />

            {/* Main app routes with navigation */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/courses" replace />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="course/:courseId" element={<CoursePage />} />
              <Route path="records" element={<RecordsPage />} />
              <Route path="records/activity" element={<ActivityPage />} />
              <Route path="records/rivalries" element={<TopRivalriesPage />} />
              <Route
                path="records/player/:playerId"
                element={<PlayerProfilePage />}
              />
              <Route path="form" element={<FormView />} />
            </Route>
          </Routes>
          </Router>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </CalculatorProvider>
    </UnitProvider>
  );
};

export default App;
