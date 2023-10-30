import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";

import {
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ChevronUpIcon } from "@heroicons/react/24/solid";
import Header from "./Header";
import TaskItem from "./TaskItem";
import CardList from "./common/CardList";
import {
  getBucketBackgroundColorBottom,
  getBucketBackgroundColorBottomHover,
  getBucketBackgroundColorTop,
} from "./common/colors";
import { useData } from "./context/data";
import {
  getBucketState,
  getClosedBucketType,
  getOpenBucketType,
  getTasksByClosed,
} from "./context/helper";
import { useGlobalDragging } from "./hooks/useGlobalDragging";
import {
  Bucket,
  BucketState,
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

  const open = getTasksByClosed(bucket, false);
  const closed = getTasksByClosed(bucket, true);
  const bucketState = getBucketState(bucket);
  const { globalDragging } = useGlobalDragging();

  useEffect(() => {
    if (closed.length === 1) {
      setClosedExpanded(false);
    }
  }, [closed.length]);

  // flag closed expansion
  const [closedExpanded, setClosedExpanded] = useState<boolean>(false);

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

  const [bottomCollectedProps, bottomDropRef] = useDrop(
    {
      accept: bucket.active ? getOpenBucketType(bucket.id) : [],

      drop: (item: DraggedTask) => {
        // only allow dropping if the task is already in this bucket but in another state.
        changeTaskState(bucket.id, item.taskId, true);
      },

      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [getOpenBucketType, bucket, changeTaskState],
  );

  const { isOver: bottomIsOver, canDrop: bottomCanDrop } =
    bottomCollectedProps as DropCollectedProps;

  const bgTop = getBucketBackgroundColorTop(bucket);
  const bgBottom = getBucketBackgroundColorBottom(bucket);
  const bgBottomHover = getBucketBackgroundColorBottomHover(bucket);

  const topCantDropWarning =
    !topCanDrop &&
    globalDragging.type === DraggingType.TASK &&
    open.length === 0 &&
    globalDragging.bucketId === bucket.id;

  const bottomCantDropWarning =
    !bottomCanDrop &&
    globalDragging.type === DraggingType.TASK &&
    closed.length === 0 &&
    globalDragging.bucketId === bucket.id;

  const showNewTaskItem =
    bucketState === BucketState.SOLVED || bucketState === BucketState.UNSOLVED;

  return (
    <div className={`w-full rounded-md overflow-hidden `}>
      <div className={` `}>
        {/* needs to be wrapped, for a clear cut - or the border will be around the corners.. */}
        <Header context={TabContext.Group} bucket={bucket} />
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
              <TaskItem task={task} key={task.id} bucket={bucket} />
            ))}
            {topCantDropWarning && (
              <div className="flex items-center justify-center gap-2 text-center">
                <ExclamationTriangleIcon className="w-5 h-5" />
                Can't drop - this bucket is done! Undone?
              </div>
            )}

            {showNewTaskItem && <TaskItem bucket={bucket} task={null} />}
          </CardList>
        </div>
        <div
          ref={bottomDropRef}
          className={`min-h-[2.3rem]  border-solid border-2 ${
            bottomCanDrop && !bottomIsOver
              ? `border-dashed border-2 border-gray-400 ${bgBottomHover}`
              : bgBottom
          }
          ${bottomIsOver && " border-gray-400"}
          ${!bottomCanDrop && !bottomIsOver && " border-transparent"}
          `}
        >
          <CardList>
            {closedExpanded && (
              <div
                onClick={() => setClosedExpanded(!closedExpanded)}
                className="flex items-center justify-center w-full gap-1 text-sm text-center cursor-pointer hover:underline"
              >
                <ChevronUpIcon className="w-3 h-3" /> Hide Tasks
              </div>
            )}
            {closedExpanded &&
              closed.map((task) => (
                <TaskItem task={task} key={task.id} bucket={bucket} />
              ))}
            {closed.length === 0 &&
              !closedExpanded &&
              !bottomCantDropWarning && (
                <div className="flex items-center justify-center w-full gap-1 text-sm text-center ">
                  {`Done (${closed.length})`}
                </div>
              )}
            {closed.length > 0 && !closedExpanded && !bottomCantDropWarning && (
              <div
                onClick={() => setClosedExpanded(!closedExpanded)}
                className="flex items-center justify-center w-full gap-1 text-sm text-center cursor-pointer hover:underline"
              >
                <ChevronDownIcon className="w-3 h-3" />
                {`Done (${closed.length})`}
              </div>
            )}
            {bottomCantDropWarning && (
              <div className="flex items-center justify-center gap-2 text-sm text-center">
                <ExclamationTriangleIcon className="w-5 h-5" />
                Can't drop - this bucket is inactive! Start?
              </div>
            )}
          </CardList>
        </div>
      </div>
    </div>
  );
};

export default Bucket;
