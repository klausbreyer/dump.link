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
  const [topCollectedProps, topDropRef] = useDrop(
    {
      accept: [
        ...allOtherBuckets.map((b) => getOpenBucketType(b.id)),
        getClosedBucketType(bucketId),
      ],

      drop: (item: DraggedItem) => {
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
    },
    [
      getOpenBucketType,
      getClosedBucketType,
      getBucketForTask,
      getTask,
      updateTask,
      moveTask,
      changeTaskState,
      bucketId,
      allOtherBuckets,
    ],
  );

  const { isOver: topIsOver, canDrop: topCanDrop } =
    topCollectedProps as DropCollectedProps;

  const [bottomCollectedProps, bottomDropRef] = useDrop(
    {
      accept: [getOpenBucketType(bucketId)],

      drop: (item: DraggedItem) => {
        // only allow dropping if the task is already in this bucket but in another state.
        changeTaskState(bucketId, item.taskId, TaskState.CLOSED);
      },

      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [getOpenBucketType, bucketId, changeTaskState],
  );

  const { isOver: bottomIsOver, canDrop: bottomCanDrop } =
    bottomCollectedProps as DropCollectedProps;

  const tasks = bucket?.tasks || [];
  const open = tasks.filter((task) => task.state === TaskState.OPEN);
  const closed = tasks.filter((task) => task.state === TaskState.CLOSED);

  // backgrounds: Colors: Black when no tasks are added, yellow when at least one is added to top state, and green when all are in the bottom state.

  const bgTop =
    open.length === 0
      ? closed.length > 0
        ? "bg-green-200"
        : "bg-slate-200"
      : "bg-amber-200";

  const bgBottom =
    open.length === 0
      ? closed.length > 0
        ? "bg-green-300"
        : "bg-slate-300"
      : "bg-amber-300";

  return (
    <div className={`w-full`}>
      <div
        ref={topDropRef}
        className={`min-h-[7.1rem] p-2 ${bgTop} border-solid border-2 ${
          topCanDrop && !topIsOver && "border-dashed border-2 border-gray-400"
        }
          ${topIsOver && " border-gray-400"}
          ${!topCanDrop && !topIsOver && " border-transparent"}
          `}
      >
        <CardList>
          {open.map((task) => (
            <Task taskId={task.id} key={task.id} />
          ))}
        </CardList>
      </div>
      <div
        ref={bottomDropRef}
        className={`min-h-[3rem]  p-2 ${bgBottom} bg-amber-300  border-solid border-2 ${
          bottomCanDrop &&
          !bottomIsOver &&
          "border-dashed border-2 border-gray-400"
        }
          ${bottomIsOver && " border-gray-400"}
          ${!bottomCanDrop && !bottomIsOver && " border-transparent"}
          `}
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
