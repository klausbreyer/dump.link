import React from "react";

import { XCircleIcon } from "@heroicons/react/24/outline";
import { useAbsence } from "./context/absence";
import { dateToHumanReadable } from "./context/helper_dates";

const NotificationBar: React.FC = () => {
  const { numChanges, lastVisit, setAcknowledged, acknowledged } = useAbsence();

  if (numChanges === 0) return null;
  if (acknowledged) return null;

  const lastVisitStr = dateToHumanReadable(lastVisit);
  return (
    <div className="fixed bottom-0 z-10 flex gap-2 p-2 text-sm text-center text-white transform -translate-x-1/2 rounded-t-lg shadow-md bg-cyan-500 left-1/2 ">
      <p>
        {numChanges} change{numChanges > 1 && "s"} since your last visit{" "}
        {lastVisitStr}.
      </p>
      <span
        onClick={() => setAcknowledged(true)}
        className="underline hover:no-underline hover:cursor-pointer"
      >
        <XCircleIcon className="inline-block w-5 h-5" />
      </span>
    </div>
  );
};

export default NotificationBar;
