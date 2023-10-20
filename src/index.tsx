import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createRoot } from 'react-dom/client';

import { DataProvider } from './context/data';
import Dump from './Dump';
import Foliation from './Foliation';
import Graph from './Graph';
import { GlobalDraggingProvider } from './hooks/useGlobalDragging';
import { useHashChange } from './hooks/useHashChange'; // Import the custom hook
import Navigation from './Navigation';
import Settings from './Settings';

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
