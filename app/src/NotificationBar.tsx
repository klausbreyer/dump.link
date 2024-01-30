import React, { useState } from "react";

import { useData } from "./context/data";
import { bucketsChangedSince } from "./context/helper_buckets";
import { dateToHumanReadable } from "./context/helper_dates";
import { dependenciesChanged } from "./context/helper_dependencies";
import { getLastActivity } from "./context/helper_requests";
import { tasksChangedSince } from "./context/helper_tasks";
import { XCircleIcon } from "@heroicons/react/24/outline";

const NotificationBar: React.FC = () => {
  const { buckets, tasks, dependencies, project } = useData();
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const lastVisit = getLastActivity(project.id);
  if (!lastVisit) return null;

  const numChanges =
    bucketsChangedSince(buckets, lastVisit).length +
    tasksChangedSince(tasks, lastVisit).length +
    dependenciesChanged(dependencies, lastVisit).length;
  if (numChanges === 0) return null;

  const lastVisitStr = dateToHumanReadable(lastVisit);

  console.log(
    "NotificationBar",

    bucketsChangedSince(buckets, lastVisit).length,
    tasksChangedSince(tasks, lastVisit).length,
    dependenciesChanged(dependencies, lastVisit).length,
  );

  return (
    <div className="fixed bottom-0 flex gap-2 p-2 text-sm text-center text-white transform -translate-x-1/2 rounded-t-lg shadow-md bg-cyan-500 left-1/2 ">
      <p>
        {numChanges} change{numChanges > 1 && "s"} since your last visit{" "}
        {lastVisitStr}.
      </p>
      <span
        onClick={handleClose}
        className="underline hover:no-underline hover:cursor-pointer"
      >
        <XCircleIcon className="inline-block w-5 h-5" />
      </span>
    </div>
  );
};

export default NotificationBar;
