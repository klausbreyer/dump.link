//@todo. rename: dataProvider / useData. it is more than tasks.
import React, { createContext, useReducer, useContext } from "react";
import { Bucket, Task, TaskState } from "../types";
type ActionType =
  | { type: "ADD_TASK"; bucketId: Bucket["id"]; task: Omit<Task, "id"> }
  | {
      type: "MOVE_TASK";
      fromBucketId: Bucket["id"];
      toBucketId: Bucket["id"];
      taskId: Task["id"];
    }
  | {
      type: "CHANGE_TASK_STATE";
      bucketId: Bucket["id"];
      taskId: Task["id"];
      newState: TaskState;
    }
  | {
      type: "UPDATE_TASK";
      taskId: Task["id"];
      updatedTask: Omit<Task, "id">;
    }
  | {
      type: "REORDER_TASK";
      movingTaskId: Task["id"];
      newPosition: number;
    }
  | {
      type: "RENAME_BUCKET";
      bucketId: Bucket["id"];
      newName: string;
    }
  | {
      type: "FLAG_BUCKET";
      bucketId: Bucket["id"];
      flag: boolean;
    }
  | {
      type: "ADD_BUCKET_DEPENDENCY";
      bucketId: Bucket["id"];
      dependencyId: Bucket["id"];
    }
  | {
      type: "REMOVE_BUCKET_DEPENDENCY";
      bucketId: Bucket["id"];
      dependencyId: Bucket["id"];
    };

type TaskContextType = {
  state: Bucket[];
  addTask: (bucketId: Bucket["id"], task: Omit<Task, "id">) => void;
  moveTask: (toBucketId: Bucket["id"], taskId: Task["id"]) => void;
  changeTaskState: (
    bucketId: Bucket["id"],
    taskId: Task["id"],
    newState: TaskState,
  ) => void;
  updateTask: (taskId: Task["id"], updatedTask: Omit<Task, "id">) => void;
  getBucket: (bucketId: Bucket["id"]) => Bucket | undefined;
  getTask: (taskId: Task["id"]) => Task | undefined;
  getBucketForTask: (taskId: Task["id"]) => Bucket | undefined;
  reorderTask: (movingTaskId: Task["id"], newPosition: number) => void;
  getTaskType: (task: Task | null | undefined) => string;
  getBuckets: () => Bucket[];
  getTaskIndex: (taskId: Task["id"] | null) => number | undefined;
  renameBucket: (bucketId: Bucket["id"], newName: string) => void;
  flagBucket: (bucketId: Bucket["id"], flag: boolean) => void;
  addBucketDependency: (
    bucketId: Bucket["id"],
    dependencyId: Bucket["id"],
  ) => void;
  removeBucketDependency: (
    bucketId: Bucket["id"],
    dependencyId: string,
  ) => void;
  hasCyclicDependency: (
    bucketId: Bucket["id"],
    dependencyId: string,
  ) => boolean;
  //@todo. check if really needed.
  getBucketsDependingOn: (dependencyId: Bucket["id"]) => Bucket["id"][];

  getBucketsAvailbleFor: (givenBucketId: Bucket["id"]) => Bucket["id"][];
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
      let bucketId: Bucket["id"] | null = null;
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

type TaskProviderProps = {
  children: React.ReactNode;
};

let initialBuckets: Bucket[] = Array.from({ length: 11 }).map((_, index) => ({
  id: index + "",
  name: ``,
  dependencies: [],
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

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialBuckets);

  const addTask = (bucketId: Bucket["id"], task: Omit<Task, "id">) => {
    console.log("add");

    dispatch({
      type: "ADD_TASK",
      bucketId: bucketId,
      task: task,
    });
  };

  const moveTask = (toBucketId: Bucket["id"], taskId: Task["id"]) => {
    dispatch({
      type: "MOVE_TASK",
      fromBucketId: getBucketForTask(taskId)?.id || "", //@todo: not pretty.
      toBucketId: toBucketId,
      taskId: taskId,
    });
  };

  const changeTaskState = (
    bucketId: Bucket["id"],
    taskId: Task["id"],
    newState: TaskState,
  ) => {
    dispatch({
      type: "CHANGE_TASK_STATE",
      bucketId: bucketId,
      taskId: taskId,
      newState: newState,
    });
  };

  const updateTask = (taskId: Task["id"], updatedTask: Omit<Task, "id">) => {
    dispatch({ type: "UPDATE_TASK", taskId, updatedTask });
  };

  const getBucket = (bucketId: Bucket["id"]) => {
    return state.find((bucket) => bucket.id === bucketId);
  };

  const getTask = (taskId: Task["id"]) => {
    for (const bucket of state) {
      const task = bucket.tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  };

  const getBucketForTask = (taskId: Task["id"]) => {
    return state.find((bucket) =>
      bucket.tasks.some((task) => task.id === taskId),
    );
  };

  const reorderTask = (movingTaskId: Task["id"], newPosition: number) => {
    dispatch({
      type: "REORDER_TASK",
      movingTaskId,
      newPosition,
    });
  };

  const getBuckets = () => {
    return state;
  };

  const getTaskIndex = (taskId: Task["id"] | null): number | undefined => {
    if (!taskId) return undefined;
    const bucket = getBucketForTask(taskId);
    if (!bucket) return undefined;

    return bucket.tasks.findIndex((task) => task.id === taskId);
  };

  const addBucketDependency = (
    bucketId: Bucket["id"],
    dependencyId: Bucket["id"],
  ) => {
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
    bucketId: Bucket["id"],
    dependencyId: Bucket["id"],
  ) => {
    dispatch({
      type: "REMOVE_BUCKET_DEPENDENCY",
      bucketId,
      dependencyId,
    });
  };

  const renameBucket = (bucketId: Bucket["id"], newName: string) => {
    dispatch({
      type: "RENAME_BUCKET",
      bucketId,
      newName,
    });
  };

  const flagBucket = (bucketId: Bucket["id"], flag: boolean) => {
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

  const getBucketsDependingOn = (
    dependencyId: Bucket["id"],
  ): Bucket["id"][] => {
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
    bucketId: Bucket["id"],
    dependencyId: Bucket["id"],
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

  const getBucketsAvailbleFor = (
    givenBucketId: Bucket["id"],
  ): Bucket["id"][] => {
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

export function getTasksByState(
  bucket: Bucket | undefined,
  state: TaskState,
): Task[] {
  const tasks = bucket?.tasks || [];
  return tasks.filter((task) => task.state === state);
}

export const getClosedBucketType = (bucketId: Bucket["id"]) => {
  return `CLOSED_BUCKET_${bucketId}`;
};
export const getOpenBucketType = (bucketId: Bucket["id"]) => {
  return `OPEN_BUCKET_${bucketId}`;
};
