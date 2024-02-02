import React from "react";

import { useGlobalInteraction } from "./context/interaction";
import { useLaneDrop } from "./hooks/useLaneDrop";
import { DraggingType } from "./types";

interface LaneProps extends React.HTMLProps<HTMLDivElement> {
  children?: React.ReactNode;
  hoverable: boolean;
  defaultHidden: boolean;
  index: number;
}

const Lane: React.FC<LaneProps> = (props) => {
  const { children, index, hoverable, defaultHidden } = props;

  const { globalDragging } = useGlobalInteraction();
  const { isOver, canDrop, dropRef } = useLaneDrop(index);

  const showWhileDragging =
    defaultHidden === false || globalDragging.type === DraggingType.ARRANGE;
  const dropActive = hoverable && canDrop && !isOver;
  const dropOver = hoverable && canDrop && isOver;

  const isUnconnected = index === null || index === undefined;

  return (
    <div
      className={`p-4 [&:not(:last-child)]:border-b border-black border-solid
      ${isUnconnected && "bg-slate-100"}
    `}
    >
      <div
        ref={dropRef}
        className={`border-2 min-h-[5rem] w-full relative flex flex-row gap-8
        ${dropActive && "border-dashed border-slate-400"}
        ${dropOver && "border-solid border-slate-400"}
        ${!dropActive && !dropOver && "border-solid border-transparent"}
        ${showWhileDragging ? "opacity-100" : "opacity-0"}
      `}
      >
        <div className="text-sm">Layer {index + 1}</div>

        <div
          className={`flex flex-1 flex-wrap items-center justify-evenly gap-8
          ${index % 2 === 0 && "pl-10"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
export default Lane;
