import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
} from "react";

import { BucketID, DraggingType, Task, TaskID } from "../types";

interface GlobalInteractionProviderProps {
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

export const GlobalInteractionContext = createContext<
  GlobalInteractionContextType | undefined
>(undefined);

export const GlobalInteractionProvider: React.FC<
  GlobalInteractionProviderProps
> = ({ children }): JSX.Element => {
  const [globalDragging, setGlobalDragging] = useState<GlobalDraggingState>({
    type: DraggingType.NONE,
    bucketId: "",
  });

  const [temporaryPriority, setTemporaryPriority] = useState<TemporaryPriority>(
    {
      priority: 0,
      taskId: "",
    },
  );

  const [hoveredBuckets, setHoveredBuckets] = useState<BucketID[]>([]);

  const updateGlobalDragging = useCallback(
    (type: DraggingType, entity: BucketID) => {
      setGlobalDragging((prevState) => ({
        ...prevState,
        type: type,
        bucketId: entity,
      }));
    },
    [],
  );

  const updateHoveredBuckets = useCallback(
    (buckets: BucketID[]) => {
      setHoveredBuckets(buckets);
    },
    [setHoveredBuckets],
  );

  return (
    <GlobalInteractionContext.Provider
      value={{
        hoveredBuckets,
        updateHoveredBuckets,
        globalDragging,
        updateGlobalDragging,
        temporaryPriority,
        setTemporaryPriority,
      }}
    >
      {children}
    </GlobalInteractionContext.Provider>
  );
};

interface GlobalInteractionContextType {
  hoveredBuckets: BucketID[];
  updateHoveredBuckets: (input: BucketID[]) => void;
  globalDragging: GlobalDraggingState;
  updateGlobalDragging: (type: DraggingType, entity: BucketID) => void;
  temporaryPriority: TemporaryPriority;
  setTemporaryPriority: (input: TemporaryPriority) => void;
}

export const useGlobalInteraction = (): GlobalInteractionContextType => {
  const context = useContext(GlobalInteractionContext);
  if (!context) {
    throw new Error(
      "useGlobalInteraction must be used within a GlobalInteractionProvider",
    );
  }
  return context;
};
