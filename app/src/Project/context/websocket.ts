import { Dispatch } from "react";
import { CLIENT_TOKEN } from "../../hooks/useApi";
import { ISOToDate } from "../../utils/dates";
import { ActionType } from "./data";

type DispatchType = Dispatch<ActionType>;
export const setupWebSocket = (
  projectId: string,
  token: string,
  dispatch: DispatchType,
  onReconnect: () => void,
) => {
  if (!projectId) return;

  let ws: WebSocket | null = null;
  let retries = 0;
  let hasAttemptedReconnect = false;
  const maxRetries = 5;

  const connectWebSocket = () => {
    const wsURL = new URL(
      process.env.NODE_ENV === "production" &&
      window.location.hostname !== "localhost"
        ? `wss://${window.location.host}/api/v1/ws/${projectId}`
        : `ws://localhost:8080/api/v1/ws/${projectId}`,
    );

    wsURL.searchParams.append("Authorization", `Bearer ${token}`);
    wsURL.searchParams.append("client", CLIENT_TOKEN);
    ws = new WebSocket(wsURL.href);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message, dispatch);
    };

    ws.onopen = () => {
      if (hasAttemptedReconnect) {
        onReconnect();
        hasAttemptedReconnect = false;
      }
      retries = 0;
    };

    ws.onclose = (e) => {
      if (retries < maxRetries) {
        setTimeout(connectWebSocket, Math.pow(2, retries) * 1000);
        retries++;
        hasAttemptedReconnect = true;
      }
    };
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      ws?.close();
    };
  };

  connectWebSocket();

  return () => {
    ws?.close();
  };
};

const handleWebSocketMessage = (message: any, dispatch: DispatchType) => {
  switch (message.action) {
    case "UPDATE_PROJECT":
      const updates = {
        ...message.data,
        startedAt: ISOToDate(message.data.startedAt),
      };
      dispatch({
        type: "UPDATE_PROJECT",
        updates: updates,
      });
      break;
    case "ADD_TASK":
      const task = {
        ...message.data,
        createdAt: ISOToDate(message.data.createdAt),
        updatedAt: ISOToDate(message.data.updatedAt),
      };
      dispatch({
        type: "ADD_TASK",
        task,
      });
      break;
    case "DELETE_TASK":
      dispatch({
        type: "DELETE_TASK",
        taskId: message.data.taskId,
      });
      break;
    case "UPDATE_TASK":
      dispatch({
        type: "UPDATE_TASK",
        taskId: message.data.id,
        updates: message.data,
      });
      break;
    case "UPDATE_BUCKET":
      dispatch({
        type: "UPDATE_BUCKET",
        bucketId: message.data.id,
        updates: message.data,
      });
      break;
    case "ADD_BUCKET_DEPENDENCY":
      dispatch({
        type: "ADD_BUCKET_DEPENDENCY",
        bucketId: message.data.bucketId,
        dependencyId: message.data.dependencyId,
        createdBy: message.data.createdBy,
        createdAt: ISOToDate(message.data.createdAt),
      });
      break;
    case "REMOVE_BUCKET_DEPENDENCY":
      dispatch({
        type: "REMOVE_BUCKET_DEPENDENCY",
        bucketId: message.data.bucketId,
        dependencyId: message.data.dependencyId,
      });
      break;
    case "RESET_PROJECT_LAYERS":
      dispatch({
        type: "RESET_PROJECT_LAYERS",
      });
      break;
    case "UPDATE_ACTIVITIES":
      const activities = message.data.map((activity: any) => ({
        ...activity,
        createdAt: ISOToDate(activity.createdAt),
      }));
      dispatch({
        type: "UPDATE_ACTIVITIES",
        activities,
      });
      break;
  }
};
