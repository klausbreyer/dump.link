import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { useEffect } from "react";
import { DndProvider } from "react-dnd-multi-backend";
import { Route, Routes } from "react-router-dom";
import Arrange from "./Arrange";
import Group from "./Group";
import Header from "./Header";
import NotificationBar from "./NotificationBar";
import Sequence from "./Sequence";
import Settings from "./Settings";
import { AbsenceProvider } from "./context/absence";
import { DataProvider } from "./context/data/data";
import { GlobalInteractionProvider } from "./context/interaction";
import {
  LifecycleProvider,
  LifecycleState,
  useLifecycle,
} from "./context/lifecycle";
import { TabContext } from "./types";

export default function Project() {
  return (
    <LifecycleProvider>
      <GlobalInteractionProvider>
        <DataProvider>
          <AbsenceProvider>
            <DndProvider options={HTML5toTouch}>
              <Router />
            </DndProvider>
          </AbsenceProvider>
        </DataProvider>
      </GlobalInteractionProvider>
    </LifecycleProvider>
  );
}

const Router = function Loaded() {
  const isTouchDevice = () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  };
  useEffect(() => {
    if (isTouchDevice()) {
      alert("Mobile & touch access in beta - expect some quirks!");
    }
  }, []);

  const { lifecycle } = useLifecycle();
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

  return (
    <>
      <Header />
      <Routes>
        <Route path={TabContext.Settings} element={<Settings />} />
        <Route path={TabContext.Group} element={<Group />} />
        <Route path={TabContext.Arrange} element={<Arrange />} />
        <Route path={TabContext.Sequence} element={<Sequence />} />
        <Route path="/" element={<Group />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <NotificationBar />
    </>
  );
};

const Loading = function Loading() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="animate-pulse">Loading..</div>
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

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="text-slate-500">Route not found</div>
    </div>
  );
}
