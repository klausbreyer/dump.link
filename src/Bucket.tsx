import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";

import CardList from "./common/CardList";
import {
  getBucketBackgroundColorBottom,
  getBucketBackgroundColorTop,
} from "./common/colors";
import { useData } from "./context/data";
import {
  getClosedBucketType,
  getOpenBucketType,
  getTasksByClosed,
} from "./context/helper";
import Header from "./Header";
import TaskItem from "./TaskItem";
import {
  DraggedTask,
  DropCollectedProps,
  Bucket as Bucket,
  DraggingType,
} from "./types";
import { useGlobalDragging } from "./hooks/useGlobalDragging";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface BucketProps {
  bucket: Bucket;
}

const Bucket: React.FC<BucketProps> = (props) => {
  const { bucket } = props;
  const {
    moveTask,
    getBucket,
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

  const showCantDrop =
    globalDragging.type === DraggingType.TASK &&
    closed.length === 0 &&
    globalDragging.bucketId === bucket.id;

  return (
    <div className={`w-full`}>
      <Header bucket={bucket} />
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
            <TaskItem task={task} key={task.id} />
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
            ? closed.map((task) => <TaskItem task={task} key={task.id} />)
            : closed
                .slice(0, 1)
                .map((task) => <TaskItem task={task} key={task.id} />)}
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
          {showCantDrop && (
            <div className="flex items-center justify-center gap-2 text-center">
              <ExclamationTriangleIcon className="w-5 h-5" />
              Can't drop - this bucket is inactive!
            </div>
          )}
        </CardList>
      </div>
    </div>
  );
};

export default Bucket;
