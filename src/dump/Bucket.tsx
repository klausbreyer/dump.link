import React, { useEffect, useState } from "react";
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
  const {
    moveTask,
    getBucket,
    updateTask,
    getTask,
    changeTaskState,
    getBucketForTask,
  } = useTasks();

  const bucket = getBucket(bucketId);
  const [isTopHovering, setTopHovering] = useState<boolean>(false);
  // This effect will run whenever `bucketId` prop changes
  useEffect(() => {
    setTopHovering(false);
    setBottomHovering(false);
  }, [bucket]);

  const [, topDropRef] = useDrop({
    accept: "TASK",
    hover: (item: DraggedItem, monitor) => {
      const isCurrentlyHovering = monitor.isOver({ shallow: true });

      setTopHovering(isCurrentlyHovering);
    },
    drop: (item: DraggedItem) => {
      console.log("drop");

      const fromBucketId = getBucketForTask(item.taskId)?.id || "";
      const task = getTask(item.taskId);
      if (fromBucketId !== bucketId.toString()) {
        updateTask(item.taskId, {
          title: task?.title || "",
          state: TaskState.OPEN,
        });
        moveTask(bucketId.toString(), item.taskId);
      } else {
        changeTaskState(bucketId.toString(), item.taskId, TaskState.OPEN);
      }
      setTopHovering(false);
    },
  });

  const [isBottomHovering, setBottomHovering] = useState<boolean>(false);
  const [, bottomDropRef] = useDrop({
    accept: "TASK",
    hover: (item: DraggedItem, monitor) => {
      // only allow dropping if the task is already in this bucket but in another state.
      const fromBucket = getBucketForTask(item.taskId);
      if (fromBucket?.id !== bucketId.toString()) {
        return;
      }

      const isCurrentlyHovering = monitor.isOver({ shallow: true });
      setBottomHovering(isCurrentlyHovering);
    },
    drop: (item: DraggedItem) => {
      // only allow dropping if the task is already in this bucket but in another state.
      const fromBucket = getBucketForTask(item.taskId);
      if (fromBucket?.id !== bucketId.toString()) {
        return;
      }
      changeTaskState(bucketId.toString(), item.taskId, TaskState.CLOSED);
      setBottomHovering(false);
    },
  });

  const tasks = bucket?.tasks || [];
  const open = tasks.filter((task) => task.state === TaskState.OPEN);
  const closed = tasks.filter((task) => task.state === TaskState.CLOSED);
  return (
    <div className="w-full">
      <div
        ref={topDropRef}
        className={`min-h-[8rem] p-2 bg-amber-200  ${
          isTopHovering && "border-dashed border-4 border-gray-400"
        }`}
      >
        {open.map((task) => (
          <Task taskId={task.id} key={task.id} />
        ))}
      </div>
      <div
        ref={bottomDropRef}
        className={`min-h-[8rem] p-2 bg-amber-300  ${
          isBottomHovering && "border-dashed border-4 border-gray-400"
        }`}
      >
        {closed.map((task) => (
          <Task taskId={task.id} key={task.id} />
        ))}
      </div>
    </div>
  );
};

export default Bucket;
