import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useData } from "./data";
import { bucketsChangedSince } from "./helper_buckets";
import { tasksChangedSince } from "./helper_tasks";
import { dependenciesChanged } from "./helper_dependencies";
import config from "../config";
import { ProjectID } from "../types";

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
  const [acknowledged, setAcknowledged] = useState<boolean>(false);

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
  return MockedDate();
  return date;
};

export const saveAbsence = (projectId: ProjectID) => {
  const key = absenceKey(projectId);
  const now = new Date();
  localStorage.setItem(key, now.toISOString());
};
