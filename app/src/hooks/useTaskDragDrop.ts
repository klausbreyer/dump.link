import { useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import config from "../config";
import { useData } from "../context/data/data";
import { getTask, getTaskIndex, getTaskType } from "../context/data/tasks";
import { useGlobalInteraction } from "../context/interaction";
import { Bucket, DraggingType, Task } from "../types";

export const useTaskDragDrop = (
  task: Task | null,
  bucket: Bucket,
  sortedTasksForBucket: Task[],
) => {
  const { updateTask, buckets } = useData();

  const { updateGlobalDragging, temporaryPriority, setTemporaryPriority } =
    useGlobalInteraction();

  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: getTaskType(buckets, task),
      item: { taskId: task?.id },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        if (!task) return;

        if (!temporaryPriority) return;

        updateTask(temporaryPriority.taskId, {
          priority: temporaryPriority.priority,
        });
        setTemporaryPriority(undefined);
      },
    }),
    [task, updateTask, buckets, temporaryPriority, setTemporaryPriority],
  );

  const [, dropRef] = useDrop(
    () => ({
      accept: getTaskType(buckets, task),
      hover: (item: { taskId: string }) => {
        const draggedId = item.taskId;
        if (draggedId === task?.id || !task) return;

        const draggedTask = getTask(sortedTasksForBucket, draggedId);
        if (!draggedTask) return;

        const overIndex = getTaskIndex(sortedTasksForBucket, task.id);

        if (overIndex === -1) return;

        const newPriority = calculateNewPriority(
          draggedTask,
          task,
          sortedTasksForBucket,
          overIndex,
        );

        setTemporaryPriority({ priority: newPriority, taskId: draggedId });
      },
    }),
    [task, sortedTasksForBucket, buckets, setTemporaryPriority],
  );

  useEffect(() => {
    updateGlobalDragging(
      isDragging ? DraggingType.TASK : DraggingType.NONE,
      isDragging ? bucket.id : "",
    );
  }, [bucket.id, isDragging, updateGlobalDragging]);

  return { dragRef, dropRef, isDragging, previewRef };
};

function calculateNewPriority(
  draggedTask: Task,
  overTask: Task,
  sortedTasksForBucket: Task[],
  overIndex: number,
): number {
  const beforeIndex = overIndex - 1;
  const afterIndex = overIndex + 1;

  let newPriority = overTask.priority; // Standardwert als aktuelle Priorität des übergeordneten Tasks

  if (overIndex === 0) {
    newPriority = overTask.priority - config.PRIORITY_INCREMENT;
  } else if (overIndex === sortedTasksForBucket.length - 1) {
    newPriority = overTask.priority + config.PRIORITY_INCREMENT;
  } else {
    if (draggedTask.priority < overTask.priority && beforeIndex >= 0) {
      newPriority = Math.round(
        (overTask.priority + sortedTasksForBucket[afterIndex].priority) / 2,
      );
    } else if (
      draggedTask.priority > overTask.priority &&
      afterIndex < sortedTasksForBucket.length
    ) {
      newPriority = Math.round(
        (overTask.priority + sortedTasksForBucket[beforeIndex].priority) / 2,
      );
    }
  }

  return newPriority;
}
