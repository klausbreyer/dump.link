import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useData } from "./data";
import { dependenciesChanged } from "./helper_dependencies";
import config from "../config";
import {
  Bucket,
  BucketID,
  Dependency,
  ProjectID,
  Task,
  TaskID,
} from "../types";

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
  const [currentVisit, setCurrentVisit] = useState<Date>(new Date());
  const [acknowledged, setAcknowledged] = useState<boolean>(true);

  useEffect(() => {
    if (project.id.length !== 11) return;
    const intervalId = setInterval(
      () => saveAbsence(project.id),
      config.ACTIVITY_INTERVAL,
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [project.id]);

  useEffect(() => {
    const retrievedLastVisit = getAbsence(project.id);
    if (!retrievedLastVisit) return;
    setLastVisit(retrievedLastVisit);
  }, [project.id]);

  const numChanges =
    bucketsChangedSince(buckets, lastVisit).length +
    tasksChangedSince(tasks, lastVisit).length +
    dependenciesChanged(dependencies, lastVisit).length;

  useEffect(() => {
    if (numChanges === 0) return;
    setAcknowledged(false);
  }, [numChanges]);

  return (
    <AbsenceContext.Provider
      value={{ lastVisit, numChanges, acknowledged, setAcknowledged }}
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
}

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

export const bucketsDuringAbsence = (
  buckets: Bucket[],
  projectId: ProjectID,
) => {
  const lastVisit = getAbsence(projectId);
  if (!lastVisit) {
    return [];
  }
  return bucketsChangedSince(buckets, lastVisit);
};

export const bucketsChangedSince = (buckets: Bucket[], date: Date) => {
  return buckets.filter(
    (bucket) =>
      bucket.updatedAt > date &&
      bucket.updatedAt.getTime() !== bucket.createdAt.getTime(),
  );
};

export function checkIfBucketIDExists(
  buckets: Bucket[],
  id: BucketID,
): boolean {
  return buckets.some((bucket) => bucket.id === id);
}

export const tasksDuringAbsence = (tasks: Task[], projectId: ProjectID) => {
  const lastVisit = getAbsence(projectId);
  if (!lastVisit) {
    return [];
  }
  return tasksChangedSince(tasks, lastVisit);
};

export const tasksChangedSince = (tasks: Task[], date: Date) => {
  console.log(tasks);

  return tasks.filter((task) => task.updatedAt > date);
};

export function checkIfTaskIDExists(tasks: Task[], id: TaskID): boolean {
  return tasks.some((task) => task.id === id);
}

export const dependenciesDuringAbsence = (
  dependencies: Dependency[],
  projectId: ProjectID,
) => {
  const lastVisit = getAbsence(projectId);
  if (!lastVisit) {
    return [];
  }
  return dependenciesChangedSince(dependencies, lastVisit);
};

export const dependenciesChangedSince = (
  dependencies: Dependency[],
  date: Date,
) => {
  return dependencies.filter((bucket) => bucket.createdAt > date);
};

export function checkIfDependencyExists(
  dependencies: Dependency[],
  id: BucketID,
): boolean {
  return dependencies.some((dependency) => dependency.bucketId === id);
}
