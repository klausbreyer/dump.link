import { Dispatch } from "react";
import { ActionType, CLIENT_TOKEN } from "./data";
import { ISOToDate } from "./helper";

type DispatchType = Dispatch<ActionType>;
export const setupWebSocket = (projectId: string, dispatch: DispatchType) => {
  if (!projectId) return;

  let ws: WebSocket | null = null;
  let retries = 0;
  const maxRetries = 5;

  const connectWebSocket = () => {
    const wsURL = new URL(
      process.env.NODE_ENV === "production"
        ? `wss://${window.location.host}/api/v1/ws/${projectId}`
        : `ws://localhost:8080/api/v1/ws/${projectId}`,
    );
    wsURL.searchParams.append("token", CLIENT_TOKEN);
    ws = new WebSocket(wsURL.href);

    ws.onopen = () => {
      retries = 0;
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message, dispatch);
    };

    ws.onclose = (e) => {
      if (retries < maxRetries) {
        setTimeout(connectWebSocket, Math.pow(2, retries) * 1000);
        retries++;
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
      console.log(message.data);
      console.log(message.data.startedAt);
      console.log(ISOToDate(message.data.startedAt));

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
      dispatch({
        type: "ADD_TASK",
        task: message.data,
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
      });
      break;
    case "REMOVE_BUCKET_DEPENDENCY":
      dispatch({
        type: "REMOVE_BUCKET_DEPENDENCY",
        bucketId: message.data.bucketId,
        dependencyId: message.data.dependencyId,
      });
      break;
    case "RESET_LAYERS_FOR_ALL_BUCKETS":
      dispatch({
        type: "RESET_LAYERS_FOR_ALL_BUCKETS",
      });
      break;
  }
};
