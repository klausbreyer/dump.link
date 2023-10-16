import React, { createContext, useReducer, useContext } from "react";
import { Bucket, BucketID, Task, TaskID, TaskState } from "../types";
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
  state: Bucket[];
  addTask: (bucketId: BucketID, task: Omit<Task, "id">) => void;
  moveTask: (toBucketId: BucketID, taskId: TaskID) => void;
  changeTaskState: (
    bucketId: BucketID,
    taskId: TaskID,
    newState: TaskState,
  ) => void;
  updateTask: (taskId: TaskID, updatedTask: Omit<Task, "id">) => void;
  getBucket: (bucketId: BucketID) => Bucket | undefined;
  getTask: (taskId: TaskID) => Task | undefined;
  getBucketForTask: (taskId: TaskID) => Bucket | undefined;
  reorderTask: (movingTaskId: TaskID, newPosition: number) => void;
  getTaskType: (task: Task | null | undefined) => string;
  getBuckets: () => Bucket[];
  getTaskIndex: (taskId: TaskID | null) => number | undefined;
  renameBucket: (bucketId: BucketID, newName: string) => void;
  flagBucket: (bucketId: BucketID, flag: boolean) => void;
  addBucketDependency: (bucketId: BucketID, dependencyId: BucketID) => void;
  removeBucketDependency: (bucketId: BucketID, dependencyId: string) => void;
  hasCyclicDependency: (bucketId: BucketID, dependencyId: string) => boolean;
  getBucketsDependingOn: (dependencyId: BucketID) => BucketID[];
  getBucketsAvailbleFor: (givenBucketId: BucketID) => BucketID[];
  getDependencyChains: () => BucketID[][];
};

const DataContext = createContext<DataContextType | undefined>(undefined);

const dataReducer = (state: Bucket[], action: ActionType): Bucket[] => {
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
      let bucketId: BucketID | null = null;
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

    case "ADD_BUCKET_DEPENDENCY":
      return state.map((bucket) =>
        bucket.id === action.bucketId
          ? {
              ...bucket,
              dependencies: [...bucket.dependencies, action.dependencyId],
            }
          : bucket,
      );

    case "REMOVE_BUCKET_DEPENDENCY":
      return state.map((bucket) =>
        bucket.id === action.bucketId
          ? {
              ...bucket,
              dependencies: bucket.dependencies.filter(
                (id) => id !== action.dependencyId,
              ),
            }
          : bucket,
      );

    default:
      return state;
  }
};

type DataProviderProps = {
  children: React.ReactNode;
};

let initialBuckets: Bucket[] = Array.from({ length: 11 }).map((_, index) => ({
  id: index + "",
  name: `index ${index}`,
  dependencies: index === 6 ? ["1", "2"] : [],
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

// initialBuckets = Array.from({ length: 11 }).map((_, index) => ({
//   id: index + "",
//   name: ``,
//   flagged: false,
//   tasks:
//     index === 0
//       ? [
//           {
//             id: Date.now().toString() + index,
//             title: "Your first task",
//             state: TaskState.OPEN,
//           },
//         ]
//       : [],
// }));

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialBuckets);

  const addTask = (bucketId: BucketID, task: Omit<Task, "id">) => {
    dispatch({
      type: "ADD_TASK",
      bucketId: bucketId,
      task: task,
    });
  };

  const moveTask = (toBucketId: BucketID, taskId: TaskID) => {
    dispatch({
      type: "MOVE_TASK",
      fromBucketId: getBucketForTask(taskId)?.id || "", //@todo: not pretty.
      toBucketId: toBucketId,
      taskId: taskId,
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
    return state.find((bucket) => bucket.id === bucketId);
  };

  const getTask = (taskId: TaskID) => {
    for (const bucket of state) {
      const task = bucket.tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  };

  const getBucketForTask = (taskId: TaskID) => {
    return state.find((bucket) =>
      bucket.tasks.some((task) => task.id === taskId),
    );
  };

  const reorderTask = (movingTaskId: TaskID, newPosition: number) => {
    dispatch({
      type: "REORDER_TASK",
      movingTaskId,
      newPosition,
    });
  };

  const getBuckets = () => {
    return state;
  };

  const getTaskIndex = (taskId: TaskID | null): number | undefined => {
    if (!taskId) return undefined;
    const bucket = getBucketForTask(taskId);
    if (!bucket) return undefined;

    return bucket.tasks.findIndex((task) => task.id === taskId);
  };

  const addBucketDependency = (bucketId: BucketID, dependencyId: BucketID) => {
    if (hasCyclicDependency(bucketId, dependencyId)) {
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

    const bucket = getBucketForTask(task.id);

    if (!bucket) {
      return "NO_OP";
    }

    if (bucket && task.state === TaskState.CLOSED) {
      return getClosedBucketType(bucket.id);
    }

    return getOpenBucketType(bucket.id);
  };

  const getBucketsDependingOn = (dependencyId: BucketID): BucketID[] => {
    const dependentBuckets: string[] = [];

    // Loop through all buckets
    for (const bucket of state) {
      // Check if the given bucket ID is present in the current bucket's dependencies array
      if (bucket.dependencies.includes(dependencyId)) {
        dependentBuckets.push(bucket.id);
      }
    }

    return dependentBuckets;
  };

  const hasCyclicDependency = (
    bucketId: BucketID,
    dependencyId: BucketID,
  ): boolean => {
    // Recursive function to traverse the dependency graph
    const traverse = (id: string, visited: Set<string>): boolean => {
      if (visited.has(id)) return true;
      visited.add(id);

      const bucket = getBucket(id);
      for (const depId of bucket?.dependencies || []) {
        if (traverse(depId, visited)) return true;
      }
      return false;
    };

    return traverse(dependencyId, new Set([bucketId]));
  };

  const getBucketsAvailbleFor = (givenBucketId: BucketID): BucketID[] => {
    return state
      .filter(
        (bucket) =>
          bucket.id !== givenBucketId && // Exclude the given bucket itself
          !bucket.dependencies.includes(givenBucketId) && // Exclude direct dependencies
          // !dependentBuckets.includes(bucket.id) && // Exclude indirect dependencies
          !hasCyclicDependency(bucket.id, givenBucketId), // Exclude buckets that would result in a cyclic dependency
      )
      .map((bucket) => bucket.id); // Extract the bucket IDs
  };

  // This function retrieves all dependency chains for a specific bucket.
  const getDependencyChainsForBucket = (bucketId: BucketID): BucketID[][] => {
    const bucket = state.find((b) => b.id === bucketId);
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
    for (const bucket of state) {
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
        getBucketsDependingOn,
        getBuckets,
        addBucketDependency,
        removeBucketDependency,
        hasCyclicDependency,
        getBucketsAvailbleFor,
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

export function getTasksByState(
  bucket: Bucket | undefined,
  state: TaskState,
): Task[] {
  const tasks = bucket?.tasks || [];
  return tasks.filter((task) => task.state === state);
}

export const getClosedBucketType = (bucketId: BucketID) => {
  return `CLOSED_BUCKET_${bucketId}`;
};

export const getOpenBucketType = (bucketId: BucketID) => {
  return `OPEN_BUCKET_${bucketId}`;
};

/**
 * Given a list of chains, this function returns the longest chain.
 * If there are multiple chains of the same longest length, the first one encountered is returned.
 *
 * @param chains - An array of chains where each chain is an array of BucketIDs.
 * @returns The longest chain or undefined if the list of chains is empty.
 */
export const getLongestChain = (
  chains: BucketID[][],
): BucketID[] | undefined => {
  return chains.reduce((longest, current) => {
    return current.length > longest.length ? current : longest;
  }, [] as BucketID[]);
};

export function removeDuplicates(arr: any[]): any[] {
  return [...new Set(arr)];
}

export function getElementsAtIndex(arrays: any[][], i: number): any[] {
  return arrays.map((array) => array[i]);
}
/**
 * Given a list of chains, this function returns each unique pair from all the chains.
 *
 * @param chains - An array of chains where each chain is an array of BucketIDs.
 * @returns An array of unique pairs from the chains.
 */
export const getAllPairs = (chains: BucketID[][]): [BucketID, BucketID][] => {
  const pairsSet = new Set<string>();

  for (const chain of chains) {
    for (let i = 0; i < chain.length - 1; i++) {
      pairsSet.add(`${chain[i]},${chain[i + 1]}`);
    }
  }

  return Array.from(pairsSet).map(
    (pair) => pair.split(",") as [BucketID, BucketID],
  );
};

/**
 * Deduplicates inner values of a two-dimensional array. For each unique BucketID in the sub-arrays,
 * only the BucketID with the highest index in the main array is retained. All other occurrences
 * are replaced with null.
 *
 * @param arr - The two-dimensional array to deduplicate.
 * @returns The array with inner values deduplicated.
 */
export function deduplicateInnerValues(
  arr: (BucketID | null)[][],
): (BucketID | null)[][] {
  const lastIndexMap = new Map<BucketID, number>();

  // Find the last index of each BucketID
  for (let i = 0; i < arr.length; i++) {
    for (const id of arr[i]) {
      if (id !== null) {
        lastIndexMap.set(id, i);
      }
    }
  }

  // Replace values with null, if they are not in their last index
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      const id = arr[i][j];
      if (id !== null && lastIndexMap.get(id) !== i) {
        arr[i][j] = null;
      }
    }
  }

  return arr;
}

export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

export function uniqueValues<T>(arr: T[][]): T[] {
  return [...new Set(arr.flatMap((subArray) => subArray))];
}
