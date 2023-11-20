import React from "react";

import { useData } from "./context/data";
import { getOtherBuckets, getTasksByClosed } from "./context/helper";

interface MacroProgressProps {}

const MacroProgress: React.FC<MacroProgressProps> = (props) => {
  const { getBuckets, getTasks } = useData();
  const buckets = getBuckets();
  const tasks = getTasks();
  const otherBuckets = getOtherBuckets(buckets);

  const tasksSolved = otherBuckets.reduce(
    (acc, bucket) => acc + getTasksByClosed(tasks, true).length,
    0,
  );

  const tasksNotDone = otherBuckets.reduce(
    (acc, bucket) => acc + getTasksByClosed(tasks, false).length,
    0,
  );

  return (
    <div className="flex w-full h-3 my-2 overflow-hidden border border-slate-800 cursor-help rounded-xl">
      <div
        title={`Solved: ${tasksSolved}`}
        className={`h-3 bg-green-500 `}
        style={{
          width: `${(100 * tasksSolved) / (tasksNotDone + tasksSolved)}%`,
        }}
      ></div>
      <div
        title={`Unsolved: ${tasksNotDone}`}
        className={`h-3 bg-white`}
        style={{
          width: `${(100 * tasksNotDone) / (tasksNotDone + tasksSolved)}%`,
        }}
      ></div>
    </div>
  );
};

export default MacroProgress;
