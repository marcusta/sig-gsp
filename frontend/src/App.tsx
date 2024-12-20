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
import CoursePage from "./pages/CoursePage"; // Import CoursePage
import CoursesPage from "./pages/CoursesPage";
import { UnitProvider } from "@/contexts/UnitContext";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const basePath = import.meta.env.PROD ? "/gsp/" : "/";
  console.log(
    "app: basePath: ",
    basePath,
    " import.meta.env.PROD: ",
    import.meta.env.PROD
  );
  return (
    <UnitProvider>
      <QueryClientProvider client={queryClient}>
        <Router basename={basePath}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/courses" replace />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="course/:courseId" element={<CoursePage />} />
              <Route path="form" element={<FormView />} />
            </Route>
          </Routes>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </UnitProvider>
  );
};

export default App;
