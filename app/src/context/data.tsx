import React, { createContext, useContext, useEffect, useReducer } from "react";

import { Bucket, BucketID, Project, Task, TaskID } from "../types";
import {
  NewID,
  extractIdFromUrl,
  getBucketForTask,
  hasCyclicDependencyWithBucket,
  transformApiResponseToProject,
} from "./helper";
import { LifecycleState, useLifecycle } from "./lifecycle";

const initialProjectState: Project = {
  buckets: [],
  id: "",
  name: "",
  appetite: 0,
  startedAt: new Date(),
};

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:8080";

type ActionType =
  | { type: "SET_INITIAL_STATE"; payload: Project }
  | {
      type: "ADD_TASK";
      bucketId: BucketID;
      task: Omit<Task, "id" | "priority">;
    }
  | {
      type: "MOVE_TASK";
      fromBucketId: BucketID;
      toBucketId: BucketID;
      taskId: TaskID;
    }
  | {
      type: "CHANGE_TASK_STATE";
      bucketId: BucketID;
      taskId: TaskID;
      closed: boolean;
    }
  | {
      type: "UPDATE_TASK";
      taskId: TaskID;
      updatedTask: Omit<Task, "id" | "priority">;
    }
  | {
      type: "REORDER_TASK";
      movingTaskId: TaskID;
      newPosition: number;
    }
  | {
      type: "RENAME_BUCKET";
      bucketId: BucketID;
      newName: string;
    }
  | {
      type: "FLAG_BUCKET";
      bucketId: BucketID;
      flag: boolean;
    }
  | {
      type: "ADD_BUCKET_DEPENDENCY";
      bucketId: BucketID;
      dependencyId: BucketID;
    }
  | {
      type: "REMOVE_BUCKET_DEPENDENCY";
      bucketId: BucketID;
      dependencyId: BucketID;
    }
  | {
      type: "UPDATE_BUCKET_LAYER";
      bucketId: BucketID;
      newLayer: number;
    }
  | {
      type: "DELETE_TASK";
      bucketId: BucketID;
      taskId: TaskID;
    }
  | {
      type: "SET_BUCKET_DONE";
      bucketId: BucketID;
      done: boolean;
    }
  | { type: "RESET_LAYERS_FOR_ALL_BUCKETS" };

const DataContext = createContext<DataContextType | undefined>(undefined);
const dataReducer = (state: Project, action: ActionType): Project => {
  switch (action.type) {
    case "SET_INITIAL_STATE":
      return action.payload;

    case "ADD_TASK": {
      const { bucketId, task } = action;

      return {
        ...state,
        buckets: state.buckets.map((bucket) => {
          if (bucket.id === bucketId) {
            // Find the current highest priority in the bucket
            let highestPriority = 0;
            bucket.tasks.forEach((t) => {
              if (t.priority > highestPriority) {
                highestPriority = t.priority;
              }
            });

            // Set the new task's priority
            const newPriority = highestPriority + 100000; // Increment by a large number

            // Add the new task at the end with the calculated priority
            return {
              ...bucket,
              tasks: [
                ...bucket.tasks,
                { ...task, id: NewID(), priority: newPriority },
              ],
            };
          }
          return bucket;
        }),
      };
    }

    case "DELETE_TASK":
      return {
        ...state,
        buckets: state.buckets.map((bucket) =>
          bucket.id === action.bucketId
            ? {
                ...bucket,
                tasks: bucket.tasks.filter((task) => task.id !== action.taskId),
              }
            : bucket,
        ),
      };

    case "CHANGE_TASK_STATE":
      return {
        ...state,
        buckets: state.buckets.map((bucket) =>
          bucket.id === action.bucketId
            ? {
                ...bucket,
                tasks: bucket.tasks.map((task) =>
                  task.id === action.taskId
                    ? { ...task, closed: action.closed }
                    : task,
                ),
              }
            : bucket,
        ),
      };

    case "UPDATE_TASK":
      return {
        ...state,
        buckets: state.buckets.map((bucket) => ({
          ...bucket,
          tasks: bucket.tasks.map((task) =>
            task.id === action.taskId
              ? { ...task, ...action.updatedTask }
              : task,
          ),
        })),
      };

    case "REORDER_TASK": {
      const { movingTaskId, newPosition } = action;

      let updatedBuckets = state.buckets.map((bucket) => {
        if (bucket.tasks.some((task) => task.id === movingTaskId)) {
          let newTasks = [...bucket.tasks];
          const movingTaskIndex = newTasks.findIndex(
            (task) => task.id === movingTaskId,
          );
          const movingTask = newTasks[movingTaskIndex];

          // Entfernen des Tasks aus seiner ursprünglichen Position
          newTasks.splice(movingTaskIndex, 1);

          // Berechnen der neuen Priorität
          let newPriority = 0;
          if (newPosition === 0) {
            newPriority = newTasks.length > 0 ? newTasks[0].priority / 2 : 1;
          } else if (newPosition >= newTasks.length) {
            newPriority =
              newTasks.length > 0
                ? newTasks[newTasks.length - 1].priority + 100000
                : 100000;
          } else {
            const beforePriority = newTasks[newPosition - 1].priority;
            const afterPriority = newTasks[newPosition].priority;
            newPriority = (beforePriority + afterPriority) / 2;
          }

          // Hinzufügen des Tasks an der neuen Position
          movingTask.priority = newPriority;
          newTasks.splice(newPosition, 0, movingTask);

          return { ...bucket, tasks: newTasks };
        }
        return bucket;
      });
      return { ...state, buckets: updatedBuckets };
    }

    case "MOVE_TASK": {
      const { fromBucketId, toBucketId, taskId } = action;

      let taskToMove: Task | null = null;
      let updatedBuckets = state.buckets.map((bucket) => {
        if (bucket.id === fromBucketId) {
          // Entfernen des Tasks aus dem ursprünglichen Bucket
          const newTasks = bucket.tasks.filter((task) => task.id !== taskId);
          return { ...bucket, tasks: newTasks };
        } else if (bucket.id === toBucketId) {
          // Finden des Tasks und Hinzufügen am Ende des neuen Buckets
          const movingTask = state.buckets
            .find((b) => b.id === fromBucketId)
            ?.tasks.find((t) => t.id === taskId);
          if (movingTask) {
            taskToMove = { ...movingTask }; // Stellt sicher, dass das Task-Objekt vollständig ist

            const highestPriority =
              bucket.tasks.length > 0
                ? Math.max(...bucket.tasks.map((t) => t.priority))
                : 0;
            const updatedTask = {
              ...taskToMove,
              priority: highestPriority + 100000,
            };

            // Stellt sicher, dass updatedTask alle erforderlichen Felder von Task enthält
            return { ...bucket, tasks: [...bucket.tasks, updatedTask] };
          }
        }
        return bucket;
      });

      if (!taskToMove) return state; // Falls der Task nicht gefunden wurde

      return { ...state, buckets: updatedBuckets };
    }

    case "RENAME_BUCKET":
      return {
        ...state,
        buckets: state.buckets.map((bucket) =>
          bucket.id === action.bucketId
            ? { ...bucket, name: action.newName }
            : bucket,
        ),
      };

    case "FLAG_BUCKET":
      return {
        ...state,
        buckets: state.buckets.map((bucket) =>
          bucket.id === action.bucketId
            ? { ...bucket, flagged: action.flag }
            : bucket,
        ),
      };

    case "ADD_BUCKET_DEPENDENCY":
      return {
        ...state,
        buckets: state.buckets.map((bucket) =>
          bucket.id === action.bucketId
            ? {
                ...bucket,
                dependencies: [...bucket.dependencies, action.dependencyId],
              }
            : bucket,
        ),
      };

    case "REMOVE_BUCKET_DEPENDENCY":
      return {
        ...state,
        buckets: state.buckets.map((bucket) => {
          // First, remove the dependency from the current bucket
          if (bucket.id === action.bucketId) {
            const newDependencies = bucket.dependencies.filter(
              (id) => id !== action.dependencyId,
            );
            return {
              ...bucket,
              dependencies: newDependencies,
            };
          }

          // Then, check if the bucket is represented by action.dependencyId
          // and if other buckets have exactly one dependency to this bucket
          if (bucket.id === action.dependencyId) {
            const otherBucketsHaveSingleDependency = state.buckets.some(
              (otherBucket) =>
                otherBucket.dependencies.length === 1 &&
                otherBucket.dependencies.includes(action.dependencyId) &&
                otherBucket.id !== action.bucketId,
            );

            return {
              ...bucket,
              layer: otherBucketsHaveSingleDependency
                ? bucket.layer
                : undefined,
            };
          }

          // If the bucket is neither the target of the action nor the dependency, leave it unchanged
          return bucket;
        }),
      };

    case "UPDATE_BUCKET_LAYER":
      return {
        ...state,
        buckets: state.buckets.map((bucket) =>
          bucket.id === action.bucketId
            ? { ...bucket, layer: action.newLayer }
            : bucket,
        ),
      };

    case "SET_BUCKET_DONE":
      return {
        ...state,
        buckets: state.buckets.map((bucket) =>
          bucket.id === action.bucketId
            ? { ...bucket, done: action.done }
            : bucket,
        ),
      };

    case "RESET_LAYERS_FOR_ALL_BUCKETS":
      return {
        ...state,
        buckets: state.buckets.map((bucket) => ({
          ...bucket,
          layer: undefined,
        })),
      };

    default:
      return state;
  }
};

type DataProviderProps = {
  children: React.ReactNode;
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialProjectState);
  const { setLifecycle } = useLifecycle();

  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const id = extractIdFromUrl();
        const response = await fetch(`${BASE_URL}/api/v1/projects/${id}`);
        const data = await response.json();
        const transformedData = transformApiResponseToProject(data);
        dispatch({ type: "SET_INITIAL_STATE", payload: transformedData });
        setLifecycle(LifecycleState.Loaded);
      } catch (error) {
        console.error("Fehler beim Laden des Initialzustands:", error);
      }
    };

    fetchInitialState();
  }, []);

  const addTask = (bucketId: BucketID, task: Omit<Task, "id" | "priority">) => {
    dispatch({
      type: "ADD_TASK",
      bucketId: bucketId,
      task: task,
    });
  };

  const moveTask = (toBucketId: BucketID, task: Task) => {
    dispatch({
      type: "MOVE_TASK",
      fromBucketId: getBucketForTask(state.buckets, task)?.id || "", // Note: this pattern is a bit risky, you might want to handle this case more explicitly
      toBucketId: toBucketId,
      taskId: task.id,
    });
  };

  const changeTaskState = (
    bucketId: BucketID,
    taskId: TaskID,
    closed: boolean,
  ) => {
    dispatch({
      type: "CHANGE_TASK_STATE",
      bucketId: bucketId,
      taskId: taskId,
      closed: closed,
    });
  };

  const updateTask = (
    taskId: TaskID,
    updatedTask: Omit<Task, "id" | "priority">,
  ) => {
    dispatch({ type: "UPDATE_TASK", taskId, updatedTask });
  };

  const reorderTask = (movingTaskId: TaskID, newPosition: number) => {
    dispatch({
      type: "REORDER_TASK",
      movingTaskId,
      newPosition,
    });
  };

  const renameBucket = (bucketId: BucketID, newName: string) => {
    dispatch({
      type: "RENAME_BUCKET",
      bucketId,
      newName,
    });
  };

  const flagBucket = (bucketId: BucketID, flag: boolean) => {
    dispatch({
      type: "FLAG_BUCKET",
      bucketId,
      flag,
    });
  };

  const getBuckets = () => {
    return state.buckets;
  };

  const addBucketDependency = (bucket: Bucket, dependencyId: BucketID) => {
    const bucketId = bucket.id;
    if (hasCyclicDependencyWithBucket(bucket, dependencyId, state.buckets)) {
      console.error("Cyclic dependency detected!");
      return;
    }

    dispatch({
      type: "ADD_BUCKET_DEPENDENCY",
      bucketId,
      dependencyId,
    });
  };

  const removeBucketDependency = (
    bucketId: BucketID,
    dependencyId: BucketID,
  ) => {
    dispatch({
      type: "REMOVE_BUCKET_DEPENDENCY",
      bucketId,
      dependencyId,
    });
  };

  const updateBucketLayer = (bucketId: BucketID, newLayer: number) => {
    dispatch({
      type: "UPDATE_BUCKET_LAYER",
      bucketId,
      newLayer,
    });
  };

  const setBucketDone = (bucketId: BucketID, done: boolean) => {
    dispatch({
      type: "SET_BUCKET_DONE",
      bucketId: bucketId,
      done: done,
    });
  };

  const deleteTask = (bucketId: BucketID, taskId: TaskID) => {
    dispatch({
      type: "DELETE_TASK",
      bucketId,
      taskId,
    });
  };

  const resetLayersForAllBuckets = () => {
    dispatch({
      type: "RESET_LAYERS_FOR_ALL_BUCKETS",
    });
  };

  console.dir(state);

  return (
    <DataContext.Provider
      value={{
        state,
        addTask,
        deleteTask,
        moveTask,
        changeTaskState,
        updateTask,
        reorderTask,
        renameBucket,
        flagBucket,
        updateBucketLayer,
        resetLayersForAllBuckets,
        getBuckets,
        addBucketDependency,
        removeBucketDependency,
        setBucketDone,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

type DataContextType = {
  state: Project;
  addTask: (bucketId: BucketID, task: Omit<Task, "id" | "priority">) => void;
  moveTask: (toBucketId: BucketID, task: Task) => void;
  changeTaskState: (
    bucketId: BucketID,
    taskId: TaskID,
    closed: boolean,
  ) => void;
  updateTask: (
    taskId: TaskID,
    updatedTask: Omit<Task, "id" | "priority">,
  ) => void;
  reorderTask: (movingTaskId: TaskID, newPosition: number) => void;
  getBuckets: () => Bucket[];
  renameBucket: (bucketId: BucketID, newName: string) => void;
  flagBucket: (bucketId: BucketID, flag: boolean) => void;
  addBucketDependency: (bucket: Bucket, dependencyId: BucketID) => void;
  removeBucketDependency: (bucketId: BucketID, dependencyId: string) => void;
  updateBucketLayer: (bucketId: BucketID, newLayer: number) => void;
  deleteTask: (bucketId: BucketID, taskId: TaskID) => void;
  setBucketDone: (bucketId: BucketID, done: boolean) => void;
  resetLayersForAllBuckets: () => void;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
