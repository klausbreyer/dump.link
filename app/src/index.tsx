import BugsnagPerformance from "@bugsnag/browser-performance";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact, {
  BugsnagPluginReactResult,
} from "@bugsnag/plugin-react";
import { createRoot } from "react-dom/client";

import React from "react";
import { BrowserRouter } from "react-router-dom";
import "../public/styles.css";
import Routing, { links } from "./Routing";

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

function isKitchen(): boolean {
  return window.location.host === "kitchen.dump.link";
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

const App: React.FC = function App() {
  return (
    <ErrorBoundary>
      <LifecycleProvider>
        <BrowserRouter basename="/a">
          <DLAuth0>
            <JWTProvider>
              <OrgProvider>
                {(isLocalhost() || isKitchen()) && <DebugLinks />}
                <Routing />
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

const DebugLinks = function DebugLinks() {
  return (
    <ul className="fixed bottom-0 right-0 p-4 text-black opacity-50 bg-amber-500">
      <li>
        <a className="hover:underline" href="/">
          Go to /
        </a>
      </li>
      <li>
        <a className="hover:underline" href="/a">
          Go to /a
        </a>
      </li>
      <li>
        <a className="hover:underline" href={"/a" + links.publicNew}>
          Go to {"/a" + links.publicNew}
        </a>
      </li>
      <li>
        <a className="hover:underline" href={"/a" + links.signup}>
          Go to {"/a" + links.signup}
        </a>
      </li>
      <li>
        <a className="hover:underline" href={"/a" + links.login}>
          Go to {"/a" + links.login}
        </a>
      </li>
    </ul>
  );
};
