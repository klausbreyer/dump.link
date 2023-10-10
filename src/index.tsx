import React from "react";

import { createRoot } from "react-dom/client";
import Dump from "./dump";
import { TaskProvider } from "./context/useTasks";

const App = function App() {
  return (
    <TaskProvider>
      <Dump />
    </TaskProvider>
  );
};

// After
const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
