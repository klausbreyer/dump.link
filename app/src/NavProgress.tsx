import React from "react";
import { DumplinkIcon } from "./common/icons";
import { useData } from "./context/data";
import {
  calculateRemainingTime,
  filterBucketsFiguringOut,
  formatDate,
} from "./context/helper";
import { Bucket } from "./types";

export interface NavProgressProps {}

const NavProgress: React.FC<NavProgressProps> = (props) => {
  const { getBuckets, getTasks, getProject } = useData();

  const project = getProject();
  const buckets = getBuckets();
  const tasks = getTasks();

  const done = buckets.filter((b: Bucket) => b.done);
  const figuringOut = filterBucketsFiguringOut(buckets, tasks);

  const startedAt = project.startedAt;

  // startedAt + project.appetiate * weeks
  const endingAt = new Date(
    startedAt.getTime() + project.appetite * 7 * 24 * 60 * 60 * 1000,
  );

  const currentDate: Date = new Date();
  const totalDuration = endingAt.getTime() - startedAt.getTime();
  const timeElapsed = currentDate.getTime() - startedAt.getTime();
  const percentDate = (timeElapsed / totalDuration) * 100;

  console.log(startedAt, currentDate, endingAt, percentDate);

  return (
    <>
      <div className="flex flex-col w-full h-full gap-2 mt-4 ">
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

          <span className="text-sm">
            {calculateRemainingTime(startedAt, endingAt)} left
          </span>
          <span className="text-sm">{formatDate(endingAt)}</span>
        </div>
      </div>
    </>
  );
};

export default NavProgress;
