import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

export enum LifecycleState {
  Initialized = "initialized",
  Loaded = "loaded",
  Error = "error",
  Error404 = "error404",
  Error401 = "error401",
  ErrorApi = "errorApi",
}

interface LifecycleContextType {
  lifecycle: LifecycleState;
  setLifecycle: Dispatch<SetStateAction<LifecycleState>>;
}

const LifecycleContext = createContext<LifecycleContextType | undefined>(
  undefined,
);

interface LifecycleProviderProps {
  children: ReactNode;
}

export const LifecycleProvider: FC<LifecycleProviderProps> = ({ children }) => {
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
    throw new Error("useLifecycle must be used within a LifecycleProvider");
  }
  return context;
};

export function NotFoundPage() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="text-slate-500">Route not found</div>
    </div>
  );
}

export const Loading: FC = () => (
  <div className="flex items-center justify-center w-screen h-screen">
    <div className="animate-pulse">Loading...</div>
  </div>
);

type ErrorStateProps = {
  lifecycle: LifecycleState;
};

export const ErrorState: FC<ErrorStateProps> = ({ lifecycle }) => {
  let error = "Something went wrong :(";
  switch (lifecycle) {
    case LifecycleState.Error404:
      error = "404 :(";
      break;
    case LifecycleState.Error401:
      error = "401 - Unauthorized";
      break;
    case LifecycleState.ErrorApi:
      error = "API Error";
      break;
  }

  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="text-rose-500">{error}</div>
    </div>
  );
};
