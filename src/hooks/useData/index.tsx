import React, { createContext, useReducer, useContext } from "react";
import { Bucket, BucketID, State, Task, TaskID, TaskState } from "../../types";
import initialState from "./init";
import {
  deduplicateInnerValues,
  getClosedBucketType,
  getDefaultLayers,
  getElementsAtIndex,
  getLongestChain,
  getOpenBucketType,
  getOtherBuckets,
  hasCyclicDependencyWithBucket,
  removeDuplicates,
} from "./helper";
type ActionType =
  | { type: "ADD_TASK"; bucketId: BucketID; task: Omit<Task, "id"> }
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
      newState: TaskState;
    }
  | {
      type: "UPDATE_TASK";
      taskId: TaskID;
      updatedTask: Omit<Task, "id">;
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
    };

type DataContextType = {
  state: State;
  addTask: (bucketId: BucketID, task: Omit<Task, "id">) => void;
  moveTask: (toBucketId: BucketID, task: Task) => void;
  changeTaskState: (
    bucketId: BucketID,
    taskId: TaskID,
    newState: TaskState,
  ) => void;
  updateTask: (taskId: TaskID, updatedTask: Omit<Task, "id">) => void;
  getBucket: (bucketId: BucketID) => Bucket | undefined;
  getTask: (taskId: TaskID) => Task | undefined;
  getBucketForTask: (task: Task) => Bucket | undefined;
  reorderTask: (movingTaskId: TaskID, newPosition: number) => void;
  getTaskType: (task: Task | null | undefined) => string;
  getBuckets: () => Bucket[];
  getTaskIndex: (task: Task | null) => number | undefined;
  renameBucket: (bucketId: BucketID, newName: string) => void;
  flagBucket: (bucketId: BucketID, flag: boolean) => void;
  addBucketDependency: (bucket: Bucket, dependencyId: BucketID) => void;
  removeBucketDependency: (bucketId: BucketID, dependencyId: string) => void;
  getBucketsDependingOn: (dependencyId: BucketID) => BucketID[];
  getBucketsAvailableFor: (givenBucketId: BucketID) => BucketID[];
  getDependencyChains: () => BucketID[][];
  //@todo: maybe we can get rid of the nulls. i dont know if I need them for positioning.
  getLayers: () => (BucketID | null)[][];
};

const DataContext = createContext<DataContextType | undefined>(undefined);
const dataReducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case "ADD_TASK":
      return {
        ...state,
        buckets: state.buckets.map((bucket) =>
          bucket.id === action.bucketId
            ? {
                ...bucket,
                tasks: [
                  ...bucket.tasks,
                  { ...action.task, id: Date.now().toString() },
                ],
              }
            : bucket,
        ),
      };

    case "MOVE_TASK":
      const taskToMove = state.buckets
        .find((bucket) => bucket.id === action.fromBucketId)
        ?.tasks.find((task) => task.id === action.taskId);
      if (!taskToMove) return state;

      return {
        ...state,
        buckets: state.buckets.map((bucket) => {
          if (bucket.id === action.fromBucketId) {
            return {
              ...bucket,
              tasks: bucket.tasks.filter((task) => task.id !== action.taskId),
            };
          } else if (bucket.id === action.toBucketId) {
            return { ...bucket, tasks: [...bucket.tasks, taskToMove] };
          }
          return bucket;
        }),
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
                    ? { ...task, state: action.newState }
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

      let movingTask: Task | null = null;
      let bucketId: BucketID | null = null;
      let originalPosition: number | null = null;

      for (const bucket of state.buckets) {
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

      if (!movingTask || !bucketId || originalPosition === null) return state;

      const targetBucket = state.buckets.find(
        (bucket) => bucket.id === bucketId,
      );
      if (!targetBucket) return state;

      targetBucket.tasks.splice(originalPosition, 1);
      targetBucket.tasks.splice(newPosition, 0, movingTask);

      return { ...state, buckets: [...state.buckets] };
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
        buckets: state.buckets.map((bucket) =>
          bucket.id === action.bucketId
            ? {
                ...bucket,
                dependencies: bucket.dependencies.filter(
                  (id) => id !== action.dependencyId,
                ),
              }
            : bucket,
        ),
      };

    default:
      return state;
  }
};

type DataProviderProps = {
  children: React.ReactNode;
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const addTask = (bucketId: BucketID, task: Omit<Task, "id">) => {
    dispatch({
      type: "ADD_TASK",
      bucketId: bucketId,
      task: task,
    });
  };

  const moveTask = (toBucketId: BucketID, task: Task) => {
    dispatch({
      type: "MOVE_TASK",
      fromBucketId: getBucketForTask(task)?.id || "", // Note: this pattern is a bit risky, you might want to handle this case more explicitly
      toBucketId: toBucketId,
      taskId: task.id,
    });
  };

  const changeTaskState = (
    bucketId: BucketID,
    taskId: TaskID,
    newState: TaskState,
  ) => {
    dispatch({
      type: "CHANGE_TASK_STATE",
      bucketId: bucketId,
      taskId: taskId,
      newState: newState,
    });
  };

  const updateTask = (taskId: TaskID, updatedTask: Omit<Task, "id">) => {
    dispatch({ type: "UPDATE_TASK", taskId, updatedTask });
  };

  const getBucket = (bucketId: BucketID) => {
    return state.buckets.find((bucket) => bucket.id === bucketId);
  };

  const getTask = (taskId: TaskID) => {
    for (const bucket of state.buckets) {
      const task = bucket.tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  };

  const getBucketForTask = (task: Task) => {
    return state.buckets.find((bucket) =>
      bucket.tasks.some((bt) => bt.id === task.id),
    );
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
  const getTaskType = (task: Task | null | undefined) => {
    if (!task) {
      return "NO_OP";
    }

    const bucket = getBucketForTask(task);

    if (!bucket) {
      return "NO_OP";
    }

    if (bucket && task.state === TaskState.CLOSED) {
      return getClosedBucketType(bucket.id);
    }

    return getOpenBucketType(bucket.id);
  };

  const getBucketsDependingOn = (dependencyId: BucketID): BucketID[] => {
    const dependentBuckets: BucketID[] = [];

    // Loop through all buckets in the state.buckets
    for (const bucket of state.buckets) {
      // Check if the given bucket ID is present in the current bucket's dependencies array
      if (bucket.dependencies.includes(dependencyId)) {
        dependentBuckets.push(bucket.id);
      }
    }

    return dependentBuckets;
  };

  const getBucketsAvailableFor = (givenBucketId: BucketID): BucketID[] => {
    return state.buckets
      .filter(
        (bucket) =>
          bucket.id !== givenBucketId && // Exclude the given bucket itself
          !bucket.dependencies.includes(givenBucketId) && // Exclude direct dependencies
          !hasCyclicDependencyWithBucket(bucket, givenBucketId, state.buckets), // Exclude buckets that would result in a cyclic dependency
      )
      .map((bucket) => bucket.id); // Extract the bucket IDs
  };

  const getDependencyChainsForBucket = (bucketId: BucketID): BucketID[][] => {
    const bucket = state.buckets.find((b) => b.id === bucketId);
    if (!bucket) return [];

    // If the bucket has no dependencies, just return the bucket itself.
    if (bucket.dependencies.length === 0) {
      return [[bucketId]];
    }

    let chains: BucketID[][] = [];
    for (const dependencyId of bucket.dependencies) {
      const dependencyChains = getDependencyChainsForBucket(dependencyId);
      for (const chain of dependencyChains) {
        chains.push([bucketId, ...chain]);
      }
    }

    return chains;
  };

  // This function retrieves all dependency chains for all buckets.
  const getAllDependencyChains = () => {
    let allChains: BucketID[][] = [];

    const others = getOtherBuckets(state.buckets);

    for (const bucket of others) {
      allChains = [...allChains, ...getDependencyChainsForBucket(bucket.id)];
    }

    // Filter out sub-chains to retain only the longest unique paths.
    return allChains
      .filter(
        (chain) =>
          !allChains.some(
            (otherChain) =>
              otherChain.length > chain.length &&
              JSON.stringify(otherChain.slice(-chain.length)) ===
                JSON.stringify(chain),
          ),
      )
      .filter((chain) => chain.length > 1);
  };

  const getLayers = (): (BucketID | null)[][] => {
    return getDefaultLayers(getAllDependencyChains());
  };

  const getTaskIndex = (task: Task | null): number | undefined => {
    if (!task) return undefined;
    const bucket = getBucketForTask(task);
    if (!bucket) return undefined;

    return bucket.tasks.findIndex((bt) => bt.id === task.id);
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

  console.log(state);

  return (
    <DataContext.Provider
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
        getLayers,
        getBucketsDependingOn,
        getBuckets,
        addBucketDependency,
        removeBucketDependency,
        getBucketsAvailableFor,
        getDependencyChains: getAllDependencyChains,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
