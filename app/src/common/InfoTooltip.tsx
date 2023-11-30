import React, { ReactNode, useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

interface TooltipProps {
  info: ReactNode;
  children: ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ info, children }) => {
  const [show, setShow] = useState(false);

  const fixedWith = info && info?.toString().length > 10;
  return (
    <div className="relative">
      <div
        className="w-full"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(false)}
      >
        {children}
      </div>

      <div
        className={`absolute z-10 flex  px-2 py-1 mb-2 text-xs text-white
        whitespace-normal rounded-md bg-slate-500 top-full
        ${show ? "block" : "hidden"}
        ${fixedWith ? "w-60" : "w-auto"}
        `}
      >
        {info}
      </div>
    </div>
  );
};

interface InfoTooltipProps {
  children: ReactNode;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ children }) => {
  return (
    <Tooltip info={children}>
      <InformationCircleIcon className="w-5 h-5 text-slate-500 cursor-help" />
    </Tooltip>
  );
};

export default InfoTooltip;
