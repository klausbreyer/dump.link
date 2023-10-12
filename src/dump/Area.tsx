import React from "react";
import TaskItem from "./TaskItem";
import FlexCol from "../common/FlexCol";
import { useTasks } from "../hooks/useTasks";
import { useDrop } from "react-dnd";
import { DraggedItem, DropCollectedProps, TaskState } from "../types";
import CardList from "../common/CardList";
import BucketHeader from "./BucketHeader";

export interface AreaProps {
  // [key: string]: any;
}

const Area: React.FC<AreaProps> = (props) => {
  const bucketId = "0";
  const {
    getBucket,
    getBuckets,
    moveTask,
    getBucketForTask,
    getOpenBucketType,
  } = useTasks();

  const bucket = getBucket(bucketId);

  const allOtherBuckets = getBuckets().filter((b) => b.id !== bucketId);

  const [collectedProps, dropRef] = useDrop(
    {
      accept: [...allOtherBuckets.map((b) => getOpenBucketType(b.id))],

      drop: (item: DraggedItem) => {
        const fromBucketId = getBucketForTask(item.taskId)?.id || "";
        if (fromBucketId !== bucketId.toString()) {
          moveTask(bucketId, item.taskId);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [bucketId, allOtherBuckets, getOpenBucketType, getBucketForTask, moveTask],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;
  return (
    <div
      ref={dropRef}
      className={`w-full h-full bg-slate-200 ${
        canDrop && !isOver ? "border-dashed border-2 border-gray-400" : ""
      } ${isOver ? "border-solid border-2 border-gray-400" : ""}`}
    >
      <div className={`w-full p-1 flex gap-1 `}>
        <input
          readOnly
          type="text"
          value={"Dump"}
          className={`px-1 w-full bg-transparent border-b-2 focus:outline-none border-slate-500
        `}
        />
      </div>
      <CardList>
        {bucket?.tasks.map((task) => (
          <TaskItem taskId={task.id} key={task.id} />
        ))}
        <TaskItem taskId={null} />
      </CardList>
    </div>
  );
};

export default Area;
