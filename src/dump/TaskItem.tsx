import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTasks } from "../context/useTasks";
import { useDrag, useDrop } from "react-dnd";
import { DraggedItem, TaskState } from "../context/types";

interface TaskItemProps {
  taskId: string | null;
}

// memo is necessary to prevent flickering.
// it works by comparing the props of the component.
// if they are the same, it does not re-render.
const TaskItem: React.FC<TaskItemProps> = function Card(props) {
  const { taskId } = props;
  const {
    addTask,
    getTask,
    updateTask,
    getTaskType,
    getTaskIndex,
    reorderTask,
  } = useTasks();

  const task = taskId ? getTask(taskId) : null;
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [val, setVal] = useState<string>(task?.title || "");

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: getTaskType(task),
      item: { taskId },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const droppedId = item.taskId;
        const overIndex = getTaskIndex(taskId);
        const didDrop = monitor.didDrop();

        if (overIndex === undefined) return;
        if (droppedId === null) return;
        if (droppedId === taskId) return;

        if (!didDrop) {
          reorderTask(droppedId, overIndex);
        }
      },
    }),
    [reorderTask, taskId],
  );

  const [, dropRef] = useDrop(
    () => ({
      accept: getTaskType(task),
      hover(item: DraggedItem) {
        const draggedId = item.taskId;
        const overIndex = getTaskIndex(taskId);

        // avoid flickering.
        if (overIndex === undefined) return;
        if (draggedId === taskId) return;

        reorderTask(draggedId, overIndex);
      },
    }),
    [reorderTask, taskId],
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
    if (taskId === null) {
      if (val.length == 0) {
        return;
      }
      addTask("0", { title: val, state: TaskState.OPEN });
      setVal("");
      return;
    }
    updateTask(taskId, { title: val, state: task?.state || TaskState.OPEN });
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
    <div
      ref={(node) => dragRef(dropRef(node))}
      className={`z-10
        ${isDragging ? "invisible" : "visible"}
        `}
    >
      <textarea
        className={`w-full px-1 rounded-sm shadow-md resize-y z-10`}
        placeholder="type more here"
        value={val}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        rows={1}
        ref={textAreaRef}
      ></textarea>
    </div>
  );
};

export default TaskItem;
