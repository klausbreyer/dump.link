import React from "react";

import { createRoot } from "react-dom/client";
import Dump from "./dump";

const App = function App() {
  return <Dump />;
};

// After
const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
