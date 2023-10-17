import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Bars2Icon } from "@heroicons/react/24/solid";
import { useData } from "../hooks/useData";
import { useDrag, useDrop } from "react-dnd";
import { DraggedTask, DraggingType, TaskState } from "../types";

import { Task } from "../types";
import { useGlobalDragging } from "../hooks/useGlobalDragging";
import { getDumpBucket } from "../hooks/useData/helper";
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
    if (task === null) {
      if (!dumpBucket) return;
      if (val.length === 0) return;

      addTask(dumpBucket?.id, { title: val, state: TaskState.OPEN });
      setVal("");

      // keep focus in this empty field. The new entry will be a new entry. This will stay the input text field.
      setTimeout(() => {
        textAreaRef?.current?.focus();
      }, 100);
      return;
    }
    updateTask(task.id, { title: val, state: task?.state || TaskState.OPEN });
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
