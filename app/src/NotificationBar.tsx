import React, { useState } from "react";

import { useData } from "./context/data";
import { bucketsChangedSince } from "./context/helper_buckets";
import { dateToHumanReadable } from "./context/helper_dates";
import { dependenciesChanged } from "./context/helper_dependencies";
import { getLastActivity } from "./context/helper_requests";
import { numTaskChanged } from "./context/helper_tasks";

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
    numTaskChanged(tasks, lastVisit).length +
    dependenciesChanged(dependencies, lastVisit).length;
  if (numChanges === 0) return null;

  const lastVisitStr = dateToHumanReadable(lastVisit);

  console.log("NotificationBar", { numChanges, lastVisitStr, lastVisit });

  return (
    <div className="fixed bottom-0 p-4 text-sm text-center text-white transform -translate-x-1/2 rounded-t-lg shadow-md bg-violet-500 left-1/2">
      <p>
        {numChanges} change(s) since your last visit {lastVisitStr}
        .&nbsp;
        <span onClick={handleClose} className="underline hover:no-underline">
          Close
        </span>
      </p>
    </div>
  );
};

export default NotificationBar;
