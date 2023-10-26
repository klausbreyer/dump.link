import React, { createContext, useContext, useEffect, useReducer } from "react";

import { Bucket, BucketID, State, Task, TaskID } from "../types";
import {
  NewID,
  SubArrayLength,
  divideIntoSubsets,
  findSubarrayIndex,
  getClosedBucketType,
  getLargestSubArray,
  getOpenBucketType,
  getOtherBuckets,
  hasCyclicDependencyWithBucket,
  isLastInSubarray,
  isOnlyInOneSubArray,
  uniqueValues,
} from "./helper";
import initialState from "./init";
import { loadFromLocalStorage, saveToLocalStorage } from "./storage";

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
      closed: boolean;
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
    }
  | {
      type: "SET_BUCKET_ACTIVE";
      bucketId: BucketID;
      active: boolean;
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
                tasks: [...bucket.tasks, { ...action.task, id: NewID() }],
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

    case "SET_BUCKET_ACTIVE":
      return {
        ...state,
        buckets: state.buckets.map((bucket) =>
          bucket.id === action.bucketId
            ? { ...bucket, active: action.active }
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
  const persistedState = loadFromLocalStorage();
  const [state, dispatch] = useReducer(
    dataReducer,
    persistedState || initialState,
  );

  useEffect(() => {
    saveToLocalStorage(state);
  }, [state]);

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
    closed: boolean,
  ) => {
    dispatch({
      type: "CHANGE_TASK_STATE",
      bucketId: bucketId,
      taskId: taskId,
      closed: closed,
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

    if (bucket && task.closed) {
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

  const getLayers = (): BucketID[][] => {
    const chains = getAllDependencyChains();
    if (chains.length === 0) {
      return [];
    }
    const longestNaturalChain = getLargestSubArray(chains).length;

    // Create a map to store the result of findSubarrayIndex as key and the corresponding ids as values
    const layersMap: Map<number, BucketID[]> = new Map();

    const ids = uniqueValues(chains);

    const middleOrphans: BucketID[] = [];
    // Process each id
    ids.forEach((id) => {
      const bucket = getBucket(id);
      let index: number;

      // Use bucket.layer if set, otherwise use findSubarrayIndex
      if (bucket?.layer !== undefined) {
        index = bucket.layer;
      } else {
        if (
          isOnlyInOneSubArray(chains, id) &&
          isLastInSubarray(chains, id) &&
          SubArrayLength(chains, id) < longestNaturalChain
        ) {
          middleOrphans.push(id);
          return;
        }

        index = findSubarrayIndex(chains, id);
      }

      // We save all the middle orphans for the last row. but not when it is from the longest chain, because it then will not create the last layer.

      if (layersMap.has(index)) {
        layersMap.get(index)!.push(id); // Add to the existing array
      } else {
        layersMap.set(index, [id]); // Create a new array with the id
      }
    });

    // Convert the map to an array of arrays
    const layersArray: BucketID[][] = [];
    const keys = Array.from(layersMap.keys()).sort((a, b) => a - b); // Sorting the keys in ascending order

    const minKey = keys[0];
    const maxKey = keys[keys.length - 1];

    for (let i = minKey; i <= maxKey; i++) {
      if (layersMap.has(i)) {
        layersArray.push(layersMap.get(i)!);
      } else {
        layersArray.push([]);
      }
    }

    console.dir(chains, middleOrphans);

    const pos = Math.min(longestNaturalChain - 1, layersArray.length - 1);
    layersArray[pos] = [...layersArray[pos], ...middleOrphans];
    return layersArray;
  };

  const getLayerForBucketId = (bucketId: BucketID): number => {
    const layers = getLayers();

    for (let i = 0; i < layers.length; i++) {
      if (layers[i].includes(bucketId)) {
        return i;
      }
    }

    // Return -1 if the bucketId is not found in any layer
    return -1;
  };

  const getAllowedBucketsByLayer = (
    index: number | undefined,
  ): BucketID[][] => {
    const MIN_LAYER = -1;
    const MAX_LAYER = Number.MAX_SAFE_INTEGER;

    const buckets = getBuckets();
    const layersWithBucketIds = getLayers();
    const lookup: Map<BucketID, [number, number]> = new Map();

    for (const idsInLayer of layersWithBucketIds) {
      for (const idInLayer of idsInLayer) {
        const bucket = getBucket(idInLayer);
        if (!bucket) continue;

        const dependentOn = getBucketsDependingOn(idInLayer);
        const dependencyFor = bucket.dependencies || [];

        const dependentOnLayers = dependentOn.map((id) =>
          getLayerForBucketId(id),
        );
        const dependencyForLayers = dependencyFor.map((id) =>
          getLayerForBucketId(id),
        );

        const minLayer = dependentOnLayers.length
          ? Math.max(...dependentOnLayers)
          : MIN_LAYER;
        const maxLayer = dependencyForLayers.length
          ? Math.min(...dependencyForLayers)
          : MAX_LAYER;

        lookup.set(idInLayer, [minLayer, maxLayer]);
      }
    }

    const getAllowedBucketsOnLayer = (
      layerIndex: number,
      others: Bucket[],
    ): BucketID[] => {
      return others
        .map((bucket) => bucket.id)
        .filter((id) => {
          const [min, max] = lookup.get(id) || [MIN_LAYER, MAX_LAYER];
          const currentLayer = getLayerForBucketId(id);
          return (
            currentLayer !== layerIndex && min < layerIndex && max > layerIndex
          );
        });
    };

    // Main logic
    const allowedOnLayers: BucketID[][] = [];
    if (index !== undefined && index >= 0) {
      const others = getOtherBuckets(buckets);
      for (
        let layerIndex = 0;
        layerIndex < layersWithBucketIds.length;
        layerIndex++
      ) {
        allowedOnLayers.push(getAllowedBucketsOnLayer(layerIndex, others));
      }
    }

    return allowedOnLayers;
  };

  const setBucketActive = (bucketId: BucketID, active: boolean) => {
    dispatch({
      type: "SET_BUCKET_ACTIVE",
      bucketId: bucketId,
      active: active,
    });
  };

  const deleteTask = (bucketId: BucketID, taskId: TaskID) => {
    dispatch({
      type: "DELETE_TASK",
      bucketId,
      taskId,
    });
  };

  console.log("state", state);

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
        getLayers,
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
        setBucketActive,
        getBucketsAvailableFor,
        getAllDependencyChains,
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
    closed: boolean,
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
  getAllDependencyChains: () => BucketID[][];
  updateBucketLayer: (bucketId: BucketID, newLayer: number) => void;
  getLayers: () => BucketID[][];
  getLayerForBucketId: (bucketId: BucketID) => number;
  getAllowedBucketsByLayer: (index: number | undefined) => BucketID[][];
  deleteTask: (bucketId: BucketID, taskId: TaskID) => void;
  setBucketActive: (bucketId: BucketID, active: boolean) => void;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
