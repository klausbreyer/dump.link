import React from "react";
import { useDrop } from "react-dnd";

import TaskItem from "./TaskItem";
import CardList from "./common/CardList";
import { useData } from "./context/data/data";
import { getBucketForTask, getOpenBucketType } from "./context/data/buckets";
import { getTask, getTasksForBucket } from "./context/data/tasks";
import { Bucket, DraggedTask, DropCollectedProps } from "./types";
import { useTaskGroupDragDrop } from "./hooks/useTaskGroupDragDrop";

export interface AreaProps {
  bucket: Bucket;
}

const Area: React.FC<AreaProps> = (props) => {
  const { bucket } = props;
  const { moveTask, project, tasks } = useData();

  const tasksForbucket = getTasksForBucket(tasks, bucket.id);

  const { isOver, canDrop, dropRef } = useTaskGroupDragDrop(bucket);

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
