import React from "react";

import { Cog8ToothIcon, ShareIcon, UserIcon } from "@heroicons/react/24/solid";
import { handleTabClick } from "./HeaderNav";
import RecentLinks from "./RecentLinks";
import ShareLink from "./ShareLink";
import InfoModal from "./common/InfoModal";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";
import { Tooltip } from "./common/InfoTooltip";
import { getInitials, getUsername } from "./context/helper_requests";

// HeaderSettings component for the application header
const HeaderSettings: React.FC = () => {
  // State to manage the active tab and copied status
  const currentQueryParam = useQueryParamChange("p");
  const currentTab = (currentQueryParam as TabContext) || TabContext.Group;

  const [initials, setInitials] = React.useState<string>(getInitials());

  function handleChangeUsername() {
    const newUsername = prompt(
      "Please enter your name as you would like your team to see it",
      getUsername(),
    );
    if (newUsername) {
      localStorage.setItem("username", newUsername);
    }
    setInitials(getInitials());
  }

  return (
    <div className="flex items-start gap-2">
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

      <Tooltip info="Change Username">
        <div
          className="flex items-center justify-center w-6 h-6 text-sm font-bold uppercase rounded-full cursor-pointer ring-2 hover:ring-slate-800 ring-slate-500 hover:text-slate-800 text-slate-500 "
          onClick={handleChangeUsername}
        >
          {initials === "" && <UserIcon className="w-5 h-5" />}
          {initials !== "" && <span>{initials}</span>}
        </div>
      </Tooltip>
    </div>
  );
};

export default HeaderSettings;
