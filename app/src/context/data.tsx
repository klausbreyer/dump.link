import React, { createContext, useContext, useEffect, useReducer } from "react";

import { Bucket, BucketID, Dependency, State, Task, TaskID } from "../types";
import {
  NewID,
  extractIdFromUrl,
  getBucketForTask,
  hasCyclicDependencyWithBucket,
  transformApiResponseToProject,
} from "./helper";
import { LifecycleState, useLifecycle } from "./lifecycle";

const initialState: State = {
  buckets: [],
  tasks: [],
  dependencies: [],
  project: {
    id: "",
    name: "",
    appetite: 0,
    startedAt: new Date(),
  },
};

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:8080";

type ActionType =
  | { type: "SET_INITIAL_STATE"; payload: State }
  | {
      type: "ADD_TASK";
      bucketId: BucketID;
      task: Omit<Task, "id" | "priority" | "bucketId">;
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
      updatedTask: Omit<Task, "id" | "priority" | "bucketId">;
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
const dataReducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case "SET_INITIAL_STATE":
      return action.payload;

    case "ADD_TASK": {
      const { bucketId, task } = action;

      // Update the tasks array directly in the state
      let updatedTasks = [...state.tasks];

      // Find the current highest priority among tasks in the same bucket
      let highestPriority = 0;
      state.tasks.forEach((t) => {
        if (t.bucketId === bucketId && t.priority > highestPriority) {
          highestPriority = t.priority;
        }
      });

      // Set the new task's priority
      const newPriority = highestPriority + 100000; // Increment by a large number

      // Add the new task at the end with the calculated priority
      updatedTasks.push({
        ...task,
        id: NewID(),
        bucketId: bucketId,
        priority: newPriority,
      });

      return {
        ...state,
        tasks: updatedTasks,
      };
    }

    case "DELETE_TASK": {
      const { taskId } = action;

      // Filter out the task to be deleted from the state's tasks array
      const updatedTasks = state.tasks.filter((task) => task.id !== taskId);

      return {
        ...state,
        tasks: updatedTasks,
      };
    }

    case "CHANGE_TASK_STATE": {
      const { taskId, closed } = action;

      // Map through the tasks array to find and update the specific task
      const updatedTasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, closed: closed } : task,
      );

      return {
        ...state,
        tasks: updatedTasks,
      };
    }

    case "UPDATE_TASK": {
      const { taskId, updatedTask } = action;

      // Map through the tasks array to find and update the specific task
      const updatedTasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updatedTask } : task,
      );

      return {
        ...state,
        tasks: updatedTasks,
      };
    }

    case "REORDER_TASK": {
      const { movingTaskId, newPosition } = action;

      // Find and remove the moving task from the current tasks array
      let updatedTasks = [...state.tasks];
      const movingTaskIndex = updatedTasks.findIndex(
        (task) => task.id === movingTaskId,
      );
      const movingTask = updatedTasks[movingTaskIndex];
      updatedTasks.splice(movingTaskIndex, 1);

      // Calculate the new priority
      let newPriority = 0;
      if (newPosition === 0) {
        newPriority =
          updatedTasks.length > 0 ? updatedTasks[0].priority / 2 : 1;
      } else if (newPosition >= updatedTasks.length) {
        newPriority =
          updatedTasks.length > 0
            ? updatedTasks[updatedTasks.length - 1].priority + 100000
            : 100000;
      } else {
        const beforePriority = updatedTasks[newPosition - 1].priority;
        const afterPriority = updatedTasks[newPosition].priority;
        newPriority = (beforePriority + afterPriority) / 2;
      }

      // Update the priority of the moving task
      movingTask.priority = newPriority;

      // Insert the moving task at the new position
      updatedTasks.splice(newPosition, 0, movingTask);

      return { ...state, tasks: updatedTasks };
    }

    case "MOVE_TASK": {
      const { fromBucketId, toBucketId, taskId } = action;

      // Find the task to move
      const taskToMoveIndex = state.tasks.findIndex(
        (task) => task.id === taskId && task.bucketId === fromBucketId,
      );
      if (taskToMoveIndex === -1) return state; // If the task is not found, return the current state

      const taskToMove = { ...state.tasks[taskToMoveIndex] };

      // Calculate the new priority for the task in the new bucket
      const tasksInNewBucket = state.tasks.filter(
        (task) => task.bucketId === toBucketId,
      );
      const highestPriority =
        tasksInNewBucket.length > 0
          ? Math.max(...tasksInNewBucket.map((t) => t.priority))
          : 0;

      // Update the task with the new bucketId and priority
      taskToMove.bucketId = toBucketId;
      taskToMove.priority = highestPriority + 100000;

      // Update the tasks array in the state
      let updatedTasks = [...state.tasks];
      updatedTasks[taskToMoveIndex] = taskToMove;

      return { ...state, tasks: updatedTasks };
    }

    case "RENAME_BUCKET": {
      const { bucketId, newName } = action;

      const updatedBuckets = state.buckets.map((bucket) =>
        bucket.id === bucketId ? { ...bucket, name: newName } : bucket,
      );

      return { ...state, buckets: updatedBuckets };
    }

    case "FLAG_BUCKET": {
      const { bucketId, flag } = action;

      const updatedBuckets = state.buckets.map((bucket) =>
        bucket.id === bucketId ? { ...bucket, flagged: flag } : bucket,
      );

      return { ...state, buckets: updatedBuckets };
    }
    case "ADD_BUCKET_DEPENDENCY": {
      const { bucketId, dependencyId } = action;

      // Creating a new dependency object
      const newDependency = { bucketId, dependencyId };

      return { ...state, dependencies: [...state.dependencies, newDependency] };
    }

    case "REMOVE_BUCKET_DEPENDENCY": {
      const { bucketId, dependencyId } = action;

      // Filter out the dependency to be removed
      const updatedDependencies = state.dependencies.filter(
        (dependency) =>
          !(
            dependency.bucketId === bucketId &&
            dependency.dependencyId === dependencyId
          ),
      );

      // Check if any bucket is solely dependent on the removed dependency
      // Adjust the 'layer' property if necessary
      const updatedBuckets = state.buckets.map((bucket) => {
        if (bucket.id === dependencyId) {
          const isSolelyDependent = updatedDependencies.some(
            (dep) => dep.dependencyId === dependencyId,
          );

          return {
            ...bucket,
            layer: isSolelyDependent ? bucket.layer : undefined,
          };
        }
        return bucket;
      });

      return {
        ...state,
        buckets: updatedBuckets,
        dependencies: updatedDependencies,
      };
    }

    case "UPDATE_BUCKET_LAYER": {
      const { bucketId, newLayer } = action;

      const updatedBuckets = state.buckets.map((bucket) =>
        bucket.id === bucketId ? { ...bucket, layer: newLayer } : bucket,
      );

      return { ...state, buckets: updatedBuckets };
    }

    case "SET_BUCKET_DONE": {
      const { bucketId, done } = action;

      const updatedBuckets = state.buckets.map((bucket) =>
        bucket.id === bucketId ? { ...bucket, done: done } : bucket,
      );

      return { ...state, buckets: updatedBuckets };
    }

    case "RESET_LAYERS_FOR_ALL_BUCKETS": {
      const updatedBuckets = state.buckets.map((bucket) => ({
        ...bucket,
        layer: undefined,
      }));

      return { ...state, buckets: updatedBuckets };
    }

    default:
      return state;
  }
};

type DataProviderProps = {
  children: React.ReactNode;
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
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

  const addTask = (
    bucketId: BucketID,
    task: Omit<Task, "id" | "priority" | "bucketId">,
  ) => {
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
    updatedTask: Omit<Task, "id" | "priority" | "bucketId">,
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

  const getTasks = () => {
    return state.tasks;
  };

  const getDependencies = () => {
    return state.dependencies;
  };

  const addBucketDependency = (bucket: Bucket, dependencyId: BucketID) => {
    const bucketId = bucket.id;
    if (
      hasCyclicDependencyWithBucket(bucket.id, dependencyId, state.dependencies)
    ) {
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
        getTasks,
        getDependencies,
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
  state: State;
  addTask: (
    bucketId: BucketID,
    task: Omit<Task, "id" | "priority" | "bucketId">,
  ) => void;
  moveTask: (toBucketId: BucketID, task: Task) => void;
  changeTaskState: (
    bucketId: BucketID,
    taskId: TaskID,
    closed: boolean,
  ) => void;
  updateTask: (
    taskId: TaskID,
    updatedTask: Omit<Task, "id" | "priority" | "bucketId">,
  ) => void;
  reorderTask: (movingTaskId: TaskID, newPosition: number) => void;
  getDependencies: () => Dependency[];
  getTasks: () => Task[];
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
