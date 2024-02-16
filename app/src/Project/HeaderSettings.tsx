import React from "react";

import { Cog8ToothIcon, ShareIcon } from "@heroicons/react/24/solid";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import InfoModal from "../common/InfoModal";
import { Tooltip } from "../common/InfoTooltip";
import { getCurrentTab } from "./HeaderNav";
import RecentLinks from "./RecentLinks";
import ShareLink from "./ShareLink";
import { TabContext } from "./types";

const HeaderSettings: React.FC = () => {
  const location = useLocation();
  const currentTab = getCurrentTab(location);

  const navigate = useNavigate();
  const params = useParams();
  const { projectId } = params;

  function handleTabClick(tab: TabContext) {
    navigate(`/${projectId}/${tab}`);
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
    </div>
  );
};

export default HeaderSettings;
