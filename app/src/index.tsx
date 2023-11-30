import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createRoot } from "react-dom/client";

import Arrange from "./Arrange";
import Group from "./Group";
import Header from "./Header";
import Sequence from "./Sequence";
import Settings from "./Settings";
import { DataProvider } from "./context/data";
import { GlobalDraggingProvider } from "./context/dragging";
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

  console.log(lifecycle);

  if (lifecycle === LifecycleState.Initialized) {
    return <Loading />;
  }

  if (lifecycle === LifecycleState.Error) {
    return <Error lifecycle={lifecycle} />;
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

type ErrorProps = {
  lifecycle: LifecycleState;
};

const Error = function Error(props: ErrorProps) {
  const { lifecycle } = props;

  let error = "";
  switch (lifecycle) {
    case LifecycleState.Error404:
      error = "404 :(";

    default:
    case LifecycleState.Error:
      error = "Something went wrong :(";
  }

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="text-rose-500">{error}</div>
    </div>
  );
};

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
