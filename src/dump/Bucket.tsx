import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import {
  getClosedBucketType,
  getOpenBucketType,
  getTasksByState,
  useData,
} from "../hooks/useData";
import { Bucket, DraggedTask, DropCollectedProps, TaskState } from "../types";
import TaskItem from "./TaskItem";
import CardList from "../common/CardList";
import BucketHeader from "./BucketHeader";
import { getBucketBackgroundColor } from "../common/colors";

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
    getBucketForTask,
    getBuckets,
  } = useData();

  const bucket = getBucket(bucketId);
  const allOtherBuckets = getBuckets().filter((b: Bucket) => b.id !== bucketId);

  const open = getTasksByState(bucket, TaskState.OPEN);
  const closed = getTasksByState(bucket, TaskState.CLOSED);

  useEffect(() => {
    if (closed.length === 1) {
      setClosedExpanded(false);
    }
  }, [closed.length]);

  // flag closed expansion
  const [closedExpanded, setClosedExpanded] = useState<boolean>(false);

  const [topCollectedProps, topDropRef] = useDrop(
    {
      accept: [
        ...allOtherBuckets.map((b: Bucket) => getOpenBucketType(b.id)),
        getClosedBucketType(bucketId),
      ],

      drop: (item: DraggedTask) => {
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

      drop: (item: DraggedTask) => {
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

  const bgTop = getBucketBackgroundColor(bucket, "top");
  const bgBottom = getBucketBackgroundColor(bucket, "bottom");

  return (
    <div className={`w-full`}>
      <BucketHeader bucketId={bucketId} />
      <div
        ref={topDropRef}
        className={`min-h-[3.5rem] ${bgTop} border-solid border-2 ${
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
        className={`min-h-[3rem] ${bgBottom} bg-amber-300  border-solid border-2 ${
          bottomCanDrop &&
          !bottomIsOver &&
          "border-dashed border-2 border-gray-400"
        }
          ${bottomIsOver && " border-gray-400"}
          ${!bottomCanDrop && !bottomIsOver && " border-transparent"}
          `}
      >
        <CardList>
          {closedExpanded
            ? closed.map((task) => <TaskItem taskId={task.id} key={task.id} />)
            : closed
                .slice(0, 1)
                .map((task) => <TaskItem taskId={task.id} key={task.id} />)}
          {closed.length > 1 && (
            <div
              onClick={() => setClosedExpanded(!closedExpanded)}
              className="w-full text-sm text-center cursor-pointer hover:underline"
            >
              {!closedExpanded
                ? `Show all ${closed.length} Tasks`
                : `Hide Tasks`}
            </div>
          )}
        </CardList>
      </div>
    </div>
  );
};

export default Bucket;
