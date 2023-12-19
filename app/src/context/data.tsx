import React, { createContext, useContext, useEffect, useReducer } from "react";

import {
  Bucket,
  BucketID,
  BucketUpdates,
  Dependency,
  Project,
  ProjectUpdates,
  State,
  Task,
  TaskID,
  TaskUpdates,
} from "../types";

import { APIError, apiFunctions } from "./calls";
import {
  NewID,
  PRIORITY_INCREMENT,
  extractIdFromUrl,
  getLayerForBucketId,
  getUniqueDependingIdsForbucket,
  hasCyclicDependencyWithBucket,
  saveProjectIdToLocalStorage,
} from "./helper";
import { LifecycleState, useLifecycle } from "./lifecycle";
import { setupWebSocket } from "./websocket";
import { notifyBugsnag } from "..";

export const CLIENT_TOKEN = NewID(new Date().getTime().toString());

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
      type: "RESET_BUCKET_LAYER";
      bucketId: BucketID;
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
  | {
      type: "UPDATE_PROJECT";
      updates: ProjectUpdates;
    };

const DataContext = createContext<DataContextType | undefined>(undefined);
const dataReducer = (state: State, action: ActionType): State => {
  console.log(action);

  switch (action.type) {
    case "SET_INITIAL_STATE":
      return action.payload;

    case "UPDATE_PROJECT": {
      const { updates } = action;

      return {
        ...state,
        project: {
          ...state.project,
          ...updates,
        },
      };
    }

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

    case "RESET_BUCKET_LAYER": {
      const { bucketId } = action;
      const updatedBuckets = state.buckets.map((bucket) => {
        if (bucket.id === bucketId) {
          return reconsileBucketUpdate(bucket, { layer: null });
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

  const loadInitialState = async () => {
    const projectId = extractIdFromUrl();
    try {
      const initialState = await apiFunctions.getProject(projectId);
      saveProjectIdToLocalStorage(projectId, initialState.project.name);
      if (initialState) {
        dispatch({ type: "SET_INITIAL_STATE", payload: initialState });
      }
    } catch (error) {
      notifyBugsnag(error);
      if (error instanceof APIError) {
        if (error.statusCode === 404) {
          setLifecycle(LifecycleState.Error404);
        } else {
          setLifecycle(LifecycleState.ErrorApi);
        }
      }
    }
  };

  useEffect(() => {
    loadInitialState();
  }, []);

  useEffect(() => {
    const wsCleanup = setupWebSocket(
      state.project.id,
      dispatch,
      loadInitialState,
    );

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
        notifyBugsnag(error);
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
    updateTask(taskId, updates);
  };

  const updateTask = (taskId: TaskID, updates: TaskUpdates) => {
    dispatch({
      type: "UPDATE_TASK",
      taskId: taskId,
      updates: updates,
    });

    (async () => {
      try {
        await apiFunctions.patchTask(state.project.id, taskId, updates);
      } catch (error) {
        notifyBugsnag(error);
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
        notifyBugsnag(error);
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
        notifyBugsnag(error);
        alert("Error while updating the bucket");
      }
    })();
  };

  const resetBucketLayer = (bucketId: BucketID) => {
    dispatch({
      type: "RESET_BUCKET_LAYER",
      bucketId: bucketId,
    });

    (async () => {
      try {
        await apiFunctions.postBucketResetLayer(state.project.id, bucketId);
      } catch (error) {
        notifyBugsnag(error);
        alert("Error while reseting bucket layer");
      }
    })();
  };

  const moveSubgraph = (bucketId: BucketID, layer: number) => {
    const uniqueDependingIds = getUniqueDependingIdsForbucket(
      state.buckets,
      state.dependencies,
      bucketId,
    );
    const rootLayer = getLayerForBucketId(
      state.buckets,
      state.dependencies,
      bucketId,
    );
    const diff = layer - rootLayer;

    uniqueDependingIds.forEach((subId) => {
      const subLayer = getLayerForBucketId(
        state.buckets,
        state.dependencies,
        subId,
      );
      updateBucket(subId, { layer: subLayer + diff });
    });
  };

  const resetLayersForAllBuckets = () => {
    dispatch({
      type: "RESET_LAYERS_FOR_ALL_BUCKETS",
    });

    (async () => {
      try {
        await apiFunctions.postProjectResetLayers(state.project.id);
      } catch (error) {
        notifyBugsnag(error);
        alert("Error while resetting layers for all buckets");
      }
    })();
  };

  const updateProject = (updates: ProjectUpdates) => {
    dispatch({
      type: "UPDATE_PROJECT",
      updates: updates,
    });

    if (updates.name) {
      saveProjectIdToLocalStorage(state.project.id, updates.name);
    }

    (async () => {
      try {
        await apiFunctions.patchProject(state.project.id, updates);
      } catch (error) {
        notifyBugsnag(error);
        alert("Error while updating the project");
      }
    })();
  };

  const addBucketDependency = (bucket: Bucket, dependencyId: BucketID) => {
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
        notifyBugsnag(error);
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
        notifyBugsnag(error);
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
        updateProject,
        resetBucketLayer,
        moveTask,
        updateTask,
        resetLayersForAllBuckets,
        getBuckets,
        addBucketDependency,
        removeBucketDependency,
        removeAllBucketDependencies,
        updateBucket,
        moveSubgraph,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

type DataContextType = {
  state: State;

  updateProject: (updates: ProjectUpdates) => void;

  getTasks: () => Task[];
  addTask: (task: Task) => void;
  deleteTask: (taskId: TaskID) => void;
  updateTask: (taskId: TaskID, updates: TaskUpdates) => void;
  moveTask: (toBucketId: BucketID, taskId: TaskID) => void;

  getBuckets: () => Bucket[];
  updateBucket: (bucketId: BucketID, updates: BucketUpdates) => void;
  resetBucketLayer: (bucketId: BucketID) => void;
  moveSubgraph: (bucketId: BucketID, layer: number) => void;

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
