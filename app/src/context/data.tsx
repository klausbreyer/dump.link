import React, { createContext, useContext, useEffect, useReducer } from "react";

import {
  Bucket,
  BucketID,
  Dependency,
  Project,
  State,
  Task,
  TaskID,
} from "../types";
import { apiGetProject, apiPostTask } from "./calls";
import { extractIdFromUrl, hasCyclicDependencyWithBucket } from "./helper";
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

type ActionType =
  | { type: "SET_INITIAL_STATE"; payload: State }
  | {
      type: "ADD_TASK";
      task: Task;
    }
  | {
      type: "MOVE_TASK";
      toBucketId: BucketID;
      taskId: TaskID;
    }
  | {
      type: "UPDATE_BUCKET";
      bucketId: BucketID;
      updates: {
        name?: string;
        layer?: number;
        flagged?: boolean;
        done?: boolean;
      };
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
      updates: {
        closed?: boolean;
        title?: string;
      };
    }
  | {
      type: "REORDER_TASK";
      movingTaskId: TaskID;
      newPosition: number;
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
      type: "DELETE_TASK";
      bucketId: BucketID;
      taskId: TaskID;
    }
  | { type: "RESET_LAYERS_FOR_ALL_BUCKETS" };

const DataContext = createContext<DataContextType | undefined>(undefined);
const dataReducer = (state: State, action: ActionType): State => {
  console.log(action);

  switch (action.type) {
    case "SET_INITIAL_STATE":
      return action.payload;

    case "ADD_TASK": {
      const { task } = action;

      // Update the tasks array directly in the state
      let updatedTasks = [...state.tasks];

      updatedTasks.push(task);

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
      const { taskId, updates } = action;

      // Map through the tasks array to find and update the specific task
      const updatedTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            ...(updates.closed !== undefined && { closed: updates.closed }),
            ...(updates.title !== undefined && { title: updates.title }),
          };
        }
        return task;
      });

      return {
        ...state,
        tasks: updatedTasks,
      };
    }

    case "UPDATE_BUCKET": {
      const { bucketId, updates } = action;

      // Map through the buckets array to find and update the specific bucket
      const updatedBuckets = state.buckets.map((bucket) => {
        if (bucket.id === bucketId) {
          return {
            ...bucket,
            ...(updates.name !== undefined && { name: updates.name }),
            ...(updates.layer !== undefined && { layer: updates.layer }),
            ...(updates.flagged !== undefined && {
              flagged: updates.flagged,
            }),
            ...(updates.done !== undefined && { done: updates.done }),
          };
        }
        return bucket;
      });

      return {
        ...state,
        buckets: updatedBuckets,
      };
    }

    case "REORDER_TASK": {
      const { movingTaskId, newPosition } = action;

      // Find and remove the moving task from the current tasks array
      let updatedTasks = [...state.tasks];
      const movingTaskIndex = updatedTasks.findIndex(
        (task) => task.id === movingTaskId,
      );
      if (movingTaskIndex === -1) return state; // If the task is not found, return the current state

      const movingTask = updatedTasks[movingTaskIndex];
      updatedTasks.splice(movingTaskIndex, 1);

      // Filter tasks to include only those in the same bucket as the moving task
      const tasksInSameBucket = updatedTasks.filter(
        (task) => task.bucketId === movingTask.bucketId,
      );

      // Sort tasks in the same bucket by their priority
      tasksInSameBucket.sort((a, b) => a.priority - b.priority);

      let newPriority = 0;
      if (newPosition === 0) {
        // If moving to the start, set priority less than the first task's priority
        newPriority =
          tasksInSameBucket.length > 0 ? tasksInSameBucket[0].priority / 2 : 1;
      } else if (newPosition >= tasksInSameBucket.length) {
        // If moving to the end, set priority greater than the last task's priority
        newPriority =
          tasksInSameBucket.length > 0
            ? tasksInSameBucket[tasksInSameBucket.length - 1].priority + 100000
            : 100000;
      } else {
        // Otherwise, set priority as the average of the before and after tasks
        const beforePriority = tasksInSameBucket[newPosition - 1].priority;
        const afterPriority = tasksInSameBucket[newPosition].priority;
        newPriority = (beforePriority + afterPriority) / 2;
      }

      // Update the priority of the moving task
      movingTask.priority = newPriority;

      // Re-insert the moving task at its new position
      updatedTasks.splice(newPosition, 0, movingTask);

      return { ...state, tasks: updatedTasks };
    }

    case "MOVE_TASK": {
      const { toBucketId, taskId } = action;

      // Find the task to move
      const taskToMoveIndex = state.tasks.findIndex(
        (task) => task.id === taskId,
      );
      if (taskToMoveIndex === -1) return state; // If the task is not found, return the current state

      const taskToMove = { ...state.tasks[taskToMoveIndex] };

      // Check if the task is already in the target bucket
      if (taskToMove.bucketId === toBucketId) return state;

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
    const loadInitialState = async () => {
      const id = extractIdFromUrl(); // Stellen Sie sicher, dass diese Funktion existiert und richtig importiert wird
      const initialState = await apiGetProject(id);
      if (initialState) {
        dispatch({ type: "SET_INITIAL_STATE", payload: initialState });
      }
    };

    loadInitialState();
  }, []);

  useEffect(() => {
    if (state.project.id === "") return;
    setLifecycle(LifecycleState.Loaded);
  }, [state.project.id]);

  const addTask = (projectId: string, task: Task) => {
    apiPostTask(projectId, task).then((newTask) => {
      if (!newTask) {
        console.error("Error while adding the task");
        return;
      }
      dispatch({
        type: "ADD_TASK",
        task: newTask,
      });
    });
  };

  const moveTask = (toBucketId: BucketID, task: Task) => {
    dispatch({
      type: "MOVE_TASK",
      toBucketId: toBucketId,
      taskId: task.id,
    });
  };

  const updateTask = (
    taskId: TaskID,
    updates: {
      closed?: boolean;
      title?: string;
      bucketId?: BucketID;
    },
  ) => {
    dispatch({
      type: "UPDATE_TASK",
      taskId: taskId,
      updates: updates,
    });
  };

  const reorderTask = (movingTaskId: TaskID, newPosition: number) => {
    dispatch({
      type: "REORDER_TASK",
      movingTaskId,
      newPosition,
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

  const getProject = () => {
    return state.project;
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

  const updateBucket = (
    bucketId: BucketID,
    updates: {
      name?: string;
      layer?: number;
      flagged?: boolean;
      done?: boolean;
    },
  ) => {
    dispatch({
      type: "UPDATE_BUCKET",
      bucketId: bucketId,
      updates: updates,
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
        getProject,
        moveTask,
        updateTask,
        reorderTask,
        resetLayersForAllBuckets,
        getBuckets,
        addBucketDependency,
        removeBucketDependency,
        updateBucket,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

type DataContextType = {
  state: State;

  getTasks: () => Task[];
  addTask: (bucketId: BucketID, task: Task) => void;
  deleteTask: (bucketId: BucketID, taskId: TaskID) => void;
  updateTask: (
    taskId: TaskID,
    updates: {
      closed?: boolean;
      title?: string;
    },
  ) => void;
  reorderTask: (movingTaskId: TaskID, newPosition: number) => void;
  moveTask: (toBucketId: BucketID, task: Task) => void;

  getBuckets: () => Bucket[];
  updateBucket: (
    bucketId: BucketID,
    updates: {
      name?: string;
      layer?: number;
      flagged?: boolean;
      done?: boolean;
    },
  ) => void;

  getDependencies: () => Dependency[];
  getProject: () => Project;
  addBucketDependency: (bucket: Bucket, dependencyId: BucketID) => void;
  removeBucketDependency: (bucketId: BucketID, dependencyId: string) => void;

  resetLayersForAllBuckets: () => void;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
