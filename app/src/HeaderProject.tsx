import React from "react";
import { DumplinkIcon } from "./common/icons";
import { useData } from "./context/data";
import { filterBucketsFiguringOut } from "./context/helper";
import { Bucket } from "./types";

export interface HeaderProjectProps {}

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
  const { getProject, getBuckets, getTasks } = useData();

  const project = getProject();
  const buckets = getBuckets();
  const tasks = getTasks();

  const done = buckets.filter((b: Bucket) => b.done);
  const figuringOut = filterBucketsFiguringOut(buckets, tasks);

  return (
    <>
      <div className="flex flex-row items-center h-full gap-2 ">
        <a href="/" title="dump.link" target="_blank">
          <DumplinkIcon className="w-10 h-10 text-slate-700" />
        </a>
        <div className="grid w-full gap-x-4">
          <div className="flex items-center gap-4">
            <a
              className="text-lg font-bold underline text-slate-700"
              href={currentUrl()}
            >
              {project.name}
            </a>
          </div>
          <div className="flex items-center gap-4 w-52">
            <div className="flex items-center gap-1">
              <span
                className={`px-1 mr-0.5 rounded text-xl
                  ${figuringOut.length > 0 && "bg-orange-300"}
                  `}
              >
                {figuringOut.length}
              </span>
              <div className="text-xs">Figuring out</div>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`px-1 mr-0.5 rounded text-xl
                  ${done.length > 0 && "bg-green-500"}
                `}
              >
                {done.length}
              </span>
              <div className="text-xs">Done</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderProject;
