import { createRoot } from "react-dom/client";

import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "../public/styles.css";
import { AppContext } from "../types";
import Callback from "./Dashboard/Callback";
import Dashboard from "./Dashboard/Dashboard";
import Project from "./Project/Project";
import { Auth0ProviderConfigured } from "./auth0-provider";

function isLocalhost(): boolean {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

const releaseStage = isLocalhost() ? "development" : window.location.host;
interface DefaultErrorBoundaryProps {
  children?: React.ReactNode;
}

const DefaultErrorBoundary: React.FC<DefaultErrorBoundaryProps> = ({
  children,
}) => {
  return <>{children}</>;
};

const App = function App() {
  return (
    <BrowserRouter basename="/a">
      <Auth0ProviderConfigured>
        <Routes>
          <Route path=":projectId/*" element={<Project />} />
          <Route path={AppContext.Dashboard} element={<Dashboard />} />
          <Route path={AppContext.Callback} element={<Callback />} />
        </Routes>
      </Auth0ProviderConfigured>
    </BrowserRouter>
  );
};

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
