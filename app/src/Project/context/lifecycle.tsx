import React, { createContext, ReactNode, useContext, useState } from "react";

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

const LifecycleContext = createContext<LifecycleContextType | undefined>(
  undefined,
);

interface LifecycleProviderProps {
  children: ReactNode;
}

export const LifecycleProvider: React.FC<LifecycleProviderProps> = ({
  children,
}) => {
  const [lifecycle, setLifecycle] = useState<LifecycleState>(
    LifecycleState.Initialized,
  );

  return (
    <LifecycleContext.Provider value={{ lifecycle, setLifecycle }}>
      {children}
    </LifecycleContext.Provider>
  );
};

export const useLifecycle = (): LifecycleContextType => {
  const context = useContext(LifecycleContext);
  if (!context) {
    throw new Error("useLifecycle must be used within an AppLifecycleProvider");
  }
  return context;
};
