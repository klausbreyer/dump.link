import React, { useEffect, useState } from "react";

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import BoxHeader from "./BoxHeader";
import MicroProgress from "./MicroProgress";
import TaskItem from "./TaskItem";
import CardList from "./common/CardList";
import { getBucketBackgroundColor } from "./common/bucketColors";
import {
  checkIfBucketIDExists,
  checkIfDependencyExists,
  checkIfTaskIDExists,
  useAbsence,
} from "./context/absence";
import {
  checkBucketActivity,
  validateActivityOther,
  validateActivitySelf,
} from "./context/data/activities";
import { useData } from "./context/data/data";
import {
  getTasksByClosed,
  getTasksForBucket,
  sortTasksByUpdatedAt,
} from "./context/data/tasks";
import { useTaskGroupDrop } from "./hooks/useTaskGroupDrop";
import { TabContext, Bucket as TaskGroup, TaskID } from "./types";

interface TaskGroupProps {
  bucket: TaskGroup;
}

const TaskGroup: React.FC<TaskGroupProps> = (props) => {
  const { bucket } = props;

  const {
    acknowledged,
    tasksDuringAbsence,
    bucketsDuringAbsence,
    dependenciesDuringAbsence,
  } = useAbsence();
  const { buckets, dependencies, activities, tasks, project } = useData();
  const tasksForbucket = getTasksForBucket(tasks, bucket.id);
  const open = getTasksByClosed(tasksForbucket, false);
  const closed = sortTasksByUpdatedAt(getTasksByClosed(tasksForbucket, true));

  const { isOver, canDrop, dropRef } = useTaskGroupDrop(bucket);

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

  const tasksChanged = tasksDuringAbsence(tasks);
  const aboveFoldClosed = closed.filter(
    (t) =>
      recentlyDone.includes(t.id) ||
      (!acknowledged && checkIfTaskIDExists(tasksChanged, t.id)),
  );
  const belowFoldClosed = closed.filter(
    (t) =>
      !recentlyDone.includes(t.id) &&
      !(!acknowledged && checkIfTaskIDExists(tasksChanged, t.id)),
  );

  const bucketsChanged = bucketsDuringAbsence(buckets);
  const dependenciesChanged = dependenciesDuringAbsence(dependencies);
  const isAbsence =
    checkIfBucketIDExists(bucketsChanged, bucket.id) ||
    checkIfDependencyExists(dependenciesChanged, bucket.id);

  const getBorderClass = (): string => {
    const activity = checkBucketActivity(activities, bucket.id);
    const activitySelf = validateActivitySelf(activity);
    const activityOther = validateActivityOther(activity);
    const showNone = !canDrop && !activitySelf && !activityOther;
    const showDashed = canDrop && !isOver && !bucket.done;
    const showSolid = isOver && !bucket.done;

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

  const bgTop = getBucketBackgroundColor(bucket, tasksForbucket);

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
                {(open.length > 0 || isAbsence) && (
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
