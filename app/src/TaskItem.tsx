import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React, {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDrag, useDrop } from "react-dnd";

import { getInputBorderColor } from "./common/colors";
import { isSafari } from "./common/helper";
import config from "./config";
import { useData } from "./context/data";
import { useGlobalDragging } from "./context/dragging";
import {
  NewID,
  PRIORITY_INCREMENT,
  calculateHighestPriority,
  getTask,
  getTaskIndex,
  getTaskType,
  getTasksForBucket,
  sortTasksByPriority,
} from "./context/helper";
import usePasteListener from "./hooks/usePasteListener";
import { Bucket, DraggedTask, DraggingType, Task } from "./types";

interface TaskItemProps {
  task: Task | null;
  bucket: Bucket;
  onTaskClosed?: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = function Card(props) {
  const { task, bucket, onTaskClosed } = props;
  const { addTask, updateTask, deleteTask, getProject, getBuckets, getTasks } =
    useData();

  const { setGlobalDragging, temporaryPriority, setTemporaryPriority } =
    useGlobalDragging();
  const buckets = getBuckets();
  const project = getProject();
  const tasks = getTasks();
  const tasksForbucket = getTasksForBucket(tasks, bucket.id);
  const sortedTasksForBucket = sortTasksByPriority(tasksForbucket);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isTextAreaFocused, setIsTextAreaFocused] = useState<boolean>(false);

  usePasteListener(textAreaRef, (title: string) => {
    title = title.substring(0, config.TASK_MAX_LENGTH);

    addTask({
      id: NewID(project.id),
      priority:
        calculateHighestPriority(sortedTasksForBucket) + PRIORITY_INCREMENT,
      title: val,
      closed: false,
      bucketId: bucket.id,
    });
  });

  const [val, setVal] = useState<string>(task?.title || "");

  useEffect(() => {
    if (task?.id === null && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [task]);

  const [{ isDragging }, dragRef, previewRev] = useDrag(
    () => ({
      type: getTaskType(buckets, task),
      item: { taskId: task?.id },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        if (!task) return;

        //it could also be that a task was not changed in priority, but moved to a different bucket. then we do not want to call updateTask!
        if (temporaryPriority.priority === 0) return;

        updateTask(temporaryPriority.taskId, {
          priority: temporaryPriority.priority,
        });
        setTemporaryPriority({ priority: 0, taskId: "" });
      },
    }),
    [
      task,
      buckets,
      sortedTasksForBucket,
      getTaskType,
      updateTask,
      setTemporaryPriority,
    ],
  );

  useEffect(() => {
    setGlobalDragging(
      isDragging ? DraggingType.TASK : DraggingType.NONE,
      isDragging ? bucket.id : "",
    );
  }, [bucket.id, isDragging, setGlobalDragging]);

  const [, dropRef] = useDrop(
    () => ({
      accept: getTaskType(buckets, task),
      hover: (item: DraggedTask) => {
        const draggedId = item.taskId;
        if (draggedId === task?.id) return;
        if (!task) return;

        const draggedTask = getTask(sortedTasksForBucket, draggedId);
        if (!draggedTask) return;

        const overIndex = getTaskIndex(sortedTasksForBucket, task.id);
        if (overIndex === -1) return;

        const newPriority = calculateNewPriority(
          draggedTask,
          task,
          sortedTasksForBucket,
          overIndex,
        );

        setTemporaryPriority({ priority: newPriority, taskId: draggedId });
      },
    }),
    [
      task,
      buckets,
      sortedTasksForBucket,
      calculateNewPriority,
      getTaskIndex,
      getTask,
      setTemporaryPriority,
    ],
  );

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [val]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    // Check for max length
    if (newValue.length > config.TASK_MAX_LENGTH) {
      newValue = newValue.substring(0, config.TASK_MAX_LENGTH);
    }

    setVal(newValue);
  };

  function handleFocus() {
    // Little hack to allow for dragging and positioning mouse cursor inside the textarea.
    setTimeout(() => {
      setIsTextAreaFocused(true);
    }, 100);
  }

  function handleBlur() {
    setTimeout(() => {
      setIsTextAreaFocused(false);
    }, 200);

    // For a new task
    if (task === null) {
      if (val.length === 0) return;
      addTask({
        id: NewID(project.id),
        priority:
          calculateHighestPriority(sortedTasksForBucket) + PRIORITY_INCREMENT,
        title: val,
        closed: false,
        bucketId: bucket.id,
      });
      setVal("");
      setTimeout(() => {
        textAreaRef?.current?.focus();
      }, 100);
      return;
    }

    // For an existing task
    if (task && val !== task.title) {
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
        // Wenn Shift + Enter gedrückt wird, tun Sie nichts
        return;
      }
      e.preventDefault(); // Verhindert den Zeilenumbruch im Textbereich
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
  const allowedToDrag = activeTask === true;

  const showCounter =
    isTextAreaFocused &&
    textAreaRef.current &&
    textAreaRef.current.scrollHeight > 30;
  const showDelete = isTextAreaFocused && task;

  const bucketTask = task && !bucket.dump;
  const bg = bucketTask
    ? task?.closed
      ? "border-yellow-300"
      : "border-orange-300"
    : getInputBorderColor(bucket);

  const localPriority =
    temporaryPriority.taskId === task?.id
      ? temporaryPriority.priority
      : task?.priority;

  const style = task && !task.closed ? { order: localPriority } : {};
  return (
    <div ref={(node) => previewRev(dropRef(node))} style={style}>
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
            disabled={bucket.done}
            checked={task.closed}
            onChange={handleCheckboxChange}
          />
        )}

        {!task && (
          <div>
            <PencilSquareIcon className="w-5 h-5" />
          </div>
        )}

        <div
          className={`relative w-full `}
          ref={allowedToDrag ? dragRef : null}
        >
          <textarea
            className={` resize-none w-full px-1 rounded-sm shadow-md relative
            border-b-2 select-text overflow-hidden
            ${activeTask && "cursor-move"}
            ${
              val.length >= config.TASK_MAX_LENGTH
                ? "focus:outline outline-2 outline-rose-500"
                : "focus:outline outline-2 outline-indigo-500"
            }
            ${bg}
            `}
            placeholder="Add a task"
            value={val}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            // disabled={task?.closed}
            rows={1}
            ref={textAreaRef}
          ></textarea>
          {process.env.NODE_ENV !== "production" && (
            <div
              className={`absolute text-slate-800 text-xxxs bottom-2 right-1 bg-white`}
            >
              ID: {task?.id} Prio:
              {task?.priority}
            </div>
          )}
          {showCounter && (
            <div
              className={`absolute text-slate-800 text-xxs bottom-2 right-1`}
            >
              {val.length}/{config.TASK_MAX_LENGTH}
            </div>
          )}

          {showDelete && (
            <XMarkIcon
              onClick={() => handleDelete()}
              className={`absolute w-5 h-5 cursor-pointer text-slate-800 top-0.5 right-1`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;

function calculateNewPriority(
  draggedTask: Task,
  overTask: Task,
  sortedTasksForBucket: Task[],
  overIndex: number,
): number {
  const beforeIndex = overIndex - 1;
  const afterIndex = overIndex + 1;

  let newPriority = overTask.priority; // Standardwert als aktuelle Priorität des übergeordneten Tasks

  if (overIndex === 0) {
    newPriority = overTask.priority - PRIORITY_INCREMENT;
  } else if (overIndex === sortedTasksForBucket.length - 1) {
    newPriority = overTask.priority + PRIORITY_INCREMENT;
  } else {
    if (draggedTask.priority < overTask.priority && beforeIndex >= 0) {
      newPriority = Math.round(
        (overTask.priority + sortedTasksForBucket[afterIndex].priority) / 2,
      );
    } else if (
      draggedTask.priority > overTask.priority &&
      afterIndex < sortedTasksForBucket.length
    ) {
      newPriority = Math.round(
        (overTask.priority + sortedTasksForBucket[beforeIndex].priority) / 2,
      );
    }
  }

  return newPriority;
}
