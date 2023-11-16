import React, { createContext, useContext, useEffect, useReducer } from "react";

import { Bucket, BucketID, Project, Task, TaskID } from "../types";
import {
  NewID,
  SubArrayLength,
  findLargestSubarrayIndex,
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
  console.log(action);

  switch (action.type) {
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
  const persistedState = loadFromLocalStorage();
  const [state, dispatch] = useReducer(
    dataReducer,
    persistedState || initialState,
  );

  useEffect(() => {
    saveToLocalStorage(state);
  }, [state]);

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

  const updateTask = (
    taskId: TaskID,
    updatedTask: Omit<Task, "id" | "priority">,
  ) => {
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

  /**
   * Returns a list of BucketID that can be associated with the given bucket.
   *
   * Specifically, the function filters out:
   * 1. The bucket specified by `givenBucketId` itself.
   * 2. Buckets that are direct dependencies of the bucket specified by `givenBucketId`.
   * 3. Buckets that would create a cyclic dependency if associated with the bucket specified by `givenBucketId`.
   *
   * @param givenBucketId - The ID of the bucket for which to find available buckets.
   * @returns A list of BucketID that can be associated with the given bucket.
   */
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
    // Create a map to store the result of findSubarrayIndex as key and the corresponding ids as values
    const layersMap: Map<number, BucketID[]> = new Map();

    const ids = uniqueValues(chains);

    // Process each id
    ids.forEach((id) => {
      const bucket = getBucket(id);
      let index: number;

      if (bucket?.layer !== undefined) {
        // Use bucket.layer if set, otherwise use findSubarrayIndex
        index = bucket.layer;
      } else {
        index = findLargestSubarrayIndex(chains, id);
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
    // Immediate return if index is undefined or negative
    if (index === undefined || index < 0) {
      return [];
    }

    const MIN_LAYER = -1;
    const MAX_LAYER = Number.MAX_SAFE_INTEGER;

    const buckets = getBuckets();
    const layersWithBucketIds = getLayers();
    const lookup: Map<BucketID, [number, number]> = new Map();

    // Pre-compute layer-to-bucketID mapping
    const layerForBucketId: Map<BucketID, number> = new Map();
    layersWithBucketIds.forEach((ids, layerIndex) => {
      ids.forEach((id) => layerForBucketId.set(id, layerIndex));
    });

    for (const idsInLayer of layersWithBucketIds) {
      for (const idInLayer of idsInLayer) {
        const bucket = getBucket(idInLayer);
        if (!bucket) continue;

        const dependentOn = getBucketsDependingOn(idInLayer);
        const dependencyFor = bucket.dependencies || [];

        const dependentOnLayers = new Set<number>(
          dependentOn
            .map((id) => layerForBucketId.get(id))
            .filter((layer): layer is number => layer !== undefined),
        );

        const dependencyForLayers = new Set<number>(
          dependencyFor
            .map((id) => layerForBucketId.get(id))
            .filter((layer): layer is number => layer !== undefined),
        );

        const minLayer = dependentOnLayers.size
          ? Math.max(...dependentOnLayers)
          : MIN_LAYER;

        const maxLayer = dependencyForLayers.size
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
          const currentLayer = layerForBucketId.get(id) || MIN_LAYER;
          return (
            currentLayer !== layerIndex && min < layerIndex && max > layerIndex
          );
        });
    };

    // Main logic
    const allowedOnLayers: BucketID[][] = [];
    const others = getOtherBuckets(buckets);
    for (
      let layerIndex = 0;
      layerIndex < layersWithBucketIds.length;
      layerIndex++
    ) {
      allowedOnLayers.push(getAllowedBucketsOnLayer(layerIndex, others));
    }

    return allowedOnLayers;
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

  console.dir("state", state.buckets[1].tasks);

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
        resetLayersForAllBuckets,
        getBucketsDependingOn,
        getBuckets,
        getAllowedBucketsByLayer,
        addBucketDependency,
        getLayerForBucketId,
        removeBucketDependency,
        setBucketDone,
        getBucketsAvailableFor,
        getAllDependencyChains,
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
