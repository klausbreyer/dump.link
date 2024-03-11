import { ISOToDate, dateToISO } from "../utils/dates";
import { NewID, getUsername } from "../utils/requests";

export const CLIENT_TOKEN = NewID(new Date().getTime().toString());

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
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
  User,
} from "../Project/types";

export class APIError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
  }
}

/**
 * Custom hook for making API calls.
 *
 * This hook manages a request queue to ensure that API calls are made in the correct order.
 * If there is an ongoing API call or the user is still authenticating, the API call will be added to the queue.
 * Once the ongoing API call is completed and the user is authenticated, the queued API calls will be processed.
 *
 * @returns An object containing various API methods.
 */
export const useApi = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  const [requestQueue, setRequestQueue] = useState<
    Array<{
      url: string;
      method: string;
      body: any;
      resolve: Function;
      reject: Function;
    }>
  >([]);

  const processQueue = async () => {
    const token = isAuthenticated ? await getAccessTokenSilently() : undefined;

    while (requestQueue.length > 0) {
      const { url, method, body, resolve, reject } = requestQueue.shift()!;

      try {
        const response = await apiCall({ url, method, body, token });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    }
  };

  useEffect(() => {
    if (!isLoading) {
      processQueue();
    }
  }, [isLoading, requestQueue]);

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
    token = "",
  }: {
    url: string;
    method?: string;
    body?: any;
    token?: string;
  }): Promise<any> => {
    const fullUrl = new URL(`/api/v1${url}`, baseUrl);
    fullUrl.searchParams.append("token", CLIENT_TOKEN);

    const headers: {
      "Content-Type": string;
      Authorization?: string;
      Username: string;
    } = {
      "Content-Type": "application/json",
      Username: encodeURIComponent(getUsername()),
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const fetchOptions = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    };

    const response = await fetch(fullUrl.toString(), fetchOptions);
    if (!response.ok) {
      throw new APIError(
        `${response.status} ${response.statusText} ${method} ${fullUrl} -> ${await response.text()}`,
        response.status,
      );
    }
    return await response.json();
  };

  const manageApiCall = (
    url: string,
    method: string = "GET",
    body: any = null,
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (isLoading) {
        setRequestQueue((prevQueue) => [
          ...prevQueue,
          { url, method, body, resolve, reject },
        ]);
      } else {
        getAccessTokenSilently()
          .then((token) => {
            apiCall({ url, method, body, token }).then(resolve).catch(reject);
          })
          .catch((error) => reject(error));
      }
    });
  };

  return {
    getUsers: async (): Promise<User[]> => {
      const response = await manageApiCall("/users");
      return response.users.map(sanitizeUserData);
    },
    getProjects: async (): Promise<Project[]> => {
      const response = await manageApiCall("/projects");
      return response.projects.map(sanitizeProjectData);
    },
    getProject: async (projectId: string): Promise<State> => {
      const response = await apiCall({ url: `/projects/${projectId}` });

      const project = sanitizeProjectData(response.project);

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
    postProject: async (
      name: string,
      appetite: number,
      ownerEmail?: string,
      ownerFirstName?: string,
      ownerLastName?: string,
    ): Promise<Project> => {
      const response = await apiCall({
        url: `/projects`,
        method: "POST",
        body: { name, appetite, ownerEmail, ownerFirstName, ownerLastName },
      });
      return sanitizeProjectData(response.project);
    },
  };
};

const sanitizeProjectData = (projectData: any): Project => {
  return {
    ...projectData,
    endingAt: projectData.endingAt ? ISOToDate(projectData.endingAt) : null,
    startedAt: ISOToDate(projectData.startedAt),
    createdAt: ISOToDate(projectData.createdAt),
    updatedAt: ISOToDate(projectData.updatedAt),
  };
};

const sanitizeUserData = (userData: any): User => {
  return {
    email: userData.email,
    name: userData.name,
    picture: userData.picture,
    userID: userData.user_id,
  };
};

export const useArrayResponse = <T>(apiCall: () => Promise<T>): T | null => {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await apiCall();
      setData(result);
    };

    fetchData();
  }, [apiCall]); // Abhängigkeiten, hier die API-Aufruf-Funktion, damit bei Änderungen neu geladen wird

  return data;
};
