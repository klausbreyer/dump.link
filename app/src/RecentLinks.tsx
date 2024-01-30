import { Popover, Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
import { lastAccessedProject } from "./types";
import { Tooltip } from "./common/InfoTooltip";
import { RecentIcon } from "./common/icons";
import { useData } from "./context/data/data";
import { extractIdFromUrl } from "./context/data/requests";

function RecentLinks() {
  const { project } = useData();

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
    //   z for the whole thing because of the transition.
    <Popover className="relative z-50">
      <Popover.Button>
        <Tooltip info="Recent">
          <RecentIcon className="w-6 h-6 cursor-pointer text-slate-500 hover:text-slate-800" />
        </Tooltip>
      </Popover.Button>

      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Popover.Panel className="absolute right-0 bg-white border rounded-md shadow-lg min-w-max border-slate-200">
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
      </Transition>
    </Popover>
  );
}

export default RecentLinks;
