import React, { useEffect, useState } from "react";

import { Cog8ToothIcon, CogIcon, ShareIcon } from "@heroicons/react/24/solid";

import HeaderProgress from "./HeaderProgress";
import HeaderProject from "./HeaderProject";
import Container from "./common/Container";
import { ArrangeIcon, GroupIcon, SequenceIcon } from "./common/icons";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";
import { EllipsisHorizontalCircleIcon } from "@heroicons/react/24/outline";
import InfoModal from "./common/InfoModal";
import HeaderNav, { handleTabClick } from "./HeaderNav";
import HeaderSettings from "./HeaderSettings";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = (props) => {
  const currentQueryParam = useQueryParamChange("p");
  const currentTab = (currentQueryParam as TabContext) || TabContext.Group;

  return (
    <Container>
      <div className="w-full border-b border-gray-200">
        <div className="flex items-center justify-between gap-4 mb-8 ">
          <HeaderProject />
          <HeaderProgress />
          <HeaderSettings />
        </div>
        <HeaderNav />
      </div>
    </Container>
  );
};

export default Header;
