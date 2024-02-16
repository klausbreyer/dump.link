import React from "react";
import { getNamedBuckets } from "./context/data/buckets";
import { useData } from "./context/data/data";
import {
  calculateTimeDifference,
  formatDate,
  formatTimeDifference,
} from "./context/data/dates";

export interface HeaderProgressProps {}

const HeaderProgress: React.FC<HeaderProgressProps> = (props) => {
  const { project, buckets } = useData();

  const namedBuckets = getNamedBuckets(buckets);
  const allBucketsDone =
    namedBuckets.length > 0 && namedBuckets.every((bucket) => bucket.done);

  const startedAt = project.startedAt;
  const endingAt =
    project.appetite === 0 && project.endingAt
      ? project.endingAt
      : new Date(
          startedAt.getTime() + project.appetite * 7 * 24 * 60 * 60 * 1000,
        );
  const currentDate: Date = new Date();
  const totalDuration = endingAt.getTime() - startedAt.getTime();
  const timeElapsed = currentDate.getTime() - startedAt.getTime();
  const percentDate = (timeElapsed / totalDuration) * 100;

  const timedifference = calculateTimeDifference(currentDate, endingAt);
  const remaining = allBucketsDone
    ? "done"
    : formatTimeDifference(timedifference);

  const color = allBucketsDone
    ? "bg-green-500"
    : timedifference < 0 && "bg-red-500";

  return (
    <>
      <div className="flex flex-col h-full gap-2 ">
        <div
          className={`relative w-full h-2 rounded-xl overflow-hidden bg-slate-300`}
        >
          <div
            className={`h-full absolute top-0 left-0 bg-slate-700 `}
            style={{ width: `${percentDate}%` }}
          ></div>
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between h-full gap-1 p-1 text-sm">
            <span className={` font-bold`}></span>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-sm">{formatDate(startedAt)}</span>
          <span className={`px-1 rounded text-sm ${color}`}>{remaining}</span>
          <span className="text-sm">{formatDate(endingAt)}</span>
        </div>
      </div>
    </>
  );
};

export default HeaderProgress;
