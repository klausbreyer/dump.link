import React, { ReactNode } from "react";

import { InformationCircleIcon } from "@heroicons/react/24/solid";
import {
  Location,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import InfoModal from "../common/InfoModal";
import Title from "../common/Title";
import { ArrangeIcon, GroupIcon, SequenceIcon } from "../common/icons";
import { TabContext } from "./types";

interface Step {
  id: TabContext;
  name: string;
  icon: ReactNode;
  infoTitle: string;
  infoChildren: ReactNode;
}

const steps: Step[] = [
  {
    id: TabContext.Group,
    name: "Dump & Task Grouper",
    infoTitle: "",
    icon: <GroupIcon className="w-6 h-6 " />,
    infoChildren: (
      <>
        <Title>Dump</Title>
        {`Put everything you think you will have to do here into the dump.
This helps you consider "the whole" by turning the whole thing into, e.g., rough implementation tasks without concerning yourself with structure and order before starting on any one area.`
          .split("\n")
          .map((p, i) => (
            <p key={i} className="mb-2 text-sm text-slate-500">
              {p}
            </p>
          ))}
        <Title>Task Grouper</Title>
        {`Drag the initial tasks (and, as things progress, any discovered tasks) from the dump (or add directly to a named task group) into unnamed groups by asking yourself: "What can be completed together and in isolation from the rest?".
Task group boxes are usually named after you and your team cluster the tasks and look at the actual work to ensure the task groups show real relationships in the work and not arbitrary categories. Then, consider which task groups, if any, have risky unknowns and flag them.
You can track the movement of work between “Figuring out”, “Figured out”, and “Done” states. When you add a task to a task group, it is by default considered an "In-progress Figuring out" state.
When a task item is checked, the task’s state auto-switches to "Figured out". Only after all tasks are "Figured out" does the task group's "Done" checkbox appear, which you can click when the task group is done.
All task groups are considered at risk so long as at least one task is in a "Figuring out" state since all tasks are assumed to work together to make one piece, or slice, work so you can move on to the next task group or finish the project.`
          .split("\n")
          .map((p, i) => (
            <p key={i} className="mb-2 text-sm text-slate-500">
              {p}
            </p>
          ))}
      </>
    ),
  },
  {
    id: TabContext.Sequence,
    name: "Task Group Sequencer",
    infoTitle: "Task Group Sequencer",
    icon: <SequenceIcon className="w-6 h-6 " />,
    infoChildren: (
      <>
        {`The Task Group Sequencer lets you draw an arrow from one task group to another illustrating the causal structure of how things are connected.
The Task Group Sequencer lets you know when you have the required inputs completed that the next task group needs.`
          .split("\n")
          .map((p, i) => (
            <p key={i} className="mb-2 text-sm text-slate-500">
              {p}
            </p>
          ))}
      </>
    ),
  },
  {
    id: TabContext.Arrange,
    name: "Task Group Arranger",
    infoTitle: "Task Group Arranger",
    icon: <ArrangeIcon className="w-6 h-6 " />,
    infoChildren: (
      <>
        {`Dumplink recognizes task groups with more outgoing than incoming connections so teams know where to start building and solving problems first.
The Task Group Arranger helps you and your colleagues easily see what has to be done first in terms of dependencies and unknowns but also lets you sort, e.g., by ease/effort, and move them up or down in the arrangement layer stack.`
          .split("\n")
          .map((p, i) => (
            <p key={i} className="mb-2 text-sm text-slate-500">
              {p}
            </p>
          ))}
      </>
    ),
  },
];

interface HeaderNavProps {}

const HeaderNav: React.FC<HeaderNavProps> = (props) => {
  const location = useLocation();
  const currentTab = getCurrentTab(location);

  const navigate = useNavigate();
  const params = useParams();
  const { projectId } = params;

  function handleTabClick(tab: TabContext) {
    navigate(`/${projectId}/${tab}`);
  }

  const openOnLoad = false;
  return (
    <>
      <nav>
        <ol
          role="list"
          className="flex border divide-y-0 rounded-md border-slate-300 divide-slate-300"
        >
          {steps.map((tab, i) => (
            <li
              key={tab.name}
              className="relative flex items-center justify-start flex-1 "
            >
              {currentTab === tab.id ? (
                <div
                  className="flex items-center py-2 pl-6 pr-2 text-sm font-medium cursor-pointer group"
                  onClick={() => handleTabClick(tab.id)}
                >
                  <span className="flex items-center justify-center flex-shrink-0 w-10 h-10 border-2 rounded-full border-slate-600">
                    {tab.icon}
                  </span>
                  <span className="ml-4 text-sm font-medium text-slate-600">
                    {tab.name}
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center cursor-pointer group "
                  onClick={() => handleTabClick(tab.id)}
                >
                  <span className="flex items-center py-2 pl-6 pr-2 text-sm font-medium">
                    <span className="flex items-center justify-center flex-shrink-0 w-10 h-10 border-2 rounded-full border-slate-300 group-hover:border-slate-400">
                      <span className="text-slate-500 group-hover:text-slate-800">
                        {tab.icon}
                      </span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-slate-500 group-hover:text-slate-800">
                      {tab.name}
                    </span>
                  </span>
                </div>
              )}
              <div className="mr-8">
                <InfoModal
                  icon={
                    <InformationCircleIcon className="w-5 h-5 cursor-pointer text-slate-500 hover:text-slate-800" />
                  }
                  title={tab.infoTitle}
                  buttonText="Got it, thanks!"
                  open={openOnLoad}
                >
                  {tab.infoChildren}
                </InfoModal>
              </div>

              {i !== steps.length - 1 ? (
                <>
                  <div className="absolute top-0 right-0 w-5 h-full">
                    <svg
                      className="w-full h-full text-slate-300"
                      viewBox="0 0 22 80"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 -2L20 40L0 82"
                        vectorEffect="non-scaling-stroke"
                        stroke="currentcolor"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default HeaderNav;

export function getCurrentTab(location: Location): TabContext {
  // Assuming the URL pattern is "/{id}/{tab}".
  const pathSegments = location.pathname.split("/").filter(Boolean);
  if (pathSegments.length < 2) {
    return TabContext.Group;
  }
  const tabSegment = pathSegments[1];
  return Object.values(TabContext).includes(tabSegment as TabContext)
    ? (tabSegment as TabContext)
    : TabContext.Group;
}
