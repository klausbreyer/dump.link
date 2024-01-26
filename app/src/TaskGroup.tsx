import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import BoxHeader from "./BoxHeader";
import MicroProgress from "./MicroProgress";
import TaskItem from "./TaskItem";
import CardList from "./common/CardList";
import { getBucketBackgroundColorTop } from "./common/colors";
import { useData } from "./context/data";
import {
  getBucketForTask,
  getClosedBucketType,
  getOpenBucketType,
} from "./context/helper_buckets";
import {
  Bucket as TaskGroup,
  DraggedTask,
  DropCollectedProps,
  TabContext,
  TaskID,
} from "./types";
import {
  getTask,
  getTasksByClosed,
  getTasksForBucket,
  sortTasksByUpdatedAt,
} from "./context/helper_tasks";
import {
  checkBucketActivity,
  validateActivityOther,
  validateActivitySelf,
} from "./context/helper_activities";
import { getUsername } from "./context/helper_requests";
import { act } from "react-dom/test-utils";

interface TaskGroupProps {
  bucket: TaskGroup;
}

const TaskGroup: React.FC<TaskGroupProps> = (props) => {
  const { bucket } = props;
  const { updateTask, moveTask, buckets, activities, tasks, project } =
    useData();

  const tasksForbucket = getTasksForBucket(tasks, bucket.id);
  const allOtherBuckets = buckets.filter((b: TaskGroup) => b.id !== bucket.id);

  // flag closed expansion
  const [closedExpanded, setClosedExpanded] = useState<boolean>(false);

  const [recentlyDone, setRecentlyDone] = useState<TaskID[]>([]);

  const open = getTasksByClosed(tasksForbucket, false);
  const closed = sortTasksByUpdatedAt(getTasksByClosed(tasksForbucket, true));

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
        : allOtherBuckets.map((b: TaskGroup) => getOpenBucketType(b.id)),
      drop: (item: DraggedTask) => {
        const taskId = item.taskId;
        const task = getTask(tasks, taskId);

        if (!task) return;
        const fromBucketId = getBucketForTask(buckets, task)?.id || "";
        if (fromBucketId === bucket.id) return;

        moveTask(bucket.id, task.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [
      getOpenBucketType,
      getClosedBucketType,
      buckets,
      updateTask,
      moveTask,
      updateTask,
      bucket,
      allOtherBuckets,
    ],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;

  const aboveFoldClosed = closed.filter((t) => recentlyDone.includes(t.id));
  const belowFoldClosed = closed.filter((t) => !recentlyDone.includes(t.id));

  const bgTop = getBucketBackgroundColorTop(bucket, tasksForbucket);

  const showDashed = canDrop && !isOver && !bucket.done;
  const showSolid = isOver && !bucket.done;

  const activity = checkBucketActivity(activities, bucket.id);
  const activitySelf = validateActivitySelf(activity);
  const activityOther = validateActivityOther(activity);

  const showNone = !canDrop && !activitySelf && !activityOther;

  return (
    <div
      ref={(node) => !project.archived && dropRef(node)}
      className={`w-full relative rounded-md overflow-hidden ${bgTop} border-2
      ${showDashed && "border-dashed border-2 border-slate-400"}
      ${activitySelf && " border-2 border-indigo-500"}
      ${activityOther && "border-dashed border-2 border-purple-500"}
      ${showSolid && " border-slate-400"}
      ${showNone && " border-transparent"}
    `}
    >
      <div className={` `}>
        {/* needs to be wrapped, for a clear cut - or the border will be around the corners.. */}
        <BoxHeader context={TabContext.Group} bucket={bucket} />
        <div
          className={`min-h-[2.5rem]
          `}
        >
          <MicroProgress bucket={bucket} />
          <CardList>
            {open.map((task) => (
              <TaskItem
                task={task}
                key={task.id}
                bucket={bucket}
                onTaskClosed={() => handleTaskClosed(task.id)}
              />
            ))}
          </CardList>
          <CardList>
            {!bucket.done && !project.archived && (
              <TaskItem bucket={bucket} task={null} />
            )}
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

export default TaskGroup;
