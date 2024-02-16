import React from "react";
import { DumplinkIcon } from "../common/icons";
import {
  filterBucketsFiguredOut,
  filterBucketsFiguringOut,
} from "./context/data/buckets";
import { useData } from "./context/data/data";
import { Bucket } from "./types";

export interface HeaderProjectProps {}

function determineIconColor(): string {
  const hostname = window.location.hostname;

  if (hostname === "localhost") {
    return "text-rose-700";
  } else if (hostname === "kitchen.dump.link") {
    return "text-teal-700";
  } else {
    return "text-slate-700";
  }
}

export function currentUrl() {
  const { protocol, hostname, port, pathname } = window.location;

  const isStandardPort =
    (protocol === "http:" && port === "80") ||
    (protocol === "https:" && port === "443");

  const baseUrl = `${protocol}//${hostname}${
    !isStandardPort && port ? `:${port}` : ""
  }${pathname}`;

  return baseUrl;
}

const HeaderProject: React.FC<HeaderProjectProps> = (props) => {
  const { project, tasks, buckets } = useData();

  const done = buckets.filter((b: Bucket) => b.done);
  const figuringOut = filterBucketsFiguringOut(buckets, tasks);
  const figuredOut = filterBucketsFiguredOut(buckets, tasks);

  return (
    <>
      <div className="flex flex-row items-center h-full gap-2 ">
        <a href="/" title="dump.link" target="_blank">
          <DumplinkIcon className={`w-10 h-10 ${determineIconColor()}`} />
        </a>
        <div className="flex flex-col w-full gap-2">
          <div className="flex items-center gap-4">
            <a
              className="text-lg font-bold underline text-slate-700"
              href={currentUrl()}
            >
              {project.name}
            </a>
          </div>
          <div className="flex items-center gap-4 w-60">
            {figuringOut.length > 0 && (
              <div className="flex items-center w-1/3 gap-1">
                <span
                  className={`px-1 mr-0.5 rounded text-xl
                  ${figuringOut.length > 0 && "bg-orange-300"}
                  `}
                >
                  {figuringOut.length}
                </span>
                <div className="text-xs">Figuring out</div>
              </div>
            )}

            {figuredOut.length > 0 && (
              <div className="flex items-center w-1/3 gap-1">
                <span
                  className={`px-1 mr-0.5 rounded text-xl
                  ${figuredOut.length > 0 && "bg-yellow-300"}
                  `}
                >
                  {figuredOut.length}
                </span>
                <div className="text-xs">Figured out</div>
              </div>
            )}

            {done.length > 0 && (
              <div className="flex items-center w-1/3 gap-1">
                <span
                  className={`px-1 mr-0.5 rounded text-xl
                  ${done.length > 0 && "bg-green-500"}
                `}
                >
                  {done.length}
                </span>
                <div className="text-xs">Done</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderProject;
