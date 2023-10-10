import React from "react";
import Task from "./Task";
import FlexCol from "../design/FlexCol";
import { useTasks } from "../context/useTasks";
import { useDrop } from "react-dnd";
import { DraggedItem } from "../context/types";

export interface AreaProps {
  [key: string]: any;
}

const Area: React.FC<AreaProps> = (props) => {
  const id = "0";
  const { getBucket, moveTask } = useTasks();

  const bucket = getBucket(id);

  const [, dropRef] = useDrop({
    accept: "TASK",
    drop: (item: DraggedItem) => {
      moveTask(item.fromBucketId, id, item.taskId);
    },
  });

  return (
    <div ref={dropRef} className="w-full h-full p-2 bg-amber-100">
      <FlexCol>
        {bucket?.tasks.map((task) => <Task taskId={task.id} key={task.id} />)}
        <Task taskId={null} />
      </FlexCol>
    </div>
  );
};

export default Area;
