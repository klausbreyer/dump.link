import React from "react";
import { useDrop } from "react-dnd";

import CardList from "./common/CardList";
import { useData } from "./context/data";
import { getOpenBucketType } from "./context/helper";
import TaskItem from "./TaskItem";
import { Bucket, DraggedTask, DropCollectedProps } from "./types";
import Title from "./common/Title";

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
    <div className={`w-full h-full`}>
      <Title title="Dump" />

      <div
        ref={dropRef}
        className={`w-full h-full pr-4 bg-slate-100 border-2 rounded-md overflow-hidden
          ${canDrop && !isOver && "border-dashed border-gray-400"}
          ${isOver && "border-solid border-gray-400"}
         ${!isOver && !canDrop && "border-solid border-transparent"}
          `}
      >
        <CardList>
          {bucket?.tasks.map((task) => (
            <TaskItem bucket={bucket} task={task} key={task.id} />
          ))}
          <TaskItem bucket={bucket} task={null} />
        </CardList>
      </div>
    </div>
  );
};

export default Area;
