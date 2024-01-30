import BugsnagPerformance from "@bugsnag/browser-performance";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact, {
  BugsnagPluginReactResult,
} from "@bugsnag/plugin-react";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { DndProvider } from "react-dnd-multi-backend";
import { createRoot } from "react-dom/client";

import Arrange from "./Arrange";
import Group from "./Group";
import Header from "./Header";
import Sequence from "./Sequence";
import Settings from "./Settings";
import { DataProvider } from "./context/data";
import { GlobalInteractionProvider } from "./context/interaction";
import {
  LifecycleProvider,
  LifecycleState,
  useLifecycle,
} from "./context/lifecycle";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";

import React, { useEffect } from "react";
import "../public/styles.css";
import NotificationBar from "./NotificationBar";
import { AbsenceProvider } from "./context/absence";

function isLocalhost(): boolean {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

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

const Main = function Main() {
  const { lifecycle } = useLifecycle();
  const currentQueryParam = useQueryParamChange("p");

  useEffect(() => {
    if (isTouchDevice()) {
      alert("Mobile & touch access in beta - expect some quirks!");
    }
  }, []);

  console.log(lifecycle);

  if (lifecycle === LifecycleState.Initialized) {
    return <Loading />;
  }

  if (
    lifecycle === LifecycleState.Error ||
    lifecycle === LifecycleState.Error404 ||
    lifecycle === LifecycleState.ErrorApi
  ) {
    return <ErrorState lifecycle={lifecycle} />;
  }

  const renderComponentBasedOnQueryParam = () => {
    switch (currentQueryParam) {
      case TabContext.Settings:
        return <Settings />;
      case TabContext.Group:
        return <Group />;
      case TabContext.Sequence:
        return <Sequence />;
      case TabContext.Arrange:
        return <Arrange />;

      default:
        return <Group />;
    }
  };

  return (
    <>
      <Header />
      {renderComponentBasedOnQueryParam()}
      <NotificationBar />
    </>
  );
};

const Loading = function Loading() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className=" animate-pulse">Loading..</div>
    </div>
  );
};

type ErrorStateProps = {
  lifecycle: LifecycleState;
};

function ErrorState(props: ErrorStateProps) {
  const { lifecycle } = props;

  let error = "";
  switch (lifecycle) {
    case LifecycleState.Error404:
      error = "404 :(";
      break;

    default:
    case LifecycleState.Error:
      error = "Something went wrong :(";
      break;
  }

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="text-rose-500">{error}</div>
    </div>
  );
}

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
