import "../public/styles.css";
import { LifecycleState } from "./Project/context/lifecycle";

export const Loading = function Loading() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="animate-pulse">Loading..</div>
    </div>
  );
};

type ErrorStateProps = {
  lifecycle: LifecycleState;
};

export function ErrorState(props: ErrorStateProps) {
  const { lifecycle } = props;

  let error = "";
  switch (lifecycle) {
    case LifecycleState.Error404:
      error = "404 :(";
      break;

    case LifecycleState.Error401:
      error = "401 - Unauthorized";
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
