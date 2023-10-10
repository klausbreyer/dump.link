import React from "react";
import { useDrop } from "react-dnd";
import { useTasks } from "../context/useTasks";
import { DraggedItem, TaskState } from "../context/types";
import Task from "./Task";

interface BucketProps {
  bucketId: string;
}
// ... (andere Imports)

const Bucket: React.FC<BucketProps> = (props) => {
  const { bucketId: bucketId } = props;
  const { moveTask, getBucket, changeTaskState, getBucketForTask } = useTasks();

  const [, topDropRef] = useDrop({
    accept: "TASK",
    hover: (item: DraggedItem, monitor) => {},
    drop: (item: DraggedItem) => {
      console.log(item);
      const fromBucketId = getBucketForTask(item.taskId)?.id || "";
      if (fromBucketId !== bucketId.toString()) {
        console.log("moveTask");
        console.log(fromBucketId, bucketId.toString(), item.taskId);

        moveTask(bucketId.toString(), item.taskId);
      } else {
        console.log("changeTaskState");

        changeTaskState(bucketId.toString(), item.taskId, TaskState.OPEN);
      }
    },
  });

  const bucket = getBucket(bucketId);
  const tasks = bucket?.tasks || [];
  const open = tasks.filter((task) => task.state === TaskState.OPEN);
  const closed = tasks.filter((task) => task.state === TaskState.CLOSED);

  const [, bottomDropRef] = useDrop({
    accept: "TASK",
    drop: (item: DraggedItem) => {
      changeTaskState(bucketId.toString(), item.taskId, TaskState.CLOSED);
    },
  });

  return (
    <div className="w-full">
      <div ref={topDropRef} className="min-h-[8rem] p-2 bg-amber-200">
        {open.map((task) => (
          <Task taskId={task.id} key={task.id} />
        ))}
      </div>
      <div ref={bottomDropRef} className="min-h-[2.5rem] p-2 bg-amber-300">
        {closed.map((task) => (
          <Task taskId={task.id} key={task.id} />
        ))}
      </div>
    </div>
  );
};

export default Bucket;
