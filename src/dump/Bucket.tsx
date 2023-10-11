import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import { getTasksByState, useTasks } from "../context/useTasks";
import {
  Bucket,
  DraggedItem,
  DropCollectedProps,
  Task,
  TaskState,
} from "../context/types";
import TaskItem from "./TaskItem";
import CardList from "../design/CardList";
import Header from "./Header";

interface BucketProps {
  bucketId: string;
}

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

  const open = getTasksByState(bucket, TaskState.OPEN);
  const closed = getTasksByState(bucket, TaskState.CLOSED);

  const bgTop = getBackgroundColor(bucket, "top");
  const bgBottom = getBackgroundColor(bucket, "bottom");

  return (
    <div className={`w-full`}>
      <Header bucketId={bucketId} />
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
            <TaskItem taskId={task.id} key={task.id} />
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
            <TaskItem taskId={task.id} key={task.id} />
          ))}
        </CardList>
      </div>
    </div>
  );
};

export default Bucket;

// backgrounds: Colors: Black when no tasks are added, yellow when at least one is added to top state, and green when all are in the bottom state.

export function getBackgroundColor(
  bucket: Bucket | undefined,
  position = "top",
): string {
  if (bucket?.flagged) {
    return position === "top" ? "bg-rose-200" : "bg-rose-300";
  }

  const openCount = getTasksByState(bucket, TaskState.OPEN).length;
  const closedCount = getTasksByState(bucket, TaskState.CLOSED).length;

  if (openCount === 0) {
    if (closedCount > 0) {
      return position === "top" ? "bg-green-200" : "bg-green-300";
    } else {
      return position === "top" ? "bg-slate-200" : "bg-slate-300";
    }
  } else {
    return position === "top" ? "bg-amber-200" : "bg-amber-300";
  }
}
