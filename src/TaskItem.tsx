import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDrag, useDrop } from "react-dnd";

import { Bars2Icon } from "@heroicons/react/24/solid";

import { PencilSquareIcon } from "@heroicons/react/24/outline";
import config from "./config";
import { useData } from "./context/data";
import { useGlobalDragging } from "./hooks/useGlobalDragging";
import usePasteListener from "./hooks/usePasteListener";
import { Bucket, DraggedTask, DraggingType, Task } from "./types";

interface TaskItemProps {
  task: Task | null;
  bucket: Bucket;
}

const TaskItem: React.FC<TaskItemProps> = function Card(props) {
  const { task, bucket } = props;
  const {
    addTask,
    updateTask,
    getTaskType,
    getTaskIndex,
    getBucketForTask,
    deleteTask,
    reorderTask,
  } = useData();
  const [isTextAreaFocused, setIsTextAreaFocused] = useState<boolean>(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  usePasteListener(textAreaRef, (title: string) => {
    title = title.substring(0, config.MAX_LENGTH);

    if (!task) {
      addTask(bucket.id, { title: title, closed: false });
    }
    if (task) {
      const bucket = getBucketForTask(task);
      if (!bucket) return;
      addTask(bucket.id, { title: title, closed: false });
    }
  });

  const [val, setVal] = useState<string>(task?.title || "");

  useEffect(() => {
    if (task?.id === null && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [task]);
  const [askedToDelete, setAskedToDelete] = useState(false);

  const [{ isDragging }, dragRef, previewRev] = useDrag(
    () => ({
      type: getTaskType(task),
      item: { taskId: task?.id },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const droppedId = item.taskId;
        const overIndex = getTaskIndex(task);
        const didDrop = monitor.didDrop();

        if (overIndex === undefined) return;
        if (droppedId === undefined) return;
        if (droppedId === task?.id) return;

        if (!didDrop) {
          reorderTask(droppedId, overIndex);
        }
      },
    }),
    [reorderTask, task],
  );

  const { setGlobalDragging } = useGlobalDragging();
  useEffect(() => {
    if (!task) return;
    const bucket = getBucketForTask(task);
    if (!bucket) return;
    setGlobalDragging(
      isDragging ? DraggingType.TASK : DraggingType.NONE,
      bucket.id,
    );
  }, [isDragging, task, getBucketForTask, setGlobalDragging]);

  const [, dropRef] = useDrop(
    () => ({
      accept: getTaskType(task),
      hover(item: DraggedTask) {
        const draggedId = item.taskId;
        const overIndex = getTaskIndex(task);

        // avoid flickering.
        if (overIndex === undefined) return;
        if (draggedId === task?.id) return;

        reorderTask(draggedId, overIndex);
      },
    }),
    [reorderTask, task],
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
    if (newValue.length > config.MAX_LENGTH) {
      newValue = newValue.substring(0, config.MAX_LENGTH);
    }

    setVal(newValue);

    // Check if the value is empty and prompt for deletion immediately
    if (newValue.trim() === "" && task && !askedToDelete) {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this task?",
      );
      if (isConfirmed) {
        deleteTask(getBucketForTask(task)?.id || "", task.id);
      } else {
        // Mark that we've asked to delete, so we don't ask again.
        setAskedToDelete(true);
      }
    }
  };

  function handleFocus() {
    setIsTextAreaFocused(true);
  }

  function handleBlur() {
    setIsTextAreaFocused(false);
    // If the task is a new entry and the value is empty, return early.
    if (task === null) {
      if (val.length === 0) return;

      addTask(bucket.id, { title: val, closed: false });
      setVal("");

      setTimeout(() => {
        textAreaRef?.current?.focus();
      }, 100);
      return;
    }

    // If the value is empty, the task exists, and we haven't asked yet, ask for confirmation to delete.
    if (val.trim() === "" && task && !askedToDelete) {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this task?",
      );
      if (isConfirmed) {
        deleteTask(getBucketForTask(task)?.id || "", task.id);
      } else {
        // Mark that we've asked to delete, so we don't ask again.
        setAskedToDelete(true);
      }
    } else {
      // Otherwise, update the task and reset the askedToDelete flag.
      updateTask(task.id, { title: val, closed: task?.closed === true });
      setAskedToDelete(false);
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

  return (
    <div ref={(node) => previewRev(dropRef(node))}>
      <div
        // for some weird reason with react-dnd another wrapper needs to be here. there is an issue with making the referenced layer visible / invisible
        className={`flex gap-1 items-center
        ${isDragging ? "invisible" : "visible"}
        `}
      >
        <div className="relative w-full">
          <textarea
            className={`w-full px-1 rounded-sm shadow-md resize-y relative
                      ${
                        val.length >= config.MAX_LENGTH
                          ? "focus:outline outline-2 outline-rose-500"
                          : "focus:outline outline-2 outline-indigo-500"
                      }`}
            placeholder="type more here"
            value={val}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            rows={1}
            ref={textAreaRef}
          ></textarea>
          <div
            className={`absolute text-slate-800 text-xxs bottom-1.5 right-1 ${
              isTextAreaFocused ? "block" : "hidden"
            }`}
          >
            {val.length}/{config.MAX_LENGTH}
          </div>
        </div>

        {task !== null && (
          <div ref={dragRef} className="cursor-move">
            <Bars2Icon className="w-5 h-5" />
          </div>
        )}
        {task === null && (
          <div>
            <PencilSquareIcon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
