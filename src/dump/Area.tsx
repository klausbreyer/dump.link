import React from "react";
import Task from "./Task";
import FlexCol from "../design/FlexCol";
import { useTasks } from "../context/useTasks";
import { useDrop } from "react-dnd";
import { DraggedItem } from "../context/types";

export interface AreaProps {
  // [key: string]: any;
}

const Area: React.FC<AreaProps> = (props) => {
  const bucketId = "0";
  const { getBucket, moveTask, getBucketForTask } = useTasks();

  const bucket = getBucket(bucketId);

  const [, dropRef] = useDrop({
    accept: "TASK",
    drop: (item: DraggedItem) => {
      console.log("drop");
      const fromBucketId = getBucketForTask(item.taskId)?.id || "";
      if (fromBucketId !== bucketId.toString()) {
        moveTask(bucketId, item.taskId);
      }
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
