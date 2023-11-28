import React, { useState } from "react";

import { Cog8ToothIcon, ShareIcon } from "@heroicons/react/24/solid";
import { EllipsisHorizontalCircleIcon } from "@heroicons/react/24/outline";
import { handleTabClick } from "./HeaderNav";
import InfoModal from "./common/InfoModal";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";
import { currentUrl } from "./HeaderProject";
import { Tooltip } from "./common/InfoTooltip";
import ShareLink from "./ShareLink";

// HeaderSettings component for the application header
const HeaderSettings: React.FC = () => {
  // State to manage the active tab and copied status
  const currentQueryParam = useQueryParamChange("p");
  const currentTab = (currentQueryParam as TabContext) || TabContext.Group;
  const [isCopied, setIsCopied] = useState(false);

  // Function to handle copying the URL to the clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset copied status after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="flex gap-1">
      <Cog8ToothIcon
        onClick={() => handleTabClick(TabContext.Settings)}
        className={`inline-block w-5 h-5 cursor-pointer hover:text-slate-800 ${
          currentTab === TabContext.Settings
            ? "text-slate-800"
            : "text-slate-500"
        }`}
      />
      <InfoModal
        icon={
          <ShareIcon className="w-5 h-5 cursor-pointer text-slate-500 hover:text-slate-800" />
        }
        title="Share"
        buttonText="Got it, thanks!"
      >
        <ShareLink />
      </InfoModal>

      <EllipsisHorizontalCircleIcon className="inline-block w-5 h-5 cursor-pointer text-slate-500 hover:text-slate-800" />
    </div>
  );
};

export default HeaderSettings;
