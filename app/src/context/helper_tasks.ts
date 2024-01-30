import { Bucket, BucketID, ProjectID, Task, TaskID } from "../types";
import { getAbsence } from "./absence";
import {
  getBucketForTask,
  getClosedBucketType,
  getOpenBucketType,
} from "./helper_buckets";

export const getTask = (tasks: Task[], taskId: TaskID) => {
  // Find and return the task with the matching ID in the tasks array
  return tasks.find((t) => t.id === taskId);
};

export const getTaskIndex = (tasks: Task[], taskId: TaskID): number => {
  // Find and return the index of the task in the tasks array
  return tasks.findIndex((t) => t.id === taskId);
};

export const getTasksForBucket = (
  tasks: Task[],
  bucketId: BucketID,
): Task[] => {
  // Filter and return tasks that belong to the given bucket
  return tasks.filter((task) => task.bucketId === bucketId);
};

export function calculateHighestPriority(tasks: Task[]) {
  let highestPriority = 0;
  tasks.forEach((task) => {
    if (task.priority > highestPriority) {
      highestPriority = task.priority;
    }
  });
  return highestPriority;
}

export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => a.priority - b.priority);
};

//it is there, from the api. But I do not want to have it in the rest of the app.
type TaskWithUpdatedAt = Task & {
  updatedAt: Date;
};

export const sortTasksByUpdatedAt = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // Ensure that both a and b are treated as TaskWithUpdatedAt
    const taskA = a as TaskWithUpdatedAt;
    const taskB = b as TaskWithUpdatedAt;

    // Convert date strings to Date objects or use a default date
    const dateA = taskA.updatedAt || new Date(0);
    const dateB = taskB.updatedAt || new Date(0);

    // Compare the Date objects
    if (dateA > dateB) return -1;
    if (dateA < dateB) return 1;
    return 0;
  });
};

export const getTaskType = (
  buckets: Bucket[],
  task: Task | null | undefined,
) => {
  if (!task) {
    return "NO_OP";
  }

  const bucket = getBucketForTask(buckets, task);

  if (!bucket) {
    return "NO_OP";
  }

  if (bucket && task.closed) {
    return getClosedBucketType(bucket.id);
  }

  return getOpenBucketType(bucket.id);
};

export function getTasksByClosed(tasks: Task[], closed: boolean): Task[] {
  return tasks.filter((task) => task.closed === closed);
}

export function sortTasksNotClosedFirst(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.closed && b.closed) return -1;
    if (a.closed && !b.closed) return 1;
    return 0;
  });
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
