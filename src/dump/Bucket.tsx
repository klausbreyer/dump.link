import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import { useTasks } from "../context/useTasks";
import { DraggedItem, DropCollectedProps, TaskState } from "../context/types";
import Task from "./Task";
import CardList from "../design/CardList";

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
    getOpenBucketType,

    getTaskType,
    getBucketForTask,
    getBuckets,
  } = useTasks();

  const bucket = getBucket(bucketId);

  const allOtherBuckets = getBuckets().filter((b) => b.id !== bucketId);
  const [topCollectedProps, topDropRef] = useDrop({
    accept: [
      ...allOtherBuckets.map((b) => getOpenBucketType(b.id)),
      getClosedBucketType(bucketId),
    ],

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
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const { isOver: topIsOver, canDrop: topCanDrop } =
    topCollectedProps as DropCollectedProps;

  const [bottomCollectedProps, bottomDropRef] = useDrop({
    accept: [getOpenBucketType(bucketId)],

    drop: (item: DraggedItem) => {
      // only allow dropping if the task is already in this bucket but in another state.
      changeTaskState(bucketId, item.taskId, TaskState.CLOSED);
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const { isOver: bottomIsOver, canDrop: bottomCanDrop } =
    bottomCollectedProps as DropCollectedProps;

  const tasks = bucket?.tasks || [];
  const open = tasks.filter((task) => task.state === TaskState.OPEN);
  const closed = tasks.filter((task) => task.state === TaskState.CLOSED);
  return (
    <div className="w-full">
      <div
        ref={topDropRef}
        className={`min-h-[8rem] p-2 bg-amber-200  ${
          topCanDrop && !topIsOver && "border-dashed border-2 border-gray-400"
        }
          ${topIsOver && "border-solid border-2 border-gray-400"}`}
      >
        <CardList>
          {open.map((task) => (
            <Task taskId={task.id} key={task.id} />
          ))}
        </CardList>
      </div>
      <div
        ref={bottomDropRef}
        className={` min-h-[2.5rem] p-2 bg-amber-300 ${
          bottomCanDrop &&
          !bottomIsOver &&
          "border-dashed border-2 border-gray-400"
        }
          ${bottomIsOver && "border-solid border-2 border-gray-400"} `}
      >
        <CardList>
          {closed.map((task) => (
            <Task taskId={task.id} key={task.id} />
          ))}
        </CardList>
      </div>
    </div>
  );
};

export default Bucket;
