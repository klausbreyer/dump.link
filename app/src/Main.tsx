import React, { useEffect } from "react";
import { useLifecycle } from "./context/lifecycle";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";
import Settings from "./Settings";
import Group from "./Group";
import Sequence from "./Sequence";
import Arrange from "./Arrange";
import Header from "./Header";
import NotificationBar from "./NotificationBar";
import { LifecycleState } from "./context/lifecycle";

const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
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

export default Main;
