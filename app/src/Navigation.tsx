import React, { useEffect, useState } from "react";

import { Cog8ToothIcon, CogIcon, ShareIcon } from "@heroicons/react/24/solid";

import NavProgress from "./NavProgress";
import NavProject from "./NavProject";
import Container from "./common/Container";
import { ArrangeIcon, GroupIcon, SequenceIcon } from "./common/icons";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";
import { EllipsisHorizontalCircleIcon } from "@heroicons/react/24/outline";
import InfoModal from "./common/InfoModal";

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
interface NavigationProps {}

const handleTabClick = (tab: TabContext) => {
  const params = new URLSearchParams(window.location.search);
  params.set("p", tab);
  window.history.pushState({}, "", "?" + params.toString());

  // Dispatch a custom event after changing the URL
  window.dispatchEvent(new Event("urlchanged"));
};

const Navigation: React.FC<NavigationProps> = (props) => {
  const currentQueryParam = useQueryParamChange("p");
  const currentTab = (currentQueryParam as TabContext) || TabContext.Group;

  return (
    <Container>
      <div className="w-full border-b border-gray-200">
        <div className="flex items-center justify-between gap-4 mb-8 ">
          <NavProject />

          <NavProgress />
          <div className="flex gap-1">
            <Cog8ToothIcon
              onClick={() => handleTabClick(TabContext.Settings)}
              className={`inline-block w-5 h-5 cursor-pointer  hover:text-slate-800 ${
                currentTab === TabContext.Settings
                  ? "text-slate-800"
                  : "text-slate-500"
              }`}
            />
            <InfoModal
              icon={
                <ShareIcon className="w-5 h-5 cursor-pointer text-slate-500 hover:text-slate-800 " />
              }
              title="Share"
              buttonText="Got it, thanks!"
            >
              {`Copy Link to Clipboard, etc. `.split("\n").map((p, i) => (
                <p key={i} className="mb-2 text-sm text-slate-500">
                  {p}
                </p>
              ))}
            </InfoModal>

            <EllipsisHorizontalCircleIcon className="inline-block w-5 h-5 cursor-pointer text-slate-500 hover:text-slate-800" />
          </div>
        </div>
        <nav className="flex items-center justify-center w-full space-x-8">
          {steps.map((tab) => {
            // Render the first tabs

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
      </div>
    </Container>
  );
};

export default Navigation;
