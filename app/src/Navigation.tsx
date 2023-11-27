import React, { useEffect, useState } from "react";

import { CogIcon } from "@heroicons/react/24/solid";

import Container from "./common/Container";
import { ArrangeIcon, GroupIcon, SequenceIcon } from "./common/icons";
import { useData } from "./context/data";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";
import NavProject from "./NavProject";
import NavProgress from "./NavProgress";

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
  {
    id: TabContext.Settings,
    name: "Settings",
    icon: <CogIcon className="w-6 h-6 text-slate-700" />,
  },
];

// Utility function to conditionally join class names, implementation needed
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
interface NavigationProps {}

const Navigation: React.FC<NavigationProps> = (props) => {
  const { getProject } = useData();
  const project = getProject();
  const currentQueryParam = useQueryParamChange("p");
  const initialTab = currentQueryParam || TabContext.Group;
  const [currentTab, setCurrentTab] = useState<string | null>(initialTab);

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
      <div className="flex items-center justify-between gap-4 border-b border-gray-200">
        <nav className="flex items-center justify-between w-full gap-8">
          <NavProject />
          <NavProgress />
          <div className="flex items-center justify-between -mb-px space-x-8">
            {steps.map((tab) => {
              const isCurrent = currentTab === tab.id;
              return (
                <button
                  key={tab.name}
                  onClick={() => handleTabClick(tab)}
                  className={classNames(
                    isCurrent
                      ? "border-slate-700 text-slate-700"
                      : "border-transparent text-slate-500 hover:border-slate-700 hover:text-slate-700",
                    "group inline-flex items-center border-b-2 py-4 text-sm font-medium",
                  )}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </Container>
  );
};

export default Navigation;
