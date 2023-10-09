import React, { createContext, useReducer, useContext } from "react";
import { Bucket, Task, TaskState } from "./types";

type ActionType =
  | { type: "ADD_TASK"; bucketId: number; task: Omit<Task, "id"> }
  | {
      type: "MOVE_TASK";
      fromBucketId: number;
      toBucketId: number;
      taskId: string;
    }
  | {
      type: "CHANGE_TASK_STATE";
      bucketId: number;
      taskId: string;
      newState: TaskState;
    }
  | {
      type: "UPDATE_TASK_TITLE";
      bucketId: number;
      taskId: string;
      newTitle: string;
    };

type TaskContextType = {
  state: Bucket[];
  addTask: (bucketId: number, task: Omit<Task, "id">) => void;
  moveTask: (fromBucketId: number, toBucketId: number, taskId: string) => void;
  changeTaskState: (
    bucketId: number,
    taskId: string,
    newState: TaskState,
  ) => void;
  updateTaskTitle: (bucketId: number, taskId: string, newTitle: string) => void;
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
    case "UPDATE_TASK_TITLE":
      return state.map((bucket) =>
        bucket.id === action.bucketId
          ? {
              ...bucket,
              tasks: bucket.tasks.map((task) =>
                task.id === action.taskId
                  ? { ...task, title: action.newTitle }
                  : task,
              ),
            }
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
  id: index,
  name: `Bucket ${index}`,
  tasks: [],
}));

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialBuckets);

  const addTask = (bucketId: number, task: Omit<Task, "id">) => {
    console.log("add");

    dispatch({
      type: "ADD_TASK",
      bucketId: bucketId,
      task: task,
    });
  };

  const moveTask = (
    fromBucketId: number,
    toBucketId: number,
    taskId: string,
  ) => {
    dispatch({
      type: "MOVE_TASK",
      fromBucketId: fromBucketId,
      toBucketId: toBucketId,
      taskId: taskId,
    });
  };

  const changeTaskState = (
    bucketId: number,
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

  const updateTaskTitle = (
    bucketId: number,
    taskId: string,
    newTitle: string,
  ) => {
    dispatch({
      type: "UPDATE_TASK_TITLE",
      bucketId: bucketId,
      taskId: taskId,
      newTitle: newTitle,
    });
  };

  console.log(state);

  return (
    <TaskContext.Provider
      value={{
        state,
        addTask,
        moveTask,
        changeTaskState,
        updateTaskTitle,
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
