import React from "react";
import TaskItem from "./TaskItem";
import FlexCol from "./common/FlexCol";
import { useData } from "./context/data";
import { useDrop } from "react-dnd";
import { Bucket, DraggedTask, DropCollectedProps, TaskState } from "./types";
import CardList from "./common/CardList";
import Header from "./Header";
import { getOpenBucketType } from "./context/helper";

export interface AreaProps {
  bucket: Bucket;
}

const Area: React.FC<AreaProps> = (props) => {
  const { bucket } = props;
  const { getBuckets, moveTask, getTask, getBucketForTask } = useData();

  const allOtherBuckets = getBuckets().filter((b) => b.id !== bucket.id);

  const [collectedProps, dropRef] = useDrop(
    {
      accept: [...allOtherBuckets.map((b) => getOpenBucketType(b.id))],

      drop: (item: DraggedTask) => {
        const task = getTask(item.taskId);
        if (!task) return;
        const fromBucketId = getBucketForTask(task)?.id || "";
        if (fromBucketId !== bucket.id) {
          moveTask(bucket.id, task);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    },
    [
      bucket,
      allOtherBuckets,
      getOpenBucketType,
      getTask,
      getBucketForTask,
      moveTask,
    ],
  );

  const { isOver, canDrop } = collectedProps as DropCollectedProps;
  return (
    <div
      ref={dropRef}
      className={`w-full h-full bg-slate-200 ${
        canDrop && !isOver ? "border-dashed border-2 border-gray-400" : ""
      } ${isOver ? "border-solid border-2 border-gray-400" : ""}`}
    >
      <div className={`w-full p-1 flex gap-1 `}>
        <input
          readOnly
          type="text"
          value={"Dump"}
          className={`px-1 w-full bg-transparent border-b-2 focus:outline-none border-slate-500
        `}
        />
      </div>
      <CardList>
        {bucket?.tasks.map((task) => <TaskItem task={task} key={task.id} />)}
        <TaskItem task={null} />
      </CardList>
    </div>
  );
};

export default Area;
