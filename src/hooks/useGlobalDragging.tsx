import React, { createContext, useState, useContext, ReactNode } from "react";

interface GlobalDraggingProviderProps {
  children: ReactNode;
}

interface GlobalDraggingContextType {
  globalDragging: boolean;
  setGlobalDragging: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GlobalDraggingContext = createContext<
  GlobalDraggingContextType | undefined
>(undefined);

export const GlobalDraggingProvider: React.FC<GlobalDraggingProviderProps> = ({
  children,
}): JSX.Element => {
  const [globalDragging, setGlobalDragging] = useState(false);

  return (
    <GlobalDraggingContext.Provider
      value={{ globalDragging, setGlobalDragging }}
    >
      {children}
    </GlobalDraggingContext.Provider>
  );
};

export const useGlobalDragging = (): GlobalDraggingContextType => {
  const context = useContext(GlobalDraggingContext);
  if (!context) {
    throw new Error(
      "useGlobalDragging must be used within a GlobalDraggingProvider",
    );
  }
  return context;
};
