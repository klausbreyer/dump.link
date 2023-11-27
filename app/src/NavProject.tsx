import React from "react";
import { DumplinkIcon } from "./common/icons";
import { useData } from "./context/data";
import { filterBucketsFiguringOut } from "./context/helper";
import { Bucket, TabContext } from "./types";

import {
  Cog8ToothIcon,
  EllipsisHorizontalCircleIcon,
  ShareIcon,
} from "@heroicons/react/24/solid";

export interface NavProjectProps {}

function currentUrl() {
  const { protocol, hostname, port, pathname } = window.location;

  const isStandardPort =
    (protocol === "http:" && port === "80") ||
    (protocol === "https:" && port === "443");

  const baseUrl = `${protocol}//${hostname}${
    !isStandardPort && port ? `:${port}` : ""
  }${pathname}`;

  return baseUrl;
}

const NavProject: React.FC<NavProjectProps> = (props) => {
  const { getProject, getBuckets, getTasks } = useData();

  const project = getProject();
  const buckets = getBuckets();
  const tasks = getTasks();

  const done = buckets.filter((b: Bucket) => b.done);
  const figuringOut = filterBucketsFiguringOut(buckets, tasks);

  return (
    <>
      <div className="flex flex-row items-center h-full gap-1 ">
        <a href="/" title="dump.link" target="_blank">
          <DumplinkIcon className="w-12 h-12 text-slate-700" />
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
          <div className="flex gap-4 w-52">
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
    </>
  );
};

export default NavProject;
