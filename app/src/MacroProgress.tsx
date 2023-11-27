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
import { DumplinkIcon } from "./common/icons";

export interface MacroProgressProps {}

const MacroProgress: React.FC<MacroProgressProps> = (props) => {
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
      <div className="grid w-full grid-cols-12">
        <div className="col-span-6">
          <div className="flex items-center gap-1 ">
            <DumplinkIcon className="w-16 h-16 text-slate-700" />
            <div className="flex flex-col">
              <div className="text-xl font-bold underline text-slate-700">
                {project.name}
              </div>
              <div className="flex flex-row gap-2">
                <span className="text-sm">Task Groups:</span>
                <span className="text-sm">
                  <span
                    className={`px-1 mr-0.5 rounded
                  ${figuringOut.length > 0 && "bg-yellow-300"}
                  `}
                  >
                    {figuringOut.length}
                  </span>
                  Figuring Out
                </span>
                <span className="text-sm">
                  <span
                    className={`px-1 mr-0.5 rounded
                  ${done.length > 0 && "bg-green-500"}
                `}
                  >
                    {done.length}
                  </span>
                  Done
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-6 ">
          <div className="flex flex-col justify-end h-full gap-2">
            <div className="flex flex-row items-center">
              <div
                className={`relative w-full h-2  rounded-xl overflow-hidden bg-slate-300  `}
              >
                <div
                  className={`h-full absolute top-0 left-0 bg-slate-700 `}
                  style={{ width: `${percentDate}%` }}
                ></div>
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between h-full gap-1 p-1 text-sm">
                  <span className={` font-bold`}></span>
                </div>
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-sm ">
                {startedAt.getFullYear()}-
                {startedAt.getMonth().toString().padStart(2, "0")}-
                {startedAt.getDate().toString().padStart(2, "0")}
              </span>

              <span className="text-sm ">6 weeks</span>
              <span className="text-sm ">
                {endingAt.getFullYear()}-
                {endingAt.getMonth().toString().padStart(2, "0")}-
                {endingAt.getDate().toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MacroProgress;
