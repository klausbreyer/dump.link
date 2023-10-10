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

    default:
      return state;
  }
};

type TaskProviderProps = {
  children: React.ReactNode;
};

const initialBuckets: Bucket[] = Array.from({ length: 11 }).map((_, index) => ({
  id: index + "",
  name: `Bucket ${index}`,
  tasks:
    index === 0
      ? [
          {
            id: Date.now().toString(),
            title: "Your first task",
            state: TaskState.OPEN,
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

  console.log(state);

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
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};
