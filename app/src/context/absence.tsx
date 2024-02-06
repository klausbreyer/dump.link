import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import config from "../config";
import {
  Bucket,
  BucketID,
  Dependency,
  ProjectID,
  Task,
  TaskID,
} from "../types";
import { useData } from "./data/data";

const AbsenceContext = createContext<AbsenceContextType | undefined>(undefined);

export const useAbsence = () => {
  const context = useContext(AbsenceContext);
  if (!context) {
    throw new Error("useAbsence must be used within a AbsenceProvider");
  }
  return context;
};

interface AbsenceProviderProps {
  children: ReactNode;
}
export const AbsenceProvider: React.FC<AbsenceProviderProps> = ({
  children,
}) => {
  const { buckets, tasks, dependencies, project } = useData();
  const [lastVisit, setLastVisit] = useState<Date>(new Date());
  const [currentVisit, _] = useState<Date>(new Date());
  const [acknowledged, setAcknowledged] = useState<boolean>(true);

  useSaveActivity(project);

  useEffect(() => {
    const retrievedLastVisit = getAbsence(project.id);
    if (!retrievedLastVisit) return;
    setLastVisit(retrievedLastVisit);
  }, [project.id]);

  const numChanges =
    bucketsChangedSince(buckets, lastVisit, currentVisit).length +
    tasksChangedSince(tasks, lastVisit, currentVisit).length +
    dependenciesChangedSince(dependencies, lastVisit, currentVisit).length;

  useEffect(() => {
    if (numChanges === 0) return;
    setAcknowledged(false);
  }, [numChanges]);

  const bucketsDuringAbsence = (buckets: Bucket[]) => {
    return bucketsChangedSince(buckets, lastVisit, currentVisit);
  };

  const tasksDuringAbsence = (tasks: Task[]) => {
    return tasksChangedSince(tasks, lastVisit, currentVisit);
  };

  const dependenciesDuringAbsence = (dependencies: Dependency[]) => {
    return dependenciesChangedSince(dependencies, lastVisit, currentVisit);
  };
  return (
    <AbsenceContext.Provider
      value={{
        lastVisit,
        numChanges,
        acknowledged,
        setAcknowledged,
        bucketsDuringAbsence,
        tasksDuringAbsence,
        dependenciesDuringAbsence,
      }}
    >
      {children}
    </AbsenceContext.Provider>
  );
};

interface AbsenceContextType {
  lastVisit: Date;
  numChanges: number;
  acknowledged: boolean;
  setAcknowledged: (input: boolean) => void;
  bucketsDuringAbsence: (buckets: Bucket[]) => Bucket[];
  tasksDuringAbsence: (tasks: Task[]) => Task[];
  dependenciesDuringAbsence: (dependencies: Dependency[]) => Dependency[];
}

const useSaveActivity = (project: { id: ProjectID }) => {
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (project.id.length === 11) {
        saveAbsence(project.id);
      }
    }, config.ACTIVITY_INTERVAL);

    const handleUnload = () => {
      saveAbsence(project.id);
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [project.id]);
};

export const absenceKey = (projectId: ProjectID): string => {
  return `absence_${projectId}`;
};

function MockedDate(): Date {
  const mocked = new Date();
  mocked.setMinutes(mocked.getMinutes() - 10);
  return mocked;
}

export const getAbsence = (projectId: ProjectID): Date | null => {
  const key = absenceKey(projectId);

  const dateString = localStorage.getItem(key);

  if (!dateString) return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return null;
  }
  // return MockedDate();
  return date;
};

export const saveAbsence = (projectId: ProjectID) => {
  const key = absenceKey(projectId);
  const now = new Date();
  localStorage.setItem(key, now.toISOString());
};

export const bucketsChangedSince = (
  buckets: Bucket[],
  from: Date,
  to: Date,
) => {
  return buckets.filter(
    (bucket) =>
      bucket.updatedAt > from &&
      bucket.updatedAt < to &&
      // ignore buckets that were never changed. By default they have after creation same createdAt and updatedAt
      bucket.updatedAt.getTime() !== bucket.createdAt.getTime(),
  );
};

export function checkIfBucketIDExists(
  buckets: Bucket[],
  id: BucketID,
): boolean {
  return buckets.some((bucket) => bucket.id === id);
}

export const tasksChangedSince = (tasks: Task[], from: Date, to: Date) => {
  return tasks.filter((task) => task.updatedAt > from && task.updatedAt < to);
};

export function checkIfTaskIDExists(tasks: Task[], id: TaskID): boolean {
  return tasks.some((task) => task.id === id);
}

export const dependenciesChangedSince = (
  dependencies: Dependency[],
  from: Date,
  to: Date,
) => {
  return dependencies.filter(
    (bucket) => bucket.createdAt > from && bucket.createdAt < to,
  );
};

export function checkIfDependencyExists(
  dependencies: Dependency[],
  id: BucketID,
): boolean {
  return dependencies.some((dependency) => dependency.bucketId === id);
}
