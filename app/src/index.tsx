import BugsnagPerformance from "@bugsnag/browser-performance";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact, {
  BugsnagPluginReactResult,
} from "@bugsnag/plugin-react";
import { createRoot } from "react-dom/client";

import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "../public/styles.css";
import { AppContext } from "../types";
import Callback from "./Dashboard/Callback";
import Dashboard from "./Dashboard/Dashboard";
import Project from "./Project/Project";
import { Auth0ProviderConfigured } from "./auth0-provider-with-navigate";

function isLocalhost(): boolean {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

const releaseStage = isLocalhost() ? "development" : window.location.host;
Bugsnag.start({
  apiKey: "dfa678c21426fc846674ce32690760ff",
  plugins: [new BugsnagPluginReact()],
  releaseStage,
  enabledReleaseStages: ["dump.link", "kitchen.dump.link"],
});
BugsnagPerformance.start({ apiKey: "dfa678c21426fc846674ce32690760ff" });

interface DefaultErrorBoundaryProps {
  children?: React.ReactNode;
}

const DefaultErrorBoundary: React.FC<DefaultErrorBoundaryProps> = ({
  children,
}) => {
  return <>{children}</>;
};

const reactPlugin = Bugsnag.getPlugin("react") as
  | BugsnagPluginReactResult
  | undefined;
const ErrorBoundary =
  reactPlugin?.createErrorBoundary(React) || DefaultErrorBoundary;

export function notifyBugsnag(error: unknown): void {
  if (isLocalhost()) return;

  if (error instanceof Error) {
    Bugsnag.notify(error);
  } else {
    Bugsnag.notify(new Error("Unknown error occurred"));
  }
}

const App = function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/a">
        <Auth0ProviderConfigured>
          <Routes>
            <Route path=":projectId/*" element={<Project />} />
            <Route path={AppContext.Dashboard} element={<Dashboard />} />
            <Route path={AppContext.Callback} element={<Callback />} />
          </Routes>
        </Auth0ProviderConfigured>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
