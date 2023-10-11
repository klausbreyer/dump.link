import React, { createContext, useReducer, useContext } from "react";
import { Bucket, Task, TaskState } from "./types";

type ActionType =
  | { type: "ADD_TASK"; bucketId: string; task: Omit<Task, "id"> }
  | {
      type: "MOVE_TASK";
      fromBucketId: string;
      toBucketId: string;
      taskId: string;
    }
  | {
      type: "CHANGE_TASK_STATE";
      bucketId: string;
      taskId: string;
      newState: TaskState;
    }
  | {
      type: "UPDATE_TASK";
      taskId: string;
      updatedTask: Omit<Task, "id">;
    }
  | {
      type: "REORDER_TASK";
      movingTaskId: string;
      newPosition: number;
    }
  | {
      type: "RENAME_BUCKET";
      bucketId: string;
      newName: string;
    }
  | {
      type: "FLAG_BUCKET";
      bucketId: string;
      flag: boolean;
    };

type TaskContextType = {
  state: Bucket[];
  addTask: (bucketId: string, task: Omit<Task, "id">) => void;
  moveTask: (toBucketId: string, taskId: string) => void;
  changeTaskState: (
    bucketId: string,
    taskId: string,
    newState: TaskState,
  ) => void;
  updateTask: (taskId: string, updatedTask: Omit<Task, "id">) => void;
  getBucket: (bucketId: string) => Bucket | undefined;
  getTask: (taskId: string) => Task | undefined;
  getBucketForTask: (taskId: string) => Bucket | undefined;
  reorderTask: (movingTaskId: string, newPosition: number) => void;
  getTaskType: (task: Task | null | undefined) => string;
  getOpenBucketType: (bucketId: string) => string;
  getClosedBucketType: (bucketId: string) => string;
  getBuckets: () => Bucket[];
  getTaskIndex: (taskId: string | null) => number | undefined;
  renameBucket: (bucketId: string, newName: string) => void;
  flagBucket: (bucketId: string, flag: boolean) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const taskReducer = (state: Bucket[], action: ActionType): Bucket[] => {
  switch (action.type) {
    case "ADD_TASK":
      return state.map((bucket) =>
        bucket.id === action.bucketId
          ? {
              ...bucket,
              tasks: [
                ...bucket.tasks,
                { ...action.task, id: Date.now().toString() },
              ],
            }
          : bucket,
      );
    case "MOVE_TASK":
      const taskToMove = state
        .find((bucket) => bucket.id === action.fromBucketId)
        ?.tasks.find((task) => task.id === action.taskId);
      if (!taskToMove) return state;
      return state.map((bucket) => {
        if (bucket.id === action.fromBucketId) {
          return {
            ...bucket,
            tasks: bucket.tasks.filter((task) => task.id !== action.taskId),
          };
        } else if (bucket.id === action.toBucketId) {
          return { ...bucket, tasks: [...bucket.tasks, taskToMove] };
        }
        return bucket;
      });

    case "CHANGE_TASK_STATE":
      return state.map((bucket) =>
        bucket.id === action.bucketId
          ? {
              ...bucket,
              tasks: bucket.tasks.map((task) =>
                task.id === action.taskId
                  ? { ...task, state: action.newState }
                  : task,
              ),
            }
          : bucket,
      );
    case "UPDATE_TASK":
      return state.map((bucket) => {
        return {
          ...bucket,
          tasks: bucket.tasks.map((task) =>
            task.id === action.taskId
              ? { ...task, ...action.updatedTask }
              : task,
          ),
        };
      });

    case "REORDER_TASK": {
      const { movingTaskId, newPosition } = action;

      let movingTask: Task | null = null;
      let bucketId: string | null = null;
      let originalPosition: number | null = null;

      for (const bucket of state) {
        const taskIndex = bucket.tasks.findIndex(
          (task) => task.id === movingTaskId,
        );
        if (taskIndex !== -1) {
          movingTask = { ...bucket.tasks[taskIndex] };
          originalPosition = taskIndex;
          bucketId = bucket.id;
          break;
        }
      }

      if (!movingTask || !bucketId || originalPosition === null) return state; // Task not found

      const targetBucket = state.find((bucket) => bucket.id === bucketId);
      if (!targetBucket) return state; // Bucket not found

      // Remove the task from its original position
      targetBucket.tasks.splice(originalPosition, 1);

      // Insert the moving task at the new position
      targetBucket.tasks.splice(newPosition, 0, movingTask);

      return [...state]; // Return a new copy of the state to trigger re-renders
    }

    case "RENAME_BUCKET":
      return state.map((bucket) =>
        bucket.id === action.bucketId
          ? { ...bucket, name: action.newName }
          : bucket,
      );

    case "FLAG_BUCKET":
      return state.map((bucket) =>
        bucket.id === action.bucketId
          ? { ...bucket, flagged: action.flag }
          : bucket,
      );

    default:
      return state;
  }
};

type TaskProviderProps = {
  children: React.ReactNode;
};

const initialBuckets: Bucket[] = Array.from({ length: 11 }).map((_, index) => ({
  id: index + "",
  name: ``,
  flagged: index === 6,
  tasks:
    index === 0
      ? [
          {
            id: Date.now().toString() + index,
            title: "Your first task",
            state: TaskState.OPEN,
          },
        ]
      : index === 1
      ? Array.from({ length: 3 }).map((_, i) => ({
          id: Date.now().toString() + index + i,
          title: `Task ${i} in Bucket ${index}`,
          state: TaskState.OPEN,
        }))
      : index === 2
      ? [
          {
            id: Date.now().toString() + index,
            title: "Done Task in Bucket 2",
            state: TaskState.CLOSED,
          },
        ]
      : index === 6
      ? [
          {
            id: Date.now().toString() + index,
            title: "Open Task in Bucket 6",
            state: TaskState.CLOSED,
          },
        ]
      : [],
}));

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialBuckets);

  const addTask = (bucketId: string, task: Omit<Task, "id">) => {
    console.log("add");

    dispatch({
      type: "ADD_TASK",
      bucketId: bucketId,
      task: task,
    });
  };

  const moveTask = (toBucketId: string, taskId: string) => {
    dispatch({
      type: "MOVE_TASK",
      fromBucketId: getBucketForTask(taskId)?.id || "", //@todo: not pretty.
      toBucketId: toBucketId,
      taskId: taskId,
    });
  };

  const changeTaskState = (
    bucketId: string,
    taskId: string,
    newState: TaskState,
  ) => {
    dispatch({
      type: "CHANGE_TASK_STATE",
      bucketId: bucketId,
      taskId: taskId,
      newState: newState,
    });
  };

  const updateTask = (taskId: string, updatedTask: Omit<Task, "id">) => {
    dispatch({ type: "UPDATE_TASK", taskId, updatedTask });
  };

  const getBucket = (bucketId: string) => {
    return state.find((bucket) => bucket.id === bucketId);
  };

  const getTask = (taskId: string) => {
    for (const bucket of state) {
      const task = bucket.tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  };

  const getBucketForTask = (taskId: string) => {
    return state.find((bucket) =>
      bucket.tasks.some((task) => task.id === taskId),
    );
  };

  const reorderTask = (movingTaskId: string, newPosition: number) => {
    dispatch({
      type: "REORDER_TASK",
      movingTaskId,
      newPosition,
    });
  };

  const getBuckets = () => {
    return state;
  };

  const getTaskIndex = (taskId: string | null): number | undefined => {
    if (!taskId) return undefined;
    const bucket = getBucketForTask(taskId);
    if (!bucket) return undefined;

    return bucket.tasks.findIndex((task) => task.id === taskId);
  };

  // for react dnd.
  const renameBucket = (bucketId: string, newName: string) => {
    dispatch({
      type: "RENAME_BUCKET",
      bucketId,
      newName,
    });
  };

  const flagBucket = (bucketId: string, flag: boolean) => {
    dispatch({
      type: "FLAG_BUCKET",
      bucketId,
      flag,
    });
  };
  console.log(state);

  const getTaskType = (task: Task | null | undefined) => {
    if (!task) {
      return "NO_OP";
    }

    const bucket = getBucketForTask(task.id);

    if (!bucket) {
      return "NO_OP";
    }

    if (bucket && task.state === TaskState.CLOSED) {
      return getClosedBucketType(bucket.id);
    }

    return getOpenBucketType(bucket.id);
  };

  return (
    <TaskContext.Provider
      value={{
        state,
        addTask,
        moveTask,
        changeTaskState,
        updateTask,
        getBucket,
        getTask,
        getBucketForTask,
        getTaskIndex,
        reorderTask,
        getTaskType,
        renameBucket,
        flagBucket,
        getOpenBucketType,
        getClosedBucketType,
        getBuckets,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

const getClosedBucketType = (bucketId: string) => {
  return `CLOSED_BUCKET_${bucketId}`;
};
const getOpenBucketType = (bucketId: string) => {
  return `OPEN_BUCKET_${bucketId}`;
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};

export function getTasksByState(
  bucket: Bucket | undefined,
  state: TaskState,
): Task[] {
  const tasks = bucket?.tasks || [];
  return tasks.filter((task) => task.state === state);
}
