import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import IaEngineOverview from "./pages/IaEngineOverview";
import ApiStudyPage from "./pages/ApiStudyPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ia-engine-overview" element={<IaEngineOverview />} />
        <Route path="/api-function-service" element={<ApiStudyPage />} />
      </Routes>
    </HashRouter>
  );
}
