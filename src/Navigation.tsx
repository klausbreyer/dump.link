import React, { useState, useEffect } from "react";

import {
  CogIcon,
  ArrowLeftOnRectangleIcon,
  ArrowsPointingOutIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";
import { Tab } from "@headlessui/react";
import Container from "./common/Container";

interface Step {
  id: string;
  name: string;
  href?: string;
  icon?: React.ReactNode;
}

const steps: Step[] = [
  {
    id: "settings",
    name: "Settings",
    icon: <CogIcon className="w-6 h-6 text-slate-600" />,
  },
  {
    id: "dump",
    name: "Grouping",
    icon: <ArrowsPointingOutIcon className="w-6 h-6 text-slate-600" />,
  },
  {
    id: "graph",
    name: "Sequencing",
    icon: (
      <ArrowLeftOnRectangleIcon className="w-6 h-6 -rotate-90 text-slate-600" />
    ),
  },
  {
    id: "foliation",
    name: "Ordering",
    icon: <ChartBarIcon className="w-6 h-6 rotate-90 text-slate-600 " />,
  },
];
interface NavigationProps {
  onTabChange?: (stepName: string) => void; // Define callback prop
}

const Navigation: React.FC<NavigationProps> = ({ onTabChange }) => {
  const initialTab =
    window.location.hash.length > 0 ? window.location.hash.slice(1) : "dump";
  const [currentTab, setCurrentTab] = useState<string | null>(initialTab);

  const handleTabClick = (step: Step) => {
    setCurrentTab(step.id);
    window.location.hash = step.id; // Set the URL hash to the step's id
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
      <Tab.Group as="nav" aria-label="Progress">
        <ol
          role="list"
          className="my-2 border border-gray-300 divide-y divide-gray-300 rounded-md md:flex md:divide-y-0"
        >
          {steps.map((step, stepIdx) => (
            <Tab as="li" key={step.name} className="relative md:flex md:flex-1">
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
    </Container>
  );
};

export default Navigation;
