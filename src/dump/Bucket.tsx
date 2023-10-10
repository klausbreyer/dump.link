import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import { useTasks } from "../context/useTasks";
import { DraggedItem, DropCollectedProps, TaskState } from "../context/types";
import Task from "./Task";

interface BucketProps {
  bucketId: string;
}
// ... (andere Imports)

const Bucket: React.FC<BucketProps> = (props) => {
  const { bucketId: bucketId } = props;
  const {
    moveTask,
    getBucket,
    updateTask,
    getTask,
    changeTaskState,
    getClosedBucketType,
    getTaskType,
    getBucketForTask,
  } = useTasks();

  const bucket = getBucket(bucketId);

  const [topCollectedProps, topDropRef] = useDrop({
    accept: [TaskState.OPEN, getClosedBucketType(bucketId)],

    drop: (item: DraggedItem) => {
      console.log("drop");
      const fromBucketId = getBucketForTask(item.taskId)?.id || "";
      const task = getTask(item.taskId);
      if (fromBucketId !== bucketId.toString()) {
        updateTask(item.taskId, {
          title: task?.title || "",
          state: TaskState.OPEN,
        });
        moveTask(bucketId.toString(), item.taskId);
      } else {
        changeTaskState(bucketId.toString(), item.taskId, TaskState.OPEN);
      }
      // setTopHovering(false);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const { isOver: topIsOver, canDrop: topCanDrop } =
    topCollectedProps as DropCollectedProps;

  const [bottomCollectedProps, bottomDropRef] = useDrop({
    accept: [TaskState.OPEN],

    drop: (item: DraggedItem) => {
      // only allow dropping if the task is already in this bucket but in another state.
      const fromBucket = getBucketForTask(item.taskId);
      if (fromBucket?.id !== bucketId.toString()) {
        return;
      }
      changeTaskState(bucketId.toString(), item.taskId, TaskState.CLOSED);
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const { isOver: bottomIsOver, canDrop: bottomCanDrop } =
    bottomCollectedProps as DropCollectedProps;

  console.log(bucketId, topIsOver, topCanDrop, bottomIsOver, bottomCanDrop);

  const tasks = bucket?.tasks || [];
  const open = tasks.filter((task) => task.state === TaskState.OPEN);
  const closed = tasks.filter((task) => task.state === TaskState.CLOSED);
  return (
    <div className="w-full">
      <div className={`min-h-[8rem] p-2 bg-amber-200 `}>
        {open.map((task) => (
          <Task taskId={task.id} key={task.id} />
        ))}
        <div
          ref={topDropRef}
          className={`min-h-[2rem] p-2 bg-amber-500   ${
            topCanDrop && !topIsOver && "border-dashed border-4 border-gray-400"
          }
          ${topIsOver && "border-solid border-4 border-gray-400"}
          `}
        ></div>
      </div>
      <div className={`min-h-[8rem] p-2 bg-amber-300 `}>
        {closed.map((task) => (
          <Task taskId={task.id} key={task.id} />
        ))}
        <div
          ref={bottomDropRef}
          className={`min-h-[2rem] p-2 bg-amber-500  ${
            bottomCanDrop &&
            !bottomIsOver &&
            "border-dashed border-4 border-gray-400"
          }
          ${bottomIsOver && "border-solid border-4 border-gray-400"}
          `}
        ></div>
      </div>
    </div>
  );
};

export default Bucket;
