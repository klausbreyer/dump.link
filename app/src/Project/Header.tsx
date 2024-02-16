import React from "react";

import { ArchiveBoxIcon } from "@heroicons/react/24/outline";
import Container from "../common/Container";
import HeaderActivity from "./HeaderActivity";
import HeaderNav from "./HeaderNav";
import HeaderProgress from "./HeaderProgress";
import HeaderProject from "./HeaderProject";
import HeaderSettings from "./HeaderSettings";
import { useData } from "./context/data/data";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = (props) => {
  const { project } = useData();
  return (
    <Container>
      <div className="w-full mt-2">
        {project.archived && (
          <div className="flex items-center justify-center gap-2 p-2 mb-4 text-sm text-center border-2 border-dashed bg-slate-100 border-slate-500">
            <ArchiveBoxIcon className="inline-block w-6 h-6 text-slate-700" />
            <span>
              <b>This project is archived!</b> You can still view it, but you
              can't make changes to it. If you want to make changes, you can{" "}
              <a href="?p=Settings" className="underline">
                unarchive it
              </a>
              .
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 mb-4 ">
          <HeaderProject />

          <div className="flex flex-col items-stretch gap-1 grow">
            <div className="flex justify-between ">
              <HeaderActivity />

              <HeaderSettings />
            </div>
            <HeaderProgress />
          </div>
        </div>
        <HeaderNav />
      </div>
    </Container>
  );
};

export default Header;
