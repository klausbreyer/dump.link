import React from "react";
import { useDrop } from "react-dnd";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Header from "./Header";
import TaskItem from "./TaskItem";
import CardList from "./common/CardList";
import { getBucketBackgroundColorTop } from "./common/colors";
import { useData } from "./context/data";
import {
  getClosedBucketType,
  getOpenBucketType,
  getTasksByClosed,
  sortTasksNotClosedFirst,
} from "./context/helper";
import { useGlobalDragging } from "./hooks/useGlobalDragging";
import {
  Bucket,
  DraggedTask,
  DraggingType,
  DropCollectedProps,
  TabContext,
} from "./types";

interface BucketProps {
  bucket: Bucket;
}

const Bucket: React.FC<BucketProps> = (props) => {
  const { bucket } = props;
  const {
    moveTask,
    updateTask,
    getTask,
    changeTaskState,
    getBucketForTask,
    getBuckets,
  } = useData();

  const allOtherBuckets = getBuckets().filter(
    (b: Bucket) => b.id !== bucket.id,
  );

  const sorted = sortTasksNotClosedFirst(bucket);
  const open = getTasksByClosed(bucket, false);
  const closed = getTasksByClosed(bucket, true);
  const { globalDragging } = useGlobalDragging();

  const [topCollectedProps, topDropRef] = useDrop(
    {
      // accepts tasks from all others and from this self bucket, if it is from done.
      accept: [
        ...allOtherBuckets.map((b: Bucket) => getOpenBucketType(b.id)),
        bucket.active ? getClosedBucketType(bucket.id) : "NO_OP",
      ],
      drop: (item: DraggedTask) => {
        const taskId = item.taskId;
        const task = getTask(taskId);
        if (!task) return;
        const fromBucketId = getBucketForTask(task)?.id || "";
        if (fromBucketId !== bucket.id) {
          updateTask(taskId, {
            title: task?.title || "",
            closed: false,
          });
          moveTask(bucket.id, task);
        } else {
          changeTaskState(bucket.id, taskId, false);
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
      bucket,
      allOtherBuckets,
    ],
  );

  const { isOver: topIsOver, canDrop: topCanDrop } =
    topCollectedProps as DropCollectedProps;

  const bgTop = getBucketBackgroundColorTop(bucket);

  const topCantDropWarning =
    !topCanDrop &&
    globalDragging.type === DraggingType.TASK &&
    sorted.length === 0 &&
    globalDragging.bucketId === bucket.id;

  const borderColor = bucket.active ? "border-black" : "border-slate-300  ";
  return (
    <div
      className={`w-full rounded-md overflow-hidden ${borderColor} border-2  ${bgTop} `}
    >
      <div className={` `}>
        {/* needs to be wrapped, for a clear cut - or the border will be around the corners.. */}
        <Header context={TabContext.Group} bucket={bucket} />
        <div
          ref={topDropRef}
          className={`min-h-[2.5rem] ${bgTop} border-solid  ${
            topCanDrop && !topIsOver && "border-dashed border-2 border-gray-400"
          }
          ${topIsOver && " border-gray-400 border-2"}
            ${borderColor} border-t-2
          `}
        >
          <div
            className={`flex items-center justify-between w-full gap-1 text-sm text-center px-1`}
          >
            <span> Figuring Out: {open.length}</span>
            <span> Figured Out: {closed.length}</span>
          </div>
          <CardList>
            {sorted.map((task) => (
              <TaskItem task={task} key={task.id} bucket={bucket} />
            ))}

            <TaskItem bucket={bucket} task={null} />
            {topCantDropWarning && (
              <div className="flex items-center justify-center gap-2 text-center">
                <ExclamationTriangleIcon className="w-5 h-5" />
                Can't drop - this bucket is done! Undone?
              </div>
            )}
          </CardList>
        </div>
      </div>
    </div>
  );
};

export default Bucket;
