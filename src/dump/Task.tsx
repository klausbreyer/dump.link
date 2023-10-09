import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTasks } from "../context/tasks";
import { TaskState } from "../context/types";

interface TaskProps {
  taskId: string | null;
}

const Task: React.FC<TaskProps> = (props) => {
  const { taskId } = props;
  const { state, addTask, moveTask, changeTaskState, updateTaskTitle } =
    useTasks();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [val, setVal] = useState<string>("");

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
      addTask(0, { title: val, state: TaskState.OPEN });
    }
  }

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [val]);

  return (
    <textarea
      className="w-full resize-y"
      placeholder="type here"
      value={val}
      onBlur={handleBlur}
      onChange={handleChange}
      rows={1}
      ref={textAreaRef}
    ></textarea>
  );
};

export default Task;
