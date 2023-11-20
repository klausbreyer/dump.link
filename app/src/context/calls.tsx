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

    const newTask: Task = await response.json();
    return newTask;
  } catch (error) {
    throw error;
  }
};
