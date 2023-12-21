import {
  ApiMessage,
  Bucket,
  BucketUpdates,
  Dependency,
  Project,
  ProjectUpdates,
  State,
  Task,
  TaskUpdates,
} from "../types";
import { CLIENT_TOKEN } from "./data";
import { ISOToDate, dateToISO } from "./helper_dates";
import { getUsername } from "./helper_requests";

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

    const fetchOptions: RequestInit = {
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
      return {
        ...response,
        project: {
          ...response.project,
          endingAt: response.project.endingAt
            ? ISOToDate(response.project.endingAt)
            : undefined,
          startedAt: ISOToDate(response.project.startedAt),
        },
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
    postTask: (projectId: string, task: Task): Promise<Task> =>
      apiCall({
        url: `/projects/${projectId}/tasks`,
        method: "POST",
        body: task,
      }),
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
    postDependency: (
      projectId: string,
      bucketId: string,
      dependencyId: string,
    ): Promise<Dependency> =>
      apiCall({
        url: `/projects/${projectId}/dependencies`,
        method: "POST",
        body: { bucketId, dependencyId },
      }),
    deleteDependency: (
      projectId: string,
      bucketId: string,
      dependencyId: string,
    ): Promise<boolean> =>
      apiCall({
        url: `/projects/${projectId}/dependencies/${bucketId}/${dependencyId}`,
        method: "DELETE",
      }),
  };
};

export const apiFunctions = createApiFunctions();
