import { PencilSquareIcon } from "@heroicons/react/24/outline";
import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { XCircleIcon } from "@heroicons/react/24/solid";
import { getInputBorderColor } from "../common/bucketColors";
import { isSafari } from "../common/helper";
import config from "../config";
import { NewID, getUsername } from "../useApi/requests";
import { ActivityAvatar } from "./HeaderActivity";
import { checkIfTaskIDExists, useAbsence } from "./context/absence";
import {
  checkTaskActivity,
  validateActivityOther,
} from "./context/data/activities";
import { useData } from "./context/data/data";
import {
  calculateHighestPriority,
  getTasksForBucket,
  sortTasksByPriority,
} from "./context/data/tasks";
import { useGlobalInteraction } from "./context/interaction";
import usePasteListener from "./hooks/usePasteListener";
import { useTaskDragDrop } from "./hooks/useTaskDragDrop";
import { Bucket, Task } from "./types";

interface TaskItemProps {
  task: Task | null;
  bucket: Bucket;
  onTaskClosed?: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = function Card(props) {
  const { task, bucket, onTaskClosed } = props;

  const { acknowledged, tasksDuringAbsence } = useAbsence();

  const {
    addTask,
    updateTask,
    deleteTask,
    project,
    tasks,
    activities,
    updateActivities,
  } = useData();
  const tasksForbucket = getTasksForBucket(tasks, bucket.id);
  const sortedTasksForBucket = sortTasksByPriority(tasksForbucket);

  const [val, setVal] = useState<string>(task?.title || "");
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isfocused, setIsEditRefFocused] = useState<boolean>(false);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const showRef = useRef<HTMLTextAreaElement>(null);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const { temporaryPriority } = useGlobalInteraction();
  const { dragRef, dropRef, isDragging, previewRef } = useTaskDragDrop(
    task,
    bucket,
    sortedTasksForBucket,
  );

  usePasteListener(
    editRef,
    task === null && val.length === 0,
    (title: string) => {
      title = title.substring(0, config.PROJECT_TASK_MAX_LENGTH);

      addTask({
        id: NewID(project.id),
        priority:
          calculateHighestPriority(sortedTasksForBucket) +
          config.PROJECT_PRIORITY_INCREMENT,
        title: title,
        closed: false,
        bucketId: bucket.id,
        updatedBy: getUsername(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    },
  );

  useEffect(() => {
    // only update when not dirty or we would overwrite changes done by the user.
    if (task && !isDirty) {
      setVal(task.title);
    }
  }, [task]);

  useEffect(() => {
    if (task?.id === null && editRef.current) {
      editRef.current.focus();
    }
  }, [task]);

  useEffect(() => {
    if (editRef.current) {
      editRef.current.style.height = "auto";
      editRef.current.style.height = `${editRef.current.scrollHeight}px`;
      if (showRef.current) {
        showRef.current.style.height = "auto";
        showRef.current.style.height = `${editRef.current.scrollHeight}px`;
      }
    }
    // needs to be both, val reference does not update after submitting a new task, but the other field also needs to be udpated.
  }, [task?.title, val, editRef.current, showRef.current]);

  const handleClick = () => {
    if (task && editRef.current) {
      setIsClicked(true);
      editRef.current.focus();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    setIsDirty(true);
    setVal(newValue);
  };

  function handleFocus() {
    updateActivities(undefined, task?.id);
    setIsEditRefFocused(true);
  }

  function handleBlur() {
    updateActivities(undefined, undefined);
    setIsEditRefFocused(false);
    setIsClicked(false);

    // For an existing task
    if (task && val !== task.title) {
      setIsDirty(false);
      updateTask(task.id, { title: val });
    }
  }

  function handleDelete() {
    if (!task) return;
    const isConfirmed = confirm("Are you sure you want to delete this task?");
    if (isConfirmed) {
      deleteTask(task.id);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" || e.keyCode === 13) {
      if (e.shiftKey) {
        return;
      }
      e.preventDefault(); // prevent default behavior of adding a new line

      // For a new task
      if (task === null) {
        if (val.length === 0) return;
        addTask({
          id: NewID(project.id),
          priority:
            calculateHighestPriority(sortedTasksForBucket) +
            config.PROJECT_PRIORITY_INCREMENT,
          title: val,
          closed: false,
          bucketId: bucket.id,
          updatedBy: getUsername(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setVal("");
        setTimeout(() => {
          editRef?.current?.focus();
        }, 100);
        return;
      }

      handleBlur();
    }
  }

  function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!task) return;

    const isTaskNowClosed = event.target.checked;
    updateTask(task.id, { closed: isTaskNowClosed });

    // If the task is now closed and there's a callback, call it
    if (isTaskNowClosed && onTaskClosed) {
      onTaskClosed(task.id);
    }
  }

  const activeTask = task && !task.closed;
  const allowedToDrag = activeTask === true && !project.archived;

  const textAreaClasses =
    "overflow-hidden px-1 resize-none rounded-sm shadow-md w-full";
  const activity = task && checkTaskActivity(activities, task.id);
  const activityOther = validateActivityOther(activity);
  const bucketTask = task && !bucket.dump;

  const localPriority =
    temporaryPriority && temporaryPriority.taskId === task?.id
      ? temporaryPriority.priority
      : task?.priority;
  const style = task && !task.closed ? { order: localPriority } : {};

  const getBorderColor = (): string => {
    if (bucketTask) {
      return task?.closed ? "border-yellow-300" : "border-orange-300";
    } else {
      return getInputBorderColor(bucket);
    }
  };

  function getOutlineColor(): string {
    const tasksChanged = tasksDuringAbsence(tasks);
    const isAbsence = task && checkIfTaskIDExists(tasksChanged, task.id);
    const hover =
      !project.archived && "group-hover:outline group-hover:outline-slate-500";
    if (activityOther) {
      return `outline-2 ${hover} outline-purple-500 outline-dashed`;
    } else if (isAbsence && !acknowledged) {
      return `outline-2 ${hover} outline-cyan-400 outline-dashed`;
    }
    return `outline-2 ${hover} outline-slate-500`;
  }

  return (
    <div ref={(node) => !project.archived && dropRef(node)} style={style}>
      <div
        // for some weird reason with react-dnd another wrapper needs to be here. there is an issue with making the referenced layer visible / invisible
        className={`flex gap-1 items-center
        ${isDragging ? "invisible" : "visible"}
        `}
      >
        {bucketTask && (
          <input
            type="checkbox"
            className={`w-5 h-5 accent-yellow-300
            ${isSafari() && "safari-only-checkbox-small"} `}
            disabled={bucket.done || project.archived}
            checked={task.closed}
            onChange={handleCheckboxChange}
          />
        )}

        {!task && (
          <div>
            <PencilSquareIcon className="w-5 h-5" />
          </div>
        )}
        <div className={`relative w-full group `}>
          {task && (
            <>
              <div
                onClick={() => !project.archived && handleClick()}
                ref={allowedToDrag ? dragRef : null}
                className={`absolute top-0 left-0 z-20 w-full h-full opacity-0
                    ${activeTask && "cursor-move"}
                    ${!activeTask && "cursor-pointer"}
                     ${isClicked && "hidden"}
                    `}
              ></div>

              {/* needs to be separate. or it is not possible to click inside the textarea to position cursor */}
              <div ref={previewRef}>
                <textarea
                  ref={showRef}
                  data-enable-grammarly="false"
                  spellCheck="false"
                  readOnly
                  className={`border-b-2 absolute z-10 bg-slate-100
                  ${!project.archived && "group-hover:bg-slate-50"} select-none
                    ${textAreaClasses}
                    ${getOutlineColor()}
                    ${getBorderColor()}
                    ${isClicked && "hidden"}
                  `}
                  value={val}
                  rows={1}
                ></textarea>
              </div>

              {activityOther && (
                <div className="absolute top-0 right-0 z-30 ">
                  <ActivityAvatar activity={activityOther} />
                </div>
              )}

              <XCircleIcon
                onClick={() => handleDelete()}
                className={` z-30 hidden absolute w-5 h-5 cursor-pointer bg-slate-100
                 text-slate-500 top-0 right-0  hover:text-slate-700 p-0 rounded-full
                   ${
                     !isDragging &&
                     !isClicked &&
                     !project.archived &&
                     "group-hover:block"
                   }
                    `}
              />
            </>
          )}
          <div className={`relative w-full `}>
            <textarea
              className={`${textAreaClasses} top-0 left-0 relative select-text ${
                val.length >= config.PROJECT_TASK_MAX_LENGTH
                  ? "focus:outline outline-2 outline-rose-500"
                  : "focus:outline outline-2 outline-indigo-500"
              } ${getBorderColor()}`}
              data-enable-grammarly="false"
              placeholder="Add a task"
              value={val}
              onBlur={handleBlur}
              disabled={project.archived}
              onFocus={handleFocus}
              maxLength={config.PROJECT_TASK_MAX_LENGTH}
              onKeyDown={handleKeyDown}
              onChange={handleChange}
              ref={editRef}
              rows={1}
            ></textarea>
            <div
              className={`absolute text-slate-800 text-xxs bottom-2 right-1 px-0.5 rounded bg-white`}
            >
              {val.length}/{config.PROJECT_TASK_MAX_LENGTH}
            </div>
          </div>
        </div>
      </div>
      {!task && isfocused && (
        <div className="w-full ml-6 mt-0.5 text-xs text-slate-600 ">
          Press Enter to create a task
        </div>
      )}
    </div>
  );
};

export default TaskItem;
