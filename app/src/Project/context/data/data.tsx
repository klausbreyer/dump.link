import React, { createContext, useContext, useEffect, useReducer } from "react";

import {
  Activity,
  Bucket,
  BucketID,
  BucketUpdates,
  Dependency,
  Project,
  ProjectID,
  ProjectUpdates,
  State,
  Task,
  TaskID,
  TaskUpdates,
  UserName,
} from "../../types";

import { useParams } from "react-router-dom";
import { notifyBugsnag } from "../../..";
import config from "../../../config";
import { LifecycleState, useLifecycle } from "../lifecycle";
import { APIError, apiFunctions } from "./calls";
import {
  getUniqueDependingIdsForbucket,
  hasCyclicDependencyWithBucket,
} from "./dependencies";
import { getLayerForBucketId } from "./layers";
import { NewID, getUsername, saveProjectIdToLocalStorage } from "./requests";
import { setupWebSocket } from "./websocket";

export const CLIENT_TOKEN = NewID(new Date().getTime().toString());

const initialState: State = {
  buckets: [],
  tasks: [],
  dependencies: [],
  activities: [],
  project: {
    id: "",
    name: "",
    appetite: 0,
    startedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    endingAt: null,
    archived: false,
    updatedBy: "",
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
  | { type: "RESET_PROJECT_LAYERS" }
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
      createdBy: UserName;
      createdAt: Date;
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
    }
  | {
      type: "UPDATE_ACTIVITIES";
      activities: Activity[];
    };

const DataContext = createContext<DataContextType | undefined>(undefined);
const dataReducer = (state: State, action: ActionType): State => {
  console.log(action);

  switch (action.type) {
    case "SET_INITIAL_STATE":
      return action.payload;

    case "UPDATE_PROJECT": {
      const { updates } = action;

      const updatedProject = reconsileProjectUpdate(state.project, updates);

      return {
        ...state,
        project: updatedProject,
      };
    }

    case "ADD_TASK": {
      const { task } = action;

      if (!task.createdAt) task.createdAt = new Date();
      if (!task.updatedAt) task.updatedAt = new Date();

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

    case "UPDATE_ACTIVITIES": {
      const { activities } = action;

      return {
        ...state,
        activities: activities,
      };
    }

    case "RESET_PROJECT_LAYERS": {
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
      const { bucketId, dependencyId, createdBy, createdAt } = action;

      // Creating a new dependency object
      const newDependency = { bucketId, dependencyId, createdBy, createdAt };

      return {
        ...state,
        dependencies: [...state.dependencies, newDependency],
      };
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

  const params = useParams();
  const { projectId } = params;

  const loadInitialState = async (projectId: ProjectID) => {
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
    if (!projectId) return;
    if (!getUsername()) {
      let username = prompt(
        "Please enter your name as you would like your team to see it",
      );
      if (!username) {
        username = "";
      }
      localStorage.setItem("username", username);
    }
    loadInitialState(projectId);
  }, [projectId]);

  useEffect(() => {
    if (!state.project.id) return;
    const wsCleanup = setupWebSocket(state.project.id, dispatch, () =>
      loadInitialState(state.project.id),
    );
    // can only make calls when state is there, because it needs a project.id

    if (state.project.id.length === 11) {
      updateActivities(undefined, undefined);
    }

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
      priority: highestPriority + config.PROJECT_PRIORITY_INCREMENT,
    };
    updateTask(taskId, updates);
  };

  const updateTask = (taskId: TaskID, updates: TaskUpdates) => {
    updates = addUpdatedByToEntity(updates);
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
    updates = addUpdatedByToEntity(updates);
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
      type: "RESET_PROJECT_LAYERS",
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
    updates = addUpdatedByToEntity(updates);
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
      createdBy: getUsername(),
      createdAt: new Date(),
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

  const updateActivities = (
    bucketId: BucketID | undefined,
    taskId: TaskID | undefined,
  ) => {
    const update = {
      bucketId: bucketId,
      taskId: taskId,
      createdAt: new Date(),
      projectId: state.project.id,
      createdBy: getUsername(),
    };

    const updatedActivities = reconsileActivityUpdates(
      state.activities,
      update,
    );

    dispatch({
      type: "UPDATE_ACTIVITIES",
      activities: updatedActivities,
    });

    (async () => {
      try {
        await apiFunctions.postActivity(state.project.id, update);
      } catch (error) {
        notifyBugsnag(error);
        alert("Error while updating activity");
      }
    })();
  };

  console.dir(state);

  return (
    <DataContext.Provider
      value={{
        state,
        project: state.project,
        tasks: state.tasks,
        buckets: state.buckets,
        dependencies: state.dependencies,
        activities: state.activities,
        updateActivities,
        addTask,
        deleteTask,
        updateProject,
        resetBucketLayer,
        moveTask,
        updateTask,
        resetLayersForAllBuckets,
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
  project: Project;
  updateProject: (updates: ProjectUpdates) => void;

  activities: Activity[];
  updateActivities: (
    bucketId: BucketID | undefined,
    taskId: TaskID | undefined,
  ) => void;

  tasks: Task[];
  addTask: (task: Task) => void;
  deleteTask: (taskId: TaskID) => void;
  updateTask: (taskId: TaskID, updates: TaskUpdates) => void;
  moveTask: (toBucketId: BucketID, taskId: TaskID) => void;

  buckets: Bucket[];
  updateBucket: (bucketId: BucketID, updates: BucketUpdates) => void;
  resetBucketLayer: (bucketId: BucketID) => void;
  moveSubgraph: (bucketId: BucketID, layer: number) => void;

  dependencies: Dependency[];
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
    ...(updates.updatedBy !== undefined && { updatedBy: updates.updatedBy }),
  };
}

function reconsileBucketUpdate(bucket: Bucket, updates: BucketUpdates): Bucket {
  return {
    ...bucket,
    ...(updates.name !== undefined && { name: updates.name }),
    ...(updates.layer !== undefined && { layer: updates.layer }),
    ...(updates.flagged !== undefined && { flagged: updates.flagged }),
    ...(updates.done !== undefined && { done: updates.done }),
    ...(updates.updatedBy !== undefined && { updatedBy: updates.updatedBy }),
  };
}

function reconsileProjectUpdate(
  project: Project,
  updates: ProjectUpdates,
): Project {
  return {
    ...project,
    ...(updates.name !== undefined && { name: updates.name }),
    ...(updates.startedAt !== undefined && { startedAt: updates.startedAt }),
    ...(updates.endingAt !== undefined && { endingAt: updates.endingAt }),
    ...(updates.appetite !== undefined && { appetite: updates.appetite }),
    ...(updates.archived !== undefined && { archived: updates.archived }),
    ...(updates.updatedBy !== undefined && { updatedBy: updates.updatedBy }),
  };
}

function reconsileActivityUpdates(
  activities: Activity[],
  update: Activity,
): Activity[] {
  // Check if the update is already in the activities array
  const updateExists = activities.some(
    (activity) => activity.createdBy === update.createdBy,
  );

  // If the update does not exist, add it to the activities array
  if (!updateExists) {
    activities.push(update);
  }

  // Go through all activities and update the ones that match the update based on username
  return activities
    .map((activity) => {
      if (activity.createdBy === update.createdBy) {
        if (update.bucketId === undefined && update.taskId === undefined) {
          return undefined;
        }
        return update;
      }
      return activity;
    })
    .filter((activity) => activity !== undefined) as Activity[];
}

function addUpdatedByToEntity<T extends { updatedBy?: string }>(entity: T): T {
  return { ...entity, updatedBy: getUsername() };
}
