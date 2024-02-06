import BugsnagPerformance from "@bugsnag/browser-performance";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact, {
  BugsnagPluginReactResult,
} from "@bugsnag/plugin-react";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { DndProvider } from "react-dnd-multi-backend";
import { createRoot } from "react-dom/client";

import { DataProvider } from "./context/data/data";
import { GlobalInteractionProvider } from "./context/interaction";
import { LifecycleProvider } from "./context/lifecycle";

import React from "react";
import "../public/styles.css";
import Main from "./Main";
import { AbsenceProvider } from "./context/absence";

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

// Default Error Boundary as a fallback
const DefaultErrorBoundary: React.FC<DefaultErrorBoundaryProps> = ({
  children,
}) => {
  return <>{children}</>;
};

// Define ErrorBoundary using Bugsnag's React plugin
const reactPlugin = Bugsnag.getPlugin("react") as
  | BugsnagPluginReactResult
  | undefined;
const ErrorBoundary =
  reactPlugin?.createErrorBoundary(React) || DefaultErrorBoundary; // Fallback to a default error boundary

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
        <GlobalInteractionProvider>
          <DataProvider>
            <AbsenceProvider>
              <DndProvider options={HTML5toTouch}>
                <Main />
              </DndProvider>
            </AbsenceProvider>
          </DataProvider>
        </GlobalInteractionProvider>
      </LifecycleProvider>
    </ErrorBoundary>
  );
};

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
