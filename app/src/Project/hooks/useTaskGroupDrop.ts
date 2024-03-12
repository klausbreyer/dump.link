import { useDrop } from "react-dnd";
import { getOpenBucketType } from "../../models/buckets";
import { useData } from "../context/data";
import { Bucket, DraggedTask } from "../types";

export function useTaskGroupDrop(bucket: Bucket) {
  const { buckets, moveTask, tasks } = useData();
  const isBucketDone = bucket.done;
  const bucketId = bucket.id;

  // const allOtherBuckets = buckets.filter((b) => b.id !== bucketId);

  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: isBucketDone ? [] : buckets.map((b) => getOpenBucketType(b.id)),
      drop: (item: DraggedTask) => {
        const task = tasks.find((t) => t.id === item.taskId);
        if (!task) return;
        const fromBucketId = task.bucketId;
        if (fromBucketId === bucketId) return;

        moveTask(bucketId, task.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [isBucketDone, buckets, getOpenBucketType, tasks, moveTask, bucketId],
  );

  return { isOver, canDrop, dropRef };
}
