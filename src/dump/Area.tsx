import React from "react";
import TaskItem from "./TaskItem";
import FlexCol from "../design/FlexCol";
import { useTasks } from "../context/useTasks";
import { useDrop } from "react-dnd";
import { DraggedItem, DropCollectedProps, TaskState } from "../context/types";
import CardList from "../design/CardList";
import Header from "./Header";

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
      className={`w-full h-full p-2 bg-slate-50 ${
        canDrop && !isOver ? "border-dashed border-2 border-gray-400" : ""
      } ${isOver ? "border-solid border-2 border-gray-400" : ""}`}
    >
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
