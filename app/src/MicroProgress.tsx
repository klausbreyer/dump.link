import React from "react";
import { Bucket } from "./types";
import {
  getBucketPercentage,
  getTasksByClosed,
  getTasksForBucket,
  sortTasksByUpdatedAt,
} from "./context/helper";
import { useData } from "./context/data";

export interface MicroProgressProps {
  bucket: Bucket;
}

const MicroProgress: React.FC<MicroProgressProps> = (props) => {
  const { bucket } = props;

  const { getTasks } = useData();
  const tasks = getTasks();
  const tasksForbucket = getTasksForBucket(tasks, bucket.id);

  const open = getTasksByClosed(tasksForbucket, false);
  const closed = sortTasksByUpdatedAt(getTasksByClosed(tasksForbucket, true));

  // to account for NaN on unstarted buckets
  const percentageCompleted = getBucketPercentage(tasksForbucket) || 0;

  const bgFiguringOut =
    percentageCompleted === 100 && bucket.done
      ? "bg-green-500"
      : "bg-yellow-300";
  const bgFiguredOut =
    percentageCompleted === 100 && bucket.done
      ? "bg-green-500"
      : "bg-orange-300";

  const showTasksAndBar = tasksForbucket.length > 0;

  const showFigured = showTasksAndBar && !bucket.done;
  const showDone = showTasksAndBar && bucket.done;

  if (!showTasksAndBar) {
    return null;
  }
  return (
    <>
      {showFigured && (
        <div
          className={`flex items-center justify-between w-full gap-1 text-sm text-center px-1`}
        >
          <span>
            Figuring Out:{" "}
            <span
              className={`px-1 rounded
                  ${open.length > 0 && !bucket.done && "bg-orange-300"}
                `}
            >
              {open.length}
            </span>
          </span>
          <span>
            Figured Out:{" "}
            <span
              className={`px-1 rounded
                  ${closed.length > 0 && !bucket.done && "bg-yellow-300"}
                  `}
            >
              {closed.length}
            </span>
          </span>
        </div>
      )}

      {showDone && (
        <div
          className={`flex items-center justify-center w-full gap-1 text-sm text-center px-1`}
        >
          Done
        </div>
      )}
      <div className="flex items-center justify-between gap-1 p-1 ">
        <div
          className={`relative w-full h-2  rounded-xl overflow-hidden ${bgFiguringOut} `}
        >
          <div
            className={`h-full absolute top-0 left-0 ${bgFiguredOut} `}
            style={{ width: `${100 - percentageCompleted}%` }}
          ></div>
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between h-full gap-1 p-1 text-sm">
            <span className={` font-bold`}></span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MicroProgress;
