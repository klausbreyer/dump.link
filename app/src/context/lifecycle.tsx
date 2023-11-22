import React, { createContext, ReactNode, useContext, useState } from "react";

// Step 1: Define the Enum for App Lifecycle States
export enum LifecycleState {
  Initialized = "initialized",
  Loaded = "loaded",
  Error = "error",
  Error404 = "error404",
  ErrorApi = "errorSocket",
}

interface LifecycleContextType {
  lifecycle: LifecycleState;
  setLifecycle: React.Dispatch<React.SetStateAction<LifecycleState>>;
}

// Step 2: Create the Context
const LifecycleContext = createContext<LifecycleContextType | undefined>(
  undefined,
);

interface LifecycleProviderProps {
  children: ReactNode;
}

// Step 3: Create the Provider Component
export const LifecycleProvider: React.FC<LifecycleProviderProps> = ({
  children,
}) => {
  const [lifecycle, setLifecycle] = useState<LifecycleState>(
    LifecycleState.Initialized,
  );

  console.log(lifecycle);

  return (
    <LifecycleContext.Provider value={{ lifecycle, setLifecycle }}>
      {children}
    </LifecycleContext.Provider>
  );
};

// Step 4: Create a Custom Hook
export const useLifecycle = (): LifecycleContextType => {
  const context = useContext(LifecycleContext);
  if (!context) {
    throw new Error("useLifecycle must be used within an AppLifecycleProvider");
  }
  return context;
};
