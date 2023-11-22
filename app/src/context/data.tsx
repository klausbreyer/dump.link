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
  NewID,
  PRIORITY_INCREMENT,
  extractIdFromUrl,
  hasCyclicDependencyWithBucket,
} from "./helper";
import { LifecycleState, useLifecycle } from "./lifecycle";
import { setupWebSocket } from "./websocket";
import { apiFunctions } from "./calls";

export const CLIENT_TOKEN = NewID(new Date().toISOString());

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

export type ActionType =
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
  | { type: "RESET_LAYERS_FOR_ALL_BUCKETS" }
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
    };

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
          return reconsileBucketUpdate(bucket, updates);
        }
        return bucket;
      });

      return {
        ...state,
        buckets: updatedBuckets,
      };
    }

    case "RESET_LAYERS_FOR_ALL_BUCKETS": {
      const updatedBuckets = state.buckets.map((bucket) => {
        return { ...bucket, layer: null };
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
            layer: isSolelyDependent ? bucket.layer : null,
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

      try {
        const initialState = await apiFunctions.getProject(id);
        if (initialState) {
          dispatch({ type: "SET_INITIAL_STATE", payload: initialState });
        }
      } catch (error) {
        setLifecycle(LifecycleState.ErrorApi);
      }
    };

    loadInitialState();
  }, []);

  useEffect(() => {
    // Hier wird jetzt die neue setupWebSocket Methode aufgerufen
    const wsCleanup = setupWebSocket(state.project.id, dispatch);

    return () => {
      if (wsCleanup) wsCleanup();
    };
  }, [state.project.id]);

  useEffect(() => {
    if (state.project.id === "") return;
    setLifecycle(LifecycleState.Loaded);
  }, [state.project.id]);

  const addTask = (task: Task) => {
    dispatch({
      type: "ADD_TASK",
      task: task,
    });

    (async () => {
      try {
        await apiFunctions.postTask(state.project.id, task);
      } catch (error) {
        alert("Error while adding the task");
      }
    })();
  };

  const moveTask = (toBucketId: BucketID, taskId: TaskID) => {
    const taskToMove = state.tasks.find((task) => task.id === taskId);
    if (!taskToMove) return;

    if (taskToMove.bucketId === toBucketId) return;

    const tasksInNewBucket = state.tasks.filter(
      (task) => task.bucketId === toBucketId,
    );
    const highestPriority =
      tasksInNewBucket.length > 0
        ? Math.max(...tasksInNewBucket.map((t) => t.priority))
        : 0;

    const updates = {
      bucketId: toBucketId,
      priority: highestPriority + PRIORITY_INCREMENT,
    };
    console.log("outer");

    console.log(updates);
    updateTask(taskId, updates);
  };

  const updateTask = (taskId: TaskID, updates: TaskUpdates) => {
    console.log("inner");

    console.log(updates);

    dispatch({
      type: "UPDATE_TASK",
      taskId: taskId,
      updates: updates,
    });

    (async () => {
      try {
        await apiFunctions.patchTask(state.project.id, taskId, updates);
      } catch (error) {
        alert("Error while updating the task");
      }
    })();
  };

  const deleteTask = (taskId: TaskID) => {
    dispatch({
      type: "DELETE_TASK",
      taskId: taskId,
    });

    (async () => {
      try {
        await apiFunctions.deleteTask(state.project.id, taskId);
      } catch (error) {
        alert("Error while deleting the task");
      }
    })();
  };

  const updateBucket = (bucketId: BucketID, updates: BucketUpdates) => {
    dispatch({
      type: "UPDATE_BUCKET",
      bucketId: bucketId,
      updates: updates,
    });

    (async () => {
      try {
        await apiFunctions.patchBucket(state.project.id, bucketId, updates);
      } catch (error) {
        alert("Error while updating the bucket");
      }
    })();
  };

  const resetLayersForAllBuckets = () => {
    dispatch({
      type: "RESET_LAYERS_FOR_ALL_BUCKETS",
    });

    (async () => {
      try {
        await apiFunctions.postProjectResetLayers(state.project.id);
      } catch (error) {
        alert("Error while resetting layers for all buckets");
      }
    })();
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
      bucketId: bucket.id,
      dependencyId: dependencyId,
    });

    (async () => {
      try {
        await apiFunctions.postDependency(
          state.project.id,
          bucket.id,
          dependencyId,
        );
      } catch (error) {
        alert("Error while adding bucket dependency");
      }
    })();
  };

  const removeBucketDependency = (
    bucketId: BucketID,
    dependencyId: BucketID,
  ) => {
    dispatch({
      type: "REMOVE_BUCKET_DEPENDENCY",
      bucketId: bucketId,
      dependencyId: dependencyId,
    });

    (async () => {
      try {
        await apiFunctions.deleteDependency(
          state.project.id,
          bucketId,
          dependencyId,
        );
      } catch (error) {
        alert("Error while removing bucket dependency");
      }
    })();
  };

  const removeAllBucketDependencies = () => {
    state.dependencies.forEach((dependency) =>
      removeBucketDependency(dependency.bucketId, dependency.dependencyId),
    );
    resetLayersForAllBuckets();
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

  const getBuckets = () => {
    return state.buckets;
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
        removeAllBucketDependencies,
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
  removeAllBucketDependencies: () => void;
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
