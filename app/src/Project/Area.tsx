import React from "react";

import CardList from "../common/CardList";
import { getTasksForBucket } from "../models/tasks";
import TaskItem from "./TaskItem";
import { useData } from "./context/data";
import { useTaskGroupDrop } from "./hooks/useTaskGroupDrop";
import { Bucket } from "./types";

export interface AreaProps {
  bucket: Bucket;
}

const Area: React.FC<AreaProps> = (props) => {
  const { bucket } = props;
  const { project, tasks } = useData();

  const tasksForbucket = getTasksForBucket(tasks, bucket.id);

  const { isOver, canDrop, dropRef } = useTaskGroupDrop(bucket);

  return (
    <div
      ref={dropRef}
      className={`w-full h-full  bg-slate-100 border-2 rounded-md overflow-hidden
          ${canDrop && !isOver && "border-dashed border-slate-400"}
          ${isOver && "border-solid border-slate-400"}
         ${!isOver && !canDrop && "border-solid border-transparent"}
          `}
    >
      <CardList>
        {tasksForbucket.map((task) => (
          <TaskItem bucket={bucket} task={task} key={task.id} />
        ))}
      </CardList>
      <CardList>
        {!project.archived && <TaskItem bucket={bucket} task={null} />}
      </CardList>
    </div>
  );
};

export default Area;
