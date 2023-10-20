import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { Bars2Icon } from '@heroicons/react/24/solid';

import { useData } from './context/data';
import { getDumpBucket } from './context/helper';
import { useGlobalDragging } from './hooks/useGlobalDragging';
import { DraggedTask, DraggingType, Task, TaskState } from './types';

interface TaskItemProps {
  task: Task | null;
}

// memo is necessary to prevent flickering.
// it works by comparing the props of the component.
// if they are the same, it does not re-render.
const TaskItem: React.FC<TaskItemProps> = function Card(props) {
  const { task } = props;
  const {
    addTask,
    updateTask,
    getTaskType,
    getTaskIndex,
    getBucketForTask,
    deleteTask,
    reorderTask,
    getBuckets,
  } = useData();

  const dumpBucket = getDumpBucket(getBuckets());
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
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
    setGlobalDragging(isDragging ? DraggingType.TASK : DraggingType.NONE);
  }, [isDragging, setGlobalDragging]);

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
    const newValue = e.target.value;
    if (newValue.length <= 48) {
      setVal(newValue);
    } else {
      setVal(newValue.substring(0, 48)); // Abschneiden nach 48 Zeichen
    }
  };

  function handleBlur() {
    // If the task is a new entry and the value is empty, return early.
    if (task === null) {
      if (!dumpBucket) return;
      if (val.length === 0) return;

      addTask(dumpBucket?.id, { title: val, state: TaskState.OPEN });
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
      updateTask(task.id, { title: val, state: task?.state || TaskState.OPEN });
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
        <textarea
          className={`w-full px-1 rounded-sm shadow-md resize-y`}
          placeholder="type more here"
          value={val}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          rows={1}
          ref={textAreaRef}
        ></textarea>
        {task !== null && (
          <div ref={dragRef} className="cursor-move">
            <Bars2Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
