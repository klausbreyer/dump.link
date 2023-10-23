import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createRoot } from "react-dom/client";

import { DataProvider } from "./context/data";
import Grouping from "./Grouping";
import Ordering from "./Ordering";
import Sequencing from "./Sequencing";
import { GlobalDraggingProvider } from "./hooks/useGlobalDragging";
import Navigation from "./Navigation";
import Settings from "./Settings";
import { useQueryParamChange } from "./hooks/useQueryParamChange";
import { TabContext } from "./types";

const App = function App() {
  const currentQueryParam = useQueryParamChange("p");

  const renderComponentBasedOnQueryParam = () => {
    switch (currentQueryParam) {
      case TabContext.Settings:
        return <Settings />;
      case TabContext.Grouping:
        return <Grouping />;
      case TabContext.Sequencing:
        return <Sequencing />;
      case TabContext.Ordering:
        return <Ordering />;
      // Add more cases here for other query param values and their corresponding components
      default:
        return <Grouping />;
    }
  };

  return (
    <GlobalDraggingProvider>
      <DataProvider>
        <DndProvider backend={HTML5Backend}>
          <Navigation />
          {renderComponentBasedOnQueryParam()}
        </DndProvider>
      </DataProvider>
    </GlobalDraggingProvider>
  );
};

// After
const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
