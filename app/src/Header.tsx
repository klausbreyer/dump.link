import React from "react";

import HeaderNav from "./HeaderNav";
import HeaderProgress from "./HeaderProgress";
import HeaderProject from "./HeaderProject";
import HeaderSettings from "./HeaderSettings";
import Container from "./common/Container";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = (props) => {
  return (
    <Container>
      <div className="w-full mt-2">
        <div className="flex items-center justify-between gap-4 mb-4 ">
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
