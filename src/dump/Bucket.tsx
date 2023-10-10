import React from "react";
import { useDrop } from "react-dnd";
import { useTasks } from "../context/useTasks";
import { DraggedItem, TaskState } from "../context/types";

interface BucketProps {
  index: number;
}
// ... (andere Imports)

const Bucket: React.FC<BucketProps> = (props) => {
  const { index } = props;
  const { moveTask, addTask, changeTaskState } = useTasks();

  const [, topDropRef] = useDrop({
    accept: "TASK",
    drop: (item: DraggedItem) => {
      if (item.fromBucketId !== index.toString()) {
        moveTask(item.fromBucketId, index.toString(), item.taskId);
      } else {
        changeTaskState(index.toString(), item.taskId, TaskState.OPEN);
      }
    },
  });

  const [, bottomDropRef] = useDrop({
    accept: "TASK",
    drop: (item: DraggedItem) => {
      changeTaskState(index.toString(), item.taskId, TaskState.CLOSED);
    },
  });

  return (
    <div className="w-full">
      <div ref={topDropRef} className="h-32 bg-amber-200"></div>
      <div ref={bottomDropRef} className="h-10 bg-amber-300"></div>
    </div>
  );
};

export default Bucket;
