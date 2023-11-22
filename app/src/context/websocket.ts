import { Dispatch, useEffect } from "react";
import { ActionType, CLIENT_TOKEN } from "./data";

type DispatchType = Dispatch<ActionType>;
export const setupWebSocket = (projectId: string, dispatch: DispatchType) => {
  if (!projectId) return;

  const wsURL = new URL(
    process.env.NODE_ENV === "production"
      ? `wss://${window.location.host}/api/v1/ws/${projectId}`
      : `ws://localhost:8080/api/v1/ws/${projectId}`,
  );
  wsURL.searchParams.append("token", CLIENT_TOKEN);
  const ws = new WebSocket(wsURL.href);

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    // Hier wird `dispatch` verwendet, wie zuvor in der useEffect-Methode
    handleWebSocketMessage(message, dispatch);
  };

  return () => {
    ws.close();
  };
};

const handleWebSocketMessage = (message: any, dispatch: DispatchType) => {
  switch (message.action) {
    case "ADD_TASK":
      dispatch({
        type: "ADD_TASK",
        task: message.data,
      });
      break;
    case "DELETE_TASK":
      dispatch({
        type: "DELETE_TASK",
        taskId: message.taskId,
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
  }
};