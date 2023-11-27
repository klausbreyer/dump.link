import React, { ReactNode, useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface TooltipProps {
  info: string;
  children: ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ info, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative flex items-center">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-10 px-2 py-1 mb-2 text-xs text-white rounded-md w-60 bg-slate-500 top-full">
          {info}
        </div>
      )}
    </div>
  );
};

interface Info {
  info: string;
}

const InfoTooltip: React.FC<Info> = ({ info }) => {
  return (
    <Tooltip info={info}>
      <InformationCircleIcon className="w-5 h-5 text-slate-500 cursor-help" />
    </Tooltip>
  );
};

export default InfoTooltip;
