import React from "react";
import Task from "./Task";
import FlexCol from "../design/FlexCol";

interface AreaProps {
  [key: string]: any;
}

const Area: React.FC<AreaProps> = (props) => {
  return (
    <div className="w-full h-full p-2 bg-amber-100">
      <FlexCol>
        <Task taskId={null} />
      </FlexCol>
    </div>
  );
};

export default Area;
