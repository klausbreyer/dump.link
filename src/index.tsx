import React from "react";

import { createRoot } from "react-dom/client";

const App = function App() {
  return <div className="bg-slate-100">hi</div>;
};

// After
const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
