import React, { useEffect, useState } from "react";

import { Tab } from "@headlessui/react";
import {
  ArrowLeftOnRectangleIcon,
  ArrowsPointingOutIcon,
  ChartBarIcon,
  CogIcon,
} from "@heroicons/react/24/solid";

import Container from "./common/Container";
import { useData } from "./context/data";
import { getBucketPercentage, getOtherBuckets } from "./context/helper";
import {
  getBucketBackgroundColorTop,
  getActiveBorderColor,
  getInactiveBorderColor,
} from "./common/colors";
import { TabContext } from "./types";

interface Step {
  id: string;
  name: string;
  href?: string;
  icon?: React.ReactNode;
}

const steps: Step[] = [
  {
    id: TabContext.Settings,
    name: "Settings",
    icon: <CogIcon className="w-6 h-6 text-slate-600" />,
  },
  {
    id: TabContext.Grouping,
    name: "Grouping",
    icon: <ArrowsPointingOutIcon className="w-6 h-6 text-slate-600" />,
  },
  {
    id: TabContext.Sequencing,
    name: "Sequencing",
    icon: (
      <ArrowLeftOnRectangleIcon className="w-6 h-6 -rotate-90 text-slate-600" />
    ),
  },
  {
    id: TabContext.Ordering,
    name: "Ordering",
    icon: <ChartBarIcon className="w-6 h-6 rotate-90 text-slate-600 " />,
  },
];

interface NavigationProps {}

const Navigation: React.FC<NavigationProps> = (props) => {
  const initialTab =
    window.location.hash.length > 0 ? window.location.hash.slice(1) : "dump";
  const [currentTab, setCurrentTab] = useState<string | null>(initialTab);

  const { getBuckets } = useData();
  const buckets = getBuckets();
  const otherBuckets = getOtherBuckets(buckets);
  const relevantBuckets = otherBuckets.filter((b) => b.tasks.length > 0);

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

  return (
    <Container>
      <div className="mb-2 overflow-hidden rounded-b-md ">
        <Tab.Group as="nav" aria-label="Progress">
          <ol
            role="list"
            className="border border-gray-300 divide-y divide-gray-300 md:flex md:divide-y-0"
          >
            {steps.map((step, stepIdx) => (
              <Tab
                as="li"
                key={step.name}
                className="relative md:flex md:flex-1"
              >
                <Tab.List className="flex items-center w-full">
                  <button
                    onClick={() => handleTabClick(step)}
                    className={`flex items-center w-full px-6 py-2 text-sm font-medium
                ${
                  currentTab === step.id
                    ? "bg-slate-200"
                    : "hover:bg-slate-100 focus:bg-slate-100"
                }
                focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2`}
                  >
                    <span className="flex items-center justify-center flex-shrink-0 w-10 h-10 border-2 rounded-full border-slate-600">
                      {step.icon}
                    </span>
                    <span className="ml-4 text-sm font-medium text-slate-600">
                      {step.name}
                    </span>
                  </button>
                </Tab.List>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className="absolute top-0 right-0 hidden w-5 h-full border-r md:block"
                    aria-hidden="true"
                  ></div>
                )}
              </Tab>
            ))}
          </ol>
        </Tab.Group>
        <div className="flex w-full cursor-help">
          {relevantBuckets.map((bucket) => (
            <div
              title={`${bucket.name}: ${getBucketPercentage(
                bucket,
              )}% completed`}
              className={` border-b-8 flex flex-row text-sm ${getActiveBorderColor(
                bucket,
              )} `}
              style={{ width: `${getBucketPercentage(bucket)}%` }}
            ></div>
          ))}
          {relevantBuckets.map((bucket) => (
            <div
              title={`${bucket.name}: ${
                100 - getBucketPercentage(bucket)
              }% missing`}
              className={`border-b-8 flex flex-row text-sm ${getInactiveBorderColor(
                bucket,
              )} `}
              style={{ width: `${100 - getBucketPercentage(bucket)}%` }}
            ></div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default Navigation;
