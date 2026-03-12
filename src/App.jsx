import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import IaEngineOverview from "./pages/IaEngineOverview";
import ApiStudyPage from "./pages/ApiStudyPage";
import SqlEtlPage from "./pages/SqlEtlPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ia-engine-overview" element={<IaEngineOverview />} />
        <Route path="/api-function-service" element={<ApiStudyPage />} />
        <Route path="/sql-etl" element={<SqlEtlPage />} />
      </Routes>
    </HashRouter>
  );
}
