import React, { createContext, useState, useContext, ReactNode } from "react";

interface GlobalGrabbingProviderProps {
  children: ReactNode;
}

interface GlobalGrabbingContextType {
  globalGrabbing: boolean;
  setGlobalGrabbing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const GlobalGrabbingContext = createContext<
  GlobalGrabbingContextType | undefined
>(undefined);

export const GlobalGrabbingProvider: React.FC<GlobalGrabbingProviderProps> = ({
  children,
}): JSX.Element => {
  const [globalGrabbing, setGlobalGrabbing] = useState(false);

  return (
    <GlobalGrabbingContext.Provider
      value={{ globalGrabbing, setGlobalGrabbing }}
    >
      {children}
    </GlobalGrabbingContext.Provider>
  );
};

export const useGlobalGrabbing = (): GlobalGrabbingContextType => {
  const context = useContext(GlobalGrabbingContext);
  if (!context) {
    throw new Error(
      "useGlobalGrabbing must be used within a GlobalGrabbingProvider",
    );
  }
  return context;
};
