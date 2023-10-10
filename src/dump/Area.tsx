import React from "react";
import Task from "./Task";
import FlexCol from "../design/FlexCol";
import { useTasks } from "../context/useTasks";

interface AreaProps {
  [key: string]: any;
}

const Area: React.FC<AreaProps> = (props) => {
  const id = "0";
  const { getBucket } = useTasks();

  const bucket = getBucket(id);
  console.log(bucket);

  return (
    <div className="w-full h-full p-2 bg-amber-100">
      <FlexCol>
        {bucket?.tasks.map((task) => <Task taskId={task.id} key={task.id} />)}
        <Task taskId={null} />
      </FlexCol>
    </div>
  );
};

export default Area;
