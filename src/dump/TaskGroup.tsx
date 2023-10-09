import React from 'react';

interface Task {
  id: number;
  name: string;
  completed: boolean;
}

interface TaskGroupProps {
  tasks: Task[];
}

const TaskGroup: React.FC<TaskGroupProps> = ({ tasks }) => {
  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>
          <input type="checkbox" checked={task.completed} readOnly />
          {task.name}
        </div>
      ))}
    </div>
  );
};

export default TaskGroup;
