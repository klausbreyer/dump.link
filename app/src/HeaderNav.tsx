import React from "react";

import { ArrangeIcon, GroupIcon, SequenceIcon } from "./common/icons";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";
import { CheckIcon } from "@heroicons/react/24/outline";

interface Step {
  id: TabContext;
  name: string;
  href?: string;
  icon?: React.ReactNode;
}

const steps: Step[] = [
  {
    id: TabContext.Group,
    name: "Group",
    icon: <GroupIcon className="w-6 h-6 " />,
  },
  {
    id: TabContext.Sequence,
    name: "Sequence",

    icon: <SequenceIcon className="w-6 h-6 " />,
  },
  {
    id: TabContext.Arrange,
    name: "Arrange",
    icon: <ArrangeIcon className="w-6 h-6 " />,
  },
];

// Utility function to conditionally join class names, implementation needed
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface HeaderNavProps {}

export const handleTabClick = (tab: TabContext) => {
  const params = new URLSearchParams(window.location.search);
  params.set("p", tab);
  window.history.pushState({}, "", "?" + params.toString());

  // Dispatch a custom event after changing the URL
  window.dispatchEvent(new Event("urlchanged"));
};

const HeaderNav: React.FC<HeaderNavProps> = (props) => {
  const currentQueryParam = useQueryParamChange("p");
  const currentTab = (currentQueryParam as TabContext) || TabContext.Group;

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
              className="relative flex flex-1 cursor-pointer group"
              onClick={() => handleTabClick(tab.id)}
            >
              {currentTab === tab.id ? (
                <div className="flex items-center px-6 py-2 text-sm font-medium ">
                  <span className="flex items-center justify-center flex-shrink-0 w-10 h-10 border-2 rounded-full border-slate-600">
                    {tab.icon}
                  </span>
                  <span className="ml-4 text-sm font-medium text-slate-600">
                    {tab.name}
                  </span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="flex items-center px-6 py-2 text-sm font-medium">
                    <span className="flex items-center justify-center flex-shrink-0 w-10 h-10 border-2 rounded-full border-slate-300 group-hover:border-slate-400">
                      <span className="text-slate-500 group-hover:text-slate-900">
                        {tab.icon}
                      </span>
                    </span>
                    <span className="ml-4 text-sm font-medium text-slate-500 group-hover:text-slate-900">
                      {tab.name}
                    </span>
                  </span>
                </div>
              )}

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
