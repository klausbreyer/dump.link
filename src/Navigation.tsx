import React, { useEffect, useState } from "react";

import { CogIcon } from "@heroicons/react/24/solid";

import Container from "./common/Container";
import { ArrangeIcon, GroupIcon, SequenceIcon } from "./common/icons";
import { useData } from "./context/data";
import {
  getAllPairs,
  getOtherBuckets,
  getTasksByClosed,
} from "./context/helper";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";

interface Step {
  id: string;
  name: string;
  href?: string;
  icon?: React.ReactNode;
}

const steps: Step[] = [
  {
    id: TabContext.Group,
    name: "Group",
    icon: <GroupIcon className="w-6 h-6 text-slate-600" />,
  },
  {
    id: TabContext.Sequence,
    name: "Sequence",

    icon: <SequenceIcon className="w-6 h-6 text-slate-600" />,
  },
  {
    id: TabContext.Arrange,
    name: "Arrange",
    icon: <ArrangeIcon className="w-6 h-6 text-slate-600 " />,
  },
  {
    id: TabContext.Settings,
    name: "Prototype Settings",
    icon: <CogIcon className="w-6 h-6 text-slate-600" />,
  },
];

// Utility function to conditionally join class names, implementation needed
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
interface NavigationProps {}

const Navigation: React.FC<NavigationProps> = (props) => {
  const currentQueryParam = useQueryParamChange("p");
  const initialTab = currentQueryParam || TabContext.Group;
  const [currentTab, setCurrentTab] = useState<string | null>(initialTab);

  const { getBuckets, getAllDependencyChains } = useData();
  const buckets = getBuckets();
  const otherBuckets = getOtherBuckets(buckets);
  const relevantBuckets = otherBuckets.filter((b) => b.tasks.length > 0);

  const chains = getAllDependencyChains();
  const pairs = getAllPairs(chains);

  const showArrange = pairs.length > 0;

  const handleTabClick = (step: Step) => {
    setCurrentTab(step.id);

    const params = new URLSearchParams(window.location.search);
    params.set("p", step.id);
    window.history.pushState({}, "", "?" + params.toString());

    // Dispatch a custom event after changing the URL
    window.dispatchEvent(new Event("urlchanged"));
  };

  useEffect(() => {
    // Function to handle hash change events
    const handleHashChange = () => {
      setCurrentTab(window.location.hash.slice(1));
    };

    // Attach event listener
    window.addEventListener("hashchange", handleHashChange);

    // Cleanup function to detach the event listener when the component is unmounted
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const tasksSolved = otherBuckets.reduce(
    (acc, bucket) => acc + getTasksByClosed(bucket, true).length,
    0,
  );

  const tasksNotDone = otherBuckets.reduce(
    (acc, bucket) => acc + getTasksByClosed(bucket, false).length,
    0,
  );

  // Assuming 'inputValue' is of type 'string | null'
  const value = currentTab === null ? "" : currentTab; // Provide a default empty string if null

  return (
    <Container>
      <div className="sm:hidden">
        {/* Mobile view: Dropdown */}
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full border-gray-300 rounded-md focus:border-slate-500 focus:ring-slate-500"
          value={value}
          onChange={(e) => {
            const step = steps.find((step) => step.name === e.target.value);
            if (step) handleTabClick(step);
          }}
        >
          {steps.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8" aria-label="Tabs">
            {steps.map((tab) => {
              const isCurrent = currentTab === tab.id;
              return (
                <button
                  key={tab.name}
                  onClick={() => handleTabClick(tab)}
                  className={classNames(
                    isCurrent
                      ? "border-slate-500 text-slate-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium",
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
      </div>
      <div className="flex w-full my-2 overflow-hidden border cursor-help rounded-xl">
        <div
          title={`Solved: ${tasksSolved}`}
          className={`h-3 bg-green-300 hover:bg-green-400 `}
          style={{
            width: `${(100 * tasksSolved) / (tasksNotDone + tasksSolved)}%`,
          }}
        ></div>
        <div
          title={`Unsolved: ${tasksNotDone}`}
          className={`h-3 bg-white`}
          style={{
            width: `${(100 * tasksNotDone) / (tasksNotDone + tasksSolved)}%`,
          }}
        ></div>
      </div>
    </Container>
  );
};

export default Navigation;
