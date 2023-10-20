import React, { createContext, useReducer, useContext, useEffect } from "react";
import { Bucket, BucketID, State, Task, TaskID, TaskState } from "../types";
import initialState from "./init";
import {
  findSubarrayIndex,
  getClosedBucketType,
  getOpenBucketType,
  getOtherBuckets,
  hasCyclicDependencyWithBucket,
  uniqueValues,
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

    case "UPDATE_BUCKET_LAYER":
      console.log(action);

      return {
        ...state,
        buckets: state.buckets.map((bucket) =>
          bucket.id === action.bucketId
            ? { ...bucket, layer: action.newLayer }
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

  const updateBucketLayer = (bucketId: BucketID, newLayer: number) => {
    dispatch({
      type: "UPDATE_BUCKET_LAYER",
      bucketId,
      newLayer,
    });
  };

  const getLayersForSubgraphChains = (chains: BucketID[][]): BucketID[][] => {
    // Create a map to store the result of findSubarrayIndex as key and the corresponding ids as values
    const resultMap: Map<number, BucketID[]> = new Map();

    const ids = uniqueValues(chains);

    // Process each id
    ids.forEach((id) => {
      const bucket = getBucket(id);
      let index: number;

      // Use bucket.layer if set, otherwise use findSubarrayIndex
      if (bucket?.layer !== undefined) {
        index = bucket.layer;
      } else {
        index = findSubarrayIndex(chains, id);
      }

      if (resultMap.has(index)) {
        resultMap.get(index)!.push(id); // Add to the existing array
      } else {
        resultMap.set(index, [id]); // Create a new array with the id
      }
    });

    // Convert the map to an array of arrays
    const resultArray: BucketID[][] = [];
    const keys = Array.from(resultMap.keys()).sort((a, b) => a - b); // Sorting the keys in ascending order

    const minKey = keys[0];
    const maxKey = keys[keys.length - 1];

    for (let i = minKey; i <= maxKey; i++) {
      if (resultMap.has(i)) {
        resultArray.push(resultMap.get(i)!);
      } else {
        resultArray.push([]);
      }
    }

    return resultArray;
  };

  const getLayerForBucketId = (
    chains: BucketID[][],
    bucketId: BucketID,
  ): number => {
    const layers = getLayersForSubgraphChains(chains);

    for (let i = 0; i < layers.length; i++) {
      if (layers[i].includes(bucketId)) {
        return i;
      }
    }

    // Return -1 if the bucketId is not found in any layer
    return -1;
  };

  const getAllowedBucketsByLayer = (
    chains: any,
    index: number | undefined,
  ): BucketID[][] => {
    const MIN_LAYER = -1;
    const MAX_LAYER = Number.MAX_SAFE_INTEGER;

    const buckets = getBuckets();
    const layersWithBucketIds = getLayersForSubgraphChains(chains);
    const getLayersForBucketIds = (
      chains: any,
      bucketIds: BucketID[],
    ): number[] => {
      return bucketIds.map((id) => getLayerForBucketId(chains, id));
    };

    const updateLookup = (
      chains: any,
      idsInLayer: BucketID[],
      lookup: Map<BucketID, [number, number]>,
    ) => {
      for (const idInLayer of idsInLayer) {
        const bucket = getBucket(idInLayer);
        if (!bucket) continue;

        const dependents = getBucketsDependingOn(idInLayer);
        const dependencies = bucket.dependencies || [];

        const dependentLayers = getLayersForBucketIds(chains, dependents);
        const dependencyLayers = getLayersForBucketIds(chains, dependencies);

        const minLayer = dependentLayers.length
          ? Math.min(...dependentLayers)
          : MIN_LAYER;
        const maxLayer = dependencyLayers.length
          ? Math.max(...dependencyLayers)
          : MAX_LAYER;

        lookup.set(idInLayer, [minLayer, maxLayer]);
      }
    };

    const getAllowedBucketsOnLayer = (
      chains: any,
      layerIndex: number,
      others: Bucket[],
      lookup: Map<BucketID, [number, number]>,
    ): BucketID[] => {
      const allowedOnLayer: BucketID[] = [];
      for (const bucket of others) {
        const id = bucket.id;
        const res = lookup.get(id);

        if (!res) continue;
        const [min, max] = res;
        const currentLayer = getLayerForBucketId(chains, id);

        if (
          currentLayer !== layerIndex &&
          min <= layerIndex &&
          max >= layerIndex
        ) {
          allowedOnLayer.push(id);
        }
      }
      return allowedOnLayer;
    };

    // Main logic
    const allowedOnLayers: BucketID[][] = [];
    if (index !== undefined && index >= 0) {
      const lookup: Map<BucketID, [number, number]> = new Map();
      for (const idsInLayer of layersWithBucketIds) {
        updateLookup(chains, idsInLayer, lookup);
      }

      const others = getOtherBuckets(buckets);
      for (
        let layerIndex = 0;
        layerIndex < layersWithBucketIds.length;
        layerIndex++
      ) {
        const allowedOnLayer = getAllowedBucketsOnLayer(
          chains,
          layerIndex,
          others,
          lookup,
        );
        allowedOnLayers.push(allowedOnLayer);
      }
    }

    return allowedOnLayers;
  };

  const deleteTask = (bucketId: BucketID, taskId: TaskID) => {
    dispatch({
      type: "DELETE_TASK",
      bucketId,
      taskId,
    });
  };

  console.log(state);

  return (
    <DataContext.Provider
      value={{
        state,
        addTask,
        deleteTask,
        moveTask,
        changeTaskState,
        updateTask,
        getBucket,
        getTask,
        getBucketForTask,
        getTaskIndex,
        getLayersForSubgraphChains,
        reorderTask,
        getTaskType,
        renameBucket,
        flagBucket,
        updateBucketLayer,
        getBucketsDependingOn,
        getBuckets,
        getAllowedBucketsByLayer,
        addBucketDependency,
        getLayerForBucketId,
        removeBucketDependency,
        getBucketsAvailableFor,
        getDependencyChains: getAllDependencyChains,
      }}
    >
      {children}
    </DataContext.Provider>
  );
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
  updateBucketLayer: (bucketId: BucketID, newLayer: number) => void; // Added this line
  getLayersForSubgraphChains: (chains: BucketID[][]) => BucketID[][];
  getLayerForBucketId: (chains: BucketID[][], bucketId: BucketID) => number;
  getAllowedBucketsByLayer: (
    chains: any,
    index: number | undefined,
  ) => BucketID[][];
  deleteTask: (bucketId: BucketID, taskId: TaskID) => void;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
