import { Popover } from "@headlessui/react";
import { useEffect, useState } from "react";
import { extractIdFromUrl } from "./context/helper";
import { lastAccessedProject } from "./types";
import { Tooltip } from "./common/InfoTooltip";
import { RecentIcon } from "./common/icons";
import { useData } from "./context/data";

function RecentLinks() {
  const { getProject } = useData();
  const project = getProject();

  const [recentProjects, setRecentProjects] = useState<lastAccessedProject[]>(
    [],
  );

  useEffect(() => {
    const savedProjects = localStorage.getItem("recentProjects");
    if (savedProjects) {
      setRecentProjects(JSON.parse(savedProjects));
    }
  }, [project.name]);

  const currentProjectId = extractIdFromUrl();

  const createProjectLink = (project: lastAccessedProject) => {
    return process.env.NODE_ENV === "production"
      ? `${window.location.origin}/a/${project.id}`
      : `${window.location.origin}/${project.id}`;
  };

  return (
    <Popover className="relative">
      <Popover.Button>
        <Tooltip info="Recent">
          <RecentIcon className="w-5 h-5 cursor-pointer text-slate-500 hover:text-slate-800" />
        </Tooltip>
      </Popover.Button>
      <Popover.Panel className="absolute right-0 z-10 bg-white border rounded-md shadow-lg min-w-max border-slate-200">
        <div className="">
          {recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <Tooltip
                key={project.id}
                info={`Last accessed: ${new Date(
                  project.lastAccessed,
                ).toLocaleDateString()}`}
              >
                <a
                  href={createProjectLink(project)}
                  className={`block px-4 w-full py-2 text-sm ${
                    project.id === currentProjectId
                      ? "bg-slate-300 text-slate-900"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {project.name}
                </a>
              </Tooltip>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-slate-500">
              No recent projects
            </div>
          )}
        </div>
      </Popover.Panel>
    </Popover>
  );
}

export default RecentLinks;
