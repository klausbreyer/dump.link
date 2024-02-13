import {
  ActivityUpdates,
  ApiMessage,
  Bucket,
  BucketUpdates,
  Dependency,
  Project,
  ProjectUpdates,
  State,
  Task,
  TaskUpdates,
} from "../../types";
import { CLIENT_TOKEN } from "./data";
import { ISOToDate, dateToISO } from "./dates";
import { getUsername } from "./requests";

export class APIError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
  }
}
const createApiFunctions = () => {
  const baseUrl = new URL(
    process.env.NODE_ENV === "production" &&
    window.location.hostname !== "localhost"
      ? `${window.location.origin}/api/v1`
      : "http://localhost:8080/api/v1",
  );
  const apiCall = async ({
    url = "",
    method = "GET",
    body = null,
  }: {
    url: string;
    method?: string;
    body?: any;
  }): Promise<any> => {
    const fullUrl = new URL(`/api/v1${url}`, baseUrl);
    fullUrl.searchParams.append("token", CLIENT_TOKEN);

    const fetchOptions = {
      method,
      headers: {
        "Content-Type": "application/json",
        Username: getUsername(),
      },
      body: body ? JSON.stringify(body) : null,
    };

    try {
      const response = await fetch(fullUrl, fetchOptions);
      if (!response.ok) {
        throw new APIError(
          `${response.status} ${
            response.statusText
          } ${method} ${fullUrl} -> ${await response.text()}`,
          response.status,
        );
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    getProject: async (projectId: string): Promise<State> => {
      const response = await apiCall({ url: `/projects/${projectId}` });
      const project = {
        ...response.project,
        endingAt: response.project.endingAt
          ? ISOToDate(response.project.endingAt)
          : null,
        startedAt: ISOToDate(response.project.startedAt),
        createdAt: ISOToDate(response.project.createdAt),
        updatedAt: ISOToDate(response.project.updatedAt),
      };

      const tasks = response.tasks.map((task: any) => ({
        ...task,
        createdAt: ISOToDate(task.createdAt),
        updatedAt: ISOToDate(task.updatedAt),
      }));

      const buckets = response.buckets.map((bucket: any) => ({
        ...bucket,
        createdAt: ISOToDate(bucket.createdAt),
        updatedAt: ISOToDate(bucket.updatedAt),
      }));

      const dependencies = response.dependencies.map((dependency: any) => ({
        ...dependency,
        createdAt: ISOToDate(dependency.createdAt),
      }));

      return {
        project,
        tasks,
        buckets,
        dependencies,
        activities: response.activities,
      };
    },
    patchProject: async (
      projectId: string,
      updateData: ProjectUpdates,
    ): Promise<Project> => {
      const updatedData = {
        ...updateData,
        startedAt: updateData.startedAt
          ? dateToISO(updateData.startedAt)
          : undefined,
        endingAt: updateData.endingAt
          ? dateToISO(updateData.endingAt)
          : undefined,
      };

      const response = await apiCall({
        url: `/projects/${projectId}`,
        method: "PATCH",
        body: updatedData,
      });

      return {
        ...response,
        startedAt: ISOToDate(response.startedAt),
      };
    },
    postProjectResetLayers: (projectId: string): Promise<ApiMessage> =>
      apiCall({ url: `/projects/${projectId}/resetLayers`, method: "POST" }),
    postTask: async (projectId: string, task: Task): Promise<Task> => {
      const response = await apiCall({
        url: `/projects/${projectId}/tasks`,
        method: "POST",
        body: task,
      });

      return {
        ...response,
        createdAt: ISOToDate(response.createdAt),
        updatedAt: ISOToDate(response.updatedAt),
      };
    },
    deleteTask: (projectId: string, taskId: string): Promise<boolean> =>
      apiCall({
        url: `/projects/${projectId}/tasks/${taskId}`,
        method: "DELETE",
      }),
    patchTask: (
      projectId: string,
      taskId: string,
      updateData: TaskUpdates,
    ): Promise<Task> =>
      apiCall({
        url: `/projects/${projectId}/tasks/${taskId}`,
        method: "PATCH",
        body: updateData,
      }),
    patchBucket: (
      projectId: string,
      bucketId: string,
      updateData: BucketUpdates,
    ): Promise<Bucket> =>
      apiCall({
        url: `/projects/${projectId}/buckets/${bucketId}`,
        method: "PATCH",
        body: updateData,
      }),
    postBucketResetLayer: (
      projectId: string,
      bucketId: string,
    ): Promise<Bucket> =>
      apiCall({
        url: `/projects/${projectId}/buckets/${bucketId}/resetLayers`,
        method: "POST",
      }),
    postDependency: async (
      projectId: string,
      bucketId: string,
      dependencyId: string,
    ): Promise<Dependency> => {
      const response = await apiCall({
        url: `/projects/${projectId}/dependencies`,
        method: "POST",
        body: { bucketId, dependencyId },
      });

      return {
        ...response,
        createdAt: response.createdAt ? ISOToDate(response.createdAt) : null,
        updatedAt: response.updatedAt ? ISOToDate(response.updatedAt) : null,
      };
    },
    deleteDependency: (
      projectId: string,
      bucketId: string,
      dependencyId: string,
    ): Promise<boolean> =>
      apiCall({
        url: `/projects/${projectId}/dependencies/${bucketId}/${dependencyId}`,
        method: "DELETE",
      }),
    postActivity: (
      projectId: string,
      updateData: ActivityUpdates,
    ): Promise<any> =>
      apiCall({
        url: `/projects/${projectId}/activities`,
        method: "POST",
        body: updateData,
      }),
  };
};

export const apiFunctions = createApiFunctions();
