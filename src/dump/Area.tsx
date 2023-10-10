import React from "react";
import Task from "./Task";
import FlexCol from "../design/FlexCol";
import { useTasks } from "../context/useTasks";
import { useDrop } from "react-dnd";
import { DraggedItem, DropCollectedProps, TaskState } from "../context/types";

export interface AreaProps {
  // [key: string]: any;
}

const Area: React.FC<AreaProps> = (props) => {
  const bucketId = "0";
  const { getBucket, moveTask, getBucketForTask } = useTasks();

  const bucket = getBucket(bucketId);

  const [collectedProps, dropRef] = useDrop({
    accept: [TaskState.OPEN],
    drop: (item: DraggedItem) => {
      console.log("drop");
      const fromBucketId = getBucketForTask(item.taskId)?.id || "";
      if (fromBucketId !== bucketId.toString()) {
        moveTask(bucketId, item.taskId);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  return (
    <div className="w-full h-full p-2 bg-amber-100">
      <FlexCol>
        {bucket?.tasks.map((task) => <Task taskId={task.id} key={task.id} />)}
        <Task taskId={null} />
        <div
          ref={dropRef}
          className={`min-h-[2rem] p-2 bg-amber-500   ${
            canDrop && !isOver && "border-dashed border-4 border-gray-400"
          }
          ${isOver && "border-solid border-4 border-gray-400"}
          `}
        ></div>
      </FlexCol>
    </div>
  );
};

export default Area;
