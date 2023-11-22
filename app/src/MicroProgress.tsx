import React from "react";
import { Bucket } from "./types";
import { getBucketPercentage, getTasksForBucket } from "./context/helper";
import { useData } from "./context/data";

export interface MicroProgressProps {
  bucket: Bucket;
}

const MicroProgress: React.FC<MicroProgressProps> = (props) => {
  const { bucket } = props;

  const { getTasks } = useData();
  const tasks = getTasks();
  const tasksForbucket = getTasksForBucket(tasks, bucket.id);

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

  if (!showTasksAndBar) {
    return null;
  }
  return (
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
  );
};

export default MicroProgress;
