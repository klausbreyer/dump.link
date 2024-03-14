import React, { createContext, ReactNode, useContext, useState } from "react";
import { ErrorState, Loading } from "../../Error";

export enum LifecycleState {
  Initialized = "initialized",
  Loaded = "loaded",
  Error = "error",
  Error404 = "error404",
  Error401 = "error401",
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

  if (
    lifecycle !== LifecycleState.Initialized &&
    lifecycle !== LifecycleState.Loaded
  ) {
    return <ErrorState lifecycle={lifecycle} />;
  }

  console.log(lifecycle);

  return (
    <LifecycleContext.Provider value={{ lifecycle, setLifecycle }}>
      <>
        {lifecycle === LifecycleState.Initialized && <Loading />}
        {children}
      </>
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
