import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTasks } from "../context/useTasks";
import { TaskState } from "../context/types";
import { useDrag } from "react-dnd";

interface TaskProps {
  taskId: string | null;
}

const Task: React.FC<TaskProps> = (props) => {
  const { taskId } = props;
  const { addTask, getTask, updateTask } = useTasks();
  const task = taskId ? getTask(taskId) : null;

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [val, setVal] = useState<string>(task?.title || "");
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "TASK",
    item: { taskId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

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
    <div ref={dragRef}>
      <textarea
        style={{ opacity: isDragging ? 0.5 : 1 }}
        className="w-full resize-y"
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

export default Task;
