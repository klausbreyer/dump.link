import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createRoot } from "react-dom/client";
import Dump from "./dump";
import { DataProvider } from "./hooks/useData";
import Navigation from "./Navigation";
import { useHashChange } from "./hooks/useHashChange"; // Import the custom hook
import Settings from "./settings";
import Graph from "./graph";
import Foliation from "./foliation";
import { GlobalDraggingProvider } from "./hooks/useGlobalDragging";

const App = function App() {
  const currentHash = useHashChange();

  const renderComponentBasedOnHash = () => {
    switch (currentHash) {
      case "settings":
        return <Settings />;
      case "dump":
        return <Dump />;
      case "graph":
        return <Graph />;
      case "foliation":
        return <Foliation />;
      // Add more cases here for other hash values and their corresponding components
      default:
        return <Dump />;
    }
  };

  return (
    <GlobalDraggingProvider>
      <DataProvider>
        <DndProvider backend={HTML5Backend}>
          <Navigation />
          {renderComponentBasedOnHash()}
        </DndProvider>
      </DataProvider>
    </GlobalDraggingProvider>
  );
};

// After
const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
