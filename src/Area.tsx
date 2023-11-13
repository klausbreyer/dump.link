import React from "react";
import { useDrop } from "react-dnd";

import CardList from "./common/CardList";
import { useData } from "./context/data";
import { getOpenBucketType } from "./context/helper";
import TaskItem from "./TaskItem";
import { Bucket, DraggedTask, DropCollectedProps } from "./types";

export interface AreaProps {
  bucket: Bucket;
}

const Area: React.FC<AreaProps> = (props) => {
  const { bucket } = props;
  const { getBuckets, moveTask, getTask, getBucketForTask } = useData();

  const allOtherBuckets = getBuckets().filter((b) => b.id !== bucket.id);

  const [collectedProps, dropRef] = useDrop(
    {
      accept: [...allOtherBuckets.map((b) => getOpenBucketType(b.id))],

      drop: (item: DraggedTask) => {
        const task = getTask(item.taskId);
        if (!task) return;
        const fromBucketId = getBucketForTask(task)?.id || "";
        if (fromBucketId !== bucket.id) {
          moveTask(bucket.id, task);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [
      bucket,
      allOtherBuckets,
      getOpenBucketType,
      getTask,
      getBucketForTask,
      moveTask,
    ],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;
  return (
    <div
      ref={dropRef}
      className={`w-full h-full pr-4 bg-white border-r-2 border-slate-500  ${
        canDrop && !isOver ? "border-dashed border-2 border-gray-400" : ""
      } ${isOver ? "border-solid border-2 border-gray-400" : ""}`}
    >
      <div
        className={` px-1 py-2 w-full border-slate-500 text-lg font-bold
        `}
      >
        Dump
      </div>
      <CardList>
        {bucket?.tasks.map((task) => (
          <TaskItem bucket={bucket} task={task} key={task.id} />
        ))}
        <TaskItem bucket={bucket} task={null} />
      </CardList>
    </div>
  );
};

export default Area;
