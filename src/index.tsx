import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createRoot } from "react-dom/client";
import Dump from "./dump";
import { TaskProvider } from "./context/useTasks";

const App = function App() {
  return (
    <TaskProvider>
      <DndProvider backend={HTML5Backend}>
        <Dump />
      </DndProvider>
    </TaskProvider>
  );
};

// After
const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
