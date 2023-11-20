import { Bucket, Dependency, State, Task } from "../types";

export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:8080";

export function transformApiResponseToProject(apiResponse: any): State {
  // Mapping tasks
  const tasks: Task[] = apiResponse.tasks.map((task: any) => ({
    id: task.id,
    bucketId: task.bucketId,
    title: task.title,
    closed: task.closed,
    priority: task.priority,
  }));

  // Mapping buckets without nested tasks
  const buckets: Bucket[] = apiResponse.buckets.map((bucket: any) => ({
    id: bucket.id,
    projectId: bucket.projectId,
    name: bucket.name,
    done: bucket.done,
    dump: bucket.dump,
    layer: bucket.layer ?? undefined, // Convert 'null' in API response to 'undefined'
    flagged: bucket.flagged,
  }));

  // Mapping dependencies
  const dependencies: Dependency[] = apiResponse.dependencies.map(
    (dep: any) => ({
      bucketId: dep.bucketId,
      dependencyId: dep.dependencyId,
    }),
  );

  // Constructing the entire State object
  return {
    project: {
      id: apiResponse.project.id,
      name: apiResponse.project.name,
      startedAt: new Date(apiResponse.project.startedAt),
      appetite: apiResponse.project.appetite,
    },
    buckets: buckets,
    tasks: tasks,
    dependencies: dependencies,
  };
}

export const apiGetProject = async (
  projectId: string,
): Promise<State | null> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/projects/${projectId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const transformedData = transformApiResponseToProject(data);

    return transformedData;
  } catch (error) {
    console.error("Fehler beim Laden des Initialzustands:", error);
    return null;
  }
};

export const apiPostTask = async (
  projectId: string,
  task: Task,
): Promise<Task> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/projects/${projectId}/tasks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    return json.task;
  } catch (error) {
    throw error;
  }
};

export const apiDeleteTask = async (
  projectId: string,
  taskId: string,
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/projects/${projectId}/tasks/${taskId}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true; // Erfolgreiches Löschen
  } catch (error) {
    console.error("Error while deleting the task:", error);
    return false; // Fehler beim Löschen
  }
};

export type TaskUpdateData = {
  title?: string;
  closed?: boolean;
  priority?: number;
};

export const apiPatchTask = async (
  projectId: string,
  taskId: string,
  updateData: TaskUpdateData,
): Promise<Task | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/projects/${projectId}/tasks/${taskId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedTask: Task = await response.json();
    return updatedTask;
  } catch (error) {
    console.error("Error while updating the task:", error);
    return null;
  }
};
