import BugsnagPerformance from "@bugsnag/browser-performance";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact, {
  BugsnagPluginReactResult,
} from "@bugsnag/plugin-react";
import { createRoot } from "react-dom/client";

import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "../public/styles.css";
import { paths } from "../routes";
import Callback from "./Dashboard/Callback";
import Dashboard from "./Dashboard/Dashboard";
import Login from "./Dashboard/Login";
import New from "./Dashboard/New";
import Signup from "./Dashboard/Signup";
import Project from "./Project/Project";
import { LifecycleProvider } from "./Project/context/lifecycle";
import { DLAuth0 } from "./auth0-provider";
import { JWTProvider } from "./context/jwt";
import { OrgProvider } from "./context/org";

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
      <LifecycleProvider>
        <BrowserRouter basename="/a">
          <DLAuth0>
            <JWTProvider>
              <OrgProvider>
                <Routes>
                  <Route path={paths.publicProject} element={<Project />} />
                  <Route path={paths.orgProject} element={<Project />} />
                  <Route path={paths.orgDashboard} element={<Dashboard />} />
                  <Route path={paths.callback} element={<Callback />} />
                  <Route path={paths.new} element={<New />} />
                  <Route path={paths.login} element={<Login />} />
                  <Route path={paths.signup} element={<Signup />} />
                </Routes>
              </OrgProvider>
            </JWTProvider>
          </DLAuth0>
        </BrowserRouter>
      </LifecycleProvider>
    </ErrorBoundary>
  );
};

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
