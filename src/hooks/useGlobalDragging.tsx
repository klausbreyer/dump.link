import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
} from "react";

import { BucketID, DraggingType } from "../types";

interface GlobalDraggingProviderProps {
  children: ReactNode;
}

type GlobalDraggingState = {
  type: DraggingType;
  bucketId: BucketID;
};

interface GlobalDraggingContextType {
  globalDragging: GlobalDraggingState;
  setGlobalDragging: (type: DraggingType, entity: BucketID) => void;
}

export const GlobalDraggingContext = createContext<
  GlobalDraggingContextType | undefined
>(undefined);

export const GlobalDraggingProvider: React.FC<GlobalDraggingProviderProps> = ({
  children,
}): JSX.Element => {
  const [state, setState] = useState<GlobalDraggingState>({
    type: DraggingType.NONE,
    bucketId: "",
  });

  const setGlobalDragging = useCallback(
    (type: DraggingType, entity: BucketID) => {
      setState((prevState) => ({
        ...prevState,
        type: type,
        bucketId: entity,
      }));
    },
    [],
  );

  console.log(state);

  return (
    <GlobalDraggingContext.Provider
      value={{ globalDragging: state, setGlobalDragging }}
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
