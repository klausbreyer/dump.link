import React from "react";

interface TaskGroupProps {
  index: number;
}

const TaskGroup: React.FC<TaskGroupProps> = (props) => {
  const { index } = props;
  return (
    <div className="w-full bg-stone-300">
      {Array.from({ length: index }).map((_, index) => (
        <div>task</div>
      ))}
    </div>
  );
};

export default TaskGroup;
