import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
} from "react";

import { BucketID, DraggingType, Task, TaskID } from "../types";

interface GlobalDraggingProviderProps {
  children: ReactNode;
}

type GlobalDraggingState = {
  type: DraggingType;
  bucketId: BucketID;
};

type TemporaryPriority = {
  priority: Task["priority"];
  taskId: TaskID;
};

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

  const [temporaryPriority, setTemporaryPriority] = useState<TemporaryPriority>(
    {
      priority: 0,
      taskId: "",
    },
  );

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

  return (
    <GlobalDraggingContext.Provider
      value={{
        globalDragging: state,
        setGlobalDragging,
        temporaryPriority,
        setTemporaryPriority,
      }}
    >
      {children}
    </GlobalDraggingContext.Provider>
  );
};

interface GlobalDraggingContextType {
  globalDragging: GlobalDraggingState;
  setGlobalDragging: (type: DraggingType, entity: BucketID) => void;
  temporaryPriority: TemporaryPriority;
  setTemporaryPriority: (input: TemporaryPriority) => void;
}

export const useGlobalDragging = (): GlobalDraggingContextType => {
  const context = useContext(GlobalDraggingContext);
  if (!context) {
    throw new Error(
      "useGlobalDragging must be used within a GlobalDraggingProvider",
    );
  }
  return context;
};
