import React from "react";

import { Cog8ToothIcon, ShareIcon } from "@heroicons/react/24/solid";
import { EllipsisHorizontalCircleIcon } from "@heroicons/react/24/outline";
import { handleTabClick } from "./HeaderNav";
import InfoModal from "./common/InfoModal";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";

interface HeaderSettingsProps {}

const HeaderSettings: React.FC<HeaderSettingsProps> = (props) => {
  const currentQueryParam = useQueryParamChange("p");
  const currentTab = (currentQueryParam as TabContext) || TabContext.Group;

  return (
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
  );
};

export default HeaderSettings;
