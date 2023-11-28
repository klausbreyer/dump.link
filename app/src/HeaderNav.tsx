import React from "react";

import { ArrangeIcon, GroupIcon, SequenceIcon } from "./common/icons";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";

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
    icon: <GroupIcon className="w-6 h-6 text-slate-700" />,
  },
  {
    id: TabContext.Sequence,
    name: "Sequence",

    icon: <SequenceIcon className="w-6 h-6 text-slate-700" />,
  },
  {
    id: TabContext.Arrange,
    name: "Arrange",
    icon: <ArrangeIcon className="w-6 h-6 text-slate-700 " />,
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
    <nav className="flex items-center justify-center w-full space-x-8">
      {steps.map((tab) => {
        const isCurrent = currentTab === tab.id;
        return (
          <button
            key={tab.name}
            onClick={() => handleTabClick(tab.id)}
            className={classNames(
              isCurrent
                ? "border-slate-700 text-slate-700"
                : "border-transparent text-slate-500 hover:border-slate-700 hover:text-slate-700",
              "group inline-flex items-center border-b-2 py-1 text-sm font-medium",
            )}
            aria-current={isCurrent ? "page" : undefined}
          >
            {tab.icon}
            <span className="ml-2">{tab.name}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default HeaderNav;
