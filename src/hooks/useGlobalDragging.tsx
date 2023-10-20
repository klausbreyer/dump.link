import React, { createContext, ReactNode, useContext, useState } from 'react';

import { DraggingType } from '../types';

interface GlobalDraggingProviderProps {
  children: ReactNode;
}

interface GlobalDraggingContextType {
  globalDragging: DraggingType;
  setGlobalDragging: React.Dispatch<React.SetStateAction<DraggingType>>;
}

export const GlobalDraggingContext = createContext<
  GlobalDraggingContextType | undefined
>(undefined);

export const GlobalDraggingProvider: React.FC<GlobalDraggingProviderProps> = ({
  children,
}): JSX.Element => {
  const [globalDragging, setGlobalDragging] = useState(DraggingType.NONE);

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
