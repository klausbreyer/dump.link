import React from "react";
import { Bucket } from "./types";
import {
  filterBucketsFiguringOut,
  getBucketPercentage,
  getTasksByClosed,
  getTasksForBucket,
  sortTasksByUpdatedAt,
} from "./context/helper";
import { useData } from "./context/data";

export interface MacroProgressProps {}

const MacroProgress: React.FC<MacroProgressProps> = (props) => {
  const { getBuckets, getTasks, getProject } = useData();

  const project = getProject();
  const buckets = getBuckets();
  const tasks = getTasks();

  const done = buckets.filter((b: Bucket) => b.done);
  const figuringOut = filterBucketsFiguringOut(buckets, tasks);

  const percentBuckets =
    (done.length / (done.length + figuringOut.length)) * 100;

  // to account for NaN on unstarted buckets

  const startedAt = project.startedAt;
  // startedAt + project.appetiate * weeks
  const endingAt = new Date(
    startedAt.getTime() + project.appetite * 7 * 24 * 60 * 60 * 1000,
  );

  const currentDate: Date = new Date();
  const totalDuration = endingAt.getTime() - startedAt.getTime();
  const timeElapsed = currentDate.getTime() - startedAt.getTime();
  const percentDate = (timeElapsed / totalDuration) * 100;

  return (
    <>
      {/* <div className="grid grid-cols-12">
        <span className="text-sm">
          Done:{" "}
          <span
            className={`px-1 rounded
                  ${done.length > 0 && "bg-green-500"}
                `}
          >
            {done.length}
          </span>
        </span>
        <div className="flex items-center justify-between col-span-10 gap-1 p-1 ">
          <div
            className={`relative w-full h-2  rounded-xl overflow-hidden bg-orange-300  `}
          >
            <div
              className={`h-full absolute top-0 left-0 bg-green-500 `}
              style={{ width: `${100 - percentBuckets}%` }}
            ></div>
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between h-full gap-1 p-1 text-sm">
              <span className={` font-bold`}></span>
            </div>
          </div>
        </div>
        <span className="text-sm">
          Figured Out:{" "}
          <span
            className={`px-1 rounded
                  ${figuringOut.length > 0 && "bg-orange-300"}
                  `}
          >
            {figuringOut.length}
          </span>
        </span>
      </div> */}
      <div className="grid grid-cols-12">
        <span className="text-sm">
          {startedAt.getFullYear()}-
          {startedAt.getMonth().toString().padStart(2, "0")}-
          {startedAt.getDate().toString().padStart(2, "0")}
        </span>
        <div className="flex items-center justify-between col-span-10 gap-1 p-1 ">
          <div
            className={`relative w-full h-2  rounded-xl overflow-hidden bg-slate-300  `}
          >
            <div
              className={`h-full absolute top-0 left-0 bg-slate-700 `}
              style={{ width: `${100 - percentDate}%` }}
            ></div>
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between h-full gap-1 p-1 text-sm">
              <span className={` font-bold`}></span>
            </div>
          </div>
        </div>
        <span className="text-sm">
          {endingAt.getFullYear()}-
          {endingAt.getMonth().toString().padStart(2, "0")}-
          {endingAt.getDate().toString().padStart(2, "0")}
        </span>
      </div>
    </>
  );
};

export default MacroProgress;
