import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Header from "./Header";
import MicroProgress from "./MicroProgress";
import TaskItem from "./TaskItem";
import CardList from "./common/CardList";
import { getBucketBackgroundColorTop } from "./common/colors";
import { useData } from "./context/data";
import {
  getBucketPercentage,
  getClosedBucketType,
  getOpenBucketType,
  getTasksByClosed,
  sortTasksByPriority,
} from "./context/helper";
import { useGlobalDragging } from "./hooks/useGlobalDragging";
import {
  Bucket,
  BucketID,
  DraggedTask,
  DraggingType,
  DropCollectedProps,
  TabContext,
  TaskID,
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

  // flag closed expansion
  const [closedExpanded, setClosedExpanded] = useState<boolean>(false);

  const [recentlyDone, setRecentlyDone] = useState<TaskID[]>([]);

  const handleTaskClosed = (taskId: string) => {
    // Add the closed task to the recentlyDone list if it's not already there
    setRecentlyDone((prev) =>
      prev.includes(taskId) ? prev : [...prev, taskId],
    );
  };

  useEffect(() => {
    if (bucket.done) {
      setClosedExpanded(false);
    }
  }, [bucket.done]);

  const [collectedProps, dropRef] = useDrop(
    {
      // accepts tasks from all others and from this self bucket, if it is from done.
      accept: bucket.done
        ? []
        : allOtherBuckets.map((b: Bucket) => getOpenBucketType(b.id)),
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

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  const open = sortTasksByPriority(getTasksByClosed(bucket, false));
  const closed = sortTasksByPriority(getTasksByClosed(bucket, true));

  const aboveFoldClosed = closed.filter((t) => recentlyDone.includes(t.id));
  const belowFoldClosed = closed.filter((t) => !recentlyDone.includes(t.id));

  const bgTop = getBucketBackgroundColorTop(bucket);

  // const showCantDropWarning =
  //   globalDragging.type === DraggingType.TASK && bucket.done;
  const showTasksAndBar = bucket.tasks.length > 0;
  const showFigured = showTasksAndBar && !bucket.done;
  const showDone = showTasksAndBar && bucket.done;
  const showDashed = canDrop && !isOver && !bucket.done;
  const showSolid = isOver && !bucket.done;
  const showNone = !canDrop;

  return (
    <div
      className={`w-full rounded-md overflow-hidden ${bgTop} border-2
      ${showDashed && "border-dashed border-2 border-gray-400"}
      ${showSolid && " border-gray-400"}
      ${showNone && " border-transparent"}
    `}
    >
      <div className={` `}>
        {/* needs to be wrapped, for a clear cut - or the border will be around the corners.. */}
        <Header context={TabContext.Group} bucket={bucket} />
        <div
          ref={dropRef}
          className={`min-h-[2.5rem]
          `}
        >
          {showFigured && (
            <div
              className={`flex items-center justify-between w-full gap-1 text-sm text-center px-1`}
            >
              <span>
                Figured Out:{" "}
                <span
                  className={`px-1 rounded
                  ${closed.length > 0 && !bucket.done && "bg-yellow-300"}
                  `}
                >
                  {closed.length}
                </span>
              </span>
              <span>
                Figuring Out:{" "}
                <span
                  className={`px-1 rounded
                  ${open.length > 0 && !bucket.done && "bg-orange-300"}
                `}
                >
                  {open.length}
                </span>
              </span>
            </div>
          )}

          {showDone && (
            <div
              className={`flex items-center justify-center w-full gap-1 text-sm text-center px-1`}
            >
              Done
            </div>
          )}

          {/* {showCantDropWarning && (
            <div className="flex items-center justify-center gap-2 text-center">
              <ExclamationTriangleIcon className="w-5 h-5" />
              Can't drop - this bucket is done! Undone?
            </div>
          )} */}
          {showTasksAndBar && <MicroProgress bucket={bucket} />}
          <CardList>
            {open.map((task) => (
              <TaskItem
                task={task}
                key={task.id}
                bucket={bucket}
                onTaskClosed={() => handleTaskClosed(task.id)}
              />
            ))}

            {!bucket.done && <TaskItem bucket={bucket} task={null} />}
            {closed.length > 0 && (
              <>
                {open.length > 0 && (
                  <hr className="border-b border-dashed border-slate-400" />
                )}
                {aboveFoldClosed.map((task) => (
                  <TaskItem
                    task={task}
                    key={task.id}
                    bucket={bucket}
                    onTaskClosed={() => handleTaskClosed(task.id)}
                  />
                ))}
                {closedExpanded &&
                  belowFoldClosed.map((task) => (
                    <TaskItem
                      task={task}
                      key={task.id}
                      bucket={bucket}
                      onTaskClosed={() => handleTaskClosed(task.id)}
                    />
                  ))}

                <div
                  onClick={() => {
                    setClosedExpanded(!closedExpanded);
                    setRecentlyDone([]);
                  }}
                  className="flex items-center justify-center w-full gap-1 text-sm text-center cursor-pointer hover:underline"
                >
                  {!closedExpanded && (
                    <>
                      <ChevronDownIcon className="w-3 h-3" />
                      {`Show all (${closed.length})`}
                    </>
                  )}
                  {closedExpanded && (
                    <>
                      <ChevronUpIcon className="w-3 h-3" />
                      {`Hide`}
                    </>
                  )}
                </div>
              </>
            )}
          </CardList>
        </div>
      </div>
    </div>
  );
};

export default Bucket;
