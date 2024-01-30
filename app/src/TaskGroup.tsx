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
  checkBucketActivity,
  validateActivityOther,
  validateActivitySelf,
} from "./context/helper_activities";
import {
  bucketsDuringAbsence,
  checkIfBucketIDExists,
  getBucketForTask,
  getClosedBucketType,
  getOpenBucketType,
} from "./context/helper_buckets";
import {
  getTask,
  getTasksByClosed,
  getTasksForBucket,
  sortTasksByUpdatedAt,
} from "./context/helper_tasks";
import {
  DraggedTask,
  DropCollectedProps,
  TabContext,
  Bucket as TaskGroup,
  TaskID,
} from "./types";
import { checkIfDependencyExists } from "./context/helper_dependencies";
import { useAbsence } from "./context/absence";

interface TaskGroupProps {
  bucket: TaskGroup;
}

const TaskGroup: React.FC<TaskGroupProps> = (props) => {
  const { bucket } = props;

  const { acknowledged } = useAbsence();
  const {
    updateTask,
    moveTask,
    buckets,
    dependencies,
    activities,
    tasks,
    project,
  } = useData();

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

  const getBorderClass = (): string => {
    const activity = checkBucketActivity(activities, bucket.id);
    const activitySelf = validateActivitySelf(activity);
    const activityOther = validateActivityOther(activity);
    const showNone = !canDrop && !activitySelf && !activityOther;
    const showDashed = canDrop && !isOver && !bucket.done;
    const showSolid = isOver && !bucket.done;
    const bucketsChanged = bucketsDuringAbsence(buckets, project.id);
    const isAbsence =
      checkIfBucketIDExists(bucketsChanged, bucket.id) ||
      checkIfDependencyExists(dependencies, bucket.id);

    if (activitySelf) {
      return "border-2 border-indigo-500";
    } else if (activityOther) {
      return "border-dashed border-2 border-purple-500";
    } else if (showDashed) {
      return "border-dashed border-2 border-slate-400";
    } else if (showSolid) {
      return "border-slate-400";
    } else if (isAbsence && !acknowledged) {
      return "border-dashed border-2 border-cyan-400";
    } else if (showNone) {
      return "border-transparent";
    }

    return "";
  };

  return (
    <div
      ref={(node) => !project.archived && dropRef(node)}
      className={`w-full relative rounded-md overflow-hidden ${bgTop} border-2
      ${getBorderClass()}
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
