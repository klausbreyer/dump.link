import React, { createContext, useContext, useEffect, useReducer } from "react";

import {
  Bucket,
  BucketID,
  BucketUpdates,
  Dependency,
  Project,
  State,
  Task,
  TaskID,
  TaskUpdates,
} from "../types";
import {
  apiDeleteTask,
  apiGetProject,
  apiPostTask,
  apiPatchTask,
  apiPatchBucket,
} from "./calls";
import {
  PRIORITY_INCREMENT,
  extractIdFromUrl,
  hasCyclicDependencyWithBucket,
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
      updates: BucketUpdates;
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
      updates: TaskUpdates;
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
          return reconsileTaskUpdate(task, updates);
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

  const addTask = (task: Task) => {
    apiPostTask(state.project.id, task).then((newTask) => {
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

  const moveTask = (toBucketId: BucketID, taskId: TaskID) => {
    // Find the task to move
    const taskToMove = state.tasks.find((task) => task.id === taskId);
    if (!taskToMove) return;

    // Check if the task is already in the target bucket
    if (taskToMove.bucketId === toBucketId) return;

    // Calculate the new priority for the task in the new bucket
    const tasksInNewBucket = state.tasks.filter(
      (task) => task.bucketId === toBucketId,
    );
    const highestPriority =
      tasksInNewBucket.length > 0
        ? Math.max(...tasksInNewBucket.map((t) => t.priority))
        : 0;

    // Prepare the updates for the task
    const updates = {
      bucketId: toBucketId,
      priority: highestPriority + PRIORITY_INCREMENT,
    };

    // Update the task using the updateTask function
    updateTask(taskId, updates);
  };

  const updateTask = (taskId: TaskID, updates: TaskUpdates) => {
    const task = state.tasks.find((task) => task.id === taskId);
    if (!task) return;
    const updateData = reconsileTaskUpdate(task, updates);

    apiPatchTask(state.project.id, taskId, updateData).then((updatedTask) => {
      if (updatedTask) {
        console.log("ifyes");

        dispatch({
          type: "UPDATE_TASK",
          taskId: taskId,
          updates: updatedTask,
        });
      }
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
    // Find the bucket to update
    const bucketToUpdate = state.buckets.find(
      (bucket) => bucket.id === bucketId,
    );
    if (!bucketToUpdate) return;

    // Merge the existing bucket data with the updates
    const updatedBucketData = reconsileBucketUpdate(bucketToUpdate, updates);

    // Call API to update the bucket on the server
    // Assuming you have an API function like `apiPatchBucket`
    apiPatchBucket(state.project.id, bucketId, updatedBucketData).then(
      (updatedBucket) => {
        if (updatedBucket) {
          // Dispatch an action to update the bucket in the local state
          dispatch({
            type: "UPDATE_BUCKET",
            bucketId: bucketId,
            updates: updatedBucket,
          });
        }
      },
    );
  };

  const deleteTask = (taskId: TaskID) => {
    apiDeleteTask(state.project.id, taskId).then((success) => {
      if (success) {
        dispatch({
          type: "DELETE_TASK",
          taskId: taskId,
        });
      }
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
  addTask: (task: Task) => void;
  deleteTask: (taskId: TaskID) => void;
  updateTask: (taskId: TaskID, updates: TaskUpdates) => void;
  moveTask: (toBucketId: BucketID, taskId: TaskID) => void;

  getBuckets: () => Bucket[];
  updateBucket: (bucketId: BucketID, updates: BucketUpdates) => void;

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

function reconsileTaskUpdate(task: Task, updates: TaskUpdates): Task {
  return {
    ...task,
    ...(updates.closed !== undefined && { closed: updates.closed }),
    ...(updates.title !== undefined && { title: updates.title }),
    ...(updates.priority !== undefined && { priority: updates.priority }),
    ...(updates.bucketId !== undefined && { bucketId: updates.bucketId }),
  };
}

function reconsileBucketUpdate(bucket: Bucket, updates: BucketUpdates): Bucket {
  return {
    ...bucket,
    ...(updates.name !== undefined && { name: updates.name }),
    ...(updates.layer !== undefined && { layer: updates.layer }),
    ...(updates.flagged !== undefined && { flagged: updates.flagged }),
    ...(updates.done !== undefined && { done: updates.done }),
  };
}
