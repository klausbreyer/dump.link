import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createRoot } from "react-dom/client";

import { DataProvider } from "./context/data";
import Group from "./Group";
import Arrange from "./Arrange";
import Sequence from "./Sequence";
import { GlobalDraggingProvider } from "./context/dragging";
import Navigation from "./Navigation";
import Settings from "./Settings";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";

import "../public/styles.css";
import {
  LifecycleProvider,
  LifecycleState,
  useLifecycle,
} from "./context/lifecycle";

const App = function App() {
  return (
    <LifecycleProvider>
      <GlobalDraggingProvider>
        <DataProvider>
          <DndProvider backend={HTML5Backend}>
            <Main />
          </DndProvider>
        </DataProvider>
      </GlobalDraggingProvider>
    </LifecycleProvider>
  );
};

const Main = function Main() {
  const { lifecycle } = useLifecycle();
  const currentQueryParam = useQueryParamChange("p");

  if (lifecycle === LifecycleState.Initialized) {
    return <Loading />;
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
      <Navigation />
      {renderComponentBasedOnQueryParam()}
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

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
