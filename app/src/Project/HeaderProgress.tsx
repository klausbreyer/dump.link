import React from "react";
import { namedBucketsDone } from "../models/buckets";
import { getEndingAt } from "../models/projects";
import {
  calculateTimeDifference,
  formatDate,
  formatTimeDifference,
} from "../utils/dates";
import { useData } from "./context/data";

export interface HeaderProgressProps {}

const HeaderProgress: React.FC<HeaderProgressProps> = (props) => {
  const { project, buckets } = useData();

  const allBucketsDone = namedBucketsDone(buckets);
  const startedAt = project.startedAt;
  const endingAt = getEndingAt(project);

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
