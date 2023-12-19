import React from "react";
import { useData } from "./context/data";
import { calculateRemainingTime, formatDate } from "./context/helper";

export interface HeaderProgressProps {}

const HeaderProgress: React.FC<HeaderProgressProps> = (props) => {
  const { project } = useData();

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

  return (
    <>
      <div className="flex flex-col h-full gap-2 mt-4 grow ">
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
            {calculateRemainingTime(startedAt, endingAt)}
          </span>
          <span className="text-sm">{formatDate(endingAt)}</span>
        </div>
      </div>
    </>
  );
};

export default HeaderProgress;
