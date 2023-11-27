import React from "react";
import { useDrop } from "react-dnd";

import CardList from "./common/CardList";
import { useData } from "./context/data";
import {
  getBucketForTask,
  getOpenBucketType,
  getTask,
  getTasksForBucket,
} from "./context/helper";
import TaskItem from "./TaskItem";
import { Bucket, DraggedTask, DropCollectedProps } from "./types";
import Title from "./common/Title";

export interface AreaProps {
  bucket: Bucket;
}

const Area: React.FC<AreaProps> = (props) => {
  const { bucket } = props;
  const { getBuckets, moveTask, getTasks } = useData();

  const buckets = getBuckets();
  const tasks = getTasks();
  const tasksForbucket = getTasksForBucket(tasks, bucket.id);
  const allOtherBuckets = buckets.filter((b) => b.id !== bucket.id);

  const [collectedProps, dropRef] = useDrop(
    {
      accept: [...allOtherBuckets.map((b) => getOpenBucketType(b.id))],

      drop: (item: DraggedTask) => {
        const task = getTask(tasks, item.taskId);
        if (!task) return;
        const fromBucketId = getBucketForTask(buckets, task)?.id || "";
        if (fromBucketId !== bucket.id) {
          moveTask(bucket.id, task.id);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [
      bucket,
      buckets,
      tasksForbucket,
      allOtherBuckets,
      getOpenBucketType,
      getBucketForTask,
      moveTask,
    ],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;
  return (
    <div
      ref={dropRef}
      className={`w-full h-full pr-4 bg-slate-100 border-2 rounded-md overflow-hidden
          ${canDrop && !isOver && "border-dashed border-gray-400"}
          ${isOver && "border-solid border-gray-400"}
         ${!isOver && !canDrop && "border-solid border-transparent"}
          `}
    >
      <CardList>
        {tasksForbucket.map((task) => (
          <TaskItem bucket={bucket} task={task} key={task.id} />
        ))}
      </CardList>
      <CardList>
        <TaskItem bucket={bucket} task={null} />
      </CardList>
    </div>
  );
};

export default Area;
