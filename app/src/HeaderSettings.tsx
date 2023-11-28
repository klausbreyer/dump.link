import React from "react";

import { Cog8ToothIcon, ShareIcon } from "@heroicons/react/24/solid";
import { handleTabClick } from "./HeaderNav";
import RecentLinks from "./RecentLinks";
import ShareLink from "./ShareLink";
import InfoModal from "./common/InfoModal";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";
import { Tooltip } from "./common/InfoTooltip";

// HeaderSettings component for the application header
const HeaderSettings: React.FC = () => {
  // State to manage the active tab and copied status
  const currentQueryParam = useQueryParamChange("p");
  const currentTab = (currentQueryParam as TabContext) || TabContext.Group;

  return (
    <div className="flex items-start gap-1">
      <InfoModal
        icon={
          <Tooltip info="Share">
            <ShareIcon className="w-6 h-6 cursor-pointer text-slate-500 hover:text-slate-800" />
          </Tooltip>
        }
        title="Share"
        buttonText="Got it, thanks!"
      >
        <ShareLink />
      </InfoModal>
      <RecentLinks />
      <Tooltip info="Settings">
        <Cog8ToothIcon
          onClick={() => handleTabClick(TabContext.Settings)}
          className={`w-6 h-6 cursor-pointer hover:text-slate-800 ${
            currentTab === TabContext.Settings
              ? "text-slate-800"
              : "text-slate-500"
          }`}
        />
      </Tooltip>
    </div>
  );
};

export default HeaderSettings;
